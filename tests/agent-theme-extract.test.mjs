// Tema a partir de site: leitura estática, sonda no navegador, escolha com razão e ferramenta MCP.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE_PROBE, probeFrames, checkUrl, resolvePublic, launchGuarded, guardedPage, isPublicAddress, observeHtml, parseColor, primaryFamily, themeFromObservations } from "../tools/refy-agent/theme-extract.mjs";

const context = {
  catalog: JSON.parse(readFileSync("ai/catalog.json", "utf8")),
  foundations: JSON.parse(readFileSync("src/tokens/foundations.tokens.json", "utf8")),
};
const escuro = readFileSync("tests/fixtures/theme-extract/escuro.html", "utf8");
const claro = readFileSync("tests/fixtures/theme-extract/claro-tailwind.html", "utf8");

test("parseColor aceita hex, rgb, hsl, triplete HSL e oklch, e recusa transparente", () => {
  assert.equal(parseColor("#abc"), "#aabbcc");
  assert.equal(parseColor("rgb(124, 92, 255)"), "#7c5cff");
  assert.equal(parseColor("rgba(0, 0, 0, 0)"), null);
  assert.equal(parseColor("#00000010"), null);
  assert.equal(parseColor("hsl(0 0% 100%)"), "#ffffff");
  assert.equal(parseColor("222.2 84% 4.9%"), "#020817");
  assert.match(parseColor("oklch(0.6 0.2 280)"), /^#[\da-f]{6}$/);
  assert.equal(parseColor("var(--x)"), null);
  assert.equal(primaryFamily('"Instrument Serif", serif'), "Instrument Serif");
  assert.equal(primaryFamily("system-ui, -apple-system, sans-serif"), null);
});

test("site escuro: fundo, superfície, texto, primária, fontes e raio saem com a razão, e o tema passa no contrato", () => {
  const result = themeFromObservations(observeHtml(escuro), { name: "escuro" }, context);
  assert.equal(result.siteMode, "dark");
  assert.deepEqual(
    { bg: result.decided.bg, surface: result.decided.surface, ink: result.decided.ink, primary: result.decided.primary },
    { bg: "#0b0b0f", surface: "#14141a", ink: "#ededf2", primary: "#7c5cff" },
  );
  assert.equal(result.decided.fontBody, "Inter");
  assert.equal(result.decided.fontHeading, "Instrument Serif");
  assert.equal(result.decided.fontMono, "JetBrains Mono");
  assert.equal(result.decided.radius, "round");
  assert.equal(result.theme.tokens["--button-radius"], "999px", "botão pílula no site vira botão pílula no tema");
  assert.match(result.evidence.primary, /--accent/);
  assert.equal(result.theme.modes.dark["--bg"], "#0b0b0f");
  assert.equal(result.theme.modes.dark["--surface"], "#14141a");
  // No escuro a primária fica a do site (com o ajuste mínimo de contraste), não a clareada pelo gerador.
  assert.equal(result.theme.modes.dark["--primary"], result.theme.modes.light["--primary"]);
  assert.equal(result.validation.passed, true, result.validation.errors.join("\n"));
});

test("site claro com Tailwind pelo CDN: lê classes arbitrárias, tailwind.config e Google Fonts", () => {
  const result = themeFromObservations(observeHtml(claro), { name: "claro" }, context);
  assert.equal(result.siteMode, "light");
  assert.equal(result.decided.bg, "#faf7f2");
  assert.equal(result.decided.primary, "#0f766e");
  assert.equal(result.decided.fontBody, "Manrope");
  assert.equal(result.decided.radius, "default");
  assert.equal(result.theme.modes.light["--bg"], "#faf7f2");
  assert.equal(result.validation.passed, true, result.validation.errors.join("\n"));
});

test("sem cor de destaque, a extração diz o que faltou em vez de inventar primária", () => {
  assert.throws(() => themeFromObservations(observeHtml("<body style=\"background:#fff;color:#111\">texto</body>"), { name: "cinza" }, context), /Não achei cor de destaque/);
});

test("endereço local ou de rede interna é recusado antes de sair para a rede", async () => {
  const local = ["http://localhost:3000", "http://127.0.0.1", "http://192.168.0.10/x", "http://[::1]/", "file:///etc/passwd", "http://10.0.0.5",
    "http://[::ffff:127.0.0.1]/", "http://[::ffff:a9fe:a9fe]/", "http://[::]/", "http://[fe80::1]/", "http://100.64.0.1/", "http://0.1.2.3/", "http://198.18.0.1/", "http://224.0.0.1/"];
  for (const url of local) assert.throws(() => checkUrl(url), undefined, url);
  assert.equal(checkUrl("https://example.com/a").hostname, "example.com");
  assert.equal(checkUrl("http://10.example.com/").hostname, "10.example.com", "nome que começa com 10. não é IP");
  // O nome pode apontar para dentro: a conferência é pelo IP resolvido, todos eles.
  const dns = (table) => async (host) => table[host];
  await assert.rejects(resolvePublic("http://localtest.me/", dns({ "localtest.me": [{ address: "127.0.0.1", family: 4 }] })), /rede interna/);
  await assert.rejects(resolvePublic("http://misto.example/", dns({ "misto.example": [{ address: "93.184.215.14", family: 4 }, { address: "10.0.0.1", family: 4 }] })), /rede interna/);
  const ok = await resolvePublic("https://example.com/", dns({ "example.com": [{ address: "2606:2800:21f:cb07:6820:80da:af6b:8b2c", family: 6 }] }));
  assert.equal(ok.address, "2606:2800:21f:cb07:6820:80da:af6b:8b2c");
  assert.equal(isPublicAddress("::ffff:8.8.8.8"), true);
  assert.equal(isPublicAddress("2001:db8::1"), false);
});

test("MCP com url local não manda pedido nenhum, nem pelo navegador do projeto", async () => {
  const { createServer } = await import("node:http");
  let hits = 0;
  const server = createServer((_req, res) => { hits++; res.end("<body style=background:#fff>oi</body>"); });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const port = server.address().port;
  try {
    for (const url of [`http://127.0.0.1:${port}/`, `http://localhost:${port}/`, "file:///etc/hostname"]) {
      const child = spawn(process.execPath, [resolve("tools/refy-agent/mcp.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
      const reply = new Promise((done) => { let b = ""; child.stdout.on("data", (d) => { b += d; const i = b.indexOf("\n"); if (i >= 0) done(JSON.parse(b.slice(0, i))); }); });
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "refy_theme_extract", arguments: { url } } }) + "\n");
      const { result } = await reply;
      child.stdin.end();
      assert.equal(result.isError, true, url);
    }
    assert.equal(hits, 0, "o servidor local não pode receber pedido");
  } finally { server.close(); }
});

