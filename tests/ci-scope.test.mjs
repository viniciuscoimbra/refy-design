// O CI do PR roda navegador e consumidores só quando o PR mexe em algo que eles testam. A suíte
// inteira continua rodando no push do main, nas tags e na preparação de cada versão.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scope } from '../scripts/ci-scope.mjs';

test('PR só de processo, spec ou teste de node não roda navegador nem consumidores', () => {
  const files = ['openspec/specs/x/spec.md', '.agents/skills/a/SKILL.md', 'tests/ci-scope.test.mjs', 'oficina/registro.json'];
  const isPublicFile = file => !file.startsWith('oficina/');
  assert.deepEqual(scope({ event: 'pull_request', files, isPublicFile }), { browser: false, consumers: false });
  assert.deepEqual(scope({ event: 'pull_request', files }), { browser: true, consumers: true }, 'arquivo público fora da lista roda tudo');
});

test('PR que toca componente, spec de navegador, story ou dependência roda tudo', () => {
  for (const file of ['src/components/Button/Button.tsx', 'tests/core.spec.ts', 'src/stories/Button.stories.tsx', 'package-lock.json', 'playwright.config.ts', '.github/workflows/ci.yml', 'CHANGELOG.md']) {
    assert.deepEqual(scope({ event: 'pull_request', files: ['openspec/x.md', file] }), { browser: true, consumers: true }, file);
  }
});

test('push, tag e diff que falhou rodam tudo', () => {
  assert.deepEqual(scope({ event: 'push', files: ['openspec/x.md'] }), { browser: true, consumers: true });
  assert.deepEqual(scope({ event: 'pull_request', files: null }), { browser: true, consumers: true });
  assert.deepEqual(scope({ event: 'pull_request', files: [] }), { browser: true, consumers: true });
});
