import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from '@playwright/test';
import { sourceDigest } from './refy-site-harness.mjs';

const root = path.resolve(import.meta.dirname, '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'tests/refy-site/contract.json')));
const selected = process.argv.slice(2);
const frames = contract.references.flatMap(reference => reference.frames);
for (const id of selected) assert(frames.some(frame => frame.id === id), `Quadro desconhecido: ${id}`);
const output = path.resolve(root, process.env.REFY_CAPTURE_OUTPUT || 'docs/evidence/refy-site/current');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const digest = sourceDigest();
const themeSha256 = hash(fs.readFileSync(path.join(root, 'src/themes/refy-site.json')));
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch();
try {
  for (const frame of frames.filter(frame => !selected.length || selected.includes(frame.id))) {
    const context = await browser.newContext({ viewport: { width: frame.crop.width, height: frame.crop.height }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: frame.mode });
    try {
      const origin = new URL(process.env.REFY_STORYBOOK_URL || 'http://127.0.0.1:6006').origin;
      const transportErrors = [], verifiedAssets = new Map(), waiters = [];
      let available = 2;
      const acquire = () => available > 0 ? (available--, Promise.resolve()) : new Promise(resolve => waiters.push(resolve));
      const release = () => { const next = waiters.shift(); if (next) next(); else available++; };
      // The existing HTTP/1.0 service has a small accept queue; limit transport, never retry or change assets.
      await context.route(`${origin}/**`, async route => {
        await acquire();
        try {
          const response = await route.fetch({ maxRetries: 0 });
          assert(response.ok(), `${response.status()} ${route.request().url()}`);
          const bytes = await response.body();
          const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
          if (verifiedAssets.size < 12 && /\.(js|css|woff2)$/.test(pathname)) {
            const directory = path.join(root, 'storybook-static');
            const file = path.resolve(directory, `.${pathname}`);
            assert(file.startsWith(directory + path.sep), `Asset outside static directory: ${pathname}`);
            const sha256 = hash(bytes);
            assert.equal(sha256, hash(fs.readFileSync(file)), `Served asset differs: ${pathname}`);
            verifiedAssets.set(pathname, { path: pathname, sha256, bytes: bytes.length });
          }
          await route.fulfill({ response, body: bytes });
        } catch (error) {
          transportErrors.push(`${route.request().url()}: ${error.message}`);
          await route.abort('failed');
        } finally { release(); }
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const url = `${process.env.REFY_STORYBOOK_URL || "http://127.0.0.1:6006"}/iframe.html?id=${frame.storyId}&viewMode=story&globals=theme:refy-site;mode:${frame.mode}`;
      await page.goto(url);
      await page.locator('[data-refy-brand="Refy Site"]').first().waitFor();
      // Storybook bootstraps with Date-based debounce; freeze the specimen only after it mounts.
      await page.clock.setFixedTime(new Date('2026-10-14T12:00:00Z'));
      if (frame.id === "11-busca") await page.getByPlaceholder("Buscar páginas e componentes…").fill("composição");
      for (const document of page.frames()) {
        await document.evaluate(async () => {
          await window.document.fonts.ready;
          await Promise.all([...window.document.images].map(image => image.decode().catch(() => undefined)));
          for (const animation of window.document.getAnimations()) {
            if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish();
          }
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
      }
      assert.deepEqual(transportErrors, [], `${frame.id}: falhas de transporte ou integridade`);
      assert(verifiedAssets.size > 0, `${frame.id}: nenhuma amostra de asset verificada`);
      assert.deepEqual(errors, [], `${frame.id}: erros de renderização`);
      const png = await page.screenshot({ animations: 'disabled', scale: 'css' });
      const metadata = { sourceSha256: digest, themeSha256, storyId: frame.storyId, mode: frame.mode, brand: 'Refy Site', viewport: { width: frame.crop.width, height: frame.crop.height }, devicePixelRatio: 1, fontsReady: true, url, capturedAt: new Date().toISOString(), browser: `Chromium ${browser.version()} / Playwright / PNG nativo DPR1; reduced motion; relógio 2026-10-14 após montagem; fontes/imagens prontas`, imageSha256: hash(png) };
      metadata.transport = { origin, maxConcurrentRequests: 2, retries: 0, verifiedAssets: [...verifiedAssets.values()] };
      fs.writeFileSync(path.join(output, `${frame.id}.png`), png);
      fs.writeFileSync(path.join(output, `${frame.id}.json`), JSON.stringify(metadata, null, 2) + '\n');
      console.log(`${frame.id}: ${frame.crop.width}×${frame.crop.height}, captura real concluída`);
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