const chromiumPath = [process.env.REFY_CHROMIUM, "/opt/pw-browsers/chromium"].filter(Boolean).find(existsSync);
test("a sonda roda no navegador e dá o mesmo tema que a leitura do CSS", { skip: !process.env.REFY_BROWSER_TESTS && !chromiumPath && "sem navegador" }, async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch(chromiumPath ? { executablePath: chromiumPath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(escuro.replace(/<link[^>]*>/, ""));
    const probe = await page.evaluate(SITE_PROBE);
    const result = themeFromObservations(probe.observations, { name: "escuro" }, context);
    assert.equal(result.decided.bg, "#0b0b0f");
    assert.equal(result.decided.primary, "#7c5cff");
    assert.equal(result.decided.fontBody, "Inter");
    assert.equal(result.validation.passed, true, result.validation.errors.join("\n"));
  } finally { await browser.close(); }
});

test("o jeito do botão vira token, e caixa alta sem token no Refy volta como gap com a rota", { skip: !process.env.REFY_BROWSER_TESTS && !chromiumPath && "sem navegador" }, async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch(chromiumPath ? { executablePath: chromiumPath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.setContent(escuro.replace(/<link[^>]*>/, "").replace(".btn{", ".btn{text-transform:uppercase;letter-spacing:.1em;height:44px;box-shadow:0 4px 12px rgba(0,0,0,.3);"));
    const probe = await page.evaluate(SITE_PROBE);
    const result = themeFromObservations(probe.observations, { name: "botao" }, context);
    assert.equal(result.theme.tokens["--button-height-md"], "44px");
    assert.match(result.theme.tokens["--button-primary-shadow"], /0px 4px 12px/);
    assert.deepEqual(result.elements.gaps.map((g) => [g.element, g.property]), [["Button", "text-transform"], ["Button", "letter-spacing"]]);
    assert.match(result.elements.gaps[0].route, /refy-extensions/);
    assert.equal(result.validation.passed, true, result.validation.errors.join("\n"));
  } finally { await browser.close(); }
});

