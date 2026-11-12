import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureDocker } from '../scripts/ensure-docker.mjs';

const noWait = async () => {};

test('Docker já de pé: não abre nada', async () => {
  let opened = 0;
  assert.equal(await ensureDocker({ platform: 'darwin', up: () => true, open: () => opened++, wait: noWait }), 'pronto');
  assert.equal(opened, 0);
});

test('Docker fechado no Mac: abre o Docker Desktop e espera o daemon', async () => {
  let opened = 0, calls = 0;
  const up = () => ++calls > 3;
  assert.equal(await ensureDocker({ platform: 'darwin', up, open: () => opened++, wait: noWait }), 'aberto');
  assert.equal(opened, 1);
});

test('Docker que não sobe no Mac: falha com o tempo esperado', async () => {
  await assert.rejects(
    ensureDocker({ platform: 'darwin', up: () => false, open: () => {}, wait: noWait, tries: 3, interval: 5000 }),
    /15s/,
  );
});

test('fora do macOS: não tenta abrir app nenhum', async () => {
  let opened = 0;
  assert.equal(await ensureDocker({ platform: 'linux', up: () => false, open: () => opened++, wait: noWait }), 'ausente');
  assert.equal(opened, 0);
});
