// COVG-03: lógica pura de componente prova-se sem navegador. Cada módulo importado
// aqui é .ts sem React nem CSS, e o Node 22 tira os tipos sozinho.
import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBrazilianPhone } from '../src/components/PhoneInput/formatBrazilianPhone.ts';
import { scoreBand } from '../src/components/ScoreGauge/scoreBand.ts';
import { usageTone } from '../src/components/UsageMeter/usageTone.ts';
import { groupVisitTimes } from '../src/components/VisitSchedulePicker/visitTimes.ts';
import { cn } from '../src/lib/cn.ts';
import { inertAttribute } from '../src/lib/inertAttribute.ts';

test('telefone: formata fixo e celular, ignora letra e corta no 11º dígito', () => {
  assert.equal(formatBrazilianPhone('31'), '(31');
  assert.equal(formatBrazilianPhone('313333'), '(31) 3333');
  assert.equal(formatBrazilianPhone('3133334444'), '(31) 3333-4444');
  assert.equal(formatBrazilianPhone('31999998888'), '(31) 99999-8888');
  assert.equal(formatBrazilianPhone('31a99999-8888 77'), '(31) 99999-8888');
  assert.equal(formatBrazilianPhone(''), '');
});

test('banda do score respeita os limiares, inclusive na borda', () => {
  assert.equal(scoreBand(70), 'ok');
  assert.equal(scoreBand(69.9), 'warn');
  assert.equal(scoreBand(40), 'warn');
  assert.equal(scoreBand(39), 'critical');
  assert.equal(scoreBand(50, 90, 60), 'critical');
});

test('tom de consumo: primary, warn no aviso, critical no limite', () => {
  assert.equal(usageTone(79), 'primary');
  assert.equal(usageTone(80), 'warn');
  assert.equal(usageTone(100), 'critical');
  assert.equal(usageTone(120), 'critical');
  assert.equal(usageTone(50, 40, 60), 'warn');
});

test('horários de visita viram faixas contínuas de 30 min, sem repetir', () => {
  assert.deepEqual(groupVisitTimes(['09:00', '09:30', '10:00', '14:00', '09:30']), ['09h–10h30', '14h–14h30']);
  assert.deepEqual(groupVisitTimes(['08:30']), ['08h30–09h']);
  assert.deepEqual(groupVisitTimes([]), []);
});

test('cn junta classes e ignora falsos', () => {
  assert.equal(cn('a', false, undefined, null, 0, 'b', { c: true, d: false }), 'a b c');
});

test('inert só aparece quando a área está inativa', () => {
  assert.equal(inertAttribute(false), undefined);
  assert.equal(inertAttribute(true), 'inert');
});
