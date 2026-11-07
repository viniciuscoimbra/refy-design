import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import { chromium } from 'playwright';

const base = process.env.REFY_CATALOG_URL || 'http://127.0.0.1:6009';
const out = process.env.REFY_CATALOG_OUTPUT || '/tmp/refy-catalog-review';
const response = await fetch(`${base}/index.json`);
assert(response.ok, `Storybook index: ${response.status}`);
const { entries } = await response.json();
const stories = Object.values(entries).filter(entry => entry.type === 'story');
assert(stories.length > 0, 'Catálogo vazio');
const families = new Map();
for (const story of stories) if (story.title.startsWith('Componentes/')) {
  if (!families.has(story.title)) families.set(story.title, story);
}
assert(families.size >= 92, 'Famílias ausentes do catálogo');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
const jobs = stories.flatMap(story => [375, 1280].map(width => ({ story, mode: 'light', width, capture: false })));
const specimens = [...families.values(), ...stories.filter(story => /^(Exemplos|Fundamentos)\//.test(story.title))];
for (const story of specimens) for (const mode of ['light', 'dark', 'editorial']) for (const width of [375, 1280]) {
  jobs.push({ story, mode, width, capture: true });
}
let index = 0;
try {
  await Promise.all(Array.from({ length: 4 }, async () => {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    while (index < jobs.length) {
      const job = jobs[index++]; const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      const result = { id: job.story.id, title: job.story.title, mode: job.mode, width: job.width, capture: job.capture };
      try {
        await page.setViewportSize({ width: job.width, height: 900 });
        await page.goto(`${base}/iframe.html?id=${encodeURIComponent(job.story.id)}&viewMode=story&globals=theme:${job.mode}`);
        await page.locator('#storybook-root').waitFor({ state: 'visible', timeout: 15000 });
        await page.waitForFunction(() => document.querySelector('#storybook-root')?.childElementCount > 0, undefined, { timeout: 15000 });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
        if (job.capture && job.width === 1280) {
          await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
          result.contrast = await page.evaluate(async () => (await window.axe.run('#storybook-root', { runOnly: ['color-contrast'] })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
        }
        result.metrics = await page.evaluate(() => ({
          width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
          overflow: [...document.querySelectorAll('#storybook-root *')].filter(el => {
            const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
            if (!r.width || !r.height || s.visibility === 'hidden' || s.position === 'fixed') return false;
            let parent = el.parentElement;
            while (parent && parent !== document.body) {
              if (['auto','scroll','hidden','clip'].includes(getComputedStyle(parent).overflowX)) return false;
              parent = parent.parentElement;
            }
            return r.right > innerWidth + 2 || r.left < -2;
          }).slice(0, 6).map(el => ({ tag: el.tagName, text: el.textContent?.trim().slice(0, 80), class: el.className })),
          fonts: [...document.fonts].filter(font => font.status === 'loaded').map(font => font.family),
        }));
        if (job.capture) {
          result.image = `${job.story.id}-${job.mode}-${job.width}.png`;
          await page.screenshot({ path: path.join(out, result.image), fullPage: true, animations: 'disabled' });
        }
        result.errors = errors;
      } catch (error) { result.errors = [...errors, error.message]; }
      page.off('pageerror', onError); results.push(result);
      if (results.length % 100 === 0) console.log(`${results.length}/${jobs.length} verificados`);
    }
    await page.close();
  }));
} finally { await browser.close(); }
const report = { date: '2026-10-22', base, stories: stories.length, families: families.size, results };
await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
const failures = results.filter(r => r.errors.length);
const overflow = results.filter(r => r.metrics?.overflow.length);
console.log(JSON.stringify({ stories: stories.length, families: families.size, cases: results.length, failures: failures.length, overflow: overflow.length, out }));
assert.equal(failures.length, 0, 'Falhas de renderização: consulte report.json');

assert.equal(overflow.length, 0, 'Conteudo fora do viewport: consulte report.json');
assert.equal(results.filter(r => r.contrast?.length).length, 0, 'Falhas de contraste nas amostras: consulte report.json');
