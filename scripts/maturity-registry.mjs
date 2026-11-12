import assert from 'node:assert/strict';
export const MATURITY_STATES = ['nao-avaliado', 'experimental', 'estavel', 'depreciado'];
export const DEFAULT_MATURITY = 'nao-avaliado';
const REQUIRED = {
  'nao-avaliado': ['state'],
  experimental: ['state', 'since', 'gaps'],
  estavel: ['state', 'since', 'evidence'],
  depreciado: ['state', 'since', 'replacement', 'migration', 'removal'],
};
const VERSION = /^\d+\.\d+\.\d+$/;
function object(value, name) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${name} must be an object`);
}
function fields(value, expected, name) {
  object(value, name);
  assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), `${name}: unexpected or missing fields`);
}
function text(value, name) {
  assert(typeof value === 'string' && value.trim() === value && value.length > 0, `${name} must be nonempty trimmed text`);
}
function list(value, name) {
  assert(Array.isArray(value) && value.length > 0, `${name} must be a nonempty list`);
  const seen = new Set();
  for (const item of value) { text(item, name); assert(!seen.has(item), `${name}: duplicate entry`); seen.add(item); }
}
export function parseMaturityRegistry(raw, familyIds) {
  const registry = typeof raw === 'string' ? JSON.parse(raw) : raw;
  fields(registry, ['schemaVersion', 'states', 'families'], 'registry');
  assert.equal(registry.schemaVersion, 1, 'Unsupported maturity schema');
  assert(Array.isArray(familyIds) && familyIds.every(id => typeof id === 'string'), 'familyIds must be strings');
  assert(Array.isArray(registry.states), 'states must be a list');
  assert.deepEqual(registry.states.map(state => state?.id), MATURITY_STATES, 'states must list the four QUALITY.md states in order');
  for (const state of registry.states) {
    fields(state, ['id', 'label', 'criteria'], `state ${state.id}`);
    text(state.label, 'label');
    text(state.criteria, 'criteria');
  }
  const families = new Set(familyIds);
  object(registry.families, 'families');
  for (const [family, entry] of Object.entries(registry.families)) {
    assert(families.has(family), `Unknown family: ${family}`);
    object(entry, family);
    assert(MATURITY_STATES.includes(entry.state), `Invalid maturity state: ${family}`);
    assert.notEqual(entry.state, DEFAULT_MATURITY, `Redundant entry, ${DEFAULT_MATURITY} is the default: ${family}`);
    fields(entry, REQUIRED[entry.state], family);
    assert(VERSION.test(entry.since ?? ''), `${family}: since must be a released version`);
    if (entry.gaps) list(entry.gaps, `${family}.gaps`);
    if (entry.evidence) list(entry.evidence, `${family}.evidence`);
    if (entry.state === 'depreciado') {
      assert(families.has(entry.replacement) && entry.replacement !== family, `${family}: replacement must be another family`);
      text(entry.migration, `${family}.migration`);
      text(entry.removal, `${family}.removal`);
    }
  }
  return registry;
}
export function maturityFor(registry, familyId) {
  return Object.hasOwn(registry.families, familyId) ? registry.families[familyId].state : DEFAULT_MATURITY;
}
