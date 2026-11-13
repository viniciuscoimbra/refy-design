// Núcleo do servidor MCP do Refy, comum ao stdio (mcp.mjs) e ao remoto por HTTP (remote.mjs). Lê só o que vem no pacote instalado (ai/, dist/ e a fundação de
// tokens) e o que o agente passa na chamada. Não escreve no projeto e não executa IA: busca,
// validação e tema são determinísticos. Só refy_theme_extract com url fala com a rede, e só com
// o endereço público que a pessoa passou; refy_compare grava a imagem de diferença na pasta temporária.
// No remoto não há projeto nem computador da pessoa: saem refy_compare e validate por files, e o tema
// de site lê pelo fetch do servidor, sem navegador.
import { readFileSync, readdirSync, realpathSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, join, resolve, relative, isAbsolute, sep, basename } from "node:path";
import { tmpdir } from "node:os";
import { buildIndex, searchCatalog, normalize } from "./search.mjs";
import { checkContract, loadTypeScript, readTypeAliases, readRuntimeExports } from "./contract.mjs";
import { generateTheme, validateTheme } from "./theme.mjs";
import { inspectFiles, localFile } from "./check.mjs";
import { comparePng, decodePng, encodePng } from "./compare.mjs";
import { SITE_PROBE, fetchSite, observeCss, observeHtml, probeWithBrowser, themeFromObservations } from "./theme-extract.mjs";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const read = (path) => readFileSync(join(packageRoot, path), "utf8");
const instructions = read("ai/instructions.md");
const foundations = JSON.parse(read("src/tokens/foundations.tokens.json"));

// Um contexto por versão do catálogo: ai/ e os .d.ts de dist/ de uma raiz de pacote. A raiz do
// pacote é a versão deste servidor; o Worker leva também a versão anterior publicada, em
// mcp-versions/<versão>/, para o agente ler a API que o consumidor consegue instalar.
function loadContext(root) {
  const aiRoot = realpathSync(join(root, "ai"));
  const catalog = JSON.parse(readFileSync(join(aiRoot, "catalog.json"), "utf8"));
  const choices = readFileSync(join(aiRoot, "control-choices.md"), "utf8");
  const documents = new Map();
  const documentFor = (component) => {
    if (!documents.has(component.id)) {
      const path = realpathSync(resolve(aiRoot, component.document));
      const local = relative(aiRoot, path);
      if (isAbsolute(local) || local.startsWith(".." + sep)) throw Error(`Documento fora do catálogo: ${component.id}`);
      documents.set(component.id, JSON.parse(readFileSync(path, "utf8")));
    }
    return documents.get(component.id);
  };
  let aliases, runtimeExports;
  return {
    catalog,
    choices,
    documentFor,
    index: buildIndex(catalog, documentFor, choices),
    typeAliases: () => (aliases ??= readTypeAliases(join(root, "dist"))),
    exportedNames: () => (runtimeExports ??= readRuntimeExports(join(root, "dist"))),
    header: { package: catalog.package, packageVersion: catalog.packageVersion, sourceSha256: catalog.sourceSha256 },
  };
}
const current = loadContext(packageRoot);
const { catalog, choices } = current;
const header = current.header;
let others;
function otherVersions() {
  if (others) return others;
  others = new Map();
  const dir = process.env.REFY_MCP_VERSIONS || join(packageRoot, "mcp-versions");
  let names = [];
  try { names = readdirSync(dir); } catch { return others; }
  for (const name of names) {
    try {
      const context = loadContext(join(dir, name));
      if (context.catalog.packageVersion !== catalog.packageVersion) others.set(context.catalog.packageVersion, context);
    } catch {}
  }
  return others;
}
const availableVersions = () => [catalog.packageVersion, ...otherVersions().keys()].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
function contextFor(version) {
  if (version === undefined || version === null || version === "" || version === catalog.packageVersion) return current;
  const found = otherVersions().get(String(version));
  if (found) return found;
  throw Error(`A versão ${version} não está neste servidor. Versões disponíveis: ${availableVersions().join(", ")}.`);
}
const VERSION = { type: "string", description: "Versão do pacote cuja API você quer ler (ex.: 1.2.0). Padrão: a versão deste servidor." };
// Na extensão do Claude Desktop a pasta do projeto é opcional: sem ela (variável vazia ou com o
// marcador não preenchido), o servidor não lê arquivo nenhum da máquina e usa uma pasta vazia.
let noProject;
const projectRoot = () => {
  const chosen = process.env.REFY_MCP_PROJECT;
  if (chosen === undefined) return realpathSync(process.cwd());
  if (!chosen.trim() || chosen.includes("${")) return (noProject ??= realpathSync(mkdtempSync(join(tmpdir(), "refy-sem-projeto-"))));
  return realpathSync(chosen);
};

