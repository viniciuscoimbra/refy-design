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
    // NATP-02 e LIFE-03: a CLI acrescenta ao documento o estado no @refy-design/mobile e a maturidade, vindos do catálogo.
    const entry = JSON.parse(readFileSync(join(root, 'ai/catalog.json'))).components.find(c => c.id === name);
    assert.deepEqual(JSON.parse(result.stdout), { ...JSON.parse(readFileSync(join(root, `ai/components/${name}.json`))), maturity: entry.maturity, mobile: entry.mobile });
  }
  assert.equal(run(['component', 'NoSuchPublicMember']).status, 2);
  assert.equal(JSON.parse(run(['catalog', 'NoSuchPublicMember']).stdout).components.length, 0);
});
test('derived API discovery refuses ambiguity and escaped document paths', () => {
  const temp = mkdtempSync(join(tmpdir(), 'refy-discovery-'));
  try {
    mkdirSync(join(temp, 'tools/refy-agent'), { recursive: true });
    mkdirSync(join(temp, 'ai/components'), { recursive: true });
    for (const file of ['cli.mjs', 'check.mjs', 'search.mjs']) cpSync(join(root, 'tools/refy-agent', file), join(temp, 'tools/refy-agent', file));
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
test('catalog answers a need in pt, en or es with the same ranking as refy_search', () => {
  // Artigo da LBP sobre a 1.2.0: "tabela" e "login" voltavam zero na CLI e só o MCP achava.
  for (const [query, first] of [['tabela', 'Table'], ['tabela de dados', 'Table'], ['data table', 'Table'], ['tabla de datos', 'Table'], ['login', 'OAuthButton'], ['gráfico', 'Charts']]) {
    const result = run(['catalog', ...query.split(' ')]);
    assert.equal(result.status, 0, result.stderr);
    const out = JSON.parse(result.stdout);
    assert.equal(out.components[0]?.id, first, query);
    assert.equal(out.ranking[0].id, first, query);
  }
  const search = JSON.parse(run(['search', 'tela', 'de', 'login']).stdout);
  assert.deepEqual(search.components.slice(0, 2).map(c => c.id).sort(), ['GoogleButton', 'OAuthButton']);
});
test('a family that only mentions a term to refuse it does not rank for that term', () => {
  // Menu diz "no nested submenus"; DatePicker diz "no free typing". Nenhum dos dois sobe por isso.
  const submenu = JSON.parse(run(['search', 'submenu']).stdout).components.map(c => c.id);
  assert(!submenu.includes('Menu'), submenu.join(' '));
  const typing = JSON.parse(run(['search', 'free', 'typing']).stdout).components.map(c => c.id);
  assert.notEqual(typing[0], 'DatePicker', typing.join(' '));
});
