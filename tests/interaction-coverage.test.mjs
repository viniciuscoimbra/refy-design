// COVG-01/02: marca explícita liga família a teste, e a catraca não deixa família
// nova entrar sem teste de interação.
import assert from 'node:assert/strict';
import test from 'node:test';
import { coverage, marksOf, ratchet } from '../scripts/interaction-coverage.mjs';

const spec = [
  "import { test } from '@playwright/test';",
  '// interação: Combobox, Select',
  "test('abre, filtra e escolhe', async () => {});",
  "test('sem marca', async () => {});",
].join('\n');

test('marca liga as famílias ao test() logo abaixo', () => {
  const marks = marksOf('tests/x.spec.ts', spec);
  assert.deepEqual(marks, [{ file: 'tests/x.spec.ts', line: 3, title: 'abre, filtra e escolhe', families: ['Combobox', 'Select'] }]);
  const { covered, missing, problems } = coverage(['Button', 'Combobox', 'Select'], marks);
  assert.deepEqual([...covered.keys()], ['Combobox', 'Select']);
  assert.deepEqual(missing, ['Button']);
  assert.deepEqual(problems, []);
});

test('nome da família no corpo do teste não conta como cobertura', () => {
  const marks = marksOf('tests/y.spec.ts', "test('clica no Button', async ({ page }) => { await page.getByText('Button').click(); });");
  assert.deepEqual(coverage(['Button'], marks).missing, ['Button']);
});

test('marca com família inexistente ou sem test() abaixo é recusada', () => {
  const marks = marksOf('tests/z.spec.ts', '// interação: Botao\nconst x = 1;');
  const { problems } = coverage(['Button'], marks);
  assert.ok(problems.some((line) => line.includes('sem test()')));
  assert.ok(problems.some((line) => line.includes('"Botao"')));
});

test('catraca: família nova sem teste reprova; família que ganhou teste só pede atualização', () => {
  assert.deepEqual(ratchet(['Button', 'Novo'], ['Button']).regressions, ['Novo']);
  assert.deepEqual(ratchet(['Button'], ['Button', 'Select']), { regressions: [], improved: ['Select'] });
});
