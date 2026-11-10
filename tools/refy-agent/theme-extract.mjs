// Tema a partir de um site: lê as cores, fontes e raios que o site usa e monta um tema do Refy
// com generateTheme, conferido por validateTheme. Três fontes de leitura, da mais fiel à mais
// pobre: estilos computados num navegador (sonda SITE_PROBE), o HTML e o CSS servidos, ou o
// HTML/CSS que o agente já tem. Todas viram a mesma lista de observações, e a escolha de cada
// token sai com a razão escrita, para quem usa conferir o que a ferramenta decidiu.
import { createRequire } from "node:module";
import { join } from "node:path";
import net, { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { contrast, fit, generateTheme, hexToOklch, oklchToHex, validateTheme } from "./theme.mjs";

// ---- cor ----------------------------------------------------------------------------------
const hex2 = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
const rgbHex = (r, g, b) => "#" + [r, g, b].map(hex2).join("");
function hslToRgb(h, s, l) {
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  return [0, 8, 4].map((n) => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
}
const num = (v, scale = 1) => (String(v).trim().endsWith("%") ? (parseFloat(v) / 100) * scale : parseFloat(v));
const alphaOf = (v) => (v === undefined ? 1 : num(v, 1));

// Devolve #rrggbb, ou null para transparente, translúcido demais, var() ou cor que não é cor.
export function parseColor(value) {
  const v = String(value ?? "").trim().toLowerCase();
  let m;
  if ((m = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.exec(v))) {
    let h = m[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    if (h.length === 8 && parseInt(h.slice(6), 16) / 255 < 0.5) return null;
    return "#" + h.slice(0, 6);
  }
  const parts = (inner) => inner.replace(/[,/]/g, " ").split(/\s+/).filter(Boolean);
  if ((m = /^rgba?\(([^)]+)\)$/.exec(v))) {
    const [r, g, b, a] = parts(m[1]);
    if (alphaOf(a) < 0.5) return null;
    return rgbHex(num(r, 255), num(g, 255), num(b, 255));
  }
  if ((m = /^hsla?\(([^)]+)\)$/.exec(v)) || (m = /^(\d+(?:\.\d+)?(?:deg)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%)$/.exec(v))) {
    const [h, s, l, a] = parts(m[1]);
    if (alphaOf(a) < 0.5) return null;
    return rgbHex(...hslToRgb(parseFloat(h), num(s, 1), num(l, 1)));
  }
  if ((m = /^oklch\(([^)]+)\)$/.exec(v))) {
    const [l, c, h, a] = parts(m[1]);
    if (alphaOf(a) < 0.5 || [l, c, h].some((x) => x === undefined || x === "none")) return null;
    return oklchToHex({ l: num(l, 1), c: num(c, 0.4), h: parseFloat(h) });
  }
  return null;
}

