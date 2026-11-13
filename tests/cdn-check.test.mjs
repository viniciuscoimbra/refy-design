// CDN-01: a página testada importa o React da mesma URL que o /+esm do refy usa, e o
// workflow que a abre roda só no público, depois do release.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { cdnPage } from '../scripts/check-cdn.mjs';

test('página do CDN lê a versão do React dentro do /+esm do refy', () => {
  const html = cdnPage('1.6.2');
  assert.match(html, /@refy-design\/web@1\.6\.2\/\+esm/);
  assert.match(html, /@refy-design\/web@1\.6\.2\/dist\/style\.css/);
  assert.match(html, /source\.indexOf\("\/npm\/react@"\)/);
  assert.doesNotMatch(html, /react@\d+\.\d+\.\d+\/\+esm/, 'React com versão fixa na página duplicaria o React do refy');
});

test('workflow do CDN só no público, em ubuntu, depois do Release', () => {
  const yml = readFileSync('.github/workflows/cdn.yml', 'utf8');
  assert.match(yml, /github\.repository == 'viniciuscoimbra\/refy-design'/);
  assert.match(yml, /runs-on: ubuntu-latest/);
  assert.match(yml, /workflows: \["Release"\]/);
  assert.match(yml, /node scripts\/check-cdn\.mjs/);
});
