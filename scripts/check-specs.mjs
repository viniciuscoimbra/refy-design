import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function validate(cwd, args) {
  const result = spawnSync('openspec', ['validate', ...args, '--strict', '--no-interactive'], { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  return result;
}
const actual = validate(process.cwd(), ['--all']);
process.stdout.write(actual.stdout);
process.stderr.write(actual.stderr);
assert.equal(actual.status, 0, 'Specs do repositório inválidas');
const fixture = mkdtempSync(join(tmpdir(), 'refy-spec-'));
try {
  mkdirSync(join(fixture, 'openspec/specs/fixture'), { recursive: true });
  const path = join(fixture, 'openspec/specs/fixture/spec.md');
  writeFileSync(path, '# Fixture\n\n## Purpose\nVerificar o validador estrutural em isolamento, aceitando o controle válido e recusando o inválido.\n\n## Requirements\n\n### Requirement: Valid fixture\nThe fixture SHALL be validated.\n\n#### Scenario: Valid\n- **WHEN** validation runs\n- **THEN** this fixture passes\n');
  const control = validate(fixture, ['fixture', '--type', 'spec']);
  assert.equal(control.status, 0, 'Controle válido deve passar: ' + control.stdout + control.stderr);
  writeFileSync(path, '# Fixture inválida\nSem requisitos ou cenários.\n');
  assert.notEqual(validate(fixture, ['fixture', '--type', 'spec']).status, 0, 'Fixture inválida deve falhar');
  console.log('OK: controle válido aceito; spec inválida recusada, sem alterar o repositório.');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
