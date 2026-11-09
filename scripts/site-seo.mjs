// Depois do build do site: uma página HTML por rota e por idioma (português na raiz, /en e /es),
// com título, descrição, canonical, hreflang, Open Graph e JSON-LD próprios, mais robots.txt,
// sitemap.xml com as versões de idioma, llms.txt, llms-full.txt, 404.html, _redirects e _headers.
// Por quê: o site é SPA e o HTML servido era só <div id="root">. Robôs de IA não rodam JS
// e liam página vazia; toda rota tinha a mesma descrição. O texto estático fica dentro do
// #root, oculto na tela e trocado pelo React no primeiro render, então quem tem JS não vê
// diferença e quem não tem lê o conteúdo.
// Uso: node scripts/site-seo.mjs <pasta-do-build>   (ex.: dist-site)
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createServer } from "vite";
import { renderToStaticMarkup as render } from "react-dom/server";
import { INDEXNOW_KEY, SITE } from "./seo-config.mjs";

const out = resolve(process.argv[2] ?? "dist-site");
if (!existsSync(join(out, "index.html"))) throw Error(`${out}/index.html não existe; rode o build do site antes.`);
const template = readFileSync(join(out, "index.html"), "utf8");
if (template.includes("data-static")) throw Error("index.html já passou por este script; rode o build do site de novo.");

// Cada idioma carrega os módulos num servidor próprio: texto de nível de módulo (templates, coleções)
// nasce no idioma que initLocale definiu antes do primeiro import.
const LOCALES = ["pt", "en", "es"];
const HTML_LANG = { pt: "pt-BR", en: "en", es: "es" };
const OG_LOCALE = { pt: "pt_BR", en: "en_US", es: "es_ES" };
async function load(locale) {
  const vite = await createServer({
    configFile: false, root: process.cwd(), logLevel: "error", appType: "custom",
    server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] },
    esbuild: { jsx: "automatic" },
  });
  try {
    const i18n = await vite.ssrLoadModule("/src/pages/RefySitePage/i18n.tsx");
    i18n.initLocale(locale);
    const { componentCatalog: catalog } = await vite.ssrLoadModule("/src/pages/PlaygroundPage/catalog.ts");
    const { blockRegistry: blocks } = await vite.ssrLoadModule("/src/pages/PlaygroundPage/blockRegistry.tsx");
    const { collectionDefinitions: collections } = await vite.ssrLoadModule("/src/pages/PlaygroundPage/collections.ts");
    const { homeSeo } = await vite.ssrLoadModule("/src/pages/RefySitePage/seo.ts");
    const docs = await vite.ssrLoadModule("/src/pages/RefySitePage/SiteDocs.tsx");
    const project = await vite.ssrLoadModule("/src/pages/RefySitePage/SiteProject.tsx");
    const ai = await vite.ssrLoadModule("/src/pages/RefySitePage/SiteAI.tsx");
    const { familySlug } = await vite.ssrLoadModule("/src/pages/RefySitePage/SiteCatalog.tsx");
    // A Instalação mostra Web ou Mobile na tela; o HTML estático leva os dois.
    docs.renderAllPlatforms(true);
    return {
      catalog, blocks, collections, docs, project, ai, familySlug, localePath: i18n.localePath, home: homeSeo[locale], tr: (text) => i18n.translate(locale, text),
      projectHtml: Object.fromEntries(project.projectTopics.map((t) => [t, render(project.projectBody(locale, t))])),
      docHtml: Object.fromEntries(docs.docTopics.map((t) => [t, render(docs.localizedDocPages[locale][t].body)])),
      aiHtml: Object.fromEntries(ai.aiTopics.map((t) => [t, render(ai.localizedAiPages[locale][t].body)])),
    };
  } finally {
    await vite.close();
  }
}

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (html) => html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (_, c) => `\n\`\`\`\n${c.replace(/<[^>]+>/g, "")}\n\`\`\`\n`)
  .replace(/<h2[^>]*>/g, "\n## ").replace(/<h3[^>]*>/g, "\n### ").replace(/<li[^>]*>/g, "\n- ").replace(/<\/(p|h2|h3)>/g, "\n")
  .replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&")
  .replace(/\n{3,}/g, "\n\n").trim();
