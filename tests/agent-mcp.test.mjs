// Servidor MCP: protocolo por stdio, busca por intenção, contrato de uso e tema.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, cpSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import ts from "typescript";
import { buildIndex, searchCatalog } from "../tools/refy-agent/search.mjs";
import { checkContract, readTypeAliases, readRuntimeExports } from "../tools/refy-agent/contract.mjs";
import { generateTheme, validateTheme, contrast } from "../tools/refy-agent/theme.mjs";

const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
const documentFor = (c) => JSON.parse(readFileSync("ai/" + c.document, "utf8"));
const foundations = JSON.parse(readFileSync("src/tokens/foundations.tokens.json", "utf8"));
const index = buildIndex(catalog, documentFor, readFileSync("ai/control-choices.md", "utf8"));
const hasDist = existsSync("dist/index.d.ts");
const context = { catalog, documentFor, aliases: readTypeAliases("dist"), exports: readRuntimeExports("dist") };

function server() {
  const child = spawn(process.execPath, [resolve("tools/refy-agent/mcp.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
  let buffer = "", id = 0;
  const waiting = new Map();
  child.stdout.on("data", (data) => {
    buffer += data;
    for (let i; (i = buffer.indexOf("\n")) >= 0; ) {
      const message = JSON.parse(buffer.slice(0, i));
      buffer = buffer.slice(i + 1);
      waiting.get(message.id)?.(message);
    }
  });
  const call = (method, params = {}) =>
    new Promise((done) => {
      const n = ++id;
      waiting.set(n, done);
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: n, method, params }) + "\n");
    });
  const tool = async (name, args) => (await call("tools/call", { name, arguments: args })).result;
  return { call, tool, notify: (method) => child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method }) + "\n"), close: () => child.stdin.end() };
}

