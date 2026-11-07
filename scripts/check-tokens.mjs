import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { cssValue, generateCSS, themeValues } from './tokens.mjs';

export function resolveToken(name, values, stack = []) {
  assert(!stack.includes(name), `Ciclo: ${[...stack, name].join(' → ')}`);
  assert(Object.hasOwn(values, name), `Token ausente: ${name}`);
  return values[name].replace(/var\((--[\w-]+)\)/g, (_, dependency) => resolveToken(dependency, values, [...stack, name]));
}
const files = readdirSync('src/components', { recursive: true }).filter(p => /\.(css|tsx)$/.test(p) && !/\.stories\./.test(p));
const local = new Set();
const consumers = {};
for (const file of files) {
  const content = readFileSync(`src/components/${file}`, 'utf8');
  for (const m of content.matchAll(/(--[\w-]+)\s*:|["'](--[\w-]+)["']\s*:/g)) local.add(m[1] ?? m[2]);
  for (const m of content.matchAll(/var\(\s*(--[\w-]+)(\s*\)|\s*,)/g)) {
    const entry = consumers[m[1]] ??= { required: false, files: new Set() };
    entry.required ||= m[2].trim() === ')';
    entry.files.add(file);
  }
}
for (const mode of ['light', 'dark', 'editorial']) {
  const values = themeValues(mode);
  for (const name of Object.keys(values)) {
    try { resolveToken(name, values); } catch (e) { throw new Error(`${mode} / ${name}: ${e.message}`); }
  }
  for (const [name, entry] of Object.entries(consumers)) {
    if (entry.required && !local.has(name)) {
      assert(Object.hasOwn(values, name), `${mode} / ${name} / ${[...entry.files].join(', ')}`);
    }
  }
}
assert.equal(generateCSS(), generateCSS(), 'Geração não determinística');
assert.equal(readFileSync('src/tokens/tokens.css', 'utf8'), generateCSS(), 'CSS diverge da fonte; execute npm run tokens:build');
assert.throws(() => resolveToken('--missing', {}), /ausente/);
assert.throws(() => resolveToken('--a', { '--a': 'var(--b)', '--b': 'var(--a)' }), /Ciclo/);
assert.throws(() => cssValue({ $type: 'dimension', $value: { value: 1, unit: 'banana' } }));
assert.throws(() => cssValue({ $type: 'unknown', $value: 'x' }), /não suportado/);

const hooks = Object.keys(consumers).filter(name => !local.has(name) && !Object.hasOwn(themeValues('light'), name)).sort();
const hookJSON = JSON.stringify(hooks, null, 2) + '\n';
if (process.argv.includes('--inventory')) writeFileSync('src/tokens/component-hooks.json', hookJSON);
else assert.equal(readFileSync('src/tokens/component-hooks.json', 'utf8'), hookJSON, 'Hooks do editor desatualizados; execute node scripts/check-tokens.mjs --inventory');

if (process.argv.includes('--inventory')) {
  const rows = Object.entries(consumers).sort(([a], [b]) => a.localeCompare(b)).map(([name, entry]) => {
    const modes = ['light', 'dark', 'editorial'].map(m => themeValues(m)[name] ?? (local.has(name) ? 'local' : 'fallback opcional'));
    return `| ${name} | ${entry.required ? 'obrigatório ou local' : 'opcional, fallback no consumidor'} | ${modes.join(' | ')} | ${[...entry.files].join(', ')} |`;
  });
  writeFileSync('docs/TOKEN_INVENTORY.md', '# Inventário de consumidores\n\nGerado por `node scripts/check-tokens.mjs --inventory`. Origem e finalidade CSS de cada valor: `src/tokens/foundations.tokens.json`. Aliases legados preservados, sem remoção prevista. Variáveis locais/props não são papéis globais obrigatórios. O fallback exato está no arquivo consumidor.\n\n| Token | Contrato | Claro | Escuro | Editorial | Consumidores |\n|---|---|---|---|---|---|\n' + rows.join('\n') + '\n');
}
console.log(`OK: três modos completos; ${Object.keys(consumers).length} variáveis consumidas inventariadas; aliases, tipos, saída e controles negativos verificados.`);
