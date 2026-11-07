// Depois do build do site: uma página HTML por rota, com título, descrição, canonical,
// Open Graph e JSON-LD próprios, mais robots.txt, sitemap.xml, llms.txt, llms-full.txt,
// 404.html e _redirects.
// Por quê: o site é SPA e o HTML servido era só <div id="root">. Robôs de IA não rodam JS
// e liam página vazia; toda rota tinha a mesma descrição. O texto estático fica dentro do
// #root, oculto na tela e trocado pelo React no primeiro render, então quem tem JS não vê
// diferença e quem não tem lê o conteúdo.
// Uso: node scripts/site-seo.mjs <pasta-do-build>   (ex.: dist-site)
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createServer } from "vite";
import { renderToStaticMarkup as render } from "react-dom/server";

const SITE = "https://refy.design";
const out = resolve(process.argv[2] ?? "dist-site");
if (!existsSync(join(out, "index.html"))) throw Error(`${out}/index.html não existe; rode o build do site antes.`);
const template = readFileSync(join(out, "index.html"), "utf8");
if (template.includes("data-static")) throw Error("index.html já passou por este script; rode o build do site de novo.");

const vite = await createServer({
  configFile: false, root: process.cwd(), logLevel: "error", appType: "custom",
  server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true, include: [] },
  esbuild: { jsx: "automatic" },
});
let catalog, blocks, collections, docs, project;
try {
  ({ componentCatalog: catalog } = await vite.ssrLoadModule("/src/pages/PlaygroundPage/catalog.ts"));
  ({ blockRegistry: blocks } = await vite.ssrLoadModule("/src/pages/PlaygroundPage/blockRegistry.tsx"));
  ({ collectionDefinitions: collections } = await vite.ssrLoadModule("/src/pages/PlaygroundPage/collections.ts"));
  docs = await vite.ssrLoadModule("/src/pages/RefySitePage/SiteDocs.tsx");
  project = await vite.ssrLoadModule("/src/pages/RefySitePage/SiteProject.tsx");
  var projectHtml = Object.fromEntries(project.projectTopics.map((t) => [t, render(project.projectBody("pt", t))]));
  var docHtml = Object.fromEntries(docs.docTopics.map((t) => [t, render(docs.localizedDocPages.pt[t].body)]));
} finally {
  await vite.close();
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
const author = { "@type": "Person", name: "Vinícius Coimbra", url: "https://github.com/viniciuscoimbra" };
const crumbs = (items) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + path })),
});
const link = (path, label) => `<li><a href="${path}">${esc(label)}</a></li>`;

const homeDescription = "Componentes prontos, temas feitos de tokens e regras que a IA lê antes de montar a tela.";
const nav = `<nav aria-label="Site"><ul>${[
  link("/", "Início"), link("/docs/instalacao", "Docs"), link("/componentes", "Componentes"),
  link("/templates", "Templates"), link("/temas", "Temas"), link("/para-ias", "Para IAs"), link("/playground", "Playground"),
  link("/releases", "Releases"), link("/contribuir", "Contribuir"),
].join("")}</ul></nav>`;

const routes = [];
const add = (r) => routes.push(r);

