import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { themeValues } from './tokens.mjs';
import { resolveToken } from './check-tokens.mjs';
const luminance = hex => {
  assert(/^#[0-9a-f]{6}$/i.test(hex), `Cor não suportada nesta medição: ${hex}`);
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const ratio = (a, b) => (Math.max(luminance(a), luminance(b)) + .05) / (Math.min(luminance(a), luminance(b)) + .05);
assert.equal(ratio('#000000', '#ffffff'), 21);
assert.equal(ratio('#ffffff', '#ffffff'), 1);
const rows = [];
for (const mode of ['light', 'dark', 'editorial']) {
  const values = themeValues(mode);
  for (const [fg, bg, context, minimum] of [
    ['--ink-1', '--surface', 'título', 4.5], ['--ink-2', '--surface', 'corpo', 4.5],
    ['--ink-3', '--surface', 'label/ajuda', 4.5], ['--ink-4', '--surface', 'placeholder', 4.5],
    ['--on-primary', '--primary', 'Button repouso', 4.5], ['--on-good', '--good', 'Button concluído', 4.5], ['--on-primary', '--primary-hover', 'Button hover', 4.5],
    ['--on-primary-container', '--primary-container', 'Button active', 4.5],
    ['--primary-ink', '--surface', 'foco externo na superfície', 3],
    ['--outline', '--surface', 'borda identificadora de Input', 3],
    ['--critical', '--surface', 'erro de campo', 4.5],
    ['--critical-ink', '--critical-soft', 'chip/aviso crítico', 4.5],
    ['--weak-ink', '--weak-soft', 'chip/aviso de atenção', 4.5],
    ['--good-ink', '--good-soft', 'chip/aviso de sucesso', 4.5],
    ['--info-ink', '--info-soft', 'chip/aviso informativo', 4.5],
    ['--outline', '--bg', 'trilho da timeline', 3],
    ...['comment','keyword','string','number','tag','function','property','punctuation'].map(name => [`--code-syntax-${name}`, '--surface-2', `sintaxe ${name}`, 4.5]),
  ]) {
    const a = resolveToken(fg, values), b = resolveToken(bg, values), result = ratio(a, b);
    rows.push({ mode, context, fg, bg, foreground: a, background: b, ratio: +result.toFixed(3), minimum, pass: result >= minimum });
  }
}
writeFileSync('docs/CONTRAST.json', JSON.stringify({ scope: 'Pares opacos sRGB da fundação. Não cobre transparências, todas as famílias ou conformidade WCAG global. Axe/browser complementam esta medição.', rows }, null, 2) + '\n');
for (const row of rows) assert(row.pass, `${row.mode} / ${row.context}: ${row.ratio} < ${row.minimum}`);
console.log(`OK: ${rows.length} pares da fundação medidos; escopo e critérios em docs/CONTRAST.json.`);
