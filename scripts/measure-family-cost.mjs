// Mede o JS e o CSS (gzip) que cada família leva para a tela num app Vite, sem React, a partir do
// dist/ atual. Uso: npm run build && node scripts/measure-family-cost.mjs [saida.json] [Familia...]
import { build } from "vite";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, symlinkSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(".");
const [output = "family-cost.json", ...only] = process.argv.slice(2);
const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
const names = only.length ? only : catalog.components.map((c) => c.publicName ?? c.id);
const dir = mkdtempSync(join(tmpdir(), "refy-cost-"));
mkdirSync(join(dir, "node_modules/@refy-design"), { recursive: true });
symlinkSync(root, join(dir, "node_modules/@refy-design/web"), "dir");
async function measure(code) {
  writeFileSync(join(dir, "entry.js"), code);
  const out = await build({
    root: dir, logLevel: "silent", configFile: false,
    build: { write: false, minify: true, cssCodeSplit: false, lib: { entry: join(dir, "entry.js"), formats: ["es"], fileName: "x" }, rollupOptions: { external: [/^react($|\/)/, /^react-dom($|\/)/] } },
  });
  let js = 0, css = 0;
  for (const file of (Array.isArray(out) ? out : [out]).flatMap((r) => r.output)) {
    const bytes = gzipSync(file.type === "chunk" ? file.code : file.source, { level: 9 }).length;
    if (file.fileName.endsWith(".css")) css += bytes; else if (file.type === "chunk") js += bytes;
  }
  return { js, css };
}
const rows = { tokens: await measure(`import "@refy-design/web/tokens.css"; export default 1;`) };
for (const name of names) rows[name] = await measure(`import "@refy-design/web/tokens.css"; import { ${name} } from "@refy-design/web"; export default ${name};`);
rmSync(dir, { recursive: true, force: true });
writeFileSync(output, JSON.stringify(rows, null, 1) + "\n");
const sorted = Object.values(rows).map((r) => r.js).sort((a, b) => a - b);
console.log(`${names.length} famílias; JS gzip mediano ${sorted[Math.floor(sorted.length / 2)]} B; tokens.css ${rows.tokens.css} B gzip. Detalhe em ${output}.`);
