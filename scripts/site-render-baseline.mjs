// Prova de que um corte de desempenho não mudou o site: grava o que o site construído mostra e
// compara duas gravações.
//
//   node scripts/site-render-baseline.mjs capture <dist-site> <pasta>
//   node scripts/site-render-baseline.mjs compare <pasta-antes> <pasta-depois> [pasta-lado-a-lado]
//
// capture grava:
// - texts.json: título e texto visível de cada rota do sitemap (pt, en e es), abrindo pelo endereço,
//   e de algumas páginas abertas a partir da home pelo menu;
// - shots/*.png: home, ficha do Button (abas Web e Mobile), temas e playground nos três idiomas,
//   em 1280 e 375 px, com a página parada;
// - hero/*.png: a entrada da home em 300 ms, 2000 ms e no fim, com relógio falso (o mesmo instante
//   nas duas gravações), em 375 e 1280 px;
// - scroll/*.png: a home rolada até as cenas de rolagem, depois de a página assentar.
// compare diz o que mudou: texto por rota e pixels por foto (contados no navegador), e grava as
// fotos lado a lado (antes | depois) para olhar.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const onlyArg = args.find((arg) => arg.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",") : ["texts", "shots", "hero", "scroll"];
const [mode, first, second, third] = args.filter((arg) => !arg.startsWith("--"));
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain" };

function serve(dist) {
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
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream", "cache-control": "no-store" });
    res.end(readFileSync(path));
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })));
}

async function pool(items, size, work) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await work(queue.shift());
  }));
}

// Texto visível sem o que muda sozinho a cada segundo (relógio de gravação do VoiceRecorder).
const pageText = () => {
  const text = document.body.innerText.replace(/\b\d{1,2}:\d{2}\b/g, "mm:ss");
  return { title: document.title, text };
};

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await page.waitForFunction(() => !document.querySelector('[aria-label="Carregando documentação"], [aria-busy="true"]'), undefined, { timeout: 15_000 }).catch(() => undefined);
  await page.waitForTimeout(1500);
}

const shotPages = {
  pt: { home: "/", ficha: "/componentes/button", temas: "/temas", playground: "/playground" },
  en: { home: "/en", ficha: "/en/components/button", temas: "/en/themes", playground: "/en/playground" },
  es: { home: "/es", ficha: "/es/componentes/button", temas: "/es/temas", playground: "/es/playground" },
};
const menuWalks = {
  pt: ["Componentes", "Docs", "Templates", "Temas"],
  en: ["Components", "Docs", "Templates", "Themes"],
  es: ["Componentes", "Docs", "Plantillas", "Temas"],
};