add({
  path: "/", title: "refy: design system com tema por arquivo e IA nativa", description: homeDescription,
  body: `<h1>refy</h1><p>${esc(homeDescription)}</p><p>Biblioteca React e TypeScript sob licença MIT, com ${catalog.length} famílias de componentes organizadas em átomos, moléculas e organismos, ${blocks.length} templates e pacote nativo para celular.</p>
<h2>Componentes</h2><ul>${catalog.map((c) => link(`/componentes/${c.id.toLowerCase()}`, c.label)).join("")}</ul>
<h2>Templates</h2><ul>${blocks.map((b) => link(`/templates/${b.id}`, b.title)).join("")}</ul>`,
  ld: [
    { "@type": "WebSite", name: "refy", url: SITE + "/", inLanguage: "pt-BR" },
    { "@type": "SoftwareSourceCode", name: "refy", description: homeDescription, url: SITE + "/", programmingLanguage: ["TypeScript", "React"], license: "https://opensource.org/licenses/MIT", author },
  ],
});
for (const topic of docs.docTopics) {
  const page = docs.localizedDocPages.pt[topic];
  add({
    path: `/docs/${topic}`, title: `${page.label} · refy`, description: page.description, md: `# ${page.label}\n\n${page.description}\n\n${text(docHtml[topic])}`,
    body: `<h1>${esc(page.label)}</h1><p>${esc(page.description)}</p>${docHtml[topic]}<h2>Outras páginas</h2><ul>${docs.docTopics.map((t) => link(`/docs/${t}`, docs.localizedDocPages.pt[t].label)).join("")}</ul>`,
    ld: [{ "@type": "TechArticle", headline: page.label, description: page.description, inLanguage: "pt-BR", author }, crumbs([["Docs", "/docs/instalacao"], [page.label, `/docs/${topic}`]])],
  });
}
add({
  path: "/componentes", title: "Componentes · refy", description: `${catalog.length} famílias de componentes React do refy, de átomos a organismos, com API, exemplos e código.`,
  body: `<h1>Componentes</h1>${["Átomos", "Moléculas", "Organismos"].map((level) => `<h2>${level}</h2><ul>${catalog.filter((c) => c.level === level).map((c) => link(`/componentes/${c.id.toLowerCase()}`, c.label)).join("")}</ul>`).join("")}
<h2>Coleções</h2><ul>${collections.map((c) => link(`/componentes/colecoes/${c.id}`, c.label)).join("")}</ul>`,
  ld: [crumbs([["Componentes", "/componentes"]])],
});
// A ficha vem da biblioteca em inglês; a página pré-renderizada é em português.
const docsPt = JSON.parse(readFileSync("src/pages/RefySitePage/locales/docs.pt.json", "utf8"));
const pt = (text) => (text ? docsPt[text] ?? text : text);
for (const c of catalog) {
  const d = aiDoc(c.id);
  const description = pt(d.description) ?? `${c.label}: componente ${c.level?.toLowerCase() ?? ""} do refy.`;
  const api = Array.isArray(d.api) ? d.api : [];
  const example = d.examples?.[0]?.code;
  const usage = d.usage ?? {};
  const body = `<h1>${esc(c.label)}</h1><p>${esc(description)}</p><p>${esc(c.level ?? "")}</p>
<pre><code>${esc(d.import ?? `import { ${c.id} } from '@refy-design/web';`)}</code></pre>
${usage.whenToUse ? `<h2>Quando usar</h2><p>${esc(pt(usage.whenToUse))}</p>` : ""}${usage.avoidWhen ? `<h2>Quando evitar</h2><p>${esc(pt(usage.avoidWhen))}</p>` : ""}${usage.keyboard ? `<h2>Teclado</h2><p>${esc(pt(usage.keyboard))}</p>` : ""}
${api.filter((a) => a.props?.length).map((a) => `<h2>Propriedades de ${esc(a.name)}</h2><ul>${a.props.map((p) => `<li><code>${esc(p.name)}</code>: <code>${esc(p.type)}</code>${p.description ? `. ${esc(pt(p.description))}` : ""}</li>`).join("")}</ul>`).join("")}
${example ? `<h2>Exemplo</h2><pre><code>${esc(example)}</code></pre>` : ""}`;
  add({
    path: `/componentes/${c.id.toLowerCase()}`, title: `${c.label} · refy`, description, body, md: text(body),
    ld: [{ "@type": "TechArticle", headline: `${c.label}, componente React do refy`, description, inLanguage: "pt-BR", author }, crumbs([["Componentes", "/componentes"], [c.label, `/componentes/${c.id.toLowerCase()}`]])],
  });
}
add({ path: "/componentes/graficos", title: "Charts · refy", description: "Gráficos D3 do refy com eixos, legenda, tooltip, zoom e streaming, lidos do tema.", body: "<h1>Charts</h1>", ld: [crumbs([["Componentes", "/componentes"], ["Charts", "/componentes/graficos"]])] });
for (const col of collections) {
  add({
    path: `/componentes/colecoes/${col.id}`, title: `${col.label} · refy`, description: col.description,
    body: `<h1>${esc(col.label)}</h1><p>${esc(col.description)}</p><ul>${catalog.filter((c) => (aiDoc(c.id).collections ?? []).includes(col.id)).map((c) => link(`/componentes/${c.id.toLowerCase()}`, c.label)).join("")}</ul>`,
    ld: [crumbs([["Componentes", "/componentes"], [col.label, `/componentes/colecoes/${col.id}`]])],
  });
}
add({
  path: "/templates", title: "Templates · refy", description: `${blocks.length} telas inteiras prontas para uma finalidade, montadas só com componentes do refy.`,
  body: `<h1>Templates</h1><ul>${blocks.map((b) => `<li><a href="/templates/${b.id}">${esc(b.title)}</a>: ${esc(b.description)}</li>`).join("")}</ul>`,
  ld: [crumbs([["Templates", "/templates"]])],
});
for (const b of blocks) {
  add({
    path: `/templates/${b.id}`, title: `${b.title} · refy`, description: b.description, md: `# ${b.title}\n\n${b.description}`,
    body: `<h1>${esc(b.title)}</h1><p>${esc(b.description)}</p>`,
    ld: [{ "@type": "WebPage", name: b.title, description: b.description, inLanguage: "pt-BR" }, crumbs([["Templates", "/templates"], [b.title, `/templates/${b.id}`]])],
  });
}
add({ path: "/temas", title: "Temas · refy", description: "Um arquivo de tokens muda cor, fonte, forma, espaço e movimento da interface inteira.", body: "<h1>Temas</h1>" });
add({ path: "/temas/tipografia", title: "Tipografia · refy", description: "Escala tipográfica do tema refy aplicada a títulos, texto e código.", body: "<h1>Tipografia</h1>" });
add({ path: "/para-ias", title: "Para IAs · refy", description: "Catálogo, contratos e CLI que agentes de código consultam antes de montar uma tela com o refy.", body: `<h1>Para IAs</h1><p><a href="/llms.txt">llms.txt</a> · <a href="/llms-full.txt">llms-full.txt</a></p>`, md: readFileSync("ai/instructions.md", "utf8") });
for (const topic of project.projectTopics) {
  const label = project.projectLabel("pt", topic), description = project.projectDescription("pt", topic);
  add({
    path: project.projectHref(topic), title: `${label} · refy`, description, md: `# ${label}\n\n${description}\n\n${text(projectHtml[topic])}`,
    body: `<h1>${esc(label)}</h1><p>${esc(description)}</p>${projectHtml[topic]}`,
    ld: [crumbs([[label, project.projectHref(topic)]])],
  });
}
add({ path: "/playground", title: "Playground · refy", description: "Escolha um componente, troque tema e propriedades e copie o código.", body: "<h1>Playground</h1>" });

