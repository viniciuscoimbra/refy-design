import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve('.');
function run(args, cli = join(root, 'tools/refy-agent/cli.mjs'), cwd = root) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}
test('discovery resolves documented secondary APIs without creating families or runtime promises', () => {
  for (const [name, family] of [['D3Chart', 'Charts'], ['CardHeader', 'Card']]) {
    const search = run(['catalog', name]);
    assert.equal(search.status, 0, search.stderr);
    assert.deepEqual(JSON.parse(search.stdout).components.map(c => c.id), [family]);
    const result = run(['component', name]);
    assert.equal(result.status, 0, result.stderr);
    const doc = JSON.parse(result.stdout);
    assert.equal(doc.id, family);
    assert(doc.api.some(api => api.name === name));
    assert.equal(doc.resolution.apiMember, name);
    assert.equal(doc.resolution.runtimeExportVerified, false);
    assert(doc.examples.length);
  }
  for (const name of ['Charts', 'Card', 'Input']) {
    const result = run(['component', name]);
    assert.equal(result.status, 0);
    assert.deepEqual(JSON.parse(result.stdout), JSON.parse(readFileSync(join(root, `ai/components/${name}.json`))));
  }
  assert.equal(run(['component', 'NoSuchPublicMember']).status, 2);
  assert.equal(JSON.parse(run(['catalog', 'NoSuchPublicMember']).stdout).components.length, 0);
});
test('derived API discovery refuses ambiguity and escaped document paths', () => {
  const temp = mkdtempSync(join(tmpdir(), 'refy-discovery-'));
  try {
    mkdirSync(join(temp, 'tools/refy-agent'), { recursive: true });
    mkdirSync(join(temp, 'ai/components'), { recursive: true });
    for (const file of ['cli.mjs', 'check.mjs']) cpSync(join(root, 'tools/refy-agent', file), join(temp, 'tools/refy-agent', file));
    const cli = join(temp, 'tools/refy-agent/cli.mjs');
    const components = ['One', 'Two'].map(id => ({ id, publicName: id, document: `components/${id}.json` }));
    for (const entry of components) writeFileSync(join(temp, 'ai', entry.document), JSON.stringify({ id: entry.id, api: [{ name: 'SharedApi' }], examples: [] }));
    const catalog = { components };
    const save = () => writeFileSync(join(temp, 'ai/catalog.json'), JSON.stringify(catalog));
    save();
    const ambiguous = run(['component', 'SharedApi'], cli);
    assert.equal(ambiguous.status, 2);
    assert.match(ambiguous.stderr, /Ambiguous API member/);
    assert.equal(run(['component', 'One'], cli).status, 0);
    writeFileSync(join(temp, 'secret.json'), JSON.stringify({ api: [{ name: 'SecretApi' }] }));
    catalog.components[0].document = '../secret.json'; save();
    const escaped = run(['component', 'SecretApi'], cli);
    assert.equal(escaped.status, 2);
    assert.match(escaped.stderr, /outside catalog root/);
    symlinkSync(join(temp, 'secret.json'), join(temp, 'ai/components/secret.json'));
    catalog.components[0].document = 'components/secret.json'; save();
    assert.match(run(['component', 'SecretApi'], cli).stderr, /outside catalog root/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
test('public check remains usable after discovery changes', () => {
  const temp = mkdtempSync(join(tmpdir(), 'refy-discovery-check-'));
  try {
    mkdirSync(join(temp, 'node_modules'));
    symlinkSync(join(root, 'node_modules/typescript'), join(temp, 'node_modules/typescript'));
    writeFileSync(join(temp, 'View.tsx'), "import { Button } from '@refy-design/web'; export function View(){return <main><Button>Continuar</Button></main>}");
    const result = run(['check', 'View.tsx'], undefined, temp);
    assert.equal(result.status, 0, result.stderr + result.stdout);
    assert.equal(JSON.parse(result.stdout).passed, true);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
