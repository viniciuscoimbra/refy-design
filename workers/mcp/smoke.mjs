#!/usr/bin/env node
// Prova do MCP remoto de ponta a ponta, do jeito que um cliente web chama: initialize, lista,
// busca, API de família, validação, tema gerado e tema a partir de HTML.
// Uso: node workers/mcp/smoke.mjs [endereço]   (padrão: https://refy.design/mcp)
import assert from "node:assert/strict";

const endpoint = process.argv[2] ?? "https://refy.design/mcp";
let id = 0;
async function rpc(method, params = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "mcp-protocol-version": "2025-06-18" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
  });
  assert.equal(res.status, 200, `${method} respondeu ${res.status}`);
  const body = await res.json();
  assert.ok(!body.error, `${method}: ${body.error?.message}`);
  return body.result;
}
const tool = async (name, args) => {
  const t0 = performance.now();
  const result = await rpc("tools/call", { name, arguments: args });
  console.log(`  ${name}: ${Math.round(performance.now() - t0)} ms${result.isError ? " (erro: " + result.content[0].text + ")" : ""}`);
  return result;
};

const init = await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "smoke", version: "1" } });
console.log(`${endpoint}: ${init.serverInfo.name} ${init.serverInfo.version}, protocolo ${init.protocolVersion}`);
const note = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
assert.equal(note.status, 202);
const names = (await rpc("tools/list")).tools.map((t) => t.name);
console.log(`  ferramentas: ${names.join(", ")}`);
assert.ok(!names.includes("refy_compare"));

const search = await tool("refy_search", { query: "confirmar antes de apagar", limit: 3 });
assert.equal(search.isError, false);
console.log(`    → ${search.structuredContent.results.map((r) => r.id).join(", ")}`);
const button = await tool("refy_component", { name: "Button" });
assert.equal(button.structuredContent.publicName, "Button");
const bad = await tool("refy_validate", { code: `import { Button } from '@refy-design/web';\nexport const T = () => <Button variant="big">Salvar</Button>;` });
assert.equal(bad.structuredContent.passed, false);
console.log(`    → recusou: ${bad.structuredContent.contract.findings.map((f) => f.message).join(" | ").slice(0, 160)}`);
const good = await tool("refy_validate", { code: `import { Button } from '@refy-design/web';\nexport const T = () => <Button variant="primary">Salvar</Button>;` });
assert.equal(good.structuredContent.passed, true, JSON.stringify(good.structuredContent.contract.findings));
const raw = await tool("refy_validate", { code: `export const T = () => <button style={{ color: "#f00" }}>Salvar</button>;` });
assert.equal(raw.structuredContent.passed, false);
const files = await tool("refy_validate", { files: ["src/App.tsx"] });
assert.equal(files.isError, true);
const theme = await tool("refy_theme_generate", { name: "teste", primary: "#2163ad" });
assert.equal(theme.isError, false);
const checked = await tool("refy_theme_validate", { theme: theme.structuredContent.theme });
assert.equal(checked.isError, false);
const fromHtml = await tool("refy_theme_extract", {
  html: `<html><body style="background:#0f1115;color:#f3f4f6;font-family:Inter"><a class="btn" style="background:#ff6a3d;color:#111;border-radius:999px">Comprar</a><h1 style="font-family:'Space Grotesk'">Oi</h1></body></html>`,
  name: "escuro",
});
assert.equal(fromHtml.isError, false, fromHtml.content[0].text);
const local = await tool("refy_theme_extract", { url: "http://127.0.0.1/" });
assert.equal(local.isError, true);
const resource = await rpc("resources/read", { uri: "refy://component/Button" });
assert.equal(JSON.parse(resource.contents[0].text).publicName, "Button");
console.log("ok");