function findComponent(name, context = current) {
  const { catalog, documentFor, index } = context;
  const wanted = normalize(name);
  const direct = catalog.components.find((c) => normalize(c.id) === wanted || normalize(c.publicName ?? "") === wanted);
  if (direct) return { component: direct };
  const owners = catalog.components.filter((c) => (documentFor(c).api ?? []).some((m) => normalize(m.name) === wanted));
  if (owners.length === 1) return { component: owners[0], member: name };
  if (owners.length > 1) throw Error(`${name} aparece em mais de uma família: ${owners.map((c) => c.id).join(", ")}. Use o nome da família.`);
  const suggestions = searchCatalog(index, name, { limit: 3 }).results.map((r) => r.id);
  throw Error(`Família desconhecida: ${name}.${suggestions.length ? ` Parecidas: ${suggestions.join(", ")}.` : ""}`);
}

function typeScriptDir(roots) {
  for (const root of roots)
    try { return dirname(createRequire(join(root, "package.json")).resolve("typescript/package.json")); } catch {}
  return null;
}

async function validate({ code, filename = "Tela.tsx", files, version, theme }, mode = LOCAL) {
  const versioned = contextFor(version);
  const { catalog, documentFor } = versioned;
  if (mode.remote && typeof code !== "string") throw Error("No servidor remoto passe o código da tela em code; ele não lê arquivos da sua máquina.");
  const roots = [projectRoot(), packageRoot];
  const ts = loadTypeScript(roots);
  if (!ts) throw Error("A validação usa o TypeScript do projeto: npm install --save-dev typescript@^5.");
  const context = { catalog, documentFor, aliases: versioned.typeAliases(), exports: versioned.exportedNames() };
  const contract = [], used = new Set();
  let staticReport;
  if (typeof code === "string") {
    if (!/^[\w.-]+\.(?:tsx|jsx|ts|js|mjs|cjs|css)$/.test(basename(filename))) throw Error("filename precisa terminar em .tsx, .jsx, .ts, .js, .mjs, .cjs ou .css.");
    const name = basename(filename);
    const temp = mkdtempSync(join(tmpdir(), "refy-mcp-"));
    try {
      mkdirSync(join(temp, "node_modules"));
      symlinkSync(typeScriptDir(roots), join(temp, "node_modules", "typescript"), "junction");
      writeFileSync(join(temp, name), code);
      staticReport = await inspectFiles(temp, [name], catalog, theme ? { theme } : {});
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
    if (!name.endsWith(".css")) {
      const result = checkContract(ts, code, name, context);
      contract.push(...result.findings);
      result.components.forEach((c) => used.add(c));
    }
  } else if (Array.isArray(files) && files.length) {
    const root = projectRoot();
    staticReport = await inspectFiles(root, files, catalog, theme ? { theme } : {});
    for (const file of staticReport.scanned ?? files) {
      if (/\.css$/.test(file)) continue;
      const { absolute, file: rel } = localFile(root, file);
      const result = checkContract(ts, readFileSync(absolute, "utf8"), rel, context);
      contract.push(...result.findings);
      result.components.forEach((c) => used.add(c));
    }
  } else throw Error("Passe code (o código da tela) ou files (caminhos dentro do projeto).");
  const staticFindings = (staticReport.findings ?? []).map((f) => ({ ...f, severity: f.severity ?? "error" }));
  const blocking = [...staticFindings.filter((f) => f.severity === "error" && !f.exception), ...contract.filter((f) => f.severity === "error")];
  return {
    ...versioned.header,
    passed: blocking.length === 0,
    errors: blocking.length,
    contract: { findings: contract, components: [...used].sort(), aliasesVerified: context.aliases.size > 0, exportsVerified: context.exports.size > 0 },
    static: staticReport,
    limits: [
      "Confere a API documentada e regras estáticas; não roda o TypeScript do projeto nem o navegador.",
      "Valores vindos de variável, spread ou expressão não são conferidos.",
      ...(catalog.limits ?? []),
    ],
  };
}

const LOCAL = { remote: false };
const themeContext = { catalog, foundations };
const themeUsage = (name) =>
  `import '@refy-design/web/tokens.css';\nimport { ThemeProvider } from '@refy-design/web';\nimport theme from './${name}.theme.json';\n\n<ThemeProvider theme={theme} mode="system">{/* app */}</ThemeProvider>`;

const slug = (text) => String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "meu-tema";
async function extractTheme({ url, html, css, observations, name, label, description, browser = "auto" }, mode = LOCAL) {
  const notes = [];
  let found, source = url, reading;
  if (Array.isArray(observations) && observations.length) {
    found = observations;
    reading = "estilos computados no navegador do agente";
  } else if (typeof html === "string" || typeof css === "string" || Array.isArray(css)) {
    found = [...observeHtml(html ?? ""), ...[].concat(css ?? []).flatMap((c) => observeCss(c))];
    reading = "HTML e CSS passados na chamada";
  } else if (typeof url === "string") {
    if (browser !== "never" && !mode.remote) {
      try {
        const probe = await probeWithBrowser(url, [projectRoot(), packageRoot]);
        if (probe?.observations?.length) { found = probe.observations; reading = "estilos computados no Playwright do projeto"; }
      } catch (error) { notes.push(`O navegador do projeto não abriu o site (${error.message.split("\n")[0]}); li o HTML e o CSS servidos.`); }
    }
    if (!found) {
      const site = await (mode.fetchSite ?? fetchSite)(url);
      found = [...observeHtml(site.html), ...site.css.flatMap((c) => observeCss(c))];
      reading = `HTML e ${site.stylesheets.length} folha(s) de estilo servidas`;
      if (site.failed.length) notes.push(`Folhas que não abriram: ${site.failed.slice(0, 3).join("; ")}.`);
    }
  } else throw Error("Passe url, ou html/css, ou observations (resultado da sonda refy://theme-probe rodada no navegador).");
  const host = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return null; } })();
  const themeName = name ? String(name) : slug(host ?? "meu-tema");
  let result;
  try {
    result = themeFromObservations(found, { name: themeName, label: label ?? (host ? `Tema de ${host}` : themeName), description, source: host }, themeContext);
  } catch (error) {
    throw Error(`${error.message} Lido: ${reading}, ${found.length} observações. Se o site monta a tela por JavaScript ou dentro de um iframe, rode a sonda refy://theme-probe no navegador (no frame da tela, quando ela devolver frames) e passe o resultado em observations.`);
  }
  return {
    ...header,
    source: { url: url ?? null, reading, observations: found.length },
    ...result,
    notes: [...notes, ...result.notes],
    file: `${result.theme.name}.theme.json`,
    usage: themeUsage(result.theme.name),
    rights: "Cores, fontes e marca do site pertencem a quem o fez. Use o tema no seu projeto como ponto de partida; não publique como tema do Refy nem como marca de outra pessoa.",
    next: "Grave o tema em <name>.theme.json no projeto, mostre as decisões (evidence) à pessoa e monte uma tela de exemplo com ThemeProvider para ela ver o resultado.",
  };
}
const TOOLS = [
  {
    name: "refy_search",
    title: "Buscar componente por intenção",
    description:
      "Encontra a família do Refy para uma necessidade descrita em português, inglês ou espanhol (\"confirmar antes de apagar\", \"lista suspensa com busca\"). Devolve as famílias em ordem, com o motivo, como usar, quando usar outra e o import.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "A necessidade da tela, em linguagem natural." },
        limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
        collection: { type: "string", description: "Filtra por coleção (core, media, geolocation, conversation, analytics...)." },
        version: VERSION,
      },
      required: ["query"],
    },
    run: ({ query, limit, collection, version }) => {
      const context = contextFor(version);
      const wanted = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 5;
      const result = searchCatalog(context.index, String(query ?? ""), { limit: Math.min(20, wanted), collection });
      return { ...context.header, ...result, empty: result.results.length === 0, next: "Leia a API da família escolhida com refy_component antes de escrever o código." };
    },
  },
  {
    name: "refy_component",
    title: "Ler a API de uma família",
    description: "Devolve a API real (props, tipos, obrigatórias), exemplos de código, uso, alternativas e teclado de uma família ou de um membro documentado (ex.: Button, CardHeader, D3Chart).",
    inputSchema: { type: "object", properties: { name: { type: "string" }, version: VERSION }, required: ["name"] },
    run: ({ name, version }) => {
      const context = contextFor(version);
      const { component, member } = findComponent(String(name), context);
      return { ...context.header, ...context.documentFor(component), maturity: component.maturity, mobile: component.mobile, ...(member ? { resolution: { family: component.id, apiMember: member } } : {}) };
    },
  },
  {
    name: "refy_collections",
    title: "Listar coleções",
    description: "Lista as coleções do catálogo (core e especializadas) com os membros reais de cada uma.",
    inputSchema: { type: "object", properties: { query: { type: "string" }, version: VERSION } },
    run: ({ query = "", version }) => {
      const { catalog, header } = contextFor(version);
      const wanted = normalize(query);
      const collections = (catalog.collections ?? []).filter((c) => !wanted || normalize([c.id, c.label, c.description, ...(c.keywords ?? [])].join(" ")).includes(wanted));
      return {
        ...header,
        collections: collections.map((c) => ({ ...c, members: catalog.components.filter((m) => (m.collections ?? []).includes(c.id)).map((m) => m.id) })),
      };
    },
  },
  {
    name: "refy_validate",
    title: "Validar uso dos componentes",
    description:
      "Confere código de tela contra o contrato do Refy: props obrigatórias, valores fora da união aceita, props fora da API, controles HTML crus, cor/fonte literal e import interno. Recebe o código (code) ou caminhos do projeto (files).",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "Código da tela (TSX/JSX/TS/JS/CSS)." },
        filename: { type: "string", description: "Nome do arquivo do código, define a linguagem. Padrão: Tela.tsx." },
        files: { type: "array", items: { type: "string" }, description: "Caminhos dentro do projeto atual, no lugar de code." },
        theme: { type: "object", description: "Tema do projeto (RefyTheme, ou objeto com vários temas). Tokens declarados nele não geram unverified-token. Com files, sem theme, vale o theme.json da raiz do projeto." },
        version: VERSION,
      },
    },
    run: validate,
  },
  {
    name: "refy_theme_generate",
    title: "Gerar tema",
    description:
      "Gera um tema completo (claro e escuro) a partir da cor primária, com raio, densidade e fontes opcionais. O tema sai no formato do ThemeProvider e já conferido: tokens reconhecidos, referências e contraste AA.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Identificador: minúsculas, números e hífen." },
        label: { type: "string", description: "Nome de exibição." },
        description: { type: "string" },
        primary: { type: "string", description: "Cor primária em hexadecimal, ex.: #2163ad." },
        radius: { type: "string", enum: ["sharp", "default", "round"] },
        density: { type: "string", enum: ["compact", "default", "comfortable"] },
        fontBody: { type: "string" },
        fontHeading: { type: "string" },
        fontMono: { type: "string" },
      },
      required: ["name", "primary"],
    },
    run: (input) => {
      const result = generateTheme(input, themeContext);
      return {
        ...header,
        ...result,
        usage: themeUsage(result.theme.name),
        limits: ["Contraste conferido para pares com cor hexadecimal; color-mix e gradientes precisam do navegador.", "Cores de estado (sucesso, erro, info) vêm da fundação."],
      };
    },
  },
  {
    name: "refy_theme_extract",
    title: "Tema a partir de um site",
    description:
      "Lê cores, fontes e raios de um site e monta um tema do Refy (claro e escuro) já conferido em contraste AA, com a razão de cada escolha. Recebe url (lê pelo Playwright do projeto, se houver, ou pelo HTML/CSS servido), html/css, ou observations da sonda refy://theme-probe rodada no navegador do agente, que é a leitura mais fiel para site montado por JavaScript.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Endereço público do site, http ou https." },
        html: { type: "string", description: "HTML da página, no lugar de url." },
        css: { type: "array", items: { type: "string" }, description: "Folhas de estilo, no lugar de url." },
        observations: { type: "array", items: { type: "object" }, description: "Saída da sonda refy://theme-probe (campo observations)." },
        name: { type: "string", description: "Identificador do tema: minúsculas, números e hífen. Padrão: o domínio." },
        label: { type: "string" },
        description: { type: "string" },
        browser: { type: "string", enum: ["auto", "never"], description: "auto tenta o Playwright do projeto antes do HTML servido." },
      },
    },
    run: extractTheme,
  },
  {
    name: "refy_compare",
    title: "Comparar tela com o original",
    description:
      "Compara duas capturas PNG do mesmo tamanho (o original e a tela feita com o Refy) e devolve a porcentagem de pixels diferentes, as regiões que mais diferem (posição em pixels) e uma imagem de diferença com o que mudou em vermelho. Use para reproduzir uma tela até ficar igual.",
    inputSchema: {
      type: "object",
      properties: {
        original: { type: "string", description: "Captura do original (PNG), dentro do projeto ou da pasta temporária." },
        candidate: { type: "string", description: "Captura da tela feita com o Refy, no mesmo tamanho e escala." },
        threshold: { type: "integer", minimum: 0, maximum: 255, default: 24, description: "Quanto um canal pode variar sem contar como diferença." },
      },
      required: ["original", "candidate"],
    },
    run: ({ original, candidate, threshold }) => {
      const allowed = [projectRoot(), realpathSync(tmpdir())];
      const open = (file) => {
        const path = realpathSync(resolve(projectRoot(), String(file)));
        if (!allowed.some((root) => path === root || path.startsWith(root + sep))) throw Error(`${file} fica fora do projeto e da pasta temporária.`);
        return decodePng(readFileSync(path));
      };
      const result = comparePng(open(original), open(candidate), { threshold: Number.isInteger(threshold) ? threshold : 24 });
      const diffPath = join(mkdtempSync(join(tmpdir(), "refy-compare-")), "diferenca.png");
      writeFileSync(diffPath, encodePng(result.diff));
      const { diff, ...report } = result;
      return {
        ...header,
        ...report,
        diffImage: diffPath,
        next: report.differentPercent === 0 ? "As capturas são iguais." : "Abra diffImage, corrija primeiro a região mais diferente (token do tema, depois composição, depois extensão) e capture de novo.",
      };
    },
  },
  {
    name: "refy_theme_validate",
    title: "Validar tema",
    description: "Confere um tema (objeto do ThemeProvider) contra o contrato dos temas do Refy: tokens reconhecidos, label, referências resolvíveis e contraste AA de texto, estado e marca, no claro e no escuro.",
    inputSchema: { type: "object", properties: { theme: { type: "object" } }, required: ["theme"] },
    run: ({ theme }) => ({ ...header, ...validateTheme(theme, themeContext) }),
  },
];

