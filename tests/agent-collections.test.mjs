import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
const root = resolve('.');
const run = (args, cli = join(root, 'tools/refy-agent/cli.mjs')) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('collections discovery uses packaged definitions and actual members, including empty and future collections', () => {
  const temp = mkdtempSync(join(tmpdir(), 'refy-collections-'));
  try {
    mkdirSync(join(temp, 'tools/refy-agent'), { recursive: true });
    mkdirSync(join(temp, 'ai/components'), { recursive: true });
    for (const file of ['cli.mjs', 'check.mjs', 'search.mjs']) cpSync(join(root, 'tools/refy-agent', file), join(temp, 'tools/refy-agent', file));
    const cli = join(temp, 'tools/refy-agent/cli.mjs');
    const definitions = [
      { id: 'core', label: 'Core', kind: 'core', keywords: [] },
      { id: 'media', label: 'Mídia', kind: 'specialized', keywords: ['música', 'capas'] },
      { id: 'conversation', label: 'Conversação', kind: 'specialized', keywords: ['conversa'] },
      { id: 'future', label: 'Futura', kind: 'specialized', keywords: [], count: 99 },
    ];
    const components = [{ id: 'VoiceRecorder', collections: ['media', 'conversation'], document: 'components/VoiceRecorder.json' }];
    writeFileSync(join(temp, 'ai/catalog.json'), JSON.stringify({ schemaVersion: 1, collections: definitions, components }));
    writeFileSync(join(temp, 'ai/components/VoiceRecorder.json'), JSON.stringify({ id: 'VoiceRecorder', api: [] }));
    for (const query of ['MÍDIA', 'musica', 'CAPAS']) {
      const result = run(['collections', query], cli);
      assert.equal(result.status, 0, result.stderr);
      const data = JSON.parse(result.stdout);
      assert.equal(data.collections[0].id, 'media');
      assert.equal(data.collections[0].count, 1);
      assert.deepEqual(data.collections[0].members.map(c => c.id), ['VoiceRecorder']);
      assert.deepEqual(JSON.parse(run(['catalog', query], cli).stdout).components, components);
    }
    const future = JSON.parse(run(['collections', 'future'], cli).stdout).collections[0];
    assert.equal(future.count, 0); assert.equal(future.empty, true); assert.deepEqual(future.members, []);
    const unknown = JSON.parse(run(['collections', 'nonexistent'], cli).stdout);
    assert.equal(unknown.empty, true); assert.deepEqual(unknown.collections, []);
    assert.equal(JSON.parse(run(['collections'], cli).stdout).collections.length, 4);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test('generated collections preserve family IDs, atomic classification, public discovery and shared memberships', () => {
  const catalog = JSON.parse(readFileSync('ai/catalog.json'));
  const baseline = JSON.parse(readFileSync('src/pages/PlaygroundPage/documentation/Button.json'));
  assert(catalog.collections?.length, 'Generate collection metadata before this acceptance test');
  const source = ts.createSourceFile('catalog.ts', readFileSync('src/pages/PlaygroundPage/catalog.ts', 'utf8'), ts.ScriptTarget.Latest, true);
  const declaration = source.statements.flatMap(s => ts.isVariableStatement(s) ? [...s.declarationList.declarations] : []).find(d => d.name.getText(source) === 'componentCatalog');
  const expected = declaration.initializer.elements.map(node => Object.fromEntries(['id', 'level', 'area', 'storyId'].map(key => [key, node.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source) === key)?.initializer.text])));
  assert.equal(catalog.components.length, expected.length);
  assert.deepEqual(catalog.components.map(({ id, level, area, storyId }) => ({ id, level, area, storyId })), expected);
  for (const entry of catalog.components) {
    const doc = JSON.parse(readFileSync(`ai/${entry.document}`));
    assert.deepEqual(entry.collections, doc.collections);
    assert(entry.level); assert(entry.storyId);
    assert(entry.collections.every(id => catalog.collections.some(c => c.id === id)));
  }
  for (const collection of catalog.collections) {
    const result = JSON.parse(run(['collections', collection.id]).stdout).collections[0];
    assert.equal(result.count, catalog.components.filter(c => c.collections.includes(collection.id)).length);
    assert.equal(collection.count, result.count);
  }
  const voice = catalog.components.find(c => c.id === 'VoiceRecorder');
  assert(voice.collections.includes('media') && voice.collections.includes('conversation'));
  assert(catalog.components.find(c => c.id === 'BillingCard').collections.length >= 2);
  assert.deepEqual(catalog.components.find(c => c.id === 'Button').collections, ['core']);
  for (const [name, family] of [['D3Chart', 'Charts'], ['CardHeader', 'Card']]) {
    const result = run(['component', name]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).id, family);
  }
  assert.equal(JSON.parse(run(['component', 'Button']).stdout).import, baseline.import);
  const coverflow = run(['component', 'Coverflow']);
  assert.equal(coverflow.status, 0, coverflow.stderr);
  assert.deepEqual(JSON.parse(coverflow.stdout).collections, ['media']);
  assert(JSON.parse(coverflow.stdout).examples.some(example => example.id === 'Capas'));
});
