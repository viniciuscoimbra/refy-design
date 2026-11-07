import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { colorMix, oklchToSrgb, resolveVars, toNative } from '../src/resolve.mjs';
import { createNativeTheme, raw } from '../dist/index.js';

test('a web continua recebendo o mesmo tokens.css', () => {
  assert.equal(readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8'), readFileSync(new URL('../../../src/tokens/tokens.css', import.meta.url), 'utf8'));
});

test('nenhum valor nativo carrega var(), color-mix() ou oklch()', () => {
  for (const mode of ['light', 'dark', 'editorial']) {
    const { values } = createNativeTheme(undefined, mode);
    for (const [name, value] of Object.entries(values)) assert.doesNotMatch(String(value), /var\(|color-mix\(|oklch\(/, `${mode} ${name}`);
  }
});

test('color-mix segue a especificação com alfa', () => {
  assert.equal(colorMix('color-mix(in srgb, #000000 50%, #ffffff)'), '#808080');
  assert.equal(colorMix('color-mix(in srgb, #dc2626 16%, #ffffff)'), '#f9dcdc');
  assert.equal(colorMix('color-mix(in srgb, #0e0e10 10%, transparent)'), 'rgba(14, 14, 16, 0.1)');
  // O tema do site escurece o vermelho com black; antes daqui o resolvedor recusava a cor e o tema não abria no nativo.
  assert.equal(colorMix('color-mix(in srgb, #ffffff 50%, black)'), '#808080');
  assert.equal(colorMix('color-mix(in srgb, #000000 50%, white)'), '#808080');
});

test('oklch converte para o sRGB que o navegador mostra', () => {
  assert.deepEqual(oklchToSrgb(0.62796, 0.25768, 29.234).map(Math.round), [255, 0, 0]);
  assert.equal(toNative('oklch(0.54615 0.21521 262.881)').value, '#2563eb');
});

test('unidades viram números do RN', () => {
  assert.deepEqual(toNative('12px'), { kind: 'size', value: 12 });
  assert.equal(toNative('1.5rem').value, 24);
  assert.equal(toNative('0.2s').value, 200);
  assert.equal(toNative('-0.03em').kind, 'em');
  assert.deepEqual(toNative('cubic-bezier(0.2, 0, 0, 1)').value, [0.2, 0, 0, 1]);
  assert.equal(toNative('"Source Sans 3", system-ui, sans-serif').value, 'Source Sans 3');
  assert.equal(toNative('linear-gradient(135deg, #10b981, #006c49)').kind, 'unsupported');
});

test('o tema sobrescreve antes de resolver os aliases, como na cascata web', () => {
  const native = createNativeTheme({ name: 't', tokens: { '--primary': '#ff0000' } }, 'light');
  assert.equal(native.values['--primary'], '#ff0000');
  assert.equal(raw.light['--brand'], 'var(--primary)');
  assert.equal(native.values['--brand'], '#ff0000');
});

test('controles negativos', () => {
  assert.throws(() => resolveVars('--a', { '--a': 'var(--b)', '--b': 'var(--a)' }), /Ciclo/);
  assert.throws(() => resolveVars('--a', { '--a': 'var(--nada)' }), /ausente/);
  assert.throws(() => createNativeTheme({ name: 'x', tokens: { primary: '#fff' } }), /inválido/);
  assert.throws(() => createNativeTheme(undefined, 'sepia'), /Modo inválido/);
  assert.deepEqual(createNativeTheme({ name: 'x', tokens: { '--ninguem-le': '1px' } }).unknown, ['--ninguem-le']);
});
