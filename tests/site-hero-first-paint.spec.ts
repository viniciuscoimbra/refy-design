import { test, expect } from "@playwright/test";
import { serveBuiltSite } from "./support/builtSite";

// refy-design#9, change fix-issues-desempenho-home, requisito "Texto da hero visível desde o
// primeiro quadro": no celular o texto da hero ficava transparente enquanto a entrada rodava.
// Título, frase e botões aparecem no primeiro quadro em que existem; a entrada só os desloca.
let site: Awaited<ReturnType<typeof serveBuiltSite>>;
test.beforeAll(async () => { site = await serveBuiltSite(); });
test.afterAll(async () => { await site?.close(); });

interface HeroFrame { at: number; opacity: Record<string, number | null>; titleInViewport: boolean }

// Roda na página antes de qualquer script: quando o título da hero entra no DOM, anota a cada
// quadro a opacidade efetiva (produto da opacidade de cada ancestral) do título, da frase e dos
// botões, por 1,5 s. Parte que não existe vira null, e o teste a recusa.
function recordHeroFrames() {
  const frames: HeroFrame[] = [];
  (window as unknown as { heroFrames: HeroFrame[] }).heroFrames = frames;
  const effectiveOpacity = (element: Element | null) => {
    if (!element) return null;
    let value = 1;
    for (let node = element; node; node = node.parentElement) value *= Number(getComputedStyle(node).opacity);
    return value;
  };
  const sample = (start: number) => {
    const title = document.querySelector("#site-content h1");
    const fold = title?.parentElement;
    const rect = title?.getBoundingClientRect();
    frames.push({
      at: performance.now() - start,
      opacity: {
        title: effectiveOpacity(title ?? null),
        lead: effectiveOpacity(fold?.querySelector(":scope > p") ?? null),
        actions: effectiveOpacity(fold?.querySelector(":scope > h1 ~ div") ?? null),
      },
      titleInViewport: !!rect && rect.height > 0 && rect.top >= 0 && rect.bottom <= innerHeight,
    });
    if (performance.now() - start < 1500) requestAnimationFrame(() => sample(start));
  };
  const watch = new MutationObserver(() => {
    if (!document.querySelector("#site-content h1")) return;
    watch.disconnect();
    const start = performance.now();
    requestAnimationFrame(() => sample(start));
  });
  document.addEventListener("DOMContentLoaded", () => watch.observe(document.body, { childList: true, subtree: true }));
}

test("no celular, o texto da hero está opaco e a caixa do título na tela desde o primeiro quadro", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.route((url) => url.origin !== new URL(site.url).origin, (route) => route.abort());
  await page.addInitScript(recordHeroFrames);
  await page.goto(site.url);
  await page.waitForFunction(() => {
    const frames = (window as unknown as { heroFrames?: HeroFrame[] }).heroFrames ?? [];
    return frames.length > 0 && frames[frames.length - 1].at >= 1500;
  }, undefined, { timeout: 30_000 });
  const frames = await page.evaluate(() => (window as unknown as { heroFrames: HeroFrame[] }).heroFrames);
  expect(frames[0].opacity, "título, frase e botões existem no primeiro quadro").toEqual({ title: expect.any(Number), lead: expect.any(Number), actions: expect.any(Number) });
  expect(frames[0].titleInViewport, "caixa do título fora da tela no primeiro quadro").toBe(true);
  const transparent = frames.filter((frame) => Object.values(frame.opacity).some((value) => value !== 1));
  expect(transparent.map((frame) => ({ at: Math.round(frame.at), ...frame.opacity })), "quadros com texto da hero transparente").toEqual([]);
});