const aiDoc = (id) => {
  const file = `ai/components/${id}.json`;
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
};
const REPO = "https://github.com/viniciuscoimbra/refy-design";
const native = new Set(JSON.parse(readFileSync("src/pages/RefySitePage/nativeComponents.json", "utf8")));
const author = { "@type": "Person", name: "Vinícius Coimbra", url: "https://github.com/viniciuscoimbra" };
/** Endereço no idioma, com o caminho na língua dele (i18n.tsx: localePath). Definido no primeiro load. */
let at;
/** Endereço antigo (até 09/11): caminho em português com o prefixo do idioma. Só para os 301. */
const oldAt = (locale, path) => (locale === "pt" ? path : `/${locale}${path === "/" ? "" : path}`);
const prefixLinks = (html, locale) => html.replace(/href="\/(?!\/)([^"]*)"/g, (all, rest) => {
  const [path, tail = ""] = rest.split(/(?=[?#])/);
  return /\.[a-z0-9]+$/i.test(path) ? all : `href="${at(locale, "/" + path)}${tail}"`;
});

// Texto fixo das páginas estáticas que não vem de módulo do site.
const W = {
  pt: { mobileYes: "Também em @refy-design/mobile, com as mesmas props.", mobileNo: "Só web: ainda não existe em @refy-design/mobile.", start: "Início", components: "Componentes", templates: "Templates", themes: "Temas", ai: "Para IAs", collections: "Coleções", others: "Outras páginas", when: "Quando usar", avoid: "Quando evitar", keyboard: "Teclado", props: "Propriedades de", example: "Exemplo", charts: "Gráficos D3", typography: "Tipografia", nav: "Site", more: "Exemplos, propriedades e código no refy.", inCollection: "Componentes do refy nesta coleção.",
    componentsDesc: (n) => `${n} famílias de componentes do refy, de átomos a organismos, com API, exemplos e código.`,
    templatesDesc: (n) => `${n} telas inteiras prontas para uma finalidade, montadas só com componentes do refy.`,
    chartsDesc: "Gráficos D3 do refy com eixos, legenda, tooltip, zoom e streaming, lidos do tema.",
    themesDesc: "Um arquivo de tokens muda cor, fonte, forma, espaço e movimento da interface inteira.",
    typographyDesc: "Escala tipográfica do tema refy aplicada a títulos, texto e código.",
    aiDesc: "Catálogo, contratos e CLI que agentes de código consultam antes de montar uma tela com o refy.",
    playgroundDesc: "Escolha um componente, troque tema e propriedades e copie o código.",
    homeFacts: (c, b) => `Biblioteca React e TypeScript sob licença MIT, com ${c} famílias de componentes organizadas em átomos, moléculas e organismos, ${b} templates e pacote nativo para celular.`,
    family: (label, level) => `${label}: componente do refy (${level}).`,
    headline: (label) => `${label}, componente do refy`,
    notFound: "Página não encontrada", notFoundDesc: "Este endereço não existe no refy.design.", back: "Voltar ao início" },
  en: { mobileYes: "Also in @refy-design/mobile, with the same props.", mobileNo: "Web only: not in @refy-design/mobile yet.", start: "Home", components: "Components", templates: "Templates", themes: "Themes", ai: "For AI", collections: "Collections", others: "Other pages", when: "When to use", avoid: "When to avoid", keyboard: "Keyboard", props: "Props of", example: "Example", charts: "D3 charts", typography: "Typography", nav: "Site", more: "Examples, props and code in refy.", inCollection: "refy components in this collection.",
    componentsDesc: (n) => `${n} refy component families, from atoms to organisms, with API, examples and code.`,
    templatesDesc: (n) => `${n} full screens ready for one purpose, built only with refy components.`,
    chartsDesc: "refy D3 charts with axes, legend, tooltip, zoom and streaming, read from the theme.",
    themesDesc: "One token file changes color, font, shape, spacing and motion across the whole interface.",
    typographyDesc: "The refy theme type scale applied to headings, text and code.",
    aiDesc: "Catalog, contracts and CLI that coding agents check before they build a screen with refy.",
    playgroundDesc: "Pick a component, change theme and props, and copy the code.",
    homeFacts: (c, b) => `React and TypeScript library under the MIT license, with ${c} component families organized as atoms, molecules and organisms, ${b} templates and a native package for mobile.`,
    family: (label, level) => `${label}: refy component (${level}).`,
    headline: (label) => `${label}, a refy component`,
    notFound: "Page not found", notFoundDesc: "This address does not exist on refy.design.", back: "Back to home" },
  es: { mobileYes: "También en @refy-design/mobile, con las mismas props.", mobileNo: "Solo web: todavía no existe en @refy-design/mobile.", start: "Inicio", components: "Componentes", templates: "Plantillas", themes: "Temas", ai: "Para IAs", collections: "Colecciones", others: "Otras páginas", when: "Cuándo usarlo", avoid: "Cuándo evitarlo", keyboard: "Teclado", props: "Propiedades de", example: "Ejemplo", charts: "Gráficos D3", typography: "Tipografía", nav: "Sitio", more: "Ejemplos, propiedades y código en refy.", inCollection: "Componentes de refy en esta colección.",
    componentsDesc: (n) => `${n} familias de componentes de refy, de átomos a organismos, con API, ejemplos y código.`,
    templatesDesc: (n) => `${n} pantallas completas listas para una finalidad, hechas solo con componentes de refy.`,
    chartsDesc: "Gráficos D3 de refy con ejes, leyenda, tooltip, zoom y streaming, leídos del tema.",
    themesDesc: "Un archivo de tokens cambia color, fuente, forma, espacio y movimiento de toda la interfaz.",
    typographyDesc: "Escala tipográfica del tema refy aplicada a títulos, texto y código.",
    aiDesc: "Catálogo, contratos y CLI que los agentes de código consultan antes de montar una pantalla con refy.",
    playgroundDesc: "Elige un componente, cambia tema y propiedades y copia el código.",
    homeFacts: (c, b) => `Biblioteca React y TypeScript con licencia MIT, con ${c} familias de componentes organizadas en átomos, moléculas y organismos, ${b} plantillas y paquete nativo para móvil.`,
    family: (label, level) => `${label}: componente de refy (${level}).`,
    headline: (label) => `${label}, componente de refy`,
    notFound: "Página no encontrada", notFoundDesc: "Esta dirección no existe en refy.design.", back: "Volver al inicio" },
};

const routes = [];
let pt; // dados em português, usados por llms.txt
for (const L of LOCALES) {
  const d = await load(L);
  if (L === "pt") pt = d;
  at = d.localePath;
  const w = W[L], tr = d.tr, { catalog, blocks, collections, docs, project, ai } = d;
  const fam = (id) => `/componentes/${d.familySlug(id)}`;
  const link = (path, label) => `<li><a href="${at(L, path)}">${esc(label)}</a></li>`;
  const crumbs = (items) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + at(L, path) })),
  });
  const article = (headline, description) => ({ "@type": "TechArticle", headline, description, inLanguage: HTML_LANG[L], author, isPartOf: { "@id": `${SITE}/#website` } });
  const nav = `<nav aria-label="${w.nav}"><ul>${[
    link("/", w.start), link("/docs/primeiros-passos", "Docs"), link("/componentes", w.components),
    link("/templates", w.templates), link("/temas", w.themes), link("/para-ias", w.ai), link("/playground", "Playground"),
    link("/contribuir", project.projectLabel(L, "contribuir")),
  ].join("")}</ul></nav>`;
  const add = (r) => routes.push({ ...r, locale: L, key: r.path, path: at(L, r.path), nav });

  add({
    path: "/", title: d.home.title, description: d.home.description,
    body: `<h1>refy</h1><p>${esc(d.home.description)}</p><p>${esc(w.homeFacts(catalog.length, blocks.length))}</p>
<h2>${w.components}</h2><ul>${catalog.map((c) => link(fam(c.id), c.label)).join("")}</ul>
<h2>${w.templates}</h2><ul>${blocks.map((b) => link(`/templates/${b.id}`, b.title)).join("")}</ul>`,
    ld: [
      { "@type": "WebSite", "@id": `${SITE}/#website`, name: "refy", alternateName: "refy.design", url: SITE + "/", inLanguage: LOCALES.map((l) => HTML_LANG[l]), publisher: author },
      { "@type": "SoftwareSourceCode", name: "refy", description: d.home.description, url: SITE + at(L, "/"), codeRepository: REPO, programmingLanguage: ["TypeScript", "React"], runtimePlatform: ["Web", "React Native"], license: "https://opensource.org/licenses/MIT", author, sameAs: [REPO, "https://www.npmjs.com/package/@refy-design/web", "https://www.npmjs.com/package/@refy-design/mobile"] },
    ],
  });
  for (const topic of docs.docTopics) {
    const page = docs.localizedDocPages[L][topic];
    const html = prefixLinks(d.docHtml[topic], L);
    add({
      path: `/docs/${topic}`, title: `${page.label} · refy`, description: page.description, md: `# ${page.label}\n\n${page.description}\n\n${text(html)}`,
      body: `<h1>${esc(page.label)}</h1><p>${esc(page.description)}</p>${html}<h2>${w.others}</h2><ul>${docs.docTopics.map((t) => link(`/docs/${t}`, docs.localizedDocPages[L][t].label)).join("")}</ul>`,
      ld: [article(page.label, page.description), crumbs([["Docs", "/docs/primeiros-passos"], [page.label, `/docs/${topic}`]])],
      old: { "primeiros-passos": "/docs/comecar", versoes: "/releases" }[topic],
    });
  }
  add({
    path: "/componentes", title: `${w.components} · refy`, description: w.componentsDesc(catalog.length),
    body: `<h1>${w.components}</h1>${["Átomos", "Moléculas", "Organismos"].map((level) => `<h2>${esc(tr(level))}</h2><ul>${catalog.filter((c) => c.level === level).map((c) => link(fam(c.id), c.label)).join("")}</ul>`).join("")}
<h2>${w.collections}</h2><ul>${collections.map((c) => link(`/componentes/colecoes/${c.id}`, tr(c.label))).join("")}</ul>`,
    ld: [crumbs([[w.components, "/componentes"]])],
  });
  for (const c of catalog) {
    const doc = aiDoc(c.id);
    const level = tr(c.level ?? "");
    const summary = tr(doc.description) || w.family(c.label, level.toLowerCase());
    const description = `${summary} ${w.more}`;
    const api = Array.isArray(doc.api) ? doc.api : [];
    const example = doc.examples?.[0]?.code;
    const usage = doc.usage ?? {};
    const body = `<h1>${esc(c.label)}</h1><p>${esc(summary)}</p><p>${esc(level)}</p>
<p>${native.has(c.id) ? w.mobileYes : w.mobileNo}</p>
<pre><code>${esc(doc.import ?? `import { ${c.id} } from '@refy-design/web';`)}</code></pre>
${usage.whenToUse ? `<h2>${w.when}</h2><p>${esc(tr(usage.whenToUse))}</p>` : ""}${usage.avoidWhen ? `<h2>${w.avoid}</h2><p>${esc(tr(usage.avoidWhen))}</p>` : ""}${usage.keyboard ? `<h2>${w.keyboard}</h2><p>${esc(tr(usage.keyboard))}</p>` : ""}
${api.filter((a) => a.props?.length).map((a) => `<h2>${w.props} ${esc(a.name)}</h2><ul>${a.props.map((p) => `<li><code>${esc(p.name)}</code>: <code>${esc(p.type)}</code>${p.description ? `. ${esc(tr(p.description))}` : ""}</li>`).join("")}</ul>`).join("")}
${example ? `<h2>${w.example}</h2><pre><code>${esc(example)}</code></pre>` : ""}`;
    add({
      path: fam(c.id), title: `${c.label} · refy`, description, body, md: text(body), old: `/componentes/${c.id.toLowerCase()}`,
      ld: [article(w.headline(c.label), description), crumbs([[w.components, "/componentes"], [c.label, fam(c.id)]])],
    });
  }
  for (const col of collections) {
    const label = tr(col.label), description = `${tr(col.description)} ${w.inCollection}`;
    add({
      path: `/componentes/colecoes/${col.id}`, title: `${label} · refy`, description,
      body: `<h1>${esc(label)}</h1><p>${esc(description)}</p><ul>${catalog.filter((c) => (aiDoc(c.id).collections ?? []).includes(col.id)).map((c) => link(fam(c.id), c.label)).join("")}</ul>`,
      ld: [crumbs([[w.components, "/componentes"], [label, `/componentes/colecoes/${col.id}`]])],
    });
  }
  add({
    path: "/templates", title: `${w.templates} · refy`, description: w.templatesDesc(blocks.length),
    body: `<h1>${w.templates}</h1><ul>${blocks.map((b) => `<li><a href="${at(L, `/templates/${b.id}`)}">${esc(b.title)}</a>: ${esc(b.description)}</li>`).join("")}</ul>`,
    ld: [crumbs([[w.templates, "/templates"]])],
  });
  for (const b of blocks) {
    add({
      path: `/templates/${b.id}`, title: `${b.title} · refy`, description: b.description, md: `# ${b.title}\n\n${b.description}`,
      body: `<h1>${esc(b.title)}</h1><p>${esc(b.description)}</p>`,
      ld: [{ "@type": "WebPage", name: b.title, description: b.description, inLanguage: HTML_LANG[L] }, crumbs([[w.templates, "/templates"], [b.title, `/templates/${b.id}`]])],
    });
  }
  add({ path: "/temas", title: `${w.themes} · refy`, description: w.themesDesc, body: `<h1>${w.themes}</h1><p>${esc(w.themesDesc)}</p>` });
  add({ path: "/temas/tipografia", title: `${w.typography} · refy`, description: w.typographyDesc, body: `<h1>${w.typography}</h1><p>${esc(w.typographyDesc)}</p>` });
  add({ path: "/para-ias", title: `${w.ai} · refy`, description: w.aiDesc, md: L === "pt" ? readFileSync("ai/instructions.md", "utf8") : undefined,
    body: `<h1>${w.ai}</h1><p>${esc(w.aiDesc)}</p><ul>${ai.aiTopics.map((t) => link(ai.aiHref(t), ai.localizedAiPages[L][t].label)).join("")}</ul><p><a href="/llms.txt">llms.txt</a> · <a href="/llms-full.txt">llms-full.txt</a></p>` });
  for (const topic of ai.aiTopics) {
    const page = ai.localizedAiPages[L][topic];
    const html = prefixLinks(d.aiHtml[topic], L);
    add({
      path: ai.aiHref(topic), title: `${page.label} · refy`, description: page.description, md: `# ${page.label}\n\n${page.description}\n\n${text(html)}`,
      body: `<h1>${esc(page.label)}</h1><p>${esc(page.description)}</p>${html}`,
      ld: [article(page.label, page.description), crumbs([[w.ai, "/para-ias"], [page.label, ai.aiHref(topic)]])],
      old: topic === "mcp" ? "/docs/mcp" : undefined,
    });
  }
  for (const topic of project.projectTopics) {
    const label = project.projectLabel(L, topic), description = project.projectDescription(L, topic);
    const html = prefixLinks(d.projectHtml[topic], L);
    add({
      path: project.projectHref(topic), title: `${label} · refy`, description, md: `# ${label}\n\n${description}\n\n${text(html)}`,
      body: `<h1>${esc(label)}</h1><p>${esc(description)}</p>${html}`,
      ld: [crumbs([[label, project.projectHref(topic)]])],
    });
  }
  add({ path: "/playground", title: "Playground · refy", description: w.playgroundDesc, body: `<h1>Playground</h1><p>${esc(w.playgroundDesc)}</p>` });
}

