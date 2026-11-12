// Decide, num PR, se o CI precisa dos jobs de navegador e de consumidores. Eles levam quase todo o
// tempo da rodada e só testam o pacote, as stories e o site; PR que mexe só em spec, processo ou
// teste de node roda apenas o job check. Push no main, tags e a preparação da versão rodam tudo.
// Na dúvida (evento desconhecido, diff que falhou ou vazio), roda tudo.
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Nada aqui chega ao pacote, às stories ou ao site.
const OUTSIDE_BROWSER = [/^openspec\//, /^\.agents\//, /^\.claude\//, /^\.kiro\//, /^tests\/[^/]+\.test\.mjs$/];

// Arquivo que não vai para o repositório público também não é testado pelo navegador de lá.
const isPublic = existsSync(new URL('./public-tree.mjs', import.meta.url))
  ? (await import('./public-tree.mjs')).isPublic
  : () => true;

export function scope({ event, files, isPublicFile = () => true }) {
  const all = { browser: true, consumers: true };
  if (event !== 'pull_request' || !Array.isArray(files) || files.length === 0) return all;
  const touches = files.some(file => isPublicFile(file) && !OUTSIDE_BROWSER.some(pattern => pattern.test(file)));
  return { browser: touches, consumers: touches };
}

// Sem detecção de renomeação: mover um arquivo do pacote para a lista de fora tem que contar
// o caminho antigo também.
function changedFiles(base) {
  try {
    execFileSync('git', ['fetch', '-q', '--no-tags', 'origin', base], { stdio: 'ignore' });
    return execFileSync('git', ['diff', '--name-only', '--no-renames', `origin/${base}...HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return null;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const event = process.env.GITHUB_EVENT_NAME;
  const files = event === 'pull_request' ? changedFiles(process.env.GITHUB_BASE_REF) : null;
  const result = scope({ event, files, isPublicFile: isPublic });
  const lines = Object.entries(result).map(([job, run]) => `${job}=${run}`);
  console.log(lines.join(' '), files ? `(${files.length} arquivos)` : '');
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
}
