import { test, expect } from "@playwright/test";
import type { Browser } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { serveBuiltSite } from "./support/builtSite";

// Mudança perf-site-2026-11-18: a entrada da home (aprovada) e o carrossel deixaram de usar GSAP na
// primeira pintura (src/pages/RefySitePage/siteMotion.ts). Com o relógio parado e avançado de 16 em
// 16 ms, o estilo em linha de cada parte da hero e de cada card, quadro a quadro por 4,5 s (o
// carrossel em 375 px avança pela primeira vez depois de 3,4 s), tem de ser
// o que o GSAP 3.15 escrevia. A referência foi gravada na build de 17/11/2026 (com GSAP):
// REFY_HERO_MOTION_RECORD=1 grava de novo a partir da build servida.
const fixture = new URL("./fixtures/hero-motion-gsap.json", import.meta.url);
const record = !!process.env.REFY_HERO_MOTION_RECORD;
let site: Awaited<ReturnType<typeof serveBuiltSite>>;
test.beforeAll(async () => { site = await serveBuiltSite(); });
test.afterAll(async () => { await site?.close(); });

// Ordem das declarações não muda a imagem: compara o conjunto.
const normalize = (style: string | null) => (style ?? "").split(";").map((part) => part.trim()).filter(Boolean).sort().join("; ");

/**
 * Relógio próprio, antes de qualquer script: Date.now parado e requestAnimationFrame só quando o
 * teste avança, de 16 em 16 ms. O relógio do Playwright alinha os quadros a um instante que varia
 * 1 ms entre execuções, e isso mudava a quarta casa decimal tanto no GSAP quanto no motor novo.
 */
export function manualClock() {
  let now = Date.UTC(2026, 10, 18, 12, 0, 5);
  let queue: [number, FrameRequestCallback][] = [];
  let next = 0;
  Date.now = () => now;
  window.requestAnimationFrame = (callback) => { next += 1; queue.push([next, callback]); return next; };
  window.cancelAnimationFrame = (handle) => { queue = queue.filter(([id]) => id !== handle); };
  (window as unknown as { __advance: (ms: number) => void }).__advance = (ms) => {
    const end = now + ms;
    while (now + 16 <= end) {
      now += 16;
      const run = queue;
      queue = [];
      for (const [, callback] of run) callback(now);
    }
    now = end;
  };
}

async function frames(browser: Browser, width: number) {
  const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
  const page = await context.newPage();
  await page.route((url) => !url.href.startsWith(site.url), (route) => route.abort());
  await page.addInitScript(manualClock);
  await page.goto(site.url, { waitUntil: "load" });
  // Com o relógio parado o requestAnimationFrame não roda: espera do lado do teste.
  for (let tries = 0; tries < 150 && !(await page.evaluate(() => !!document.querySelector("[data-hero-word]"))); tries += 1) await page.waitForTimeout(100);
  await page.waitForTimeout(2500);
  const list: string[][] = [];
  for (let at = 16; at <= 4500; at += 16) {
    await page.evaluate(() => (window as unknown as { __advance: (ms: number) => void }).__advance(16));
    list.push(await page.evaluate(() => [...document.querySelectorAll("[data-hero-word], [data-hero-part], #site-content h1, [class*=reelItem]")].map((element) => element.getAttribute("style") ?? "")));
  }
  await context.close();
  return list.map((frame) => frame.map(normalize));
}

test("a entrada da home e o carrossel desenham, quadro a quadro, o que o GSAP desenhava", async ({ browser }) => {
  test.setTimeout(120_000);
  const reference: Record<string, string[][]> = record ? {} : JSON.parse(readFileSync(fixture, "utf8"));
  for (const width of [1280, 375]) {
    const current = await frames(browser, width);
    if (record) { reference[width] = current; continue; }
    const expected = reference[width];
    expect(current.length).toBe(expected.length);
    // Cada quadro tem as mesmas partes da referência: parte que some não passa por igual.
    const parts = expected.map((frame) => frame.length);
    expect(Math.min(...parts), `${width}px: referência sem partes`).toBeGreaterThan(0);
    expect(current.map((frame) => frame.length), `${width}px: número de partes por quadro`).toEqual(parts);
    const diffs = current.flatMap((frame, index) => frame.map((style, part) => style === expected[index][part] ? null : { quadro: (index + 1) * 16, parte: part, antes: expected[index][part], agora: style })).filter(Boolean);
    expect(diffs.slice(0, 5), `${width}px: ${diffs.length} estilos diferentes do GSAP`).toEqual([]);
  }
  if (record) writeFileSync(fixture, JSON.stringify(reference));
});