test("MCP responde initialize, lista ferramentas e recursos e recusa método desconhecido", async () => {
  const mcp = server();
  try {
    const init = await mcp.call("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "teste", version: "1" } });
    assert.equal(init.result.protocolVersion, "2025-06-18");
    assert.equal(init.result.serverInfo.version, catalog.packageVersion);
    mcp.notify("notifications/initialized");
    const old = await mcp.call("initialize", { protocolVersion: "1999-01-01" });
    assert.equal(old.result.protocolVersion, "2025-06-18");
    const { result } = await mcp.call("tools/list");
    assert.deepEqual(result.tools.map((t) => t.name), ["refy_search", "refy_component", "refy_collections", "refy_validate", "refy_theme_generate", "refy_theme_extract", "refy_compare", "refy_theme_validate"]);
    for (const tool of result.tools) assert.equal(tool.inputSchema.type, "object");
    const resources = (await mcp.call("resources/list")).result.resources.map((r) => r.uri);
    assert.deepEqual(resources, ["refy://instructions", "refy://control-choices", "refy://theme-probe", "refy://catalog"]);
    const button = await mcp.call("resources/read", { uri: "refy://component/Button" });
    assert.equal(JSON.parse(button.result.contents[0].text).publicName, "Button");
    assert.equal((await mcp.call("nada/existe")).error.code, -32601);
    const missing = await mcp.tool("refy_component", { name: "Botao" });
    assert.equal(missing.isError, true);
    assert.match(missing.content[0].text, /Parecidas: .*Button/);
    const member = await mcp.tool("refy_component", { name: "CardHeader" });
    assert.equal(member.structuredContent.resolution.family, "Card");
  } finally {
    mcp.close();
  }
});

// Consulta → família que precisa estar entre as três primeiras. Escrita como pessoa pergunta,
// nas três línguas do site; nenhuma consulta repete o nome da família.
const intents = [
  ["confirmar antes de apagar", "AlertDialog"],
  ["lista suspensa com busca", "Combobox"],
  ["escolher uma data", "DatePicker"],
  ["upload de foto", "FileUpload"],
  ["chat com IA", "Message"],
  ["gráfico de vendas", "Charts"],
  ["selecionar vários itens", "Multiselect"],
  ["menu do usuário", "UserMenu"],
  ["mapa de bairros", "GeoAreaPicker"],
  ["botão só com ícone", "IconButton"],
  ["ir para outra página", "NavCard"],
  ["tabela com filtros", "Table"],
  ["mostrar que está carregando", "Spinner"],
  ["erro no campo", "Input"],
  ["capas de álbuns", "Coverflow"],
  ["linha do tempo do projeto", "Timeline"],
  ["navegação lateral", "Sidebar"],
  ["aviso que some sozinho", "Toast"],
  ["ventana de confirmación", "AlertDialog"],
  ["seleccionar varias opciones", "Multiselect"],
  ["pick one option from many", "Select"],
  ["editar detalhes sem sair da tela", "Drawer"],
];

test("busca por intenção acha a família certa entre as três primeiras", () => {
  const misses = intents.filter(([query, family]) => !searchCatalog(index, query, { limit: 3 }).results.some((r) => r.id === family));
  assert.deepEqual(misses, []);
  const first = searchCatalog(index, "confirmar antes de apagar", { limit: 3 });
  assert.deepEqual(first, searchCatalog(index, "confirmar antes de apagar", { limit: 3 }), "mesma consulta, mesma ordem");
  assert(first.results.find((r) => r.id === "AlertDialog").reasons.some((reason) => /deletes or cannot be undone/.test(reason)));
  assert.equal(searchCatalog(index, "Button", { limit: 1 }).results[0].id, "Button");
  assert.deepEqual(searchCatalog(index, "de para com", {}).results, []);
  assert(searchCatalog(index, "música", { collection: "media" }).results.every((r) => r.collections.includes("media")));
});

test("contrato recusa valor fora da união, prop obrigatória ausente e export inexistente", { skip: !hasDist && "sem dist/: rode npm run build" }, () => {
  const code = `import { Button, Badge, Modal, Botao } from '@refy-design/web';
export function Tela() {
  return <>
    <Button variant="big" loading="true">Salvar</Button>
    <Badge tone="sucess">ok</Badge>
    <Modal title="Apagar?">x</Modal>
    <Button {...props} />
    <Button variant="primary" data-id="x" aria-label="Salvar" onMouseEnter={f}>Salvar</Button>
  </>;
}`;
  const { findings, components } = checkContract(ts, code, "Tela.tsx", context);
  const rules = findings.map((f) => `${f.line}:${f.rule}`);
  assert.deepEqual(rules, [
    "1:unknown-export",
    "4:invalid-prop-value",
    "4:invalid-prop-value",
    "5:invalid-prop-value",
    "6:missing-required-prop",
    "6:missing-required-prop",
    "7:spread-not-verified",
  ]);
  assert.deepEqual(findings[1].allowed, ["primary", "secondary", "ghost", "danger"]);
  assert.deepEqual(components, ["Badge", "Button", "Modal"]);
});

test("os exemplos publicados nas fichas passam no contrato sem erro", { skip: !hasDist && "sem dist/: rode npm run build" }, () => {
  const errors = [];
  for (const component of catalog.components)
    for (const example of documentFor(component).examples)
      for (const finding of checkContract(ts, example.code, `${component.id}-${example.id}.tsx`, context).findings)
        if (finding.severity === "error") errors.push(`${component.id}/${example.id}: ${finding.message}`);
  assert.deepEqual(errors, []);
});

test("refy_validate junta contrato e regras do check, por código ou por arquivo", { skip: !hasDist && "sem dist/: rode npm run build" }, async () => {
  const mcp = server();
  try {
    const bad = await mcp.tool("refy_validate", { code: `import { Button } from '@refy-design/web';\nexport const T = () => <div style={{ color: '#f00' }}><Button variant="big">Ok</Button><button>x</button></div>;` });
    const result = bad.structuredContent;
    assert.equal(result.passed, false);
    assert.deepEqual(result.contract.findings.map((f) => f.rule), ["invalid-prop-value"]);
    assert.deepEqual(result.static.findings.map((f) => f.rule).sort(), ["appearance-literal", "raw-control"]);
    const good = await mcp.tool("refy_validate", { code: `import { Button } from '@refy-design/web';\nexport const T = () => <Button variant="primary">Salvar</Button>;` });
    assert.equal(good.structuredContent.passed, true);
    const file = await mcp.tool("refy_validate", { files: ["tests/agent-kit/pilot/After.tsx"] });
    assert.equal(file.isError, false);
    assert.deepEqual(file.structuredContent.static.scanned, ["tests/agent-kit/pilot/After.tsx"]);
    const outside = await mcp.tool("refy_validate", { files: ["../fora.tsx"] });
    assert.equal(outside.isError, true);
  } finally {
    mcp.close();
  }
});

test("temas do repositório passam no mesmo contrato que o MCP aplica", () => {
  for (const file of readdirSync("src/themes").filter((f) => f.endsWith(".json"))) {
    const report = validateTheme(JSON.parse(readFileSync(`src/themes/${file}`, "utf8")), { catalog, foundations });
    assert.deepEqual(report.errors, [], file);
  }
  const broken = validateTheme({ name: "x", label: "X", tokens: { "--nao-existe": "1px" }, modes: { light: { "--on-primary": "#ffffff", "--primary": "#ffff00" } } }, { catalog, foundations });
  assert.equal(broken.passed, false);
  assert(broken.errors.some((e) => /--nao-existe/.test(e)));
  assert(broken.errors.some((e) => /light: contraste --on-primary\/--primary/.test(e)));
});

test("tema gerado passa no contrato do MCP e no check-themes do repositório", () => {
  const seeds = ["#2163ad", "#ffd400", "#00c853", "#e91e63", "#000000", "#ffffff", "#7c3aed", "#b4471f", "#0ea5e9", "#9e9e9e", "#ff6600", "#00ffff"];
  const work = mkdtempSync(join(tmpdir(), "refy-theme-"));
  try {
    mkdirSync(join(work, "src"), { recursive: true });
    cpSync("src/tokens", join(work, "src/tokens"), { recursive: true });
    cpSync("src/themes", join(work, "src/themes"), { recursive: true });
    for (const [i, primary] of seeds.entries()) {
      const { theme, validation } = generateTheme({ name: `gerado-${i}`, label: `Gerado ${i}`, primary, radius: i % 2 ? "round" : "sharp", density: i % 3 ? "compact" : "comfortable", fontBody: "Inter" }, { catalog, foundations });
      assert.deepEqual(validation.errors, [], primary);
      assert(contrast(theme.modes.light["--on-primary"], theme.modes.light["--primary"]) >= 4.5);
      writeFileSync(join(work, "src/themes", `gerado-${i}.json`), JSON.stringify(theme));
    }
    const result = spawnSync(process.execPath, [resolve("scripts/check-themes.mjs")], { cwd: work, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, new RegExp(`OK: ${readdirSync("src/themes").filter((f) => f.endsWith(".json")).length + seeds.length} arquivos`));
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  assert.throws(() => generateTheme({ name: "Nome Errado", primary: "#000" }, { catalog, foundations }), /name/);
  assert.throws(() => generateTheme({ name: "ok", primary: "azul" }, { catalog, foundations }), /Cor inválida/);
});

// Achados da revisão de gate (09/11/2026): cada caso falhava antes do conserto.
test("mensagem nula, lote e erro de recurso seguem o JSON-RPC sem derrubar o servidor", async () => {
  const child = spawn(process.execPath, [resolve("tools/refy-agent/mcp.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
  const lines = [];
  child.stdout.on("data", (d) => lines.push(...String(d).split("\n").filter(Boolean).map((l) => JSON.parse(l))));
  const until = async (n) => { for (let i = 0; i < 100 && lines.length < n; i++) await new Promise((r) => setTimeout(r, 20)); };
  child.stdin.write("null\n");
  child.stdin.write(JSON.stringify([{ jsonrpc: "2.0", id: 5, method: "ping" }, { jsonrpc: "2.0", method: "notifications/initialized" }]) + "\n");
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 6, method: "resources/read", params: { uri: "refy://component/Nope" } }) + "\n");
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "refy_search", arguments: { query: "form constructor", limit: "x" } } }) + "\n");
  await until(4);
  child.stdin.end();
  assert.equal(lines[0].error.code, -32600);
  assert.deepEqual(lines[1], [{ jsonrpc: "2.0", id: 5, result: {} }]);
  assert.equal(lines[2].error.code, -32002);
  assert.equal(lines[3].result.isError, false);
  assert(lines[3].result.structuredContent.results.length <= 5);
});

