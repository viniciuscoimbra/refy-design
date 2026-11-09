// Gate do SEO do site: reprova o build quando uma página indexável perde título, descrição,
// canonical, hreflang recíproco, idioma do <html>, JSON-LD válido ou entrada no sitemap.
// Uso: node scripts/seo-check.mjs <pasta-do-build>   (roda no fim de npm run build:site)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { INDEXNOW_KEY, SITE } from "./seo-config.mjs";

const out = resolve(process.argv[2] ?? "dist-site");
const LANG = { "": "pt-BR", en: "en", es: "es" };
const files = [];
const walk = (dir) => readdirSync(dir).forEach((name) => {
  const path = join(dir, name);
  if (statSync(path).isDirectory()) { if (name !== "assets") walk(path); } else if (name.endsWith(".html")) files.push(path);
});
walk(out);

const errors = [], warnings = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);
const pages = new Map(); // url -> { file, alternates }
const titles = new Map();
const attr = (html, re) => re.exec(html)?.[1];

for (const path of files) {
  const file = relative(out, path);
  if (file === "404.html" || file === "block-preview.html") continue;
  const html = readFileSync(path, "utf8");
  const route = file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`;
  const url = SITE + route;
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const lang = attr(html, /<html lang="([^"]*)"/);
  const expectedLang = LANG[route.split("/")[1] === "en" || route.split("/")[1] === "es" ? route.split("/")[1] : ""];
  if (!title) fail(file, "sem <title>");
  else if (/[—–]/.test(title)) fail(file, `título com travessão: ${title}`);
  else titles.set(`${lang} ${title}`, [...(titles.get(`${lang} ${title}`) ?? []), file]);
  if (!description) fail(file, "sem meta description");
  else if (description.length < 25) fail(file, `descrição com ${description.length} caracteres: ${description}`);
  else if (description.length < 50 || description.length > 200) warn(file, `descrição com ${description.length} caracteres (o Google mostra de 50 a ~160)`);
  if (canonical !== url) fail(file, `canonical ${canonical} devia ser ${url}`);
  if (lang !== expectedLang) fail(file, `<html lang="${lang}"> devia ser ${expectedLang}`);
  if (!html.includes('property="og:image"')) fail(file, "sem og:image");
  if (!/<div data-static[^>]*>[\s\S]*<h1>/.test(html)) fail(file, "sem texto estático com <h1> para robô sem JS");
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch (error) { fail(file, `JSON-LD inválido: ${error.message}`); }
  }
  const alternates = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
  for (const lang of ["pt-BR", "en", "es", "x-default"]) if (!alternates[lang]) fail(file, `sem hreflang ${lang}`);
  if (alternates[lang] !== url) fail(file, `hreflang ${lang} não aponta para a própria página`);
  pages.set(url, { file, alternates });
}
for (const { file, alternates } of pages.values()) {
  for (const [lang, href] of Object.entries(alternates)) {
    const other = pages.get(href);
    if (!other) { fail(file, `hreflang ${lang} aponta para ${href}, que não existe no build`); continue; }
    const back = Object.values(other.alternates);
    if (!back.includes(SITE + (file === "index.html" ? "/" : `/${file.replace(/\.html$/, "")}`))) fail(file, `hreflang ${lang} sem volta em ${other.file}`);
  }
}
for (const [title, list] of titles) if (list.length > 1) fail(list.join(", "), `título repetido no mesmo idioma: ${title}`);

const sitemap = readFileSync(join(out, "sitemap.xml"), "utf8");
const listed = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
for (const [url, { file }] of pages) if (!listed.has(url)) fail(file, "fora do sitemap.xml");
for (const url of listed) if (!pages.has(url)) fail("sitemap.xml", `${url} não existe no build`);
const robots = readFileSync(join(out, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots.txt", "não aponta o sitemap");
if (/Disallow:\s*\/\s*$/m.test(robots)) fail("robots.txt", "bloqueia o site inteiro");
for (const name of ["og.png", "llms.txt", "_headers", `${INDEXNOW_KEY}.txt`]) if (!existsSync(join(out, name))) fail(name, "não existe no build");
// Todo 301 cai numa página que existe, e nenhum 301 tira do ar uma página do sitemap.
const redirectLines = readFileSync(join(out, "_redirects"), "utf8").split("\n").filter(Boolean).map((line) => line.split(/\s+/));
for (const [from, to] of redirectLines) {
  if (from.includes("*")) continue;
  if (!pages.has(SITE + to)) fail("_redirects", `${from} vai para ${to}, que não existe no build`);
  if (pages.has(SITE + from)) fail("_redirects", `${from} é página do sitemap e está sendo redirecionada`);
}

if (warnings.length) console.warn(`seo-check: ${warnings.length} aviso(s), sem reprovar\n${warnings.join("\n")}`);
if (errors.length) {
  console.error(`seo-check: ${errors.length} problema(s)\n${errors.slice(0, 50).join("\n")}`);
  process.exit(1);
}
console.log(`seo-check: ${pages.size} páginas indexáveis, ${listed.size} no sitemap, ${redirectLines.length} redirecionamentos com destino, hreflang recíproco, JSON-LD válido`);
