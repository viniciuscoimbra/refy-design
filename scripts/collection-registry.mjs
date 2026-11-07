import assert from 'node:assert/strict';
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
export function parseCollectionRegistry(raw, familyIds) {
  const registry = typeof raw === 'string' ? JSON.parse(raw) : raw;
  fields(registry, ['schemaVersion', 'collections', 'memberships'], 'registry');
  assert.equal(registry.schemaVersion, 1, 'Unsupported collection schema');
  assert(Array.isArray(registry.collections) && registry.collections.length > 0, 'collections must be nonempty');
  assert(Array.isArray(familyIds) && familyIds.every(id => typeof id === 'string'), 'familyIds must be strings');
  const families = new Set(familyIds), ids = new Set(), labels = new Set();
  let coreCount = 0;
  for (const collection of registry.collections) {
    fields(collection, ['id', 'label', 'kind', 'description', 'keywords'], 'collection');
    text(collection.id, 'id');
    assert(/^[a-z][a-z0-9-]*$/.test(collection.id), 'Invalid collection id');
    assert(!ids.has(collection.id), `Duplicate collection id: ${collection.id}`); ids.add(collection.id);
    text(collection.label, 'label');
    assert(!labels.has(collection.label.toLocaleLowerCase()), 'Duplicate collection label'); labels.add(collection.label.toLocaleLowerCase());
    text(collection.description, 'description');
    assert(['core', 'specialized'].includes(collection.kind), 'Invalid collection kind');
    if (collection.kind === 'core') { coreCount++; assert.equal(collection.id, 'core', 'Core id must be core'); }
    if (collection.id === 'core') assert.equal(collection.kind, 'core', 'core must have core kind');
    assert(Array.isArray(collection.keywords) && collection.keywords.length > 0, 'keywords must be nonempty');
    const keywords = new Set();
    for (const keyword of collection.keywords) { text(keyword, 'keyword'); assert(!keywords.has(keyword.toLocaleLowerCase()), 'Duplicate keyword'); keywords.add(keyword.toLocaleLowerCase()); }
  }
  assert.equal(coreCount, 1, 'Exactly one Core is required');
  object(registry.memberships, 'memberships');
  for (const [family, membership] of Object.entries(registry.memberships)) {
    assert(families.has(family), `Unknown family: ${family}`);
    assert(Array.isArray(membership) && membership.length > 0, `Empty membership: ${family}`);
    assert.equal(new Set(membership).size, membership.length, `Duplicate membership: ${family}`);
    for (const id of membership) assert(ids.has(id), `Unknown collection: ${id}`);
    assert(!membership.includes('core') || membership.length === 1, `Core cannot mix with specialized membership: ${family}`);
  }
  return registry;
}
export function collectionIdsFor(registry, familyId) {
  return Object.hasOwn(registry.memberships, familyId) ? [...registry.memberships[familyId]] : ['core'];
}