// Mesma página nos três idiomas, pela chave sem prefixo: vira hreflang no HTML e no sitemap.
const byKey = new Map();
for (const r of routes) byKey.set(r.key, [...(byKey.get(r.key) ?? []), r]);
const alternates = (r) => [
  ...byKey.get(r.key).map((x) => [HTML_LANG[x.locale], SITE + x.path]),
  ["x-default", SITE + byKey.get(r.key).find((x) => x.locale === "pt").path],
];
const verify = [
  process.env.REFY_GOOGLE_VERIFICATION && `<meta name="google-site-verification" content="${esc(process.env.REFY_GOOGLE_VERIFICATION)}" />`,
  process.env.REFY_BING_VERIFICATION && `<meta name="msvalidate.01" content="${esc(process.env.REFY_BING_VERIFICATION)}" />`,
].filter(Boolean);
const OG_IMAGE = `${SITE}/og.png`;

const page = (r, { noindex = false } = {}) => {
  const url = SITE + r.path;
  const ld = r.ld?.length ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": r.ld }).replace(/</g, "\\u003c")}</script>` : "";
  const head = [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    ...(noindex ? [] : alternates(r).map(([lang, href]) => `<link rel="alternate" hreflang="${lang}" href="${href}" />`)),
    `<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="refy" />`, `<meta property="og:locale" content="${OG_LOCALE[r.locale]}" />`,
    ...LOCALES.filter((l) => l !== r.locale).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`),
    `<meta property="og:title" content="${esc(r.title)}" />`, `<meta property="og:description" content="${esc(r.description)}" />`, `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`, `<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`, `<meta property="og:image:alt" content="refy" />`,
    `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    ...verify, ld,
  ].filter(Boolean).join("\n    ");
  // Oculto só na tela: o React troca este conteúdo no primeiro render, e robô sem JS lê o texto.
  const stat = `<div data-static style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">${r.nav}<main>${r.body}</main></div>`;
  let html = template.replace(/<title>[\s\S]*?<\/title>\s*/, "").replace(/<meta name="description"[^>]*>\s*/, "").replace(/<html lang="[^"]*">/, `<html lang="${HTML_LANG[r.locale]}">`);
  html = html.replace("</head>", `  ${head}\n  </head>`).replace('<div id="root"></div>', `<div id="root">${stat}</div>`);
  if (!html.includes("data-static")) throw Error('index.html sem <div id="root"></div>; o template mudou.');
  return html;
};

