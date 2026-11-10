#!/usr/bin/env node
// Monta o Worker do MCP remoto num arquivo só (workers/mcp/dist/worker.js), sem nodejs_compat:
// os módulos do Node que o servidor importa viram as versões de shims/, e o que o servidor lê
// do pacote (ai/, dist/*.d.ts, fundação de tokens) entra como mapa de arquivos em memória.
// Pede `npm run build` antes, para dist/*.d.ts existir: sem ele, refy_validate não confere aliases.
import { build } from "esbuild";
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
if (!existsSync(join(root, "dist", "index.d.ts"))) throw Error("Falta dist/: rode npm run build antes de montar o Worker.");

const files = {};
const add = (path) => { files["/pkg/" + relative(root, path).split(sep).join("/")] = readFileSync(path, "utf8"); };
const walk = (dir, keep) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, keep);
    else if (keep(name)) add(path);
  }
};
walk(join(root, "ai"), (name) => /\.(json|md)$/.test(name));
walk(join(root, "dist"), (name) => name.endsWith(".d.ts"));
add(join(root, "src/tokens/foundations.tokens.json"));
add(join(root, "package.json"));

// Versão anterior publicada no npm, em /pkg/mcp-versions/<versão>/, para refy_* com version (MCP-06).
// REFY_MCP_PREVIOUS escolhe a versão; "none" monta sem ela (só para teste local sem rede).
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const newer = (a, b) => a.localeCompare(b, undefined, { numeric: true }) > 0;
let previous = process.env.REFY_MCP_PREVIOUS;
if (!previous) {
  const versions = JSON.parse(execFileSync("npm", ["view", pkg.name, "versions", "--json"], { encoding: "utf8" }));
  previous = [].concat(versions).filter((v) => /^\d+\.\d+\.\d+$/.test(v) && newer(pkg.version, v)).sort((a, b) => (newer(a, b) ? -1 : 1))[0];
}
const embedded = [pkg.version];
if (previous && previous !== "none") {
  const temp = mkdtempSync(join(tmpdir(), "refy-mcp-anterior-"));
  try {
    const tgz = execFileSync("npm", ["pack", `${pkg.name}@${previous}`, "--pack-destination", temp, "--silent"], { encoding: "utf8" }).trim().split("\n").pop();
    execFileSync("tar", ["-xzf", join(temp, tgz), "-C", temp]);
    const base = join(temp, "package");
    const keep = (name) => /\.(json|md)$/.test(name) || name.endsWith(".d.ts");
    const walkInto = (dir) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walkInto(path);
        else if (keep(name)) files[`/pkg/mcp-versions/${previous}/` + relative(base, path).split(sep).join("/")] = readFileSync(path, "utf8");
      }
    };
    walkInto(join(base, "ai"));
    if (existsSync(join(base, "dist"))) walkInto(join(base, "dist"));
    embedded.push(previous);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const shim = (name) => join(here, "shims", name);
const ALIAS = {
  fs: shim("fs.mjs"), path: shim("path.mjs"), module: shim("module.mjs"), net: shim("net.mjs"),
  os: shim("os-url.mjs"), url: shim("os-url.mjs"),
  "dns/promises": shim("unavailable.mjs"), http: shim("unavailable.mjs"), https: shim("unavailable.mjs"), zlib: shim("unavailable.mjs"),
};
const nodeShims = {
  name: "refy-node-shims",
  setup(b) {
    b.onResolve({ filter: /^(node:)?(fs|path|module|net|os|url|dns\/promises|http|https|zlib)$/ }, (args) => ({ path: ALIAS[args.path.replace(/^node:/, "")] }));
    // Qualquer outro módulo do Node é recusado aqui, no build, em vez de falhar no Worker.
    b.onResolve({ filter: /^node:|^(crypto|child_process|readline|buffer|stream|util|events|tty|worker_threads|perf_hooks|inspector)$/ }, (args) =>
      args.importer.includes(`${sep}typescript${sep}`) ? { path: args.path, namespace: "empty" } : { errors: [{ text: `${args.path} não existe no Worker (importado por ${relative(root, args.importer)})` }] });
    b.onLoad({ filter: /.*/, namespace: "empty" }, () => ({ contents: "module.exports = {};", loader: "js" }));
    b.onResolve({ filter: /^refy:files$/ }, () => ({ path: "files", namespace: "refy" }));
    b.onLoad({ filter: /.*/, namespace: "refy" }, () => ({ contents: JSON.stringify(files), loader: "json" }));
  },
};

const outfile = join(here, "dist", "worker.js");
mkdirSync(dirname(outfile), { recursive: true });
const result = await build({
  entryPoints: [join(here, "worker.mjs")],
  outfile,
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2022",
  mainFields: ["module", "main"],
  conditions: ["worker", "import", "default"],
  minify: true,
  legalComments: "external",
  define: { "import.meta.url": JSON.stringify("file:///pkg/tools/refy-agent/mcp-server.mjs") },
  plugins: [nodeShims],
  metafile: true,
  logLevel: "warning",
});
const bytes = readFileSync(outfile);
const gzip = gzipSync(bytes).length;
console.log(`worker.js: ${(bytes.length / 1e6).toFixed(2)} MB, ${(gzip / 1e6).toFixed(2)} MB comprimido, ${Object.keys(files).length} arquivos do pacote, versões ${embedded.join(" e ")}.`);
// Plano gratuito da Cloudflare: 3 MB comprimido por Worker.
if (gzip > 3e6) throw Error("O Worker passou de 3 MB comprimido, o limite do plano gratuito.");