const GENERIC_FONTS = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded", "emoji", "math", "fangsong", "inherit", "initial", "unset", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto", "helvetica neue", "arial", "helvetica", "noto sans", "apple color emoji", "segoe ui emoji", "segoe ui symbol", "noto color emoji", "menlo", "monaco", "consolas", "liberation mono", "courier new", "sfmono-regular", "times new roman", "georgia", "times"]);
// Primeira família nomeada que não é genérica nem do sistema, ou null.
export function primaryFamily(value) {
  for (const raw of String(value ?? "").split(",")) {
    const family = raw.trim().replace(/^["']|["']$/g, "").trim();
    if (family && !/^var\(/.test(family) && !GENERIC_FONTS.has(family.toLowerCase())) return family;
  }
  return null;
}
function radiusPx(value) {
  const v = String(value ?? "").trim().split(/\s+/)[0];
  // Raio enorme (999px, 9999px) é o jeito de escrever pílula; vira 9999 para contar como tal.
  if (/^\d+(\.\d+)?px$/.test(v)) return parseFloat(v) >= 500 ? 9999 : parseFloat(v);
  if (/^\d+(\.\d+)?rem$/.test(v)) return parseFloat(v) * 16;
  if (/^50%$/.test(v)) return 9999;
  return null;
}

// ---- observações --------------------------------------------------------------------------
// { role: root|button|heading|card|code|text|any|token, prop, value, weight, name? }
const ROLE_BY_SELECTOR = [
  [/(^|[\s,>+~])(html|body|:root)\b|\[data-theme|\.dark\b|\.light\b/, "root"],
  [/button|\.btn|\bcta\b|\[type=["']?submit|\[role=["']?button/, "button"],
  [/(^|[\s,>+~.])h[1-3]\b|heading|headline|display|\.title\b|hero/, "heading"],
  [/\b(pre|code|kbd|samp)\b|mono/, "code"],
  [/card|panel|surface|tile|modal|dialog|popover/, "card"],
];
const roleOfSelector = (selector) => ROLE_BY_SELECTOR.find(([re]) => re.test(selector))?.[1] ?? "any";
const ROLE_BY_TAG = { html: "root", body: "root", button: "button", h1: "heading", h2: "heading", h3: "heading", pre: "code", code: "code", kbd: "code" };
const COLOR_PROPS = new Set(["background", "background-color", "color", "border-color", "fill"]);

function declarations(block) {
  const out = [];
  for (const part of block.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const prop = part.slice(0, i).trim().toLowerCase(), value = part.slice(i + 1).replace(/!important/i, "").trim();
    if (prop && value) out.push([prop, value]);
  }
  return out;
}
function observeDeclaration(out, role, prop, value, weight, vars) {
  const resolved = value.replace(/var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g, (_, name, fallback) => vars.get(name) ?? fallback ?? "");
  if (prop.startsWith("--")) {
    out.push({ role: "token", prop, name: prop, value: resolved, weight });
    return;
  }
  if (COLOR_PROPS.has(prop)) {
    const color = prop === "background" ? resolved.match(/#[\da-f]{3,8}\b|(?:rgba?|hsla?|oklch)\([^)]*\)/i)?.[0] : resolved;
    if (color) out.push({ role, prop: prop === "color" ? "color" : prop === "border-color" ? "border" : "background", value: color, weight });
  } else if (prop === "font-family" || prop === "font") out.push({ role, prop: "font-family", value: prop === "font" ? resolved.replace(/^.*?\d[\w.%/]*\s+/, "") : resolved, weight });
  else if (prop === "border-radius") out.push({ role, prop: "border-radius", value: resolved, weight });
}

export function observeCss(css, weight = 1) {
  const text = String(css ?? "").replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [], vars = new Map();
  const rules = [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), declarations(m[2])]);
  // Custom properties primeiro, para resolver var() nas regras que vêm antes delas no arquivo.
  for (const [, decls] of rules) for (const [prop, value] of decls) if (prop.startsWith("--") && !vars.has(prop)) vars.set(prop, value);
  for (const [name, value] of vars) vars.set(name, value.replace(/var\((--[\w-]+)\)/g, (_, n) => vars.get(n) ?? ""));
  for (const [selector, decls] of rules) {
    if (selector.startsWith("@")) continue;
    const role = roleOfSelector(selector.toLowerCase());
    for (const [prop, value] of decls) observeDeclaration(out, role, prop, value, weight, vars);
  }
  return out;
}

const TW_COLOR = /(?:^|\s)(bg|text|border|from|to|via|fill)-\[([^\]\s]+)\]/g;
const TW_RADIUS = /(?:^|\s)rounded(?:-[a-z]{1,2})?-\[([^\]\s]+)\]|(?:^|\s)rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?(?=\s|$)/g;
const TW_RADIUS_PX = { "-none": 0, "-sm": 2, "": 4, "-md": 6, "-lg": 8, "-xl": 12, "-2xl": 16, "-3xl": 24, "-full": 9999 };
export function observeHtml(html) {
  const text = String(html ?? "");
  const out = [];
  for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) out.push(...observeCss(m[1], 1));
  for (const m of text.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase(), attrs = m[2];
    let role = ROLE_BY_TAG[tag] ?? "any";
    if (tag === "a" && /\b(btn|button|cta)\b|bg-/.test(attrs)) role = "button";
    const style = /\sstyle\s*=\s*"([^"]*)"/i.exec(attrs)?.[1];
    if (style) for (const [prop, value] of declarations(style)) observeDeclaration(out, role, prop, value, 1, new Map());
    const classes = /\sclass(?:Name)?\s*=\s*"([^"]*)"/i.exec(attrs)?.[1];
    if (!classes) continue;
    for (const [, kind, value] of classes.matchAll(TW_COLOR)) {
      const prop = kind === "text" ? "color" : kind === "border" ? "border" : "background";
      out.push({ role: kind === "from" || kind === "to" || kind === "via" ? "button" : role, prop, value: value.replace(/_/g, " "), weight: 1 });
    }
    for (const [, arbitrary, preset] of classes.matchAll(TW_RADIUS)) {
      const px = arbitrary ? arbitrary : `${TW_RADIUS_PX[preset ?? ""]}px`;
      if (role === "button" || role === "any") out.push({ role: role === "button" ? "button" : "card", prop: "border-radius", value: px, weight: 1 });
    }
  }
  // tailwind.config embutido na página (Tailwind pelo CDN): nomes como primary, brand, accent.
  for (const m of text.matchAll(/tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*<\/script>/gi))
    for (const [, name, value] of m[1].matchAll(/["']?([\w-]+)["']?\s*:\s*["'](#[\da-f]{3,8}|(?:rgb|hsl|oklch)a?\([^)]*\))["']/gi))
      out.push({ role: "token", prop: `--${name}`, name: `--${name}`, value, weight: 2 });
  for (const m of text.matchAll(/fonts\.googleapis\.com\/css2?\?([^"'\s>]+)/gi))
    for (const [, family] of m[1].replace(/&amp;/g, "&").matchAll(/family=([^:&]+)/g))
      out.push({ role: "webfont", prop: "font-family", value: decodeURIComponent(family.replace(/\+/g, " ")), weight: 2 });
  return out;
}

// Roda dentro da página (navegador do agente, Playwright, DevTools). Devolve { observations }.
// Pesa cada fundo pela área visível, porque a cor que ocupa a tela é a que define o site.
export const SITE_PROBE = `(() => {
  const out = [], cs = (el) => getComputedStyle(el), clear = (c) => !c || c === "transparent" || /rgba\\([^)]*,\\s*0\\)$/.test(c);
  const push = (role, prop, value, weight) => value && out.push({ role, prop, value, weight: Math.round(weight * 100) / 100 });
  const page = innerWidth * innerHeight, body = cs(document.body), html = cs(document.documentElement);
  push("root", "background", clear(body.backgroundColor) ? html.backgroundColor : body.backgroundColor, 50);
  push("root", "color", body.color, 50);
  push("root", "font-family", body.fontFamily, 20);
  // Fundo visível: em cinco pontos da tela, o primeiro fundo pintado de cima para baixo.
  for (const [x, y] of [[0.5, 0.5], [0.08, 0.3], [0.92, 0.3], [0.08, 0.9], [0.92, 0.9]])
    for (const el of document.elementsFromPoint(innerWidth * x, innerHeight * y)) {
      const c = cs(el).backgroundColor;
      if (!clear(c) && el.getBoundingClientRect().width * el.getBoundingClientRect().height > page * 0.3) { push("visible", "background", c, 12); break; }
    }
  for (const el of [...document.querySelectorAll("body *")].slice(0, 4000)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0) continue;
    const s = cs(el), tag = el.tagName.toLowerCase();
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) continue;
    const area = Math.min(1, (r.width * r.height) / page);
    const filled = !clear(s.backgroundColor);
    const role = tag === "button" || el.getAttribute("role") === "button" || (tag === "a" && filled && s.display !== "inline") ? "button"
      : /^h[1-3]$/.test(tag) ? "heading" : /^(code|pre|kbd)$/.test(tag) ? "code" : filled && area > 0.01 ? "card" : "any";
    if (filled) push(role, "background", s.backgroundColor, role === "button" ? 4 : 1 + area * 30);
    if (s.backgroundImage.includes("gradient") && role === "button") for (const c of s.backgroundImage.match(/rgba?\\([^)]*\\)/g) ?? []) push("button", "background", c, 2);
    const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (text) push(role === "any" || role === "card" ? "text" : role, "color", s.color, 1);
    if (text && role !== "any") push(role, "font-family", s.fontFamily, 2);
    if (role === "card" || (role === "button" && (filled || parseFloat(s.borderTopWidth) > 0))) push(role, "border-radius", s.borderTopLeftRadius, 1);
    // O jeito de cada elemento: medidas e tipografia que viram tokens de componente.
    const box = { height: r.height, width: r.width, paddingInline: parseFloat(s.paddingLeft), padding: parseFloat(s.paddingTop), radius: s.borderTopLeftRadius,
      borderWidth: parseFloat(s.borderTopWidth), borderColor: s.borderTopColor, shadow: s.boxShadow, background: s.backgroundColor, color: s.color,
      fontSize: parseFloat(s.fontSize), fontWeight: Number(s.fontWeight), letterSpacing: s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing), textTransform: s.textTransform };
    const bordered = box.borderWidth > 0 && !clear(s.borderTopColor);
    if (role === "button" && (filled || bordered) && r.height >= 24) push("button", "style", box, 1);
    else if (/^(input|select|textarea)$/.test(tag) && s.display !== "none" && el.type !== "hidden" && el.type !== "checkbox" && el.type !== "radio") push("field", "style", box, 1);
    else if (role === "card" && area < 0.6 && (box.shadow !== "none" || bordered)) push("card", "style", box, 1);
    else if (role === "heading" && text) push("heading", "style", box, 1);
    else if (text && filled && r.height <= 30 && r.width < 220 && role !== "button") push("badge", "style", box, 1);
    else if (text && !filled && s.textTransform === "uppercase" && box.letterSpacing / box.fontSize >= 0.06 && box.fontSize <= 14) push("eyebrow", "style", box, 1);
  }
  // Página que só embrulha a tela num iframe (construtores de site fazem isso): diz onde ela está.
  const frames = [...document.querySelectorAll("iframe")].filter((f) => { const r = f.getBoundingClientRect(); return r.width * r.height > page * 0.5; }).map((f) => f.src);
  return { url: location.href, observations: out, frames };
})()`;

// ---- leitura pela rede --------------------------------------------------------------------
// O endereço vem de quem conversa com o agente: só sai pedido para endereço público. A conferência
// é pelo IP resolvido (nome como localtest.me aponta para 127.0.0.1), a cada redirecionamento, e
// a conexão usa o IP conferido, para o DNS não trocar de resposta entre a conferência e o pedido.
const V4_BLOCKED = [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
  ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 3],
];
const v4ToInt = (ip) => ip.split(".").reduce((n, part) => n * 256 + Number(part), 0);
function v6Words(ip) {
  let text = ip.toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];
  const tail = /(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (tail) { const n = v4ToInt(tail[1]); text = text.slice(0, -tail[1].length) + `${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`; }
  const [head, rest] = text.split("::");
  const a = head ? head.split(":") : [], b = rest !== undefined ? (rest ? rest.split(":") : []) : [];
  const words = rest !== undefined ? [...a, ...Array(8 - a.length - b.length).fill("0"), ...b] : a;
  return words.map((w) => parseInt(w || "0", 16));
}
export function isPublicAddress(ip) {
  const kind = isIP(String(ip).replace(/^\[|\]$/g, ""));
  if (kind === 4) { const n = v4ToInt(ip); return !V4_BLOCKED.some(([base, bits]) => (n >>> (32 - bits)) === (v4ToInt(base) >>> (32 - bits))); }
  if (kind !== 6) return false;
  const w = v6Words(ip);
  if (w.slice(0, 5).every((x) => x === 0) && (w[5] === 0xffff || w[5] === 0)) return w[5] === 0xffff && isPublicAddress(`${w[6] >> 8}.${w[6] & 255}.${w[7] >> 8}.${w[7] & 255}`); // ::, ::1, ::ffff:v4
  if (w[0] === 0x64 && w[1] === 0xff9b) return isPublicAddress(`${w[6] >> 8}.${w[6] & 255}.${w[7] >> 8}.${w[7] & 255}`); // NAT64
  if ((w[0] & 0xfe00) === 0xfc00 || (w[0] & 0xffc0) === 0xfe80 || (w[0] & 0xff00) === 0xff00 || w[0] === 0x2001 && w[1] === 0xdb8) return false;
  return (w[0] & 0xe000) === 0x2000; // só unicast global (2000::/3)
}
const REFUSED = "Endereço local ou de rede interna não é lido: passe um site público, ou o HTML/CSS no lugar do endereço.";
const PRIVATE_NAME = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.home\.arpa)$/i;
export function checkUrl(raw) {
  let url;
  try { url = new URL(String(raw)); } catch { throw Error(`Endereço inválido: ${raw}.`); }
  if (!/^https?:$/.test(url.protocol)) throw Error("Use um endereço http ou https.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_NAME.test(host) || (isIP(host) && !isPublicAddress(host))) throw Error(REFUSED);
  return url;
}
/** Confere o endereço e o IP para onde o nome aponta; devolve o IP público a usar na conexão. */
export async function resolvePublic(raw, resolve = lookup) {
  const url = checkUrl(raw);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [{ address: host, family: isIP(host) }] : await resolve(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address))) throw Error(REFUSED);
  return { url, address: addresses[0].address, family: addresses[0].family };
}
const LIMIT = 3_000_000;
function request(url, { address, family }, accept) {
  return new Promise((done, fail) => {
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.get(url, {
      headers: { accept, "user-agent": "refy-theme-extract (+https://refy.design)" },
      lookup: (_host, options, callback) => options?.all ? callback(null, [{ address, family }]) : callback(null, address, family),
      timeout: 12_000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) { res.resume(); return done({ redirect: new URL(res.headers.location, url).href }); }
      if (res.statusCode < 200 || res.statusCode >= 300) { res.resume(); return fail(Error(`${url.href} respondeu ${res.statusCode}.`)); }
      const chunks = []; let size = 0;
      res.on("data", (chunk) => { size += chunk.length; if (size <= LIMIT) chunks.push(chunk); else res.destroy(); });
      res.on("close", () => done({ text: Buffer.concat(chunks).toString("utf8").slice(0, LIMIT) }));
      res.on("error", fail);
    });
    req.on("timeout", () => req.destroy(Error(`${url.href} não respondeu em 12 s.`)));
    req.on("error", fail);
  });
}
async function get(raw, accept) {
  let next = raw;
  for (let hop = 0; hop <= 5; hop++) {
    const target = await resolvePublic(next);
    const reply = await request(target.url, target, accept);
    if (reply.text !== undefined) return reply.text;
    next = reply.redirect;
  }
  throw Error(`${raw} redireciona demais.`);
}
// `load` troca o transporte: o servidor remoto lê pelo fetch da plataforma, sem DNS nem socket.
export async function fetchSite(raw, load = get) {
  const url = checkUrl(raw);
  const html = await load(url.href, "text/html");
  const hrefs = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => /rel=["']?[^"'>]*stylesheet/i.test(tag)).map((tag) => /href=["']([^"']+)["']/i.exec(tag)?.[1]).filter(Boolean);
  const css = [], read = [], failed = [];
  const queue = hrefs.map((h) => new URL(h.replace(/&amp;/g, "&"), url).href).filter((h) => !/fonts\.googleapis\.com/.test(h));
  while (queue.length && read.length < 12) {
    const href = queue.shift();
    if (read.includes(href)) continue;
    try {
      const text = await load(href, "text/css");
      read.push(href);
      css.push(text);
      for (const [, imported] of text.matchAll(/@import\s+(?:url\()?["']?([^"')\s;]+)/g)) if (read.length + queue.length < 12) queue.push(new URL(imported, href).href);
    } catch (error) { failed.push(`${href}: ${error.message}`); }
  }
  return { url: url.href, html, css, stylesheets: read, failed };
}

// Roda a sonda em cada frame e fica com o que mais leu: site que embrulha a tela num iframe
// isolado (sandbox sem same-origin) só é lido de dentro do frame.
export async function probeFrames(page) {
  let best = null;
  for (const frame of page.frames()) {
    let probe;
    try { probe = await frame.evaluate(SITE_PROBE); } catch { continue; }
    if (!best || probe.observations.length > best.observations.length) best = probe;
  }
  return best;
}

// Proxy que todo pedido do navegador atravessa: página, redirecionamento, iframe, popup e
// WebSocket. Cada destino passa por resolvePublic e a conexão vai ao IP conferido, então o
// Chromium nunca resolve nome nem fala direto com a rede. `resolve` e `dial` existem para teste.
export async function startGuardProxy({ resolve = lookup, dial = (address) => address } = {}) {
  const refuse = (socket) => socket.end("HTTP/1.1 403 Forbidden\r\nContent-Length: 0\r\n\r\n");
  const server = http.createServer(async (req, res) => {
    try {
      const target = await resolvePublic(req.url, resolve);
      const headers = { ...req.headers, host: target.url.host };
      delete headers["proxy-connection"]; delete headers["proxy-authorization"];
      const upstream = http.request({ host: dial(target.address), family: target.family, port: Number(target.url.port) || 80, method: req.method, path: target.url.pathname + target.url.search, headers }, (up) => {
        res.writeHead(up.statusCode, up.headers);
        up.pipe(res);
      });
      upstream.on("error", () => res.destroy());
      req.pipe(upstream);
    } catch { res.writeHead(403).end(); }
  });
  server.on("connect", async (req, socket, head) => {
    socket.on("error", () => {});
    try {
      const target = await resolvePublic(`https://${req.url}/`, resolve);
      const upstream = net.connect(Number(target.url.port) || 443, dial(target.address), () => {
        socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
        if (head?.length) upstream.write(head);
        upstream.pipe(socket); socket.pipe(upstream);
      });
      upstream.on("error", () => socket.destroy());
    } catch { refuse(socket); }
  });
  server.on("upgrade", (_req, socket) => refuse(socket));
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return { server: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((done) => server.close(() => done())) };
}

/** Chromium preso ao proxy de guarda. `<-loopback>` tira a exceção que o Chromium faz para localhost. */
export async function launchGuarded(chromium, options = {}, guard = {}) {
  const proxy = await startGuardProxy(guard);
  const browser = await chromium.launch({ ...options, proxy: { server: proxy.server, bypass: "<-loopback>" } });
  browser.on("disconnected", () => proxy.close());
  return browser;
}

// WebRTC não passa pelo proxy (manda UDP direto ao STUN que a página pedir). A leitura de estilo
// não precisa dele, então a página nasce sem as classes de WebRTC em todo frame.
const NO_WEBRTC = "for (const k of ['RTCPeerConnection','webkitRTCPeerConnection','RTCDataChannel','RTCSessionDescription','RTCIceCandidate']) { try { delete window[k]; Object.defineProperty(window, k, { value: undefined, configurable: false }); } catch {} }";
export async function guardedPage(browser, options = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(NO_WEBRTC);
  return context.newPage();
}

// Navegador opcional: usa o Playwright do projeto, se houver. Não é dependência do Refy.
export async function probeWithBrowser(url, roots) {
  for (const root of roots) {
    let playwright;
    for (const name of ["playwright", "@playwright/test"]) {
      try { playwright = await import(createRequire(join(root, "package.json")).resolve(name)); break; } catch {}
    }
    if (!playwright) continue;
    const chromium = playwright.chromium ?? playwright.default?.chromium;
    const { url: checked } = await resolvePublic(url);
    const browser = await launchGuarded(chromium);
    try {
      const page = await guardedPage(browser, { viewport: { width: 1440, height: 900 } });
      await page.goto(checked.href, { waitUntil: "networkidle", timeout: 30_000 });
      return await probeFrames(page);
    } finally { await browser.close(); }
  }
  return null;
}

// ---- escolha ------------------------------------------------------------------------------
const NAMES = {
  primary: /^--(?:color-)?(?:primary|brand|accent)(?:-500|-600|-default|-base)?$/i,
  bg: /^--(?:color-)?(?:background|bg|page|canvas)(?:-default|-base)?$/i,
  surface: /^--(?:color-)?(?:card|surface|panel|popover)(?:-default|-base)?$/i,
  ink: /^--(?:color-)?(?:foreground|fg|text|ink)(?:-default|-base|-primary)?$/i,
  radius: /^--(?:radius|border-radius|rounded)(?:-default|-base|-md)?$/i,
  fontBody: /^--(?:font-)?(?:sans|body|font-family|font-base|font)$/i,
  fontHeading: /^--(?:font-)?(?:heading|display|headline|serif|title)$/i,
  fontMono: /^--(?:font-)?mono$/i,
};
const chromaOf = (hex) => hexToOklch(hex).c;
const lightnessOf = (hex) => hexToOklch(hex).l;
function tally(entries) {
  // Junta cores quase iguais (distância OKLCH < 0,03) e soma o peso no representante mais pesado.
  const groups = [];
  for (const { hex, weight, why } of entries) {
    const a = hexToOklch(hex);
    const near = groups.find((g) => { const b = g.lch; return Math.hypot(a.l - b.l, a.c - b.c, (a.c + b.c) / 2 * 2 * Math.sin(((a.h - b.h) * Math.PI) / 360)) < 0.03; });
    if (near) { near.weight += weight; if (why && !near.why.includes(why)) near.why.push(why); }
    else groups.push({ hex, lch: a, weight, why: why ? [why] : [] });
  }
  return groups.sort((x, y) => y.weight - x.weight);
}
const top = (list) => list[0] ?? null;
const round = (n) => Math.round(n * 10) / 10;

export function chooseTokens(observations) {
  const colors = (filter) => observations.filter(filter).map((o) => ({ ...o, hex: parseColor(o.value) })).filter((o) => o.hex);
  const named = (key) => observations.filter((o) => o.role === "token" && NAMES[key].test(o.name));
  const decided = {}, evidence = {};

  // Fundo: a cor que a pessoa vê atrás do conteúdo. O fundo do body perde para um bloco neutro que
  // cobre a maior parte da tela (site que pinta o fundo numa div), e a variável de fundo vale como
  // desempate. Bloco com croma (faixa verde, foto) não é fundo de página.
  const anyBg = tally([
    ...colors((o) => o.role === "visible" && o.prop === "background").map((o) => ({ ...o, why: "fundo visível na tela" })),
    ...colors((o) => o.role === "root" && o.prop === "background").map((o) => ({ ...o, why: "fundo do body" })),
    ...colors((o) => o.role === "token" && NAMES.bg.test(o.name)).map((o) => ({ ...o, weight: o.weight * 10, why: `variável ${o.name}` })),
    ...colors((o) => o.prop === "background" && (o.role === "card" || o.role === "any") && o.weight >= 10).map((o) => ({ ...o, why: "bloco que cobre a tela" })),
  ]).filter((g) => g.lch.c < 0.04);
  const bg = top(anyBg);
  if (bg) { decided.bg = bg.hex; evidence.bg = bg.why[0]; }
  const dark = bg ? lightnessOf(bg.hex) < 0.5 : false;

  // Texto: a cor de texto mais frequente que se lê sobre o fundo (4,5:1), com a do body e a
  // variável de texto somando peso; texto claro em faixa escura não conta para o fundo claro.
  const readable = (g) => !bg || contrast(g.hex, bg.hex) >= 4.5;
  const ink = top(tally([
    ...colors((o) => o.role === "token" && NAMES.ink.test(o.name)).map((o) => ({ ...o, weight: 20, why: `variável ${o.name}` })),
    ...colors((o) => o.role === "root" && o.prop === "color").map((o) => ({ ...o, weight: 5, why: "texto do body" })),
    ...colors((o) => o.prop === "color" && (o.role === "text" || o.role === "heading")).map((o) => ({ ...o, weight: 1, why: "texto mais frequente" })),
  ]).filter(readable));
  if (ink) { decided.ink = ink.hex; evidence.ink = ink.why[0]; }

  // Superfície: fundo de cartão ou painel perto do fundo da página, sem ser o próprio fundo.
  if (bg) {
    const candidates = tally([
      ...colors((o) => o.role === "token" && NAMES.surface.test(o.name)).map((o) => ({ ...o, weight: o.weight * 3, why: `variável ${o.name}` })),
      ...colors((o) => o.prop === "background" && (o.role === "card" || o.role === "any")).map((o) => ({ ...o, why: "fundo de cartão" })),
    ]).filter((g) => g.hex !== bg.hex && Math.abs(g.lch.l - bg.lch.l) < 0.12 && Math.abs(g.lch.l - bg.lch.l) > 0.005 && g.lch.c < 0.06);
    if (candidates[0]) { decided.surface = candidates[0].hex; evidence.surface = candidates[0].why[0]; }
  }

  // Primária: a cor com croma que aparece em botão, variável de marca ou com mais peso.
  const accents = tally([
    ...colors((o) => o.role === "token" && NAMES.primary.test(o.name)).map((o) => ({ ...o, weight: o.weight * 8, why: `variável ${o.name}` })),
    ...colors((o) => o.role === "button" && o.prop === "background").map((o) => ({ ...o, weight: o.weight * 4, why: "fundo de botão" })),
    ...colors((o) => o.role !== "root" && o.role !== "button" && o.prop === "background").map((o) => ({ ...o, weight: Math.min(o.weight, 3), why: "fundo" })),
    ...colors((o) => o.prop === "color" && o.role !== "root").map((o) => ({ ...o, weight: 0.5, why: "cor de texto ou link" })),
  ]).filter((g) => g.lch.c >= 0.05 && g.lch.l > 0.2 && g.lch.l < 0.95);
  const primary = top(accents);
  if (primary) { decided.primary = primary.hex; evidence.primary = primary.why.slice(0, 2).join(" e "); }

  // Fontes: títulos, corpo e mono, por variável, por papel e pela fonte carregada do Google Fonts.
  const fontBy = (filter, why) => {
    const counts = new Map();
    for (const o of observations.filter(filter)) {
      const family = primaryFamily(o.value);
      if (family) counts.set(family, (counts.get(family) ?? 0) + (o.weight ?? 1));
    }
    const best = [...counts].sort((a, b) => b[1] - a[1])[0];
    return best ? { family: best[0], why } : null;
  };
  const body = fontBy((o) => o.role === "token" && NAMES.fontBody.test(o.name), "variável de fonte")
    ?? fontBy((o) => o.prop === "font-family" && o.role === "root", "fonte do body")
    ?? fontBy((o) => o.prop === "font-family" && (o.role === "text" || o.role === "any" || o.role === "webfont"), "fonte mais usada");
  const heading = fontBy((o) => o.role === "token" && NAMES.fontHeading.test(o.name), "variável de título")
    ?? fontBy((o) => o.prop === "font-family" && o.role === "heading", "fonte dos títulos");
  const mono = fontBy((o) => o.role === "token" && NAMES.fontMono.test(o.name), "variável mono")
    ?? fontBy((o) => o.prop === "font-family" && o.role === "code", "fonte do código");
  if (body) { decided.fontBody = body.family; evidence.fontBody = body.why; }
  if (heading && heading.family !== body?.family) { decided.fontHeading = heading.family; evidence.fontHeading = heading.why; }
  if (mono) { decided.fontMono = mono.family; evidence.fontMono = mono.why; }

  // Raio: pílula em botão manda quando é o padrão do site; senão, mediana dos raios maiores que
  // zero (link sem fundo e faixa de ponta a ponta têm raio 0 e não dizem nada da forma).
  const radiusObs = [...named("radius"), ...observations.filter((o) => o.prop === "border-radius" && (o.role === "button" || o.role === "card"))];
  const px = radiusObs.map((o) => ({ role: o.role, px: radiusPx(o.value) })).filter((r) => r.px !== null);
  const pills = px.filter((r) => r.role === "button" && r.px >= 9999).length, rounded = px.filter((r) => r.role === "button" && r.px > 0).length;
  const radii = px.map((r) => r.px).filter((v) => v > 0 && v < 9999).sort((a, b) => a - b);
  if (rounded && pills / rounded >= 0.5) {
    decided.radius = "round";
    decided.buttonShape = "pill";
    evidence.radius = `${pills} de ${rounded} botões com canto arredondado são pílula`;
  } else if (radii.length) {
    const median = radii[Math.floor(radii.length / 2)];
    decided.radius = median <= 4 ? "sharp" : median >= 12 ? "round" : "default";
    evidence.radius = `mediana de ${radii.length} raios de botão e cartão: ${round(median)}px`;
  } else if (px.length) {
    decided.radius = "sharp";
    evidence.radius = `${px.length} botões e cartões, todos com canto reto`;
  }
  return { decided, evidence, mode: dark ? "dark" : "light", candidates: accents.slice(0, 6).map((g) => ({ color: g.hex, weight: round(g.weight), why: g.why })) };
}

// ---- elementos ----------------------------------------------------------------------------
// O jeito de botão, cartão, campo, selo, título e sobretítulo vira token de componente. O que o
// Refy não tem token para receber volta em gaps, com a rota: extensão no projeto ou contribuição.
const GAP_ROUTE = "Extensão no projeto em refy-extensions/<Nome> sobre o componente público, com contribution.json; se servir a outros projetos, `npx refy contribute <Nome>` prepara a contribuição ao Refy.";
const median = (values) => { const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
const mode = (values) => { const counts = new Map(); for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1); return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null; };
const px = (n) => `${Math.round(n)}px`;
const em = (spacing, size) => `${Math.round((spacing / size) * 100) / 100}em`;
// Tailwind grava camadas transparentes (rgba(0, 0, 0, 0) 0px 0px 0px 0px) antes da sombra real: saem.
const cleanShadow = (value) => value?.split(/,(?![^(]*\))/).map((x) => x.trim()).filter((x) => !/rgba\([^)]*,\s*0\)/.test(x)).join(", ") || "none";
const shadowOf = (list) => { const shadows = list.map((b) => cleanShadow(b.shadow)).filter((x) => x && x !== "none"); return shadows.length * 2 >= list.length ? mode(shadows) : null; };

export function chooseElements(observations, decided = {}) {
  const styles = (role) => observations.filter((o) => o.role === role && o.prop === "style" && o.value && typeof o.value === "object").map((o) => o.value);
  const tokens = {}, evidence = {}, gaps = [];
  const set = (token, value, why) => { tokens[token] = value; evidence[token] = why; };

  // Botão primário: os botões pintados com a primária escolhida; sem ela, todos os pintados.
  const buttons = styles("button");
  const near = (css, hex) => { const c = parseColor(css); return c && hex && Math.hypot(...["l", "c"].map((k) => hexToOklch(c)[k] - hexToOklch(hex)[k])) < 0.05; };
  const primaryButtons = buttons.filter((b) => near(b.background, decided.primary));
  const main = primaryButtons.length ? primaryButtons : buttons;
  if (main.length) {
    const label = `${main.length} botão(ões) ${primaryButtons.length ? "com a primária" : "pintados"}`;
    const h = median(main.map((b) => b.height));
    if (h) set("--button-height-md", px(h), `altura mediana de ${label}`);
    const pad = median(main.map((b) => b.paddingInline));
    if (pad) set("--button-padding-md", px(pad), `espaço lateral mediano de ${label}`);
    const weight = median(main.map((b) => b.fontWeight));
    if (weight) set("--control-font-weight", String(weight), `peso da letra de ${label}`);
    const shadow = shadowOf(main);
    set("--button-primary-shadow", shadow ?? "none", shadow ? `sombra de ${label}` : `${label} sem sombra`);
    const upper = main.filter((b) => b.textTransform === "uppercase").length;
    if (upper * 2 > main.length)
      gaps.push({ element: "Button", property: "text-transform", value: "uppercase", why: `${upper} de ${main.length} botões escrevem em caixa alta`, missing: "o Button do Refy não tem token de caixa alta", route: GAP_ROUTE });
    const tracking = median(main.map((b) => (b.fontSize ? b.letterSpacing / b.fontSize : 0)));
    if (tracking >= 0.04)
      gaps.push({ element: "Button", property: "letter-spacing", value: `${Math.round(tracking * 100) / 100}em`, why: "espaço entre letras dos botões", missing: "o Button do Refy não tem token de espaço entre letras", route: GAP_ROUTE });
  }
  // Botão secundário: pintado com cor neutra ou só com borda, quando o texto se lê sobre o fundo.
  const secondary = buttons.filter((b) => !near(b.background, decided.primary));
  const secBg = mode(secondary.map((b) => parseColor(b.background)).filter(Boolean));
  const secFg = mode(secondary.map((b) => parseColor(b.color)).filter(Boolean));
  if (secBg && secFg && contrast(secBg, secFg) >= 4.5) {
    set("--button-secondary-background", secBg, `fundo de ${secondary.length} botão(ões) sem a primária`);
    set("--button-secondary-foreground", secFg, "texto desses botões");
    const border = secondary.filter((b) => b.borderWidth > 0);
    if (border.length * 2 >= secondary.length) set("--button-secondary-border", mode(border.map((b) => parseColor(b.borderColor)).filter(Boolean)) ?? secFg, "borda desses botões");
  }

  // Cartão: sombra, borda e espaço interno dos blocos com sombra ou borda.
  const cards = styles("card");
  if (cards.length) {
    const shadow = shadowOf(cards);
    set("--shadow-card-light", shadow ?? "none", shadow ? `sombra de ${cards.length} cartões` : `${cards.length} cartões sem sombra`);
    const bordered = cards.filter((c) => c.borderWidth > 0).length;
    set("--card-border-width", bordered * 2 >= cards.length ? px(median(cards.map((c) => c.borderWidth))) : "0px", `${bordered} de ${cards.length} cartões com borda`);
    const pad = median(cards.map((c) => c.padding).filter((p) => p > 0));
    if (pad) set("--card-padding", px(pad), `espaço interno mediano de ${cards.length} cartões`);
  }

  // Campo: altura, raio, borda e sombra dos campos de formulário.
  // Um campo só não é padrão do site (costuma ser busca escondida ou campo de newsletter).
  const fields = styles("field");
  if (fields.length >= 2) {
    const h = median(fields.map((f) => f.height));
    if (h) set("--field-height", px(h), `altura mediana de ${fields.length} campos`);
    const r = median(fields.map((f) => radiusPx(f.radius)));
    if (r !== null) set("--field-radius", r >= 9999 ? "999px" : px(r), `raio dos campos`);
    set("--field-border-width", px(median(fields.map((f) => f.borderWidth)) ?? 1), "borda dos campos");
    const shadow = shadowOf(fields);
    if (shadow) set("--field-shadow", shadow, "sombra dos campos");
  }

  // Selo: raio, caixa alta e espaço entre letras.
  const badges = styles("badge");
  if (badges.length >= 2) {
    const r = median(badges.map((b) => radiusPx(b.radius)));
    if (r !== null) set("--control-group-radius", r >= 9999 ? "999px" : px(r), `raio de ${badges.length} selos (o Badge lê --control-group-radius)`);
    const upper = badges.filter((b) => b.textTransform === "uppercase").length;
    set("--interface-label-transform", upper * 2 > badges.length ? "uppercase" : "none", `${upper} de ${badges.length} selos em caixa alta`);
    const tracking = median(badges.map((b) => (b.fontSize ? b.letterSpacing / b.fontSize : 0)));
    if (tracking !== null) set("--interface-label-tracking", `${Math.round(tracking * 100) / 100}em`, "espaço entre letras dos selos");
  }

  // Título e sobretítulo: espaço entre letras.
  const headings = styles("heading");
  if (headings.length) {
    const big = headings.filter((h) => h.fontSize >= 28);
    const t = median((big.length ? big : headings).map((h) => (h.fontSize ? h.letterSpacing / h.fontSize : 0)));
    if (t !== null) set(big.length ? "--tracking-display" : "--tracking-heading", `${Math.round(t * 1000) / 1000}em`, `espaço entre letras de ${big.length || headings.length} títulos`);
  }
  const eyebrows = styles("eyebrow");
  if (eyebrows.length) {
    const t = median(eyebrows.map((e) => e.letterSpacing / e.fontSize));
    set("--tracking-eyebrow", `${Math.round(t * 100) / 100}em`, `espaço entre letras de ${eyebrows.length} sobretítulos em caixa alta`);
  }
  return { tokens, evidence, gaps };
}

// Escada de neutros a partir do fundo medido, no mesmo matiz e croma do site.
function neutrals(bg, surface, dark) {
  const b = hexToOklch(bg), step = dark ? 1 : -1;
  const at = (dl) => oklchToHex({ l: Math.min(1, Math.max(0, b.l + step * dl)), c: Math.min(b.c, 0.03), h: b.h });
  return {
    "--bg": bg, "--surface": surface ?? (dark ? at(0.035) : "#ffffff"), "--surface-2": at(0.06),
    "--surface-container-low": at(0.045), "--surface-container": at(0.065), "--surface-container-high": at(0.1),
    "--line": at(dark ? 0.13 : 0.08), "--line-soft": at(dark ? 0.09 : 0.05),
  };
}

export function themeFromObservations(observations, { name, label, description, source }, context) {
  const { decided, evidence, mode, candidates } = chooseTokens(observations);
  const notes = [];
  if (!decided.primary) throw Error("Não achei cor de destaque no site: nenhuma cor com croma em botão, link ou variável. Passe primary à mão em refy_theme_generate.");
  const input = { name, label: label ?? name, description: description ?? (source ? `Tema tirado de ${source}.` : undefined), primary: decided.primary };
  for (const key of ["radius", "fontBody", "fontHeading", "fontMono"]) if (decided[key]) input[key] = decided[key];
  const generated = generateTheme(input, context);
  notes.push(...generated.notes);
  const theme = generated.theme;
  if (decided.buttonShape === "pill") theme.tokens["--button-radius"] = "999px";
  const elements = chooseElements(observations, decided);
  const known = new Set(context.catalog.themeTokens);
  const colorToken = /background|foreground|border$/;
  for (const [token, value] of Object.entries(elements.tokens)) {
    if (!known.has(token)) { delete elements.tokens[token]; continue; }
    if (colorToken.test(token)) theme.modes[decided.bg && lightnessOf(decided.bg) < 0.5 ? "dark" : "light"][token] = value;
    else theme.tokens[token] = value;
  }

  // Os neutros medidos entram no modo do site (claro ou escuro); o outro modo sai do gerador.
  if (decided.bg) {
    const measured = theme.modes[mode];
    const before = { ...measured };
    const ladder = neutrals(decided.bg, decided.surface, mode === "dark");
    Object.assign(measured, ladder);
    const surface = measured["--surface"], hue = hexToOklch(decided.bg);
    const dir = mode === "dark" ? 1 : -1;
    const inkSeed = decided.ink && contrast(decided.ink, decided.bg) >= 7 ? decided.ink : null;
    measured["--ink-1"] = inkSeed ?? fit({ l: mode === "dark" ? 0.95 : 0.22, c: Math.min(hue.c, 0.015), h: hue.h }, decided.bg, 7, dir);
    if (decided.ink && !inkSeed) notes.push(`O texto do site (${decided.ink}) não chega a 7:1 sobre o fundo; o tema usa ${measured["--ink-1"]}.`);
    const ink = hexToOklch(measured["--ink-1"]);
    measured["--ink-2"] = fit({ ...ink, l: ink.l - dir * 0.14 }, surface, 4.5, dir);
    measured["--ink-3"] = fit({ ...ink, l: ink.l - dir * 0.24 }, surface, 4.5, dir);
    measured["--ink-4"] = oklchToHex({ ...ink, l: ink.l - dir * 0.34 });
    // No escuro o gerador clareia a primária; aqui o site já é escuro, então vale a cor do site,
    // com o mesmo ajuste mínimo de contraste que ela recebeu no claro.
    if (mode === "dark")
      for (const key of ["--primary", "--on-primary", "--primary-hover", "--brand-primary", "--brand-on-primary", "--chart-primary"]) measured[key] = theme.modes.light[key];
    measured["--primary-ink"] = fit(hexToOklch(measured["--primary"]), surface, 4.5, dir);
    measured["--brand-mark"] = contrast(measured["--primary"], decided.bg) >= 3 ? "var(--primary)" : "var(--primary-ink)";
    const check = validateTheme(theme, context);
    if (!check.passed) {
      theme.modes[mode] = before;
      notes.push(`Os neutros do site derrubavam contraste (${check.errors.slice(0, 2).join("; ")}); o modo ${mode === "dark" ? "escuro" : "claro"} ficou com os neutros gerados.`);
    } else notes.push(`Modo ${mode === "dark" ? "escuro" : "claro"} com o fundo${decided.surface ? ", a superfície" : ""} e o texto do site; o outro modo sai da mesma primária.`);
  } else notes.push("Não achei a cor de fundo do site; claro e escuro saem só da primária.");
  if (!decided.fontBody) notes.push("Nenhuma fonte nomeada: o tema fica com a fonte do Refy.");
  else notes.push(`${decided.fontHeading ? `As fontes ${decided.fontBody} e ${decided.fontHeading} precisam` : `A fonte ${decided.fontBody} precisa`} estar carregada${decided.fontHeading ? "s" : ""} no projeto (Google Fonts ou arquivo local); o tema só aponta o nome.`);

  const validation = validateTheme(theme, context);
  // Cor de elemento que derrube contraste sai do tema, e a nota diz qual.
  if (!validation.passed) {
    const colorKeys = Object.keys(elements.tokens).filter((t) => colorToken.test(t));
    for (const key of colorKeys) for (const m of Object.values(theme.modes)) delete m[key];
    const again = validateTheme(theme, context);
    if (again.passed) { notes.push(`As cores de botão secundário do site derrubavam contraste e ficaram fora: ${colorKeys.join(", ")}.`); colorKeys.forEach((k) => delete elements.tokens[k]); return { theme, validation: again, decided, evidence, elements, siteMode: mode, candidates, notes }; }
  }
  if (elements.gaps.length) notes.push(`${elements.gaps.length} detalhe(s) do site não têm token no Refy: veja gaps.`);
  return { theme, validation, decided, evidence, elements, siteMode: mode, candidates, notes };
}
