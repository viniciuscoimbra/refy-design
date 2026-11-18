// Mede a primeira carga do site construído (npm run build:site): JS gzip pedido por rota e LCP
// num celular emulado. Uso: node scripts/measure-site-load.mjs [dist-site] [saida.json] [cargas]
//
// - JS da primeira carga: cada .js que a página pede ao próprio site até a rede parar, com o
//   requestIdleCallback desligado (o que só baixa com o navegador ocioso fica de fora, como em
//   tests/site-home-budget.spec.ts). Gzip padrão do Node sobre cada arquivo.
// - JS com ocioso: o mesmo, com o requestIdleCallback ligado, esperando 3 s depois da rede parar.
// - Aba Mobile: JS a mais que a ficha pede ao abrir a aba Mobile.
// - LCP: 375×812, CPU 4x, 1,6 Mbps, 150 ms de latência, servidor com gzip, cache vazio, mediana.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";

const [distArg = "dist-site", output = "", runsArg = "5"] = process.argv.slice(2);
const dist = resolve(distArg);
const runs = Number(runsArg);
if (!existsSync(join(dist, "index.html"))) throw new Error(`Falta ${dist}/index.html: rode npm run build:site antes.`);

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain" };
const gz = new Map();
const fileFor = (pathname) => {
  const clean = decodeURIComponent(pathname).replace(/\/$/, "") || "/index";
  for (const candidate of [clean, `${clean}.html`, `${clean}/index.html`]) {
    const path = join(dist, candidate);
    if (existsSync(path) && statSync(path).isFile()) return path;
  }
  return join(dist, "index.html");
};
const server = createServer((req, res) => {
  const path = fileFor(new URL(req.url, "http://x").pathname);
  const type = types[extname(path)] ?? "application/octet-stream";
  const compressible = /text|javascript|json|svg/.test(type);
  let body = readFileSync(path);
  const headers = { "content-type": type, "cache-control": "no-store" };
  if (compressible && /gzip/.test(req.headers["accept-encoding"] ?? "")) {
    if (!gz.has(path)) gz.set(path, gzipSync(body));
    body = gz.get(path);
    headers["content-encoding"] = "gzip";
  }
  res.writeHead(200, headers);
  res.end(body);
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const origin = `http://127.0.0.1:${server.address().port}`;
const gzipOf = (pathname) => gzipSync(readFileSync(join(dist, pathname))).length;

const browser = await chromium.launch();

async function scripts(route, { idle, mobileTab = false }) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  if (!idle) await page.addInitScript(() => { window.requestIdleCallback = () => 0; });
  const seen = new Set();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname.endsWith(".js")) seen.add(url.pathname);
  });
  await page.goto(origin + route, { waitUntil: "networkidle" });
  await page.locator("#site-content").first().waitFor();
  if (idle) await page.waitForTimeout(3000);
  let before = [];
  if (mobileTab) {
    before = [...seen];
    await page.getByRole("radio", { name: "Mobile" }).first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  }
  await context.close();
  const list = mobileTab ? [...seen].filter((path) => !before.includes(path)) : [...seen];
  const files = list.map((path) => ({ path, gzip: gzipOf(path) })).sort((a, b) => b.gzip - a.gzip);
  return { total: files.reduce((sum, file) => sum + file.gzip, 0), files };
}

async function lcp(route) {
  const values = [];
  for (let run = 0; run < runs; run += 1) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.addInitScript(() => {
      window.__lcp = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__lcp.push({ at: entry.startTime, tag: entry.element?.tagName ?? "", text: (entry.element?.textContent ?? "").slice(0, 40) });
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(origin + route, { waitUntil: "load", timeout: 120_000 });
    await page.waitForTimeout(4000);
    const entries = await page.evaluate(() => window.__lcp);
    await context.close();
    const last = entries[entries.length - 1];
    values.push(last ? { ms: Math.round(last.at), element: `${last.tag} ${last.text}`.trim() } : { ms: null, element: "" });
  }
  const sorted = values.map((value) => value.ms).filter((value) => value != null).sort((a, b) => a - b);
  return { median: sorted[Math.floor(sorted.length / 2)], runs: values };
}

const ficha = "/componentes/button";
const result = {
  dist,
  home: { first: await scripts("/", { idle: false }), idle: await scripts("/", { idle: true }) },
  ficha: { first: await scripts(ficha, { idle: false }), idle: await scripts(ficha, { idle: true }), mobileTab: await scripts(ficha, { idle: false, mobileTab: true }) },
  temas: { first: await scripts("/temas", { idle: false }) },
  playground: { first: await scripts("/playground", { idle: false }) },
  enHome: { first: await scripts("/en", { idle: false }) },
  esHome: { first: await scripts("/es", { idle: false }) },
  enFicha: { first: await scripts("/en/components/button", { idle: false }) },
  esFicha: { first: await scripts("/es/componentes/button", { idle: false }) },
};
if (runs > 0) {
  result.home.lcp = await lcp("/");
  result.ficha.lcp = await lcp(ficha);
}
await browser.close();
server.close();

const line = (label, item) => console.log(`${label.padEnd(26)} ${String(item.total).padStart(8)} B gzip em ${item.files.length} arquivos`);
line("home, primeira carga", result.home.first);
line("home, com ocioso", result.home.idle);
line("ficha, primeira carga", result.ficha.first);
line("ficha, com ocioso", result.ficha.idle);
line("ficha, aba Mobile (a mais)", result.ficha.mobileTab);
line("temas, primeira carga", result.temas.first);
line("playground, primeira carga", result.playground.first);
line("home en, primeira carga", result.enHome.first);
line("home es, primeira carga", result.esHome.first);
line("ficha en, primeira carga", result.enFicha.first);
line("ficha es, primeira carga", result.esFicha.first);
if (result.home.lcp) console.log(`LCP home: ${result.home.lcp.median} ms (${result.home.lcp.runs.map((r) => r.ms).join(", ")}) ${result.home.lcp.runs[0].element}`);
if (result.ficha.lcp) console.log(`LCP ficha: ${result.ficha.lcp.median} ms (${result.ficha.lcp.runs.map((r) => r.ms).join(", ")}) ${result.ficha.lcp.runs[0].element}`);
if (output) writeFileSync(output, JSON.stringify(result, null, 2));