async function capture(distArg, outArg) {
  const dist = resolve(distArg);
  const out = resolve(outArg);
  for (const dir of ["shots", "hero", "scroll"]) mkdirSync(join(out, dir), { recursive: true });
  const { origin, close } = await serve(dist);
  const launched = await chromium.launch();
  // Nada de fora do site (contador de estrelas do GitHub, fontes externas): a foto não pode
  // depender da rede.
  const browser = {
    newContext: async (options) => {
      const context = await launched.newContext(options);
      await context.route((url) => !url.href.startsWith(origin), (route) => route.abort());
      return context;
    },
    close: () => launched.close(),
  };
  const sitemap = readFileSync(join(dist, "sitemap.xml"), "utf8");
  const routes = [...new Set([...sitemap.matchAll(/<loc>https?:\/\/[^/<]+([^<]*)<\/loc>/g)].map((match) => match[1] || "/"))];

  // Texto de cada rota.
  const texts = {};
  if (only.includes("texts")) {
  await pool(routes, 6, async (route) => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      await page.goto(origin + route, { waitUntil: "load", timeout: 60_000 });
      await settle(page);
      texts[route] = await page.evaluate(pageText);
    } catch (error) {
      texts[route] = { error: String(error).slice(0, 200) };
    }
    await context.close();
  });
  // Pelo menu, a partir da home.
  for (const [locale, links] of Object.entries(menuWalks)) {
    for (const name of links) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(origin + shotPages[locale].home, { waitUntil: "load" });
      await settle(page);
      const link = page.locator("header").getByRole("link", { name, exact: true }).first();
      const key = `menu:${locale}:${name}`;
      if (await link.count()) {
        await link.click();
        await settle(page);
        texts[key] = { path: new URL(page.url()).pathname, ...(await page.evaluate(pageText)) };
      } else texts[key] = { error: "link do menu não encontrado" };
      await context.close();
    }
  }
  writeFileSync(join(out, "texts.json"), JSON.stringify(texts, null, 1));
  }

  // Fotos das páginas paradas.
  if (only.includes("shots"))
  for (const [locale, pages] of Object.entries(shotPages)) {
    for (const [name, route] of Object.entries(pages)) {
      for (const width of [1280, 375]) {
        const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, reducedMotion: "reduce" });
        const page = await context.newPage();
        await page.goto(origin + route, { waitUntil: "load" });
        await settle(page);
        await page.screenshot({ path: join(out, "shots", `${locale}-${name}-${width}.png`) });
        if (name === "ficha") {
          await page.getByRole("radio", { name: "Mobile" }).first().click();
          await settle(page);
          await page.waitForTimeout(1500);
          await page.screenshot({ path: join(out, "shots", `${locale}-ficha-mobile-${width}.png`) });
        }
        await context.close();
      }
    }
  }

  // Entrada da home com relógio falso: o quadro de 300 ms é 300 ms depois do primeiro quadro em
  // que a entrada existe, nas duas gravações.
  if (only.includes("hero"))
  for (const width of [375, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
    const page = await context.newPage();
    // Relógio próprio (o mesmo de tests/site-hero-motion.spec.ts): Date.now parado e quadros só
    // quando a gravação avança, de 16 em 16 ms. O relógio do Playwright varia 1 ms entre execuções.
    await page.addInitScript(() => {
      let now = Date.UTC(2026, 10, 18, 12, 0, 5);
      let queue = [];
      let next = 0;
      Date.now = () => now;
      window.requestAnimationFrame = (callback) => { next += 1; queue.push([next, callback]); return next; };
      window.cancelAnimationFrame = (handle) => { queue = queue.filter(([id]) => id !== handle); };
      window.__advance = (ms) => {
        const end = now + ms;
        while (now + 16 <= end) { now += 16; const run = queue; queue = []; for (const [, callback] of run) callback(now); }
        now = end;
      };
    });
    await page.goto(origin + "/", { waitUntil: "load" });
    // Com o relógio parado, o requestAnimationFrame não roda: espera do lado do Node.
    for (let tries = 0; tries < 150 && !(await page.evaluate(() => !!document.querySelector("[data-hero-word]"))); tries += 1) await page.waitForTimeout(100);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(2500);
    let at = 0;
    for (const mark of [300, 2000, 6000]) {
      await page.evaluate((ms) => window.__advance(ms), mark - at);
      at = mark;
      await page.screenshot({ path: join(out, "hero", `${width}-${mark === 6000 ? "final" : mark}.png`) });
    }
    await context.close();
  }

  // Cenas de rolagem da home depois de assentar.
  if (only.includes("scroll"))
  for (const width of [1280, 375]) {
    const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
    const page = await context.newPage();
    await page.goto(origin + "/", { waitUntil: "load" });
    await settle(page);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const stops = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
    for (const stop of stops) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round(height * stop));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(out, "scroll", `${width}-${Math.round(stop * 100)}.png`) });
    }
    writeFileSync(join(out, "scroll", `${width}-height.txt`), String(height));
    await context.close();
  }

  await browser.close();
  close();
  console.log(`gravado em ${out}: ${Object.keys(texts).length} textos`);
}

