// refy contribute <Nome>: transforma uma extensão local do consumidor (refy-extensions/<Nome>)
// numa proposta para o Refy. Aplica o patch num git worktree temporário do Refy, criado do HEAD,
// roda os gates lá e grava patch, texto do PR, gates e imagens em refy-contrib/<Nome>/ no consumidor.
// Não abre PR, não faz push e não toca na árvore de trabalho do Refy.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, symlinkSync, copyFileSync, mkdtempSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

// O vocabulário do produto vem do contribution.json de quem contribui (`productWords`): o pacote é
// público e não carrega lista de produto nenhum.
const KEYS = ["component", "capability", "why", "props", "tokens", "screens", "patch", "changelog", "tests", "preview", "productWords", "level", "area", "collections"];
const LEVELS = ["Átomos", "Moléculas", "Organismos"];
const AREAS = ["actions", "forms", "navigation", "feedback", "data", "content", "structure"];

/** Família nova não tem "antes": `preview.before` vazio ou ausente. Ela precisa dizer camada e finalidade. */
export const isNewFamily = (spec) => !spec.preview?.before?.length;

export function validateSpec(spec) {
  const problems = [];
  const unknown = Object.keys(spec).filter((k) => !KEYS.includes(k));
  if (unknown.length) problems.push(`campos desconhecidos: ${unknown.join(", ")}`);
  for (const key of ["component", "capability", "why", "patch", "changelog"]) if (!spec[key]) problems.push(`falta ${key}`);
  if (!spec.preview?.after?.length) problems.push("falta preview.after: a capacidade nova precisa de imagem");
  if (isNewFamily(spec)) {
    if (!LEVELS.includes(spec.level)) problems.push(`família nova precisa de level: ${LEVELS.join(", ")}`);
    if (!AREAS.includes(spec.area)) problems.push(`família nova precisa de area: ${AREAS.join(", ")}`);
  }
  return problems;
}

// Põe o item em "## Não publicado", dentro de "### <categoria>", criando o que faltar. A seção fica
// no topo, antes da primeira versão, como pede o Keep a Changelog.
export function unreleasedEntry(markdown, category, text) {
  const lines = markdown.split("\n");
  let start = lines.findIndex((line) => line.trim() === "## Não publicado");
  if (start < 0) {
    const first = lines.findIndex((line) => line.startsWith("## "));
    start = first < 0 ? lines.length : first;
    lines.splice(start, 0, "## Não publicado", "");
  }
  let end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  if (end < 0) end = lines.length;
  const head = lines.findIndex((line, index) => index > start && index < end && line.trim() === `### ${category}`);
  if (head < 0) {
    while (end > start + 1 && lines[end - 1].trim() === "") lines.splice(--end, 1);
    lines.splice(end, 0, "", `### ${category}`, "", `- ${text}`, "");
  } else {
    let at = head + 1;
    while (at < end && (lines[at].trim() === "" || lines[at].startsWith("- "))) at++;
    while (at > head + 1 && lines[at - 1].trim() === "") at--;
    lines.splice(at, 0, `- ${text}`);
  }
  return lines.join("\n");
}

function run(cmd, args, cwd, log) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  log?.push({ command: [cmd, ...args].join(" "), status: r.status, tail: out.split("\n").slice(-12).join("\n") });
  return { ok: r.status === 0, out };
}

export function generality(spec, patchText) {
  const words = (spec.productWords ?? []).map((w) => w.toLowerCase());
  const added = patchText.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).join("\n").toLowerCase();
  const names = [...(spec.props ?? []).map((p) => p.name), ...(spec.tokens ?? []).map((t) => t.name)].join(" ").toLowerCase();
  const found = words.filter((w) => new RegExp(`(^|[^\\p{L}])${w}([^\\p{L}]|$)`, "u").test(added + "\n" + names));
  const defaults = [...(spec.props ?? []), ...(spec.tokens ?? [])].filter((x) => x.default === undefined).map((x) => x.name);
  return { productWords: found, missingDefaults: defaults, passed: !found.length && !defaults.length };
}