// Nenhuma ferramenta muda estado de quem chama: leem o pacote e o que vem na chamada. Sem a
// anotação, o protocolo manda o cliente presumir escrita destrutiva e pedir aprovação a cada uso.
// refy_theme_extract lê um site público (mundo aberto); refy_compare grava só na pasta temporária.
for (const tool of TOOLS)
  tool.annotations = { title: tool.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: tool.name === "refy_theme_extract" };

// Só o remoto confere o npm (o local não tem rede e serve o pacote instalado, que é instalável).
async function withPublished(result, mode) {
  if (!mode.published || !result || typeof result !== "object" || !("packageVersion" in result)) return result;
  const published = await mode.published();
  const warnings = [...(Array.isArray(result.warnings) ? result.warnings : [])];
  if (!published) warnings.push("Não consegui ler o npm agora; a versão publicada não foi conferida.");
  else if (!published.versions.includes(result.packageVersion)) {
    const loaded = availableVersions().includes(published.latest);
    warnings.push(
      `${result.packageVersion} não está publicada no npm; a versão instalável é ${published.latest}.` +
        (loaded ? ` Chame de novo com version: "${published.latest}" para ler a API que o projeto instala.` : ""),
    );
  }
  return { ...result, publishedVersion: published?.latest ?? null, ...(warnings.length ? { warnings } : {}) };
}

