// Gera as saídas do @refy/tokens a partir da fonte única do Refy.
// A fonte continua em src/tokens/foundations.tokens.json porque o pacote web
// exporta esse caminho (./tokens.json) e a geração CSS em scripts/tokens.mjs.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { generateCSS, themeValues } from '../../scripts/tokens.mjs';
import { resolveAll } from './src/resolve.mjs';

const root = new URL('../../', import.meta.url);
const here = new URL('./', import.meta.url);
const MODES = ['light', 'dark', 'editorial'];
const hooks = JSON.parse(readFileSync(new URL('src/tokens/component-hooks.json', root), 'utf8'));

function outputs() {
  const files = {};
  files['dist/tokens.css'] = generateCSS();
  const raw = Object.fromEntries(MODES.map(mode => [mode, themeValues(mode)]));
  const report = { generatedFrom: 'src/tokens/foundations.tokens.json', modes: {} };
  const resolved = {};
  for (const mode of MODES) {
    const all = resolveAll(raw[mode]);
    resolved[mode] = Object.fromEntries(Object.entries(all).map(([k, v]) => [k, v.value]));
    files[`dist/native/${mode}.json`] = JSON.stringify(resolved[mode], null, 2) + '\n';
    const byKind = {};
    for (const [name, entry] of Object.entries(all)) (byKind[entry.kind] ??= []).push(entry.note ? `${name}: ${entry.note}` : name);
    report.modes[mode] = { total: Object.keys(all).length, kinds: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.length])), divergences: { em: byKind.em ?? [], shadow: byKind.shadow ?? [], unsupported: byKind.unsupported ?? [] } };
  }
  files['dist/native/report.json'] = JSON.stringify(report, null, 2) + '\n';
  const names = Object.keys(raw.light).sort();
  const resolver = readFileSync(new URL('src/resolve.mjs', here), 'utf8');
  files['dist/resolve.js'] = resolver;
  files['dist/index.js'] = `// Gerado por packages/tokens/build.mjs. Edite src/tokens/foundations.tokens.json.
import { resolveAll, themeOverlay } from './resolve.js';
export { colorMix } from './resolve.js';
export const modes = ${JSON.stringify(MODES)};
export const raw = ${JSON.stringify(raw)};
export const componentHooks = ${JSON.stringify(hooks)};
const known = new Set([...Object.keys(raw.light), ...componentHooks]);
/** Tema resolvido para React Native: valores literais, sem var() nem color-mix. */
export function createNativeTheme(theme, mode = 'light') {
  if (!modes.includes(mode)) throw new Error('Modo inválido: ' + mode);
  const overlay = themeOverlay(raw[mode], theme, mode);
  const all = resolveAll(overlay);
  const values = {}, kinds = {};
  for (const [name, entry] of Object.entries(all)) { values[name] = entry.value; kinds[name] = entry.kind; }
  const unknown = Object.keys({ ...theme?.tokens, ...theme?.modes?.[mode] }).filter(name => !known.has(name)).sort();
  return { name: theme?.name ?? 'refy', mode, values, kinds, unknown };
}
`;
  files['dist/index.d.ts'] = `// Gerado por packages/tokens/build.mjs.
export type RefyMode = ${MODES.map(m => JSON.stringify(m)).join(' | ')};
export type RefyTokenName =
${names.map(n => `  | ${JSON.stringify(n)}`).join('\n')};
export type NativeTokenKind = 'size' | 'em' | 'duration' | 'number' | 'color' | 'easing' | 'shadow' | 'keyword' | 'fontFamily' | 'unsupported';
export type NativeTokenValue = string | number | number[];
export interface RefyTheme {
  name: string;
  tokens?: Partial<Record<\`--\${string}\`, string | number>>;
  modes?: Partial<Record<RefyMode, Partial<Record<\`--\${string}\`, string | number>>>>;
}
export interface NativeTheme {
  name: string;
  mode: RefyMode;
  values: Record<RefyTokenName, NativeTokenValue> & Record<string, NativeTokenValue>;
  kinds: Record<string, NativeTokenKind>;
  /** Variáveis do tema que nenhum token nem componente do Refy lê. */
  unknown: string[];
}
export declare const modes: RefyMode[];
export declare const raw: Record<RefyMode, Record<RefyTokenName, string>>;
export declare const componentHooks: string[];
export declare function createNativeTheme(theme?: RefyTheme, mode?: RefyMode): NativeTheme;
/** color-mix(in srgb, …) já resolvido para hex ou rgba. */
export declare function colorMix(expression: string): string;
`;
  return files;
}

const files = outputs();
if (process.argv.includes('--check')) {
  assert.equal(files['dist/tokens.css'], readFileSync(new URL('src/tokens/tokens.css', root), 'utf8'), 'dist/tokens.css diverge de src/tokens/tokens.css');
  for (const [path, content] of Object.entries(files)) {
    const file = new URL(path, here);
    assert(existsSync(file), `${path} ausente; rode npm --prefix packages/tokens run build`);
    assert.equal(readFileSync(file, 'utf8'), content, `${path} desatualizado; rode npm --prefix packages/tokens run build`);
  }
  console.log(`OK: ${Object.keys(files).length} saídas em dia; tokens.css igual byte a byte ao da web.`);
} else {
  for (const [path, content] of Object.entries(files)) {
    const file = new URL(path, here);
    mkdirSync(new URL('./', file), { recursive: true });
    writeFileSync(file, content);
  }
  console.log(`OK: ${Object.keys(files).length} saídas geradas.`);
}
