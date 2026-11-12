// Issue viniciuscoimbra/refy-design#11: no npm existe outro pacote chamado `refy`. Fora de um
// projeto com @refy-design/web instalado, o atalho sem -p baixa e executa esse pacote. Todo texto
// que vai para quem usa manda rodar o binário pelo pacote do refy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Casa `npx` seguido de opções e do pacote `refy` (com ou sem versão). Com `-p @refy-design/web`
// a palavra depois das opções é o pacote do refy, então a forma segura não casa.
const UNSAFE = /\bnpx(\s+-{1,2}[\w-]+)*\s+refy(@\S*)?\s/;
// A lista do que é interno mora no gerador da árvore pública, que não vai para o público: lá,
// todo arquivo rastreado já é público.
const isPublic = existsSync('scripts/public-tree.mjs')
  ? (await import('../scripts/public-tree.mjs')).isPublic
  : () => true;

// A promoção roda este teste na árvore exportada, que não tem .git: ali vale todo arquivo da
// pasta, menos o que nunca é fonte.
const NOT_SOURCE = new Set(['.git', 'node_modules', 'dist', 'dist-site', 'storybook-static']);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (NOT_SOURCE.has(entry.name)) return [];
    const path = dir === '.' ? entry.name : join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : entry.isFile() ? [path] : [];
  });
}

function trackedPublicFiles() {
  const files = existsSync('.git')
    ? execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0')
    : walk('.');
  return files.filter(file => file && isPublic(file) && existsSync(file));
}

test('o padrão pega o pacote de terceiros em qualquer grafia do npx', () => {
  const unsafe = ['refy contribute X', '-y refy contribute X', '--yes refy contribute X', 'refy@latest contribute X', '--yes refy@1.0.0 init'];
  for (const args of unsafe) assert.match(`npx ${args}`, UNSAFE, args);
});

test('o padrão deixa passar o binário pelo pacote do refy', () => {
  const safe = ['-p @refy-design/web refy contribute X', '--yes -p @refy-design/web refy contribute X', '--package=@refy-design/web refy contribute X', 'refy-mcp'];
  for (const args of safe) assert.doesNotMatch(`npx ${args}`, UNSAFE, args);
});

test('nenhum arquivo público manda rodar o pacote `refy` sem o pacote @refy-design/web', () => {
  const offenders = [];
  for (const file of trackedPublicFiles()) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => { if (UNSAFE.test(line)) offenders.push(`${file}:${index + 1}`); });
  }
  assert.deepEqual(offenders, [], 'troque por `npx -p @refy-design/web refy ...`');
});