const RESOURCES = [
  { uri: "refy://instructions", name: "instructions", title: "Contrato de adoção para agentes", mimeType: "text/markdown", text: () => instructions },
  { uri: "refy://control-choices", name: "control-choices", title: "Escolher e compor controles", mimeType: "text/markdown", text: () => choices },
  { uri: "refy://theme-probe", name: "theme-probe", title: "Sonda de estilos para rodar no navegador", mimeType: "text/javascript", text: () => SITE_PROBE },
  { uri: "refy://catalog", name: "catalog", title: "Catálogo de famílias", mimeType: "application/json", text: () => JSON.stringify(catalog) },
];
const componentUri = /^refy:\/\/component\/([\w-]+)$/;

const SERVER_INSTRUCTIONS =
  "Refy é um design system. Para montar tela: refy_search com a necessidade, refy_component na família escolhida, escreva o código, refy_validate no resultado. Para identidade visual: refy_theme_generate e refy_theme_validate; para partir de um site, refy_theme_extract. Cor, fonte e raio vêm do tema, nunca de CSS solto.";
const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

// Ferramenta no remoto: sem as que dependem do computador de quem usa, e sem o campo files.
function toolsFor(mode) {
  if (!mode.remote) return TOOLS;
  return TOOLS.filter((t) => t.name !== "refy_compare").map((t) => {
    if (t.name === "refy_validate") {
      const { files, ...properties } = t.inputSchema.properties;
      return { ...t, description: t.description.replace(" Recebe o código (code) ou caminhos do projeto (files).", " Recebe o código da tela em code."), inputSchema: { ...t.inputSchema, properties, required: ["code"] } };
    }
    if (t.name === "refy_theme_extract") {
      const { browser, ...properties } = t.inputSchema.properties;
      return { ...t, description: t.description.replace("Recebe url (lê pelo Playwright do projeto, se houver, ou pelo HTML/CSS servido)", "Recebe url (lê o HTML e o CSS servidos)"), inputSchema: { ...t.inputSchema, properties } };
    }
    return t;
  });
}
const REMOTE_NOTE = " Este é o servidor remoto: não lê arquivos da máquina de quem usa; passe o código em refy_validate.";

