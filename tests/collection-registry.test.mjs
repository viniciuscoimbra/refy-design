import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { parseCollectionRegistry, collectionIdsFor } from '../scripts/collection-registry.mjs';
const raw = JSON.parse(readFileSync('src/catalog/collections.json', 'utf8'));
const source = ts.createSourceFile('catalog.ts', readFileSync('src/pages/PlaygroundPage/catalog.ts','utf8'), ts.ScriptTarget.Latest, true);
const declaration = source.statements.flatMap(s => ts.isVariableStatement(s) ? [...s.declarationList.declarations] : []).find(d => d.name.getText(source) === 'componentCatalog');
const familyIds = declaration.initializer.elements.map(node => node.properties.find(p => p.name?.getText(source) === 'id').initializer.text);
const clone = () => structuredClone(raw);
test('registry derives specialized memberships from existing family IDs and defaults to Core', () => {
  const registry = parseCollectionRegistry(JSON.stringify(raw), familyIds);
  assert.equal(new Set(familyIds).size, familyIds.length);
  assert(familyIds.includes("Coverflow"));
  assert.equal(registry.collections.length, 9);
  assert.deepEqual(collectionIdsFor(registry, "Coverflow"), ["media"]);
  assert.deepEqual(collectionIdsFor(registry, 'Button'), ['core']);
  assert.deepEqual(collectionIdsFor(registry, 'VoiceRecorder'), ['media','conversation']);
  assert.deepEqual(collectionIdsFor(registry, 'BillingCard'), ['commerce','finance']);
  const result = collectionIdsFor(registry, 'BillingCard'); result.push('core');
  assert.deepEqual(registry.memberships.BillingCard, ['commerce','finance']);
});
test('registry refuses malformed schemas, duplicate definitions and invalid memberships', () => {
  const mutations = [
    r => { r.schemaVersion = 2; },
    r => { r.extra = true; },
    r => { r.collections.push({...r.collections[0]}); },
    r => { r.collections = r.collections.filter(c => c.id !== 'core'); },
    r => { r.collections[0].kind = 'specialized'; },
    r => { r.collections[1].kind = 'core'; },
    r => { r.collections[1].keywords = []; },
    r => { r.collections[1].keywords = ['image','IMAGE']; },
    r => { r.collections[1].label = ''; },
    r => { r.collections[1].surprise = true; },
    r => { r.memberships.NotARealFamily = ['media']; },
    r => { r.memberships.Charts = ['unknown']; },
    r => { r.memberships.Charts = []; },
    r => { r.memberships.Charts = ['analytics','analytics']; },
    r => { r.memberships.Charts = ['core','analytics']; },
  ];
  for (const mutate of mutations) { const value=clone(); mutate(value); assert.throws(() => parseCollectionRegistry(value, familyIds)); }
});
test('UI metadata lookup agrees with Node registry without importing component runtime or validator', () => {
  const source = readFileSync('src/pages/PlaygroundPage/collections.ts','utf8');
  const compiled = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2020, esModuleInterop:true}}).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require(name) { assert.equal(name, '../../catalog/collections.json'); return raw; }});
  const registry = parseCollectionRegistry(raw, familyIds);
  for (const id of familyIds) {
    assert.deepEqual(Array.from(exports.componentCollectionIds(id)), collectionIdsFor(registry,id));
    const expected = registry.collections.filter(c => collectionIdsFor(registry,id).includes(c.id));
    assert.deepEqual(Array.from(exports.collectionLabels(id)), expected.map(c=>c.label));
    assert.deepEqual(Array.from(exports.collectionSearchTerms(id)), expected.flatMap(c=>[c.id,c.label,...c.keywords]));
    for(const collection of registry.collections) assert.equal(exports.matchesCollection(id, collection.id), collectionIdsFor(registry,id).includes(collection.id));
  }
  assert.equal(exports.matchesCollection('Button','all'),true);
  assert.equal(exports.matchesCollection('Button',''),true);
  assert.equal(exports.matchesCollection('Button','missing'),false);
});
