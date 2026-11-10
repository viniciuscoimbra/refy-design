// CSS-01 e CSS-03 (scope-css-to-used-components): uma tela que só usa Button
// não pode levar o CSS do catálogo inteiro. Vite (Rollup) descarta o CSS dos módulos não usados
// também pela raiz; o esbuild junta o CSS pelo grafo de imports antes de descartar o JS, então
// para ele o caminho seletivo é o import direto. Pede `npm run build` antes (lê dist/).
// Uso: node scripts/check-css-budget.mjs [--budget-esbuild <bytes>]
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, readdirSync, statSync, rmSync, existsSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { build as esbuild } from "esbuild";
import { build as vite } from "vite";

const root = resolve(".");
if (!existsSync(join(root, "dist/index.js"))) throw Error("Falta dist/: rode npm run build antes.");
const flag = process.argv.indexOf("--budget-esbuild");
// Orçamento do Button sozinho: 7.544 B medidos em 09/11/2026, com folga de 20%.
const ESBUILD_BUDGET = flag > 0 ? Number(process.argv[flag + 1]) : 9_000;
const VITE_RATIO = 1.1;

// No macOS o tmpdir passa por symlink (/var -> /private/var) e o Vite recusa o index.html como caminho relativo.
const temp = realpathSync(mkdtempSync(join(tmpdir(), "refy-css-budget-")));
const cssBytes = (dir) => {
  let total = 0;
  const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith(".css")) total += statSync(p).size; });
  walk(dir);
  return total;
};
try {
  mkdirSync(join(temp, "node_modules/@refy-design"), { recursive: true });
  symlinkSync(root, join(temp, "node_modules/@refy-design/web"), "junction");
  for (const name of ["react", "react-dom", "scheduler"]) symlinkSync(join(root, "node_modules", name), join(temp, "node_modules", name), "junction");
  const entry = (name, from, extra = "") =>
    writeFileSync(join(temp, `${name}.js`), `${extra}import { createElement } from "react";\nimport { createRoot } from "react-dom/client";\nimport { Button } from "${from}";\ncreateRoot(document.getElementById("root")).render(createElement(Button, null, "Ok"));\n`);
  entry("root", "@refy-design/web");
  entry("direct", "@refy-design/web/Button");
  entry("legacy", "@refy-design/web", 'import "@refy-design/web/styles.css";\n');

  const sizes = {};
  for (const name of ["root", "direct", "legacy"]) {
    const html = join(temp, name);
    mkdirSync(html);
    writeFileSync(join(html, "index.html"), `<div id="root"></div><script type="module" src="../${name}.js"></script>`);
    await vite({ root: html, logLevel: "silent", configFile: false, build: { outDir: join(temp, "out", `vite-${name}`), emptyOutDir: true } });
    sizes[`vite ${name}`] = cssBytes(join(temp, "out", `vite-${name}`));
  }
  for (const name of ["root", "direct"]) {
    const outdir = join(temp, "out", `esbuild-${name}`);
    await esbuild({ entryPoints: [join(temp, `${name}.js`)], absWorkingDir: temp, bundle: true, outdir, minify: true, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent" });
    sizes[`esbuild ${name}`] = cssBytes(outdir);
  }
  console.table(Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, { css: v }])));
  const failures = [];
  const viteLimit = Math.round(sizes["vite direct"] * VITE_RATIO);
  if (sizes["vite root"] > viteLimit) failures.push(`Vite pela raiz: ${sizes["vite root"]} B de CSS, orçamento ${viteLimit} B (110% do import direto).`);
  if (sizes["esbuild direct"] > ESBUILD_BUDGET) failures.push(`esbuild pelo import direto: ${sizes["esbuild direct"]} B de CSS, orçamento ${ESBUILD_BUDGET} B.`);
  if (sizes["vite legacy"] < sizes["vite root"] * 10) failures.push(`styles.css legado gerou só ${sizes["vite legacy"]} B; devia trazer a folha completa.`);
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  } else
    console.log(`OK: CSS do Button dentro do orçamento (Vite raiz ≤ ${viteLimit} B, esbuild direto ≤ ${ESBUILD_BUDGET} B). esbuild pela raiz: ${sizes["esbuild root"]} B, documentado no README.`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