async function renderPreview(wt, preview, out, refyNodeModules) {
  // Página mínima: componente público do dist do worktree + estilos, renderizado com as props pedidas.
  const require = createRequire(join(refyNodeModules, "package.json"));
  const esbuild = require("esbuild");
  const dir = mkdtempSync(join(tmpdir(), "refy-preview-"));
  writeFileSync(join(dir, "entry.jsx"), `import React from "react";import {createRoot} from "react-dom/client";import * as R from ${JSON.stringify(join(wt, "dist/index.js"))};import ${JSON.stringify(join(wt, "src/tokens/tokens.css"))};import ${JSON.stringify(join(wt, "src/styles/global.css"))};import ${JSON.stringify(join(wt, "dist/style.css"))};
const P=${JSON.stringify(preview)};createRoot(document.getElementById("root")).render(<R.ThemeProvider mode="light"><div id="alvo" style={{width:P.width||360,padding:16}}>{P.cases.map((c,i)=>React.createElement(R[P.component],{key:i,...c}))}</div></R.ThemeProvider>);`);
  esbuild.buildSync({ entryPoints: [join(dir, "entry.jsx")], bundle: true, outdir: dir, jsx: "automatic", nodePaths: [refyNodeModules], loader: { ".woff2": "file", ".woff": "file", ".ttf": "file" }, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "silent" });
  writeFileSync(join(dir, "index.html"), `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="entry.css"><body style="margin:0"><div id="root"></div><script src="entry.js"></script>`);
  const { chromium } = require("playwright");
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: (preview.width || 360) + 32, height: 400 }, deviceScaleFactor: 2 });
  await p.goto("file://" + join(dir, "index.html")); await p.waitForTimeout(400);
  await (await p.$("#alvo")).screenshot({ path: out }); await b.close();
  rmSync(dir, { recursive: true, force: true });
}

function samePixels(a, b, refyNodeModules) {
  const py = spawnSync("python3", ["-c", `from PIL import Image, ImageChops\nimport sys\na=Image.open(sys.argv[1]).convert('RGB');b=Image.open(sys.argv[2]).convert('RGB')\nprint('size' if a.size!=b.size else sum(ImageChops.difference(a,b).convert('L').histogram()[1:]))`, a, b], { encoding: "utf8" });
  return py.stdout.trim();
}

