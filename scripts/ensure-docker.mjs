#!/usr/bin/env node
// O Firefox dos testes roda num contêiner (o do Playwright não abre no macOS 27). No Mac do
// runner, o Docker Desktop pode estar fechado depois de reinício ou atualização, e o
// `docker run` falha na hora sem rodar teste nenhum. Aqui ele é aberto e esperado; fora do
// macOS nada é aberto, e o `docker run` seguinte mostra o erro de sempre.
import { execFileSync } from 'node:child_process';

export function dockerUp(run = cmd => execFileSync(cmd[0], cmd.slice(1), { stdio: 'ignore' })) {
  try { run(['docker', 'info']); return true; } catch { return false; }
}

export async function ensureDocker({
  platform = process.platform,
  up = () => dockerUp(),
  open = () => execFileSync('open', ['-a', 'Docker'], { stdio: 'ignore' }),
  wait = ms => new Promise(r => setTimeout(r, ms)),
  tries = 60,
  interval = 5000,
} = {}) {
  if (up()) return 'pronto';
  if (platform !== 'darwin') return 'ausente';
  open();
  for (let i = 0; i < tries; i++) {
    await wait(interval);
    if (up()) return 'aberto';
  }
  throw new Error(`Docker não respondeu em ${(tries * interval) / 1000}s depois de aberto.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const estado = await ensureDocker();
  console.log(`docker: ${estado}`);
}
