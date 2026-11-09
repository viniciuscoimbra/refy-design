#!/usr/bin/env node
// Servidor MCP do Refy, por stdio. Lê só o que vem no pacote instalado (ai/, dist/ e a fundação de
// tokens) e o que o agente passa na chamada. Não escreve no projeto, não fala com a rede e não
// executa IA: busca, validação e tema são determinísticos.
import { readFileSync, realpathSync, mkdtempSync, mkdirSync, symlinkSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { dirname, join, resolve, relative, isAbsolute, sep, basename } from "node:path";
import { tmpdir } from "node:os";
import { createInterface } from "node:readline";
import { buildIndex, searchCatalog, normalize } from "./search.mjs";
import { checkContract, loadTypeScript, readTypeAliases, readRuntimeExports } from "./contract.mjs";
import { generateTheme, validateTheme } from "./theme.mjs";
import { inspectFiles, localFile } from "./check.mjs";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const aiRoot = realpathSync(join(packageRoot, "ai"));
const read = (path) => readFileSync(join(packageRoot, path), "utf8");
const catalog = JSON.parse(read("ai/catalog.json"));
const choices = read("ai/control-choices.md");
const instructions = read("ai/instructions.md");
const foundations = JSON.parse(read("src/tokens/foundations.tokens.json"));
const documents = new Map();
function documentFor(component) {
  if (!documents.has(component.id)) {
    const path = realpathSync(resolve(aiRoot, component.document));
    const local = relative(aiRoot, path);
    if (isAbsolute(local) || local.startsWith(".." + sep)) throw Error(`Documento fora do catálogo: ${component.id}`);
    documents.set(component.id, JSON.parse(readFileSync(path, "utf8")));
  }
  return documents.get(component.id);
}
const index = buildIndex(catalog, documentFor, choices);
let aliases, runtimeExports;
const typeAliases = () => (aliases ??= readTypeAliases(join(packageRoot, "dist")));
const exportedNames = () => (runtimeExports ??= readRuntimeExports(join(packageRoot, "dist")));
const projectRoot = () => realpathSync(process.env.REFY_MCP_PROJECT ?? process.cwd());
const header = { package: catalog.package, packageVersion: catalog.packageVersion, sourceSha256: catalog.sourceSha256 };

function findComponent(name) {
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

async function validate({ code, filename = "Tela.tsx", files }) {
  const roots = [projectRoot(), packageRoot];
  const ts = loadTypeScript(roots);
  if (!ts) throw Error("A validação usa o TypeScript do projeto: npm install --save-dev typescript@^5.");
  const context = { catalog, documentFor, aliases: typeAliases(), exports: exportedNames() };
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
      staticReport = await inspectFiles(temp, [name], catalog);
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
    staticReport = await inspectFiles(root, files, catalog);
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
    ...header,
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

const themeContext = { catalog, foundations };
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
      },
      required: ["query"],
    },
    run: ({ query, limit, collection }) => {
      const wanted = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 5;
      const result = searchCatalog(index, String(query ?? ""), { limit: Math.min(20, wanted), collection });
      return { ...header, ...result, empty: result.results.length === 0, next: "Leia a API da família escolhida com refy_component antes de escrever o código." };
    },
  },
  {
    name: "refy_component",
    title: "Ler a API de uma família",
    description: "Devolve a API real (props, tipos, obrigatórias), exemplos de código, uso, alternativas e teclado de uma família ou de um membro documentado (ex.: Button, CardHeader, D3Chart).",
    inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    run: ({ name }) => {
      const { component, member } = findComponent(String(name));
      return { ...header, ...documentFor(component), ...(member ? { resolution: { family: component.id, apiMember: member } } : {}) };
    },
  },
  {
    name: "refy_collections",
    title: "Listar coleções",
    description: "Lista as coleções do catálogo (core e especializadas) com os membros reais de cada uma.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
    run: ({ query = "" }) => {
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
        usage: `import '@refy-design/web/tokens.css';\nimport { ThemeProvider } from '@refy-design/web';\nimport theme from './${result.theme.name}.theme.json';\n\n<ThemeProvider theme={theme} mode="system">{/* app */}</ThemeProvider>`,
        limits: ["Contraste conferido para pares com cor hexadecimal; color-mix e gradientes precisam do navegador.", "Cores de estado (sucesso, erro, info) vêm da fundação."],
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

const RESOURCES = [
  { uri: "refy://instructions", name: "instructions", title: "Contrato de adoção para agentes", mimeType: "text/markdown", text: () => instructions },
  { uri: "refy://control-choices", name: "control-choices", title: "Escolher e compor controles", mimeType: "text/markdown", text: () => choices },
  { uri: "refy://catalog", name: "catalog", title: "Catálogo de famílias", mimeType: "application/json", text: () => JSON.stringify(catalog) },
];
const componentUri = /^refy:\/\/component\/([\w-]+)$/;

const SERVER_INSTRUCTIONS =
  "Refy é um design system. Para montar tela: refy_search com a necessidade, refy_component na família escolhida, escreva o código, refy_validate no resultado. Para identidade visual: refy_theme_generate e refy_theme_validate. Cor, fonte e raio vêm do tema, nunca de CSS solto.";
const PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"];

async function handle(message) {
  const { method, params = {} } = message;
  switch (method) {
    case "initialize":
      return {
        protocolVersion: PROTOCOLS.includes(params.protocolVersion) ? params.protocolVersion : PROTOCOLS[0],
        capabilities: { tools: {}, resources: {} },
        serverInfo: { name: "refy", title: "Refy", version: catalog.packageVersion },
        instructions: SERVER_INSTRUCTIONS,
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS.map(({ run, ...tool }) => tool) };
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) throw Object.assign(Error(`Ferramenta desconhecida: ${params.name}`), { code: -32602 });
      try {
        const result = await tool.run(params.arguments ?? {});
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
        return { contents: [{ uri: params.uri, mimeType: "application/json", text: JSON.stringify(documentFor(component)) }] };
      }
      throw Object.assign(Error(`Recurso desconhecido: ${params.uri}`), { code: -32002 });
    }
    default:
      throw Object.assign(Error(`Método não suportado: ${method}`), { code: -32601 });
  }
}

const send = (payload) => process.stdout.write(JSON.stringify(payload) + "\n");
const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
let pending = Promise.resolve();
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
// Devolve a resposta de uma mensagem, ou undefined para notificação.
async function answer(message) {
  if (!message || typeof message !== "object" || Array.isArray(message) || typeof message.method !== "string")
    return rpcError(message && typeof message === "object" && "id" in message ? message.id ?? null : null, -32600, "Requisição inválida");
  if (message.id === undefined || message.id === null) return undefined;
  try {
    return { jsonrpc: "2.0", id: message.id, result: await handle(message) };
  } catch (error) {
    return rpcError(message.id, Number.isInteger(error.code) ? error.code : -32603, error.message);
  }
}
lines.on("line", (line) => {
  if (!line.trim()) return;
  pending = pending
    .then(async () => {
      let message;
      try { message = JSON.parse(line); }
      catch { return send(rpcError(null, -32700, "JSON inválido")); }
      if (Array.isArray(message)) {
        if (!message.length) return send(rpcError(null, -32600, "Lote vazio"));
        const replies = (await Promise.all(message.map(answer))).filter(Boolean);
        if (replies.length) send(replies);
        return;
      }
      const reply = await answer(message);
      if (reply) send(reply);
    })
    .catch((error) => send(rpcError(null, -32603, error.message)));
});