test("site que embrulha a tela num iframe isolado é lido de dentro do frame", { skip: !process.env.REFY_BROWSER_TESTS && !chromiumPath && "sem navegador" }, async () => {
  const { chromium } = await import("@playwright/test");
  const browser = await chromium.launch(chromiumPath ? { executablePath: chromiumPath } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const inner = escuro.replace(/<link[^>]*>/, "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    await page.setContent(`<body style="margin:0;background:#fff;color:#171717;font-family:Inter"><iframe sandbox="allow-scripts" style="border:0;width:100vw;height:100vh" srcdoc="${inner}"></iframe></body>`);
    await page.waitForTimeout(300);
    const outer = await page.evaluate(SITE_PROBE);
    assert.equal(outer.frames.length, 1, "a página de fora aponta o iframe");
    const probe = await probeFrames(page);
    const result = themeFromObservations(probe.observations, { name: "embrulhado" }, context);
    assert.equal(result.decided.bg, "#0b0b0f");
    assert.equal(result.decided.primary, "#7c5cff");
  } finally { await browser.close(); }
});

test("MCP refy_theme_extract com html devolve tema, evidência, aviso de direitos e uso", async () => {
  const child = spawn(process.execPath, [resolve("tools/refy-agent/mcp.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
  const reply = new Promise((done) => {
    let buffer = "";
    child.stdout.on("data", (d) => { buffer += d; const i = buffer.indexOf("\n"); if (i >= 0) done(JSON.parse(buffer.slice(0, i))); });
  });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "refy_theme_extract", arguments: { html: escuro, name: "painel" } } }) + "\n");
  const { result } = await reply;
  child.stdin.end();
  assert.equal(result.isError, false, result.content[0].text);
  const out = result.structuredContent;
  assert.equal(out.theme.name, "painel");
  assert.equal(out.file, "painel.theme.json");
  assert.equal(out.validation.passed, true);
  assert.match(out.rights, /não publique/);
  assert.match(out.usage, /ThemeProvider/);
  assert.equal(out.source.reading, "HTML e CSS passados na chamada");
});

test("navegador preso ao proxy: redirecionamento, WebSocket, popup e iframe para a rede interna não saem", { skip: !process.env.REFY_BROWSER_TESTS && !chromiumPath && "sem navegador" }, async () => {
  const { createServer } = await import("node:http");
  const net = await import("node:net");
  const listen = (server) => new Promise((done) => server.listen(0, "127.0.0.1", () => done(server.address().port)));
  const internal = [];
  const inner = createServer((req, res) => { internal.push(req.url); res.end("interno"); });
  const socketHits = [];
  const ws = net.createServer((socket) => { socketHits.push(1); socket.destroy(); });
  const dgram = await import("node:dgram");
  let udpHits = 0;
  const stun = dgram.createSocket("udp4").on("message", () => udpHits++);
  await new Promise((done) => stun.bind(0, "127.0.0.1", done));
  const stunPort = stun.address().port;
  const [innerPort, wsPort] = [await listen(inner), await listen(ws)];
  const site = createServer((req, res) => {
    if (req.url === "/salto") { res.writeHead(302, { location: `http://127.0.0.1:${innerPort}/via-redirect` }); return res.end(); }
    res.setHeader("content-type", "text/html");
    res.end(`<body style="background:#0b0b0f;color:#ededf2"><button style="background:#7c5cff">Ok</button>
      <iframe src="http://127.0.0.1:${innerPort}/iframe"></iframe><img src="http://localhost:${innerPort}/img">
      <script>new WebSocket("ws://127.0.0.1:${wsPort}/");window.open("http://127.0.0.1:${innerPort}/popup");fetch("/salto").catch(()=>{});
      try { const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:127.0.0.1:${stunPort}" }] }); pc.createDataChannel("x"); pc.createOffer().then((o) => pc.setLocalDescription(o)); } catch {}</script></body>`);
  });
  const sitePort = await listen(site);
  // "publico.test" resolve para um IP público de mentira; o dial leva esse IP ao servidor local do teste.
  const guard = { resolve: async () => [{ address: "93.184.215.14", family: 4 }], dial: (address) => (address === "93.184.215.14" ? "127.0.0.1" : address) };
  const { chromium } = await import("@playwright/test");
  const browser = await launchGuarded(chromium, chromiumPath ? { executablePath: chromiumPath } : {}, guard);
  try {
    const page = await guardedPage(browser);
    await page.goto(`http://publico.test:${sitePort}/`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    assert.equal(await page.locator("button").textContent(), "Ok", "o site público abre pelo proxy");
    assert.deepEqual(internal, [], "nenhum pedido chegou ao servidor interno");
    assert.equal(socketHits.length, 0, "o WebSocket interno não conectou");
    assert.equal(udpHits, 0, "WebRTC não manda UDP para a rede interna");
  } finally {
    await browser.close();
    for (const s of [inner, ws, site, stun]) s.close();
  }
});