/** Responde uma mensagem JSON-RPC já interpretada. `mode.remote` liga as restrições do servidor por HTTP. */
export async function handle(message, mode = LOCAL) {
  const { method, params = {} } = message;
  const tools = toolsFor(mode);
  switch (method) {
    case "initialize":
      return {
        protocolVersion: PROTOCOLS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOLS[0],
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "refy", title: "Refy", version: catalog.packageVersion },
        instructions: SERVER_INSTRUCTIONS + (mode.remote ? REMOTE_NOTE : ""),
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: tools.map(({ run, ...tool }) => tool) };
    case "tools/call": {
      const tool = tools.find((t) => t.name === params.name);
      if (!tool) throw Object.assign(Error(`Ferramenta desconhecida: ${params.name}`), { code: -32602 });
      try {
        const result = await withPublished(await tool.run(params.arguments ?? {}, mode), mode);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], structuredContent: result, isError: false };
      } catch (error) {
        return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }], isError: true };
      }
    }
    case "resources/list":
      return { resources: RESOURCES.map(({ text, ...r }) => r) };
    case "resources/templates/list":
      return { resourceTemplates: [{ uriTemplate: "refy://component/{name}", name: "component", title: "Documento de uma família", mimeType: "application/json" }] };
    case "resources/read": {
      const fixed = RESOURCES.find((r) => r.uri === params.uri);
      if (fixed) return { contents: [{ uri: fixed.uri, mimeType: fixed.mimeType, text: fixed.text() }] };
      const match = componentUri.exec(params.uri ?? "");
      if (match) {
        let component;
        try { ({ component } = findComponent(match[1])); }
        catch (error) { throw Object.assign(error, { code: -32002 }); }
        return { contents: [{ uri: params.uri, mimeType: "application/json", text: JSON.stringify(current.documentFor(component)) }] };
      }
      throw Object.assign(Error(`Recurso desconhecido: ${params.uri}`), { code: -32002 });
    }
    default:
      throw Object.assign(Error(`Método não suportado: ${method}`), { code: -32601 });
  }
}

export const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
// Devolve a resposta de uma mensagem, ou undefined para notificação.
export async function answer(message, mode = LOCAL) {
  if (!message || typeof message !== "object" || Array.isArray(message) || typeof message.method !== "string")
    return rpcError(message && typeof message === "object" && "id" in message ? message.id ?? null : null, -32600, "Requisição inválida");
  if (message.id === undefined || message.id === null) return undefined;
  try {
    return { jsonrpc: "2.0", id: message.id, result: await handle(message, mode) };
  } catch (error) {
    return rpcError(message.id, Number.isInteger(error.code) ? error.code : -32603, error.message);
  }
}
