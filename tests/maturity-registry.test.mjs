import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { parseMaturityRegistry, maturityFor, MATURITY_STATES } from '../scripts/maturity-registry.mjs';
const raw = JSON.parse(readFileSync('src/catalog/maturity.json', 'utf8'));
const catalog = JSON.parse(readFileSync('ai/catalog.json', 'utf8'));
const source = ts.createSourceFile('catalog.ts', readFileSync('src/pages/PlaygroundPage/catalog.ts','utf8'), ts.ScriptTarget.Latest, true);
const declaration = source.statements.flatMap(s => ts.isVariableStatement(s) ? [...s.declarationList.declarations] : []).find(d => d.name.getText(source) === 'componentCatalog');
const familyIds = declaration.initializer.elements.map(node => node.properties.find(p => p.name?.getText(source) === 'id').initializer.text);
const clone = () => structuredClone(raw);
const quality = readFileSync('docs/QUALITY.md', 'utf8');
test('registry mirrors the four QUALITY.md states and defaults every family to não avaliado', () => {
  const registry = parseMaturityRegistry(JSON.stringify(raw), familyIds);
  for (const state of registry.states) assert(quality.includes(`| ${state.label} | ${state.criteria.replace(/\.$/, '')} |`), `QUALITY.md drift: ${state.id}`);
  assert.equal(maturityFor(registry, 'Button'), 'nao-avaliado');
  assert.equal(maturityFor(registry, 'NotARealFamily'), 'nao-avaliado');
});
test('registry accepts entries that carry the evidence each state requires', () => {
  const value = clone();
  value.families.Button = { state: 'estavel', since: '1.6.2', evidence: ['openspec/changes/x/evidence.md'] };
  value.families.Chip = { state: 'experimental', since: '1.6.2', gaps: ['Leitor de tela não verificado'] };
  value.families.Tag = { state: 'depreciado', since: '1.6.2', replacement: 'Chip', migration: 'Troque Tag por Chip.', removal: '2.0.0' };
  const registry = parseMaturityRegistry(value, [...familyIds, 'Tag']);
  assert.equal(maturityFor(registry, 'Button'), 'estavel');
  assert.equal(maturityFor(registry, 'Chip'), 'experimental');
  assert.equal(maturityFor(registry, 'Tag'), 'depreciado');
});
test('registry refuses claims without evidence, unknown families and malformed schemas', () => {
  const mutations = [
    r => { r.schemaVersion = 2; },
    r => { r.extra = true; },
    r => { r.states.pop(); },
    r => { r.states.reverse(); },
    r => { r.states[0].label = ''; },
    r => { r.states[0].surprise = true; },
    r => { r.families.NotARealFamily = { state: 'experimental', since: '1.6.2', gaps: ['x'] }; },
    r => { r.families.Button = { state: 'certificado', since: '1.6.2' }; },
    r => { r.families.Button = { state: 'nao-avaliado' }; },
    r => { r.families.Button = { state: 'estavel', since: '1.6.2' }; },
    r => { r.families.Button = { state: 'estavel', since: '1.6.2', evidence: [] }; },
    r => { r.families.Button = { state: 'estavel', since: 'next', evidence: ['e.md'] }; },
    r => { r.families.Button = { state: 'estavel', since: '1.6.2', evidence: ['e.md'], wcag: 'AA' }; },
    r => { r.families.Button = { state: 'experimental', since: '1.6.2' }; },
    r => { r.families.Button = { state: 'experimental', since: '1.6.2', gaps: ['x', 'x'] }; },
    r => { r.families.Button = { state: 'depreciado', since: '1.6.2', replacement: 'Button', migration: 'm', removal: '2.0.0' }; },
    r => { r.families.Button = { state: 'depreciado', since: '1.6.2', replacement: 'Missing', migration: 'm', removal: '2.0.0' }; },
    r => { r.families.Button = { state: 'depreciado', since: '1.6.2', replacement: 'Chip', migration: '', removal: '2.0.0' }; },
  ];
  for (const mutate of mutations) { const value = clone(); mutate(value); assert.throws(() => parseMaturityRegistry(value, familyIds), JSON.stringify(value.families)); }
});
test('generated agent catalog carries the states and one maturity per family', () => {
  assert.deepEqual(catalog.maturity.map(state => state.id), MATURITY_STATES);
  const registry = parseMaturityRegistry(raw, familyIds);
  assert.equal(catalog.components.length, familyIds.length);
  for (const component of catalog.components) assert.equal(component.maturity, maturityFor(registry, component.id), component.id);
});
