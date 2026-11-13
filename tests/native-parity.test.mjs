// NATP-01/02: paridade web e mobile por família, sem lista escrita à mão.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { divergenceNames, parity, summary } from '../scripts/native-parity.mjs';

test('títulos do DIVERGENCIAS.md viram nomes, inclusive em grupo e entre parênteses', () => {
  const names = divergenceNames('**Select.** texto\n\n**Menu / ContextMenu.** x\n\n**Accordion e Collapsible.** y\n\n**Camada ancorada (AnchoredLayer).** z\n\nno meio **Falso.** não');
  assert.deepEqual([...names].sort(), ['Accordion', 'AnchoredLayer', 'Collapsible', 'ContextMenu', 'Menu', 'Select']);
});

test('família sem export nativo é so-web; com seção é com-divergencia; sem seção é igual', () => {
  const map = parity([{ id: 'Select', publicName: 'Select' }, { id: 'Badge', publicName: 'Badge' }, { id: 'Command', publicName: 'Command' }], ['Select', 'Badge'], new Set(['Select']));
  assert.deepEqual(map, { Select: 'com-divergencia', Badge: 'igual', Command: 'so-web' });
  assert.deepEqual(summary(map), { igual: 1, 'com-divergencia': 1, 'so-web': 1 });
});

test('catálogo e relatório dizem o mesmo para cada família', () => {
  const catalog = JSON.parse(readFileSync('ai/catalog.json', 'utf8'));
  const report = JSON.parse(readFileSync('src/catalog/native-parity.json', 'utf8'));
  for (const component of catalog.components) assert.equal(component.mobile, report.families[component.id], component.id);
  assert.equal(Object.keys(report.families).length, catalog.components.length);
});

test('refy component diz que Command é só da web', () => {
  const out = JSON.parse(execFileSync('node', ['tools/refy-agent/cli.mjs', 'component', 'Command'], { encoding: 'utf8' }));
  assert.equal(out.mobile, 'so-web');
});