test("import de tipo sem `type` passa; cor fora de #rrggbb e hover sem contraste reprovam", { skip: !hasDist && "sem dist/: rode npm run build" }, () => {
  const { findings } = checkContract(ts, "import { Button, ButtonProps } from '@refy-design/web';\nexport const T = (p: ButtonProps) => <Button {...p} />;", "T.tsx", context);
  assert(!findings.some((f) => f.severity === "error"));
  const short = validateTheme({ name: "x", label: "X", tokens: { "--primary": "#ff0", "--on-primary": "#fff" } }, { catalog, foundations });
  assert(short.errors.some((e) => /--on-primary\/--primary = 1.07/.test(e)));
  const rgb = validateTheme({ name: "x", label: "X", tokens: { "--primary": "rgb(255, 255, 0)" } }, { catalog, foundations });
  assert(rgb.errors.some((e) => /não dá para medir/.test(e)));
  const editorial = validateTheme({ name: "x", label: "X", modes: { editorial: { "--primary": "#ffff00", "--on-primary": "#ffffff" } } }, { catalog, foundations });
  assert(editorial.errors.some((e) => /^editorial:/.test(e)));
  for (const primary of ["#ff0000", "#808080"]) {
    const { theme } = generateTheme({ name: "hover", primary }, { catalog, foundations });
    for (const mode of ["light", "dark"])
      assert(contrast(theme.modes[mode]["--on-primary"], theme.modes[mode]["--primary-hover"]) >= 4.5, `${primary} ${mode}`);
  }
  assert.throws(() => generateTheme({ name: "x", primary: "#000", fontBody: 123 }, { catalog, foundations }), /fontBody/);
});

test("CHIPG: filtro de opção única e filtros acima da lista levam ao Chip, onde mora o ChipGroup", () => {
  for (const query of ["filtro de opção única", "filtros acima da lista"])
    assert.equal(searchCatalog(index, query, { limit: 3 }).results[0].id, "Chip", query);
  assert(documentFor(catalog.components.find((c) => c.id === "Chip")).api.some((m) => m.name === "ChipGroup"));
});