const page = (r, { noindex = false } = {}) => {
  const url = SITE + (r.path === "/" ? "/" : r.path);
  const ld = r.ld?.length ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": r.ld }).replace(/</g, "\\u003c")}</script>` : "";
  const head = [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="refy" />`, `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`, `<meta property="og:description" content="${esc(r.description)}" />`, `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:card" content="summary" />`, ld,
  ].filter(Boolean).join("\n    ");
  // Oculto só na tela: o React troca este conteúdo no primeiro render, e robô sem JS lê o texto.
  const stat = `<div data-static style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">${nav}<main>${r.body}</main></div>`;
  let html = template.replace(/<title>[\s\S]*?<\/title>\s*/, "").replace(/<meta name="description"[^>]*>\s*/, "");
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
writeFileSync(join(out, "404.html"), page({ path: "/404", title: "Página não encontrada · refy", description: "Este endereço não existe no refy.design.", body: `<h1>Página não encontrada</h1><p><a href="/">Voltar ao início</a></p>` }, { noindex: true }));
writeFileSync(join(out, "_redirects"), "/blocks /templates 301\n/blocks/* /templates/:splat 301\n/charts /componentes/graficos 301\n/docs /docs/instalacao 301\n/docs/celular /docs/mobile 301\n");
writeFileSync(join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /block-preview.html\n\nSitemap: ${SITE}/sitemap.xml\n`);
const day = new Date().toISOString().slice(0, 10);
writeFileSync(join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((r) => `  <url><loc>${SITE}${r.path}</loc><lastmod>${day}</lastmod></url>`).join("\n")}\n</urlset>\n`);

const section = (title, list) => `## ${title}\n\n${list.map((r) => `- [${r.title.replace(/ · refy$/, "")}](${SITE}${r.path}): ${r.description}`).join("\n")}\n`;
const by = (prefix) => routes.filter((r) => r.path.startsWith(prefix));
writeFileSync(join(out, "llms.txt"), `# refy

> ${homeDescription} Biblioteca React e TypeScript, licença MIT, pacote \`@refy-design/web\`.

O texto completo de docs, componentes e templates está em ${SITE}/llms-full.txt. Agentes de código que já instalaram o pacote consultam o catálogo local com \`npm exec --offline -- refy-agent catalog <necessidade>\`.

${section("Docs", by("/docs/"))}
${section("Componentes", by("/componentes/").filter((r) => !r.path.startsWith("/componentes/colecoes")))}
${section("Coleções", by("/componentes/colecoes/"))}
${section("Templates", by("/templates/"))}
## Opcional

- [Para IAs](${SITE}/para-ias): contrato que agentes seguem para montar telas com o refy.
- [Playground](${SITE}/playground): componente ao vivo, tema e código.
${project.projectTopics.map((t) => `- [${project.projectLabel("pt", t)}](${SITE}${project.projectHref(t)}): ${project.projectDescription("pt", t)}`).join("\n")}
`);
writeFileSync(join(out, "llms-full.txt"), `# refy\n\n> ${homeDescription}\n\n${routes.filter((r) => r.md).map((r) => `---\nURL: ${SITE}${r.path}\n\n${r.md.trim()}\n`).join("\n")}`);
console.log(`site-seo: ${routes.length} rotas, 404.html, robots.txt, sitemap.xml, llms.txt, llms-full.txt, _redirects em ${out}`);