for (const r of routes) {
  // Cloudflare Pages serve /x a partir de x.html sem barra final; x/index.html redirecionaria para /x/.
  const file = r.path === "/" ? join(out, "index.html") : join(out, `${r.path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(r));
}
const ptNav = routes.find((r) => r.locale === "pt").nav;
writeFileSync(join(out, "404.html"), page({ path: "/404", locale: "pt", nav: ptNav, title: `${W.pt.notFound} · refy`, description: W.pt.notFoundDesc, body: `<h1>${W.pt.notFound}</h1><p><a href="/">${W.pt.back}</a></p>` }, { noindex: true }));
// 301 de todo endereço que já existiu: o de antes de 09/11 (caminho em português em todos os idiomas,
// nome de componente colado) e os apelidos antigos. scripts/seo-check.mjs confere que cada destino existe.
const legacy = [
  ["/docs", "/docs/primeiros-passos"], ["/docs/primeira-tela", "/docs/primeiros-passos"], ["/docs/celular", "/docs/instalacao"],
  ["/docs/mobile", "/docs/instalacao"], ["/componentes/graficos", "/componentes/charts"], ["/charts", "/componentes/charts"], ["/blocks", "/templates"],
];
const redirects = new Map();
const redirect = (from, to) => { if (from !== to && !byKey.has(from) && !routes.some((r) => r.path === from)) redirects.set(from, to); };
for (const L of LOCALES) {
  for (const [from, to] of legacy) redirect(oldAt(L, from), at(L, to));
  redirect(at(L, "/docs"), at(L, "/docs/primeiros-passos"));
}
for (const r of routes) {
  redirect(oldAt(r.locale, r.key), r.path);
  if (r.old) redirect(oldAt(r.locale, r.old), r.path);
}
writeFileSync(join(out, "_redirects"), `${[...redirects].map(([from, to]) => `${from} ${to} 301`).join("\n")}\n${LOCALES.map((L) => `${oldAt(L, "/blocks")}/* ${at(L, "/templates")}/:splat 301`).join("\n")}\n`);
// Arquivo com hash muda de nome a cada build: pode ficar um ano no cache. HTML revalida sempre.
writeFileSync(join(out, "_headers"), `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
copyFileSync("site/og.png", join(out, "og.png"));
// IndexNow: Bing e Yandex aceitam aviso de página nova com esta chave pública (scripts/indexnow.mjs).
writeFileSync(join(out, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /block-preview.html\n\nSitemap: ${SITE}/sitemap.xml\n`);
// Sem lastmod: a data do build não diz quando a página mudou, e o Google ignora lastmod que não confere.
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${routes.map((r) => `  <url><loc>${SITE}${r.path}</loc>${alternates(r).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`).join("")}</url>`).join("\n")}\n</urlset>\n`);

const ptRoutes = routes.filter((r) => r.locale === "pt");
const homeDescription = pt.home.description;
const project = pt.project;
const section = (title, list) => `## ${title}\n\n${list.map((r) => `- [${r.title.replace(/ · refy$/, "")}](${SITE}${r.path}): ${r.description}`).join("\n")}\n`;
const by = (prefix) => ptRoutes.filter((r) => r.path.startsWith(prefix));
writeFileSync(join(out, "llms.txt"), `# refy

> ${homeDescription} Biblioteca React e TypeScript, licença MIT, pacote \`@refy-design/web\`.

O texto completo de docs, componentes e templates está em ${SITE}/llms-full.txt. Agentes de código que já instalaram o pacote consultam o catálogo local com \`npm exec --offline -- refy-agent catalog <necessidade>\` ou pelo servidor MCP (${SITE}/para-ias/mcp).

${section("Docs", by("/docs/"))}
${section("Para IAs", by("/para-ias"))}
${section("Componentes", by("/componentes/").filter((r) => !r.path.startsWith("/componentes/colecoes")))}
${section("Coleções", by("/componentes/colecoes/"))}
${section("Templates", by("/templates/"))}
## Opcional

- [Playground](${SITE}/playground): componente ao vivo, tema e código.
${project.projectTopics.map((t) => `- [${project.projectLabel("pt", t)}](${SITE}${project.projectHref(t)}): ${project.projectDescription("pt", t)}`).join("\n")}
`);
writeFileSync(join(out, "llms-full.txt"), `# refy\n\n> ${homeDescription}\n\n${ptRoutes.filter((r) => r.md).map((r) => `---\nURL: ${SITE}${r.path}\n\n${r.md.trim()}\n`).join("\n")}`);
console.log(`site-seo: ${routes.length} rotas (${LOCALES.join(", ")}), ${redirects.size} redirecionamentos, 404.html, robots.txt, sitemap.xml, llms.txt, llms-full.txt, _redirects em ${out}`);