async function compare(beforeArg, afterArg, sideArg) {
  const before = resolve(beforeArg);
  const after = resolve(afterArg);
  const report = { text: [], pixels: [] };
  const readTexts = (dir) => existsSync(join(dir, "texts.json")) ? JSON.parse(readFileSync(join(dir, "texts.json"), "utf8")) : {};
  const a = readTexts(before);
  const b = readTexts(after);
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (JSON.stringify(a[key]) === JSON.stringify(b[key])) continue;
    const left = a[key]?.text ?? a[key]?.error ?? "";
    const right = b[key]?.text ?? b[key]?.error ?? "";
    const leftLines = left.split("\n");
    const rightLines = right.split("\n");
    const onlyBefore = leftLines.filter((line) => !rightLines.includes(line)).slice(0, 5);
    const onlyAfter = rightLines.filter((line) => !leftLines.includes(line)).slice(0, 5);
    report.text.push({ key, title: a[key]?.title === b[key]?.title ? undefined : [a[key]?.title, b[key]?.title], onlyBefore, onlyAfter });
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const side = sideArg ? resolve(sideArg) : "";
  if (side) mkdirSync(side, { recursive: true });
  for (const dir of ["shots", "hero", "scroll"]) {
    if (!existsSync(join(before, dir))) continue;
    for (const file of readdirSync(join(before, dir)).filter((name) => name.endsWith(".png"))) {
      const left = readFileSync(join(before, dir, file));
      const rightPath = join(after, dir, file);
      if (!existsSync(rightPath)) { report.pixels.push({ file: `${dir}/${file}`, differentPixels: "falta depois" }); continue; }
      const right = readFileSync(rightPath);
      const result = await page.evaluate(async ([l, r]) => {
        const load = (data) => new Promise((ok) => { const image = new Image(); image.onload = () => ok(image); image.src = `data:image/png;base64,${data}`; });
        const [x, y] = await Promise.all([load(l), load(r)]);
        if (x.width !== y.width || x.height !== y.height) return { differentPixels: -1, size: [x.width, x.height, y.width, y.height] };
        const read = (image) => { const canvas = document.createElement("canvas"); canvas.width = image.width; canvas.height = image.height; const context = canvas.getContext("2d"); context.drawImage(image, 0, 0); return context.getImageData(0, 0, image.width, image.height).data; };
        const p = read(x);
        const q = read(y);
        let count = 0;
        for (let index = 0; index < p.length; index += 4) if (p[index] !== q[index] || p[index + 1] !== q[index + 1] || p[index + 2] !== q[index + 2] || p[index + 3] !== q[index + 3]) count += 1;
        // Lado a lado: antes à esquerda, depois à direita, no máximo 1080 px de largura.
        const scale = Math.min(1, 1080 / (x.width * 2 + 16));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round((x.width * 2 + 16) * scale);
        canvas.height = Math.round(x.height * scale);
        const context = canvas.getContext("2d");
        context.fillStyle = "#888";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(x, 0, 0, x.width * scale, x.height * scale);
        context.drawImage(y, (x.width + 16) * scale, 0, y.width * scale, y.height * scale);
        return { differentPixels: count, side: canvas.toDataURL("image/png").split(",")[1] };
      }, [left.toString("base64"), right.toString("base64")]);
      if (side && result.side) writeFileSync(join(side, `${dir}-${basename(file)}`), Buffer.from(result.side, "base64"));
      report.pixels.push({ file: `${dir}/${file}`, differentPixels: result.differentPixels, ...(result.size ? { size: result.size } : {}) });
    }
  }
  await browser.close();
  const changedPixels = report.pixels.filter((item) => item.differentPixels !== 0);
  console.log(`texto: ${Object.keys(a).length} entradas, ${report.text.length} diferentes`);
  for (const item of report.text.slice(0, 30)) console.log(`  ${item.key}\n    antes: ${JSON.stringify(item.onlyBefore)}\n    depois: ${JSON.stringify(item.onlyAfter)}${item.title ? `\n    título: ${JSON.stringify(item.title)}` : ""}`);
  console.log(`fotos: ${report.pixels.length}, ${changedPixels.length} com pixel diferente`);
  for (const item of changedPixels) console.log(`  ${item.file}: ${item.differentPixels}${item.size ? ` ${item.size}` : ""}`);
  writeFileSync(join(after, "compare.json"), JSON.stringify(report, null, 1));
}

if (mode === "capture") await capture(first, second);
else if (mode === "compare") await compare(first, second, third);
else {
  console.error("uso: node scripts/site-render-baseline.mjs capture <dist-site> <pasta> | compare <antes> <depois> [lado-a-lado]");
  process.exit(1);
}
