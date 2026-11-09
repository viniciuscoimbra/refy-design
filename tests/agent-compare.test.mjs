// refy_compare: PNG lido e gravado sem dependência, diferença medida por região.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { comparePng, decodePng, encodePng } from "../tools/refy-agent/compare.mjs";

function image(width, height, paint) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) pixels.set([...paint(x, y), 255], (y * width + x) * 4);
  return { width, height, pixels };
}
const creme = image(120, 80, () => [247, 239, 223]);
const comBotao = image(120, 80, (x, y) => (x >= 90 && y >= 60 ? [217, 154, 49] : [247, 239, 223]));

test("PNG gravado volta igual na leitura", () => {
  const back = decodePng(encodePng(comBotao));
  assert.equal(back.width, 120);
  assert.ok(back.pixels.equals(comBotao.pixels));
});

test("diferença aponta a região que mudou e a porcentagem", () => {
  const same = comparePng(creme, creme);
  assert.equal(same.differentPixels, 0);
  const result = comparePng(creme, comBotao);
  assert.equal(result.differentPixels, 30 * 20);
  assert.equal(result.differentPercent, 6.25);
  const top = result.regions[0];
  assert.ok(top.x >= 80 && top.y >= 53, JSON.stringify(top));
  assert.throws(() => comparePng(creme, image(10, 10, () => [0, 0, 0])), /Tamanhos diferentes/);
});

test("MCP refy_compare lê os dois PNG e grava a imagem de diferença", async () => {
  const dir = mkdtempSync(join(tmpdir(), "refy-compare-test-"));
  writeFileSync(join(dir, "original.png"), encodePng(creme));
  writeFileSync(join(dir, "refy.png"), encodePng(comBotao));
  const child = spawn(process.execPath, [resolve("tools/refy-agent/mcp.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
  const reply = new Promise((done) => { let b = ""; child.stdout.on("data", (d) => { b += d; const i = b.indexOf("\n"); if (i >= 0) done(JSON.parse(b.slice(0, i))); }); });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "refy_compare", arguments: { original: join(dir, "original.png"), candidate: join(dir, "refy.png") } } }) + "\n");
  const { result } = await reply;
  child.stdin.end();
  assert.equal(result.isError, false, result.content[0].text);
  assert.equal(result.structuredContent.differentPercent, 6.25);
  assert.equal(decodePng(readFileSync(result.structuredContent.diffImage)).width, 120);
});

test("PNG com cabeçalho gigante é recusado antes de alocar memória", async () => {
  const { decodePng, encodePng } = await import("../tools/refy-agent/compare.mjs");
  const png = encodePng({ width: 1, height: 1, pixels: Buffer.alloc(4) });
  png.writeUInt32BE(30000, 16); png.writeUInt32BE(30000, 20);
  assert.throws(() => decodePng(png), /grande demais/);
});
