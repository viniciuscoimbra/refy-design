// DEPS-01: `@types/*` em dependencies só quando um tipo do pacote publicado importa o
// módulo. Os tipos de Charts (src/components/Charts/d3/types.ts) usam geojson, d3-geo,
// d3-scale e d3-shape; sem os @types, o TypeScript de quem consome quebra no .d.ts.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const build = JSON.parse(readFileSync('tsconfig.build.json', 'utf8'));
const excluded = (file) => /\.stories\.tsx$/.test(file)
  || build.exclude.some((pattern) => !pattern.includes('*') && (file === pattern || file.startsWith(`${pattern}/`)));

function buildFiles(dir = 'src') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name);
    if (excluded(file)) return [];
    if (entry.isDirectory()) return buildFiles(file);
    return /\.tsx?$/.test(entry.name) ? [file] : [];
  });
}

// `@types/d3-geo` → `d3-geo`; `@types/babel__core` → `@babel/core`.
const moduleOf = (types) => {
  const name = types.slice('@types/'.length);
  return name.includes('__') ? `@${name.replace('__', '/')}` : name;
};

export function orphanTypes(dependencies, sources) {
  return Object.keys(dependencies).filter((name) => name.startsWith('@types/')).filter((name) => {
    const mod = moduleOf(name).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const typeImport = new RegExp(`import\\s+(?:type\\s+[^;]*|\\{[^}]*\\btype\\b[^}]*\\})\\s+from\\s+["']${mod}["']`);
    return !sources.some((source) => typeImport.test(source));
  });
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const sources = buildFiles().map((file) => readFileSync(file, 'utf8'));

test('todo @types em dependencies é importado por um tipo do pacote publicado', () => {
  assert.deepEqual(orphanTypes(pkg.dependencies, sources), []);
});

test('@types sem tipo público que o use é recusado', () => {
  assert.deepEqual(orphanTypes({ ...pkg.dependencies, '@types/d3-chord': '^3.0.0' }, sources), ['@types/d3-chord']);
});

test('import de valor não conta como tipo público', () => {
  assert.deepEqual(orphanTypes({ '@types/d3-geo': '^3' }, ['import { geoPath } from "d3-geo";']), ['@types/d3-geo']);
  assert.deepEqual(orphanTypes({ '@types/d3-geo': '^3' }, ['import type { GeoProjection } from "d3-geo";']), []);
});