export async function contribute(argv, { cwd = process.cwd(), log = console.log } = {}) {
  const name = argv.find((a) => !a.startsWith("--"));
  if (!name) throw Error("Usage: refy contribute <Nome> [--refy <caminho do repo Refy>]");
  const root = resolve(cwd);
  const extDir = join(root, "refy-extensions", name);
  const spec = JSON.parse(readFileSync(join(extDir, "contribution.json"), "utf8"));
  const problems = validateSpec(spec);
  if (problems.length) throw Error(`contribution.json: ${problems.join("; ")}`);
  const fresh = isNewFamily(spec);
  const refyIdx = argv.indexOf("--refy");
  const refy = resolve(cwd, refyIdx >= 0 ? argv[refyIdx + 1] : "../refy-design");
  const outDir = join(root, "refy-contrib", name);
  mkdirSync(outDir, { recursive: true });
  const patchText = readFileSync(join(extDir, spec.patch), "utf8");
  const gates = { component: spec.component, generality: generality(spec, patchText), steps: [] };
  log(`generalidade: ${gates.generality.passed ? "passa" : "falha"} ${JSON.stringify(gates.generality)}`);

  // Worktree temporário do Refy a partir do HEAD; node_modules emprestado por link.
  const wt = mkdtempSync(join(tmpdir(), `refy-contrib-${name}-`));
  rmSync(wt, { recursive: true, force: true });
  const add = run("git", ["-C", refy, "worktree", "add", "--detach", wt, "HEAD"], refy, gates.steps);
  if (!add.ok) throw Error("git worktree add falhou: " + add.out);
  try {
    symlinkSync(join(refy, "node_modules"), join(wt, "node_modules"), "dir");
    const nm = join(refy, "node_modules");
    // Antes: build do HEAD e imagem do componente com as props atuais.
    run("npm", ["run", "build"], wt, gates.steps);
    if (!fresh) await renderPreview(wt, { ...spec.preview, cases: spec.preview.before }, join(outDir, "antes.png"), nm);
    // Patch, ficha e catálogo regenerados, changelog.
    writeFileSync(join(wt, "contrib.patch"), patchText);
    const applied = run("git", ["apply", "--whitespace=nowarn", "contrib.patch"], wt, gates.steps);
    if (!applied.ok) throw Error("git apply falhou: " + applied.out);
    rmSync(join(wt, "contrib.patch"));
    // A entrada vai para "## Não publicado" na categoria do Keep a Changelog: família nova é
    // Adicionado, mudança numa família que já existe é Modificado. A versão só é escolhida na release.
    const changelog = join(wt, "CHANGELOG.md");
    writeFileSync(changelog, unreleasedEntry(existsSync(changelog) ? readFileSync(changelog, "utf8") : "# Changelog\n", fresh ? "Adicionado" : "Modificado", `${spec.component}: ${spec.changelog}`));
    run("npm", ["run", "docs:build"], wt, gates.steps);
    run("node", ["scripts/api-history.mjs"], wt, gates.steps);
    run("npm", ["run", "agent:build"], wt, gates.steps);
    // Gates.
    const gate = (label, cmd, args) => { const r = run(cmd, args, wt, gates.steps); gates[label] = r.ok; log(`${label}: ${r.ok ? "passa" : "falha"}`); return r.ok; };
    gate("tipos", "npx", ["tsc", "--noEmit"]);
    gate("build", "npm", ["run", "build"]);
    gate("docs", "npm", ["run", "docs:check"]);
    gate("agente", "npm", ["run", "agent:check"]);
    for (const t of spec.tests ?? []) gate("teste " + t, "node", ["--test", t]);
    await renderPreview(wt, { ...spec.preview, cases: spec.preview.after }, join(outDir, "depois-nova.png"), nm);
    if (fresh) {
      // Família nova: ninguém usa ainda, então não há visual antigo a preservar.
      gates.padraoSemDiferenca = true;
    } else {
      await renderPreview(wt, { ...spec.preview, cases: spec.preview.before }, join(outDir, "depois-padrao.png"), nm);
      const diff = samePixels(join(outDir, "antes.png"), join(outDir, "depois-padrao.png"), nm);
      gates.padraoSemDiferenca = diff === "0";
      log(`visual padrão sem diferença: ${gates.padraoSemDiferenca ? "passa" : "falha (" + diff + ")"}`);
    }
    run("git", ["add", "-A"], wt);
    const full = run("git", ["diff", "--cached", "--", ".", ":(exclude)node_modules"], wt).out;
    writeFileSync(join(outDir, "patch.diff"), full);
    gates.version = next;
  } finally {
    run("git", ["-C", refy, "worktree", "remove", "--force", wt], refy);
  }
  gates.passed = gates.generality.passed && ["tipos", "build", "docs", "agente", "padraoSemDiferenca"].every((k) => gates[k]) && (spec.tests ?? []).every((t) => gates["teste " + t]);
  writeFileSync(join(outDir, "gates.json"), JSON.stringify(gates, null, 2) + "\n");
  writeFileSync(join(outDir, "PR.md"), `# ${spec.component}: ${spec.capability}

## O que
${spec.capability}. Versão proposta: ${gates.version} (minor).
${fresh ? `\nFamília nova. Camada: ${spec.level}. Finalidade: ${spec.area}. Coleções: ${(spec.collections ?? ["core"]).join(", ")}.\n` : ""}
Props novas: ${(spec.props ?? []).map((p) => `\`${p.name}\` (padrão \`${p.default}\`)`).join(", ") || "nenhuma"}.
Tokens novos: ${(spec.tokens ?? []).map((t) => `\`${t.name}\` (padrão \`${t.default}\`)`).join(", ") || "nenhum"}.

## Por que
${spec.why}

Tela do consumidor que exige: ${(spec.screens ?? []).join("; ")}.

## Como testar
${(spec.tests ?? []).map((t) => `- \`node --test ${t}\``).join("\n")}
- \`npm run docs:check\` e \`npm run agent:check\`
${fresh ? "" : "- O componente com as props atuais renderiza igual antes e depois (\`antes.png\` × \`depois-padrao.png\`).\n"}
## Imagens
${fresh ? "- Família nova: \`depois-nova.png\`" : "- Antes (HEAD): \`antes.png\`\n- Depois, uso atual: \`depois-padrao.png\`\n- Depois, capacidade nova: \`depois-nova.png\`"}

## Gates
${["tipos", "build", "docs", "agente", ...(spec.tests ?? []).map((t) => "teste " + t), "padraoSemDiferenca"].map((k) => `- ${k}: ${gates[k] ? "passa" : "falha"}`).join("\n")}
- generalidade: ${gates.generality.passed ? "passa" : "falha"}
`);
  log(`${gates.passed ? "PRONTA" : "NÃO PRONTA"}: refy-contrib/${name}/ (patch.diff, PR.md, gates.json, imagens). Nenhum PR aberto.`);
  return gates;
}
