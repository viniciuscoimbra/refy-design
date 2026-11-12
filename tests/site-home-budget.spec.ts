import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { serveBuiltSite, siteDist } from "./support/builtSite";

// refy-design#6, change fix-issues-desempenho-home, requisito "Home baixa só o que mostra".
// 273.788 B medidos em 12/11/2026 depois do conserto, com folga de ~10%; ver docs/PACKAGE_COST.md.
const HOME_JS_GZIP_BUDGET = 300_000;

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
  const reference = page.waitForRequest(/\/docs\.pt-[^/]+\.js$/);
  await page.goto(site.url, { waitUntil: "load" });
  await reference;
});
