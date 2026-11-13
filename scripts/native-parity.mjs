// NATP-01: cada família do catálogo existe no @refy-design/mobile? Lê a lista que o site
// já usa (src/pages/RefySitePage/nativeComponents.json, gerada do pacote nativo) e as
// seções de packages/native/DIVERGENCIAS.md. Nada é escrito à mão.
//   node scripts/native-parity.mjs          grava src/catalog/native-parity.json
//   node scripts/native-parity.mjs --check  falha se o arquivo estiver desatualizado
import { readFileSync, writeFileSync } from 'node:fs';

export const OUTPUT = 'src/catalog/native-parity.json';

/** Nomes citados nos títulos em negrito do DIVERGENCIAS.md, como "**Menu / ContextMenu.**". */
export function divergenceNames(markdown) {
  return new Set([...markdown.matchAll(/^\*\*([^*]+?)\.\*\*/gm)].flatMap((m) =>
    m[1].replace(/\(([^)]+)\)/g, ',$1').split(/,|\/|\s+e\s+/).map((s) => s.trim()).filter((s) => /^[A-Z]\w+$/.test(s))));
}

export function parity(components, nativeNames, divergences) {
  const native = new Set(nativeNames);
  return Object.fromEntries(components.map(({ id, publicName }) => {
    const present = native.has(id) || native.has(publicName);
    const status = !present ? 'so-web' : divergences.has(id) || divergences.has(publicName) ? 'com-divergencia' : 'igual';
    return [id, status];
  }));
}

export function summary(map) {
  const counts = { igual: 0, 'com-divergencia': 0, 'so-web': 0 };
  for (const status of Object.values(map)) counts[status] += 1;
  return counts;
}

function build() {
  const components = JSON.parse(readFileSync('ai/catalog.json', 'utf8')).components;
  const nativeNames = JSON.parse(readFileSync('src/pages/RefySitePage/nativeComponents.json', 'utf8'));
  const mobileVersion = JSON.parse(readFileSync('packages/native/package.json', 'utf8')).version;
  const families = parity(components, nativeNames, divergenceNames(readFileSync('packages/native/DIVERGENCIAS.md', 'utf8')));
  return { about: 'Gerado por scripts/native-parity.mjs. igual: existe no mobile sem seção no DIVERGENCIAS.md; com-divergencia: existe e tem seção; so-web: não existe no mobile.', mobileVersion, summary: summary(families), families };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const text = `${JSON.stringify(build(), null, 2)}\n`;
  if (process.argv.includes('--check')) {
    let current = '';
    try { current = readFileSync(OUTPUT, 'utf8'); } catch { /* ausente conta como velho */ }
    if (current !== text) { console.error(`${OUTPUT} desatualizado: rode node scripts/native-parity.mjs`); process.exit(1); }
    console.log(`OK: paridade mobile ${JSON.stringify(JSON.parse(text).summary)}`);
  } else {
    writeFileSync(OUTPUT, text);
    console.log(`${OUTPUT}: ${JSON.stringify(JSON.parse(text).summary)}`);
  }
}
