import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const actionsRequire = createRequire(
  require.resolve("@storybook/addon-actions"),
);
const metadataPath = actionsRequire.resolve("uuid/package.json");
const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
assert.equal(metadata.version, "11.1.1");
const cjs = actionsRequire("uuid");
const esm = await import(
  pathToFileURL(
    resolve(dirname(metadataPath), metadata.exports["."].node.import),
  ).href
);
for (const api of [cjs, esm]) {
  assert(api.validate(api.v4()));
  assert.throws(() => api.v5("Refy", api.NIL, new Uint8Array(4)), RangeError);
}
console.log(
  "OK: Actions resolves patched uuid 11.1.1; ESM/CJS v4 and buffer bounds verified.",
);

// Docgen discovers TSX through globSync; validate the scoped replacement at that caller.
const docgenRequire = createRequire(
  require.resolve('@joshwooding/vite-plugin-react-docgen-typescript'),
);
const globMetadataPath = docgenRequire.resolve('glob/package.json');
const globMetadata = JSON.parse(readFileSync(globMetadataPath, 'utf8'));
const globRequire = createRequire(globMetadataPath);
const minimatchMetadata = JSON.parse(readFileSync(globRequire.resolve('minimatch/package.json'), 'utf8'));
function checkDiscoveryVersions(globVersion, minimatchVersion) {
  assert.equal(globVersion, '14.0.2', 'Docgen glob must retain the audited scoped version');
  assert.equal(minimatchVersion, '11.0.1', 'Docgen minimatch must retain the audited scoped version');
}
checkDiscoveryVersions(globMetadata.version, minimatchMetadata.version);
assert.throws(() => checkDiscoveryVersions('10.5.0', '11.0.1'));
assert.throws(() => checkDiscoveryVersions('14.0.2', '9.0.9'));
const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs');
const { tmpdir } = await import('node:os');
const directory = mkdtempSync(resolve(tmpdir(), 'refy-docgen-glob-'));
try {
  mkdirSync(resolve(directory, 'nested'));
  const expected = ['Button.tsx', 'nested/Input.tsx'].map(file => resolve(directory, file)).sort();
  for (const file of [...expected, resolve(directory, 'ignored.ts')]) writeFileSync(file, 'export {};\n');
  const globEsm = await import(pathToFileURL(resolve(dirname(globMetadataPath), globMetadata.exports['.'].import.default)).href);
  const globCjs = docgenRequire('glob');
  for (const api of [globEsm, globCjs]) {
    assert.equal(typeof api.globSync, 'function');
    assert.deepEqual(api.globSync(resolve(directory, '**/*.tsx')).map(file => resolve(file)).sort(), expected);
    assert.deepEqual(api.globSync(resolve(directory, '**/Absent.tsx')), []);
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
console.log('OK: scoped docgen glob/minimatch, ESM/CJS TSX discovery and unsafe-version controls verified.');
