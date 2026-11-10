// MCP remoto (Streamable HTTP): o mesmo núcleo do stdio, sem o que lê o computador de quem usa.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, symlinkSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { handleMcpRequest, REMOTE } from "../tools/refy-agent/remote.mjs";

const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
// Versão anterior falsa, como o Worker leva em mcp-versions/: catálogo 1.2.0 cuja ficha de
// ContentCard ainda não tem valueSuffix.
const versions = mkdtempSync(join(tmpdir(), "refy-versoes-"));
const previous = join(versions, "1.2.0");
cpSync("ai", join(previous, "ai"), { recursive: true });
if (existsSync("dist")) symlinkSync(resolve("dist"), join(previous, "dist"), "junction");
writeFileSync(join(previous, "ai/catalog.json"), JSON.stringify({ ...catalog, packageVersion: "1.2.0" }));
const card = JSON.parse(readFileSync("ai/components/PropertyCard.json", "utf8"));
card.api = card.api.map((member) => ({ ...member, props: member.props.filter((p) => p.name !== "valueSuffix") }));
writeFileSync(join(previous, "ai/components/PropertyCard.json"), JSON.stringify(card));
process.env.REFY_MCP_VERSIONS = versions;
const withNpm = (value) => ({ ...REMOTE, published: async () => value });
const call = async (mode, name, args) =>
  (await (await handleMcpRequest(new Request("https://refy.design/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }) }), mode)).json()).result;
const post = (body, headers = {}) =>
  handleMcpRequest(new Request("https://refy.design/mcp", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const rpc = async (method, params = {}, id = 1) => (await (await post({ jsonrpc: "2.0", id, method, params })).json());

test("HTTP: initialize, notificação com 202, GET com 405 e CORS aberto", async () => {
  const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "teste", version: "1" } });
  assert.equal(init.result.serverInfo.version, catalog.packageVersion);
  assert.match(init.result.instructions, /servidor remoto/);
  const note = await post({ jsonrpc: "2.0", method: "notifications/initialized" });
  assert.equal(note.status, 202);
  const get = await handleMcpRequest(new Request("https://refy.design/mcp"));
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST, OPTIONS");
  const preflight = await handleMcpRequest(new Request("https://refy.design/mcp", { method: "OPTIONS" }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), "*");
  assert.match(preflight.headers.get("access-control-allow-headers"), /mcp-protocol-version/);
  assert.equal((await (await post("{nada")).json()).error.code, -32700);
  const big = await post("x".repeat(2_000_001));
  assert.equal(big.status, 413);
});

test("HTTP: lote devolve as respostas na ordem e ignora notificação", async () => {
  const replies = await (await post([{ jsonrpc: "2.0", id: 1, method: "ping" }, { jsonrpc: "2.0", method: "notifications/initialized" }, { jsonrpc: "2.0", id: 2, method: "tools/list" }])).json();
  assert.deepEqual(replies.map((r) => r.id), [1, 2]);
});

test("remoto lista as ferramentas sem refy_compare, sem files e sem browser", async () => {
  const { tools } = (await rpc("tools/list")).result;
  assert.deepEqual(tools.map((t) => t.name), ["refy_search", "refy_component", "refy_collections", "refy_validate", "refy_theme_generate", "refy_theme_extract", "refy_theme_validate"]);
  const validate = tools.find((t) => t.name === "refy_validate");
  assert.deepEqual(validate.inputSchema.required, ["code"]);
  assert.equal("files" in validate.inputSchema.properties, false);
  assert.equal("browser" in tools.find((t) => t.name === "refy_theme_extract").inputSchema.properties, false);
  const compare = await rpc("tools/call", { name: "refy_compare", arguments: { original: "a.png", candidate: "b.png" } });
  assert.equal(compare.error.code, -32602);
});

test("remoto recusa arquivo da máquina e endereço interno, e valida código passado", async () => {
  const files = (await rpc("tools/call", { name: "refy_validate", arguments: { files: ["package.json"] } })).result;
  assert.equal(files.isError, true);
  assert.match(files.content[0].text, /não lê arquivos/);
  for (const url of ["http://127.0.0.1/", "http://localhost:3000/", "http://[::1]/", "http://10.0.0.1/", "file:///etc/passwd"]) {
    const result = (await rpc("tools/call", { name: "refy_theme_extract", arguments: { url } })).result;
    assert.equal(result.isError, true, url);
  }
  const bad = (await rpc("tools/call", { name: "refy_validate", arguments: { code: `import { Button } from '@refy-design/web';\nexport const T = () => <Button variant="big">Salvar</Button>;` } })).result;
  assert.equal(bad.structuredContent.passed, false);
});

test("o stdio continua com as oito ferramentas", () => {
  const out = spawnSync(process.execPath, ["tools/refy-agent/mcp.mjs"], { input: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) + "\n", encoding: "utf8" });
  assert.equal(JSON.parse(out.stdout).result.tools.length, 8);
});

test("MCP-05: catálogo igual ao npm não avisa; à frente do npm, avisa qual versão instalar", async () => {
  const same = await call(withNpm({ latest: catalog.packageVersion, versions: ["1.2.0", catalog.packageVersion] }), "refy_component", { name: "Button" });
  assert.equal(same.structuredContent.packageVersion, catalog.packageVersion);
  assert.equal(same.structuredContent.publishedVersion, catalog.packageVersion);
  assert.equal("warnings" in same.structuredContent, false);
  const ahead = await call(withNpm({ latest: "1.2.0", versions: ["1.0.0", "1.1.0", "1.2.0"] }), "refy_search", { query: "botão" });
  assert.equal(ahead.structuredContent.publishedVersion, "1.2.0");
  assert.match(ahead.structuredContent.warnings.join(" "), new RegExp(`${catalog.packageVersion} não está publicada no npm; a versão instalável é 1.2.0. Chame de novo com version: "1.2.0"`));
  const offline = await call(withNpm(null), "refy_collections", {});
  assert.equal(offline.structuredContent.publishedVersion, null);
  assert.match(offline.structuredContent.warnings[0], /não foi conferida/);
});

test("MCP-06: version lê a API da versão pedida e recusa versão que o servidor não tem", async () => {
  const npm = withNpm({ latest: "1.2.0", versions: ["1.2.0"] });
  const old = await call(npm, "refy_component", { name: "ContentCard", version: "1.2.0" });
  assert.equal(old.isError, false, old.content[0].text);
  assert.equal(old.structuredContent.packageVersion, "1.2.0");
  assert.equal("warnings" in old.structuredContent, false);
  assert.equal(old.structuredContent.api[0].props.some((p) => p.name === "valueSuffix"), false);
  const now = await call(npm, "refy_component", { name: "ContentCard" });
  assert.equal(now.structuredContent.api[0].props.some((p) => p.name === "valueSuffix"), true);
  for (const name of ["refy_search", "refy_collections"]) {
    const result = await call(npm, name, { query: "card", version: "1.2.0" });
    assert.equal(result.structuredContent.packageVersion, "1.2.0", name);
  }
  const checked = await call(npm, "refy_validate", { code: `import { ContentCard } from '@refy-design/web';\nexport const T = () => <ContentCard title="Casa" media={[]} valueSuffix="/mês" />;`, version: "1.2.0" });
  assert.equal(checked.structuredContent.packageVersion, "1.2.0");
  assert(checked.structuredContent.contract.findings.some((f) => f.rule === "undocumented-prop" && /valueSuffix/.test(f.message)));
  const missing = await call(npm, "refy_component", { name: "Button", version: "9.9.9" });
  assert.equal(missing.isError, true);
  assert.match(missing.content[0].text, new RegExp(`Versões disponíveis: ${catalog.packageVersion.replaceAll(".", "\\.")}, 1\\.2\\.0`));
});

test("MCP-07: toda ferramenta, no local e no remoto, se declara só de leitura", async () => {
  const out = spawnSync(process.execPath, ["tools/refy-agent/mcp.mjs"], { input: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) + "\n", encoding: "utf8" });
  const local = JSON.parse(out.stdout).result.tools;
  const remote = (await rpc("tools/list")).result.tools;
  for (const tool of [...local, ...remote]) {
    assert.deepEqual(tool.annotations, { title: tool.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: tool.name === "refy_theme_extract" }, tool.name);
  }
  assert.deepEqual(remote.filter((t) => t.annotations.openWorldHint).map((t) => t.name), ["refy_theme_extract"]);
});

test("RMCP-04: publicação do remoto para quando a versão do pacote não está no npm", () => {
  const { version } = JSON.parse(readFileSync("package.json", "utf8"));
  const run = (list) => spawnSync(process.execPath, ["workers/mcp/check-published.mjs", list], { encoding: "utf8" });
  const blocked = run("1.0.0,1.1.0");
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, new RegExp(`${version.replaceAll(".", "\\.")} não está no npm`));
  assert.equal(run(`1.0.0,${version}`).status, 0);
});
