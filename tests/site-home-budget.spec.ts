import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { serveBuiltSite, siteDist } from "./support/builtSite";

// refy-design#6, change fix-issues-desempenho-home, requisito "Home baixa só o que mostra".
// 273.788 B medidos em 12/11/2026; 233.232 B em 18/11/2026, depois de tirar o GSAP, o JSON de tokens
// e os dicionários inteiros da primeira carga (change perf-site-carga-sob-demanda). Folga de ~10%;
// ver docs/PACKAGE_COST.md.
const HOME_JS_GZIP_BUDGET = 256_000;

let site: Awaited<ReturnType<typeof serveBuiltSite>>;
test.beforeAll(async () => { site = await serveBuiltSite(); });
test.afterAll(async () => { await site?.close(); });

/** Caminho de cada .js que a página pediu ao próprio site, da abertura da home até a rede parar. */
async function homeScripts(page: Page) {
  const origin = new URL(site.url).origin;
  const scripts = new Set<string>();
  await page.route((url) => url.origin !== origin, (route) => route.abort());
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname.endsWith(".js")) scripts.add(url.pathname);
  });
  await page.goto(site.url, { waitUntil: "networkidle" });
  await expect(page.locator("#site-content h1")).toBeVisible();
  return [...scripts];
}

test("a primeira carga da home fica no orçamento de JavaScript gzip", async ({ page }) => {
  // A ficha e os exemplos baixam quando o navegador fica ocioso, depois da carga: não contam.
  await page.addInitScript(() => { window.requestIdleCallback = () => 0; });
  const scripts = await homeScripts(page);
  const sizes = scripts.map((path) => ({ path, gzip: gzipSync(readFileSync(join(siteDist, path))).length }));
  const total = sizes.reduce((sum, item) => sum + item.gzip, 0);
  console.log(`JS da home: ${total} B gzip em ${sizes.length} arquivos`);
  sizes.sort((a, b) => b.gzip - a.gzip).slice(0, 8).forEach((item) => console.log(`  ${item.gzip}\t${item.path}`));
  expect(total, `JS gzip da home acima do orçamento de ${HOME_JS_GZIP_BUDGET} B`).toBeLessThanOrEqual(HOME_JS_GZIP_BUDGET);
});

test("com o navegador ocioso, a home já deixa baixada a ficha dos componentes", async ({ page }) => {
  await page.route((url) => url.origin !== new URL(site.url).origin, (route) => route.abort());
  // Parte comum da ficha em pt (scripts/vite-locale-split.mjs), antes o docs.pt.json inteiro.
  const reference = page.waitForRequest(/\/locale-reference-pt-[^/]+\.js$/);
  await page.goto(site.url, { waitUntil: "load" });
  await reference;
});

test("se as cenas da home não baixam, a próxima visita à home tenta de novo e as monta", async ({ page }) => {
  const origin = new URL(site.url).origin;
  await page.route((url) => url.origin !== origin, (route) => route.abort());
  // A recarga única de site/main.tsx já aconteceu nesta rota: a falha não some com um reload.
  await page.addInitScript(() => { try { sessionStorage.setItem("refy:reloaded-for-build", "/"); } catch { /* sem storage */ } });
  let asked = 0;
  await page.route(/\/homeScenes-[^/]+\.js$/, (route) => (++asked === 1 ? route.abort() : route.continue()));
  await page.goto(site.url, { waitUntil: "load" });
  await expect.poll(() => asked).toBe(1);
  await page.locator('a[href$="/componentes"]').first().click();
  await expect(page).toHaveURL(/\/componentes/);
  await page.goBack();
  await expect(page.locator("#site-content h1")).toBeVisible();
  await expect.poll(() => asked, { message: "a segunda visita pede as cenas de novo" }).toBe(2);
  // A cena do manifesto pinta as linhas pelo GSAP: estilo inline nelas mostra que ela montou.
  await page.locator("[data-manifesto-line]").first().scrollIntoViewIfNeeded();
  await expect.poll(() => page.locator("[data-manifesto-line]").first().getAttribute("style")).toBeTruthy();
});
