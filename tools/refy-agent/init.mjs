import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, dirname, join, sep, basename, extname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const BEGIN = "<!-- refy:begin -->", END = "<!-- refy:end -->";
const CSS = ["@refy-design/web/tokens.css", "@refy-design/web/global.css", "@refy-design/web/styles.css"];
const skipped = new Set(["node_modules", "dist", "build", "coverage", "storybook-static", "vendor"]);
const posix = (p) => p.split(sep).join("/");

// Minimal line diff (LCS) so every change to an existing file is shown before it is written.
export function lineDiff(before, after, label) {
  const a = before.split("\n"), b = after.split("\n");
  const m = a.length, n = b.length, lcs = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out = [`--- ${label}`, `+++ ${label}`];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) { i++; j++; }
    else if (j < n && (i === m || lcs[i][j + 1] >= lcs[i + 1][j])) out.push(`+${j + 1}: ${b[j++]}`);
    else out.push(`-${i + 1}: ${a[i++]}`);
  }
  return out.join("\n");
}

function findFiles(root, test, depth = 4, dir = root, out = []) {
  if (depth < 0) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || skipped.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) findFiles(root, test, depth - 1, path, out);
    else if (entry.isFile() && test(entry.name, path)) out.push(posix(relative(root, path)));
  }
  return out.sort();
}

export function agentsSection(gaps) {
  return `${BEGIN}
## Telas são Refy

Toda tela deste projeto é montada com o Refy (\`@refy-design/web\`). Antes de criar ou alterar qualquer tela:

- Consulte o catálogo instalado: \`npm exec --offline -- refy catalog <necessidade>\` e \`npm exec --offline -- refy component <Nome>\`. Fonte: \`node_modules/@refy-design/web/ai\` (\`catalog.json\`, \`components/*.json\`, \`instructions.md\`).
- Importe só da entrada pública \`@refy-design/web\` (ou \`@refy-design/web/<Componente>\`), nunca de \`dist/\`, \`src/\` ou caminho absoluto.
- A aparência vem do tema via \`ThemeProvider\`: cores, fontes, raios e sombras são tokens. O CSS da tela cuida de layout, sem cor literal.
- Sem \`button\`, \`input\`, \`select\` ou \`textarea\` crus: use \`Button\`, \`Input\`, \`Select\`, \`Textarea\` e afins.
- Falta componente ou variação? Registre em \`${gaps}\` e proponha no Refy. Nunca copie nem recrie o componente localmente.
- Prancha para aprovação é a captura do código Refy que monta a tela, registrada com a origem; imagem sem código de origem não vai para aprovação.
- Antes de entregar: \`npm run refy:check\`.
${END}`;
}

const GAPS_TEMPLATE = `# Lacunas do Refy

Componentes ou variações que faltaram ao montar telas. Cada item vira proposta no Refy; não recriar localmente.

| Data | Tela | Necessidade | Componente Refy mais próximo | Status |
| --- | --- | --- | --- | --- |
`;

export async function init(argv, { cwd = process.cwd(), log = console.log } = {}) {
  const opts = { dryRun: false, offline: false, from: process.env.REFY_UI_SOURCE, entry: undefined };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--offline") opts.offline = true;
    else if (arg === "--from") opts.from = argv[++i];
    else if (arg === "--entry") opts.entry = argv[++i];
    else throw Error(`Unknown init option: ${arg}. Usage: refy init [--from <tgz>] [--entry <file>] [--dry-run] [--offline]`);
  }
  const root = resolve(cwd);
  const changes = [], notes = [];
  const write = (file, next) => {
    const path = join(root, file);
    const before = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (before === next) return changes.push({ file, status: "sem mudança" });
    if (before !== null) log(lineDiff(before, next, file));
    if (!opts.dryRun) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, next); }
    changes.push({ file, status: before === null ? "criado" : "alterado" });
  };
  const readPkg = () => JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const indent = (text) => (text.match(/^\{\n([ \t]+)"/)?.[1] ?? "  ");

  // 1. package.json and installation.
  if (!existsSync(join(root, "package.json")))
    write("package.json", JSON.stringify({ name: basename(root).toLowerCase().replace(/[^a-z0-9-]/g, "-"), private: true }, null, 2) + "\n");
  // Usa o gerenciador do projeto: instalar com npm dentro de um projeto pnpm/yarn reescreveria o node_modules.
  const manifest = existsSync(join(root, "package.json")) ? JSON.parse(readFileSync(join(root, "package.json"), "utf8")) : {};
  const manager = /^pnpm@/.test(manifest.packageManager ?? "") || existsSync(join(root, "pnpm-lock.yaml")) ? "pnpm"
    : /^yarn@/.test(manifest.packageManager ?? "") || existsSync(join(root, "yarn.lock")) ? "yarn" : "npm";
  const workspaceRoot = manager === "pnpm" && existsSync(join(root, "pnpm-workspace.yaml"));
  const npm = (args) => {
    const [, kind, spec] = args; // ["install", "--save" | "--save-dev", spec]
    const dev = kind === "--save-dev";
    const specs = spec.split(" ");
    const full = manager === "pnpm" ? ["add", ...(dev ? ["-D"] : []), ...(workspaceRoot ? ["-w"] : []), ...specs, opts.offline ? "--offline" : "--prefer-offline"]
      : manager === "yarn" ? ["add", ...(dev ? ["-D"] : []), ...specs, ...(opts.offline ? ["--offline"] : [])]
      : [args[0], args[1], ...specs, "--no-audit", "--no-fund", opts.offline ? "--offline" : "--prefer-offline"];
    log(`$ ${manager} ${full.join(" ")}`);
    if (opts.dryRun) return;
    const result = spawnSync(process.platform === "win32" ? `${manager}.cmd` : manager, full, { cwd: root, stdio: "inherit" });
    if (result.status !== 0) throw Error(`${manager} ${full.join(" ")} failed (exit ${result.status}).`);
  };
  let pkg = existsSync(join(root, "package.json")) ? readPkg() : {};
  const recorded = pkg.dependencies?.["@refy-design/web"] ?? pkg.devDependencies?.["@refy-design/web"];
  const installed = existsSync(join(root, "node_modules/@refy-design/web/package.json"));
  let wanted;
  if (opts.from) {
    const local = resolve(cwd, opts.from);
    if (existsSync(local)) {
      if (statSync(local).isDirectory())
        throw Error(`--from ${opts.from} is a directory. Pack it first (npm pack) and pass the .tgz: a linked checkout brings a second copy of React.`);
      wanted = "file:" + posix(relative(root, local) || ".");
    } else wanted = opts.from;
  }
  if (!installed || (wanted && recorded !== wanted)) {
    if (!wanted) throw Error("@refy-design/web is not installed. Run again with --from <path/to/refy-design-web-x.y.z.tgz> (or set REFY_UI_SOURCE).");
    npm(["install", "--save", wanted.startsWith("file:") ? wanted.slice(5) : wanted]);
    changes.push({ file: "node_modules/@refy-design/web", status: "instalado" });
  } else changes.push({ file: "node_modules/@refy-design/web", status: "sem mudança" });
  // Peers do Refy: pnpm não os instala na raiz; sem react/react-dom no projeto o bundler não resolve as telas.
  const resolvable = (name) => { try { createRequire(join(root, "package.json")).resolve(name + "/package.json"); return true; } catch { return false; } };
  const peers = ["react", "react-dom"].filter((name) => !resolvable(name));
  if (peers.length) { npm(["install", "--save", peers.join(" ")]); changes.push({ file: "node_modules/" + peers.join("+"), status: "instalado" }); }
  // The checker parses with the TypeScript JS API; TypeScript 7 (native) no longer ships it.
  let tsVersion;
  try { tsVersion = JSON.parse(readFileSync(createRequire(join(root, "package.json")).resolve("typescript/package.json"), "utf8")).version; } catch {}
  if (!tsVersion) { npm(["install", "--save-dev", "typescript@^5"]); changes.push({ file: "node_modules/typescript", status: "instalado" }); }
  else if (Number(tsVersion.split(".")[0]) >= 7) notes.push(`typescript ${tsVersion} não tem a API JS usada pelo refy check; instale typescript@^5 como dependência de desenvolvimento.`);

  // 2. Entry: CSS imports and ThemeProvider.
  const entry = opts.entry ? posix(relative(root, resolve(cwd, opts.entry))) : (() => {
    const conventional = ["src/main.tsx", "src/main.jsx", "src/main.ts", "src/main.js", "src/index.tsx", "src/index.jsx", "src/index.ts", "src/index.js"].filter((f) => existsSync(join(root, f)));
    if (conventional.length === 1) return conventional[0];
    const found = findFiles(root, (name, path) => /\.(?:[jt]sx?)$/.test(name) && /\b(?:createRoot|hydrateRoot)\s*\(/.test(readFileSync(path, "utf8")));
    if (found.length === 1) return found[0];
    notes.push(found.length ? `Mais de uma entrada React encontrada (${found.join(", ")}). Rode de novo com --entry <arquivo>.` : "Nenhuma entrada React (createRoot) encontrada. Rode de novo com --entry <arquivo>.");
    return undefined;
  })();
  const snippet = `import { ThemeProvider } from "@refy-design/web";\n${CSS.map((c) => `import "${c}";`).join("\n")}\n\n// na renderização da raiz:\n<ThemeProvider>\n  <App />\n</ThemeProvider>`;
  if (entry) {
    let code = readFileSync(join(root, entry), "utf8");
    const missing = CSS.filter((c) => !code.includes(`"${c}"`) && !code.includes(`'${c}'`));
    const insertAt = (text, block) => {
      const last = [...text.matchAll(/^import\b[^\n]*?(?:from\s*)?["'][^"'\n]+["'];?[ \t]*$/gm)].at(-1);
      const at = last ? last.index + last[0].length : 0;
      return text.slice(0, at) + (last ? "\n" : "") + block + (last ? "" : "\n") + text.slice(at);
    };
    // Refy CSS goes before the project's own CSS so local layout rules keep the last word in the cascade.
    const firstCss = code.match(/^import\s+["'][^"'\n]+\.css["'];?[ \t]*$/m);
    if (missing.length)
      code = firstCss
        ? code.slice(0, firstCss.index) + missing.map((c) => `import "${c}";`).join("\n") + "\n" + code.slice(firstCss.index)
        : insertAt(code, missing.map((c) => `import "${c}";`).join("\n"));
    if (!/\bThemeProvider\b/.test(code)) {
      const render = code.match(/\.render\(\s*([\s\S]*?)\s*\)\s*;?\s*$/m);
      const app = render && render[1].match(/<([A-Z][\w.]*)\s*\/>/);
      if (app) {
        const target = app[0];
        const start = render.index + render[0].indexOf(render[1]);
        const local = render[1].replace(target, `<ThemeProvider>\n      ${target}\n    </ThemeProvider>`);
        code = code.slice(0, start) + local + code.slice(start + render[1].length);
        code = insertAt(code, `import { ThemeProvider } from "@refy-design/web";`);
      } else notes.push(`Não encontrei <App /> dentro de .render() em ${entry}. Envolva a raiz manualmente:\n${snippet}`);
    } else notes.push(`${entry} já usa ThemeProvider; mantido como está.`);
    write(entry, code);
  } else notes.push(`Cole na entrada React (o arquivo que chama createRoot):\n${snippet}`);

  // 3. Gaps file, AGENTS.md, CLAUDE.md and the skill.
  const gapsFound = findFiles(root, (name) => name === "REFY-GAPS.md", 4);
  const gaps = gapsFound[0] ?? "REFY-GAPS.md";
  if (!gapsFound.length) write(gaps, GAPS_TEMPLATE);
  else changes.push({ file: gaps, status: "sem mudança (lacunas)" });
  if (gapsFound.length > 1) notes.push(`Mais de um REFY-GAPS.md; usando ${gaps}.`);
  const agentsPath = join(root, "AGENTS.md");
  const section = agentsSection(gaps);
  const agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : null;
  if (agents === null) write("AGENTS.md", `# Instruções para agentes\n\n${section}\n`);
  else if (!agents.includes(BEGIN) && /^#{1,6}\s+Telas são Refy\s*$/m.test(agents)) {
    // A equipe já escreveu a seção à mão: preserva o texto dela e não duplica.
    changes.push({ file: "AGENTS.md", status: "sem mudança (seção própria)" });
    notes.push("AGENTS.md já tem uma seção \"Telas são Refy\" escrita pelo projeto; mantida como está. Compare com o texto padrão em node_modules/@refy-design/web/tools/refy-agent/init.mjs se quiser alinhar.");
  } else {
    const b = agents.indexOf(BEGIN), e = agents.indexOf(END);
    write("AGENTS.md", b >= 0 && e > b ? agents.slice(0, b) + section + agents.slice(e + END.length) : agents.replace(/\n*$/, "\n\n") + section + "\n");
  }
  const claude = join(root, "CLAUDE.md");
  if (!existsSync(claude)) write("CLAUDE.md", "@AGENTS.md\n");
  else if (!readFileSync(claude, "utf8").includes("AGENTS.md")) notes.push("CLAUDE.md existe e não cita AGENTS.md; acrescente a linha @AGENTS.md para o Claude ler a seção do Refy.");
  else changes.push({ file: "CLAUDE.md", status: "sem mudança" });
  write(".claude/skills/refy/SKILL.md", readFileSync(fileURLToPath(new URL("./templates/SKILL.md", import.meta.url)), "utf8"));

  // 4. refy:check script and checker scope.
  if (existsSync(join(root, "package.json"))) {
    const text = readFileSync(join(root, "package.json"), "utf8");
    pkg = JSON.parse(text);
    if (pkg.scripts?.["refy:check"] && pkg.scripts["refy:check"] !== "refy check")
      notes.push(`package.json já tem refy:check = "${pkg.scripts["refy:check"]}"; mantido.`);
    else if (!pkg.scripts?.["refy:check"]) {
      pkg.scripts = { ...pkg.scripts, "refy:check": "refy check" };
      write("package.json", JSON.stringify(pkg, null, indent(text)) + "\n");
    } else changes.push({ file: "package.json", status: "sem mudança" });
  }
  if (!existsSync(join(root, "refy-agent.config.json"))) {
    const scope = entry ? posix(dirname(entry)) : existsSync(join(root, "src")) ? "src" : undefined;
    if (scope && scope !== ".") write("refy-agent.config.json", JSON.stringify({ version: 1, include: [scope], exceptions: [] }, null, 2) + "\n");
    else notes.push("Crie refy-agent.config.json com include apontando para as pastas de tela.");
  } else changes.push({ file: "refy-agent.config.json", status: "sem mudança (já existe)" });

  const seen = new Map();
  for (const c of changes) if (!seen.has(c.file) || c.status !== "sem mudança") seen.set(c.file, c.status);
  for (const [file, status] of seen) log(`${status.padEnd(12)} ${file}`);
  for (const note of notes) log(`! ${note}`);
  const changed = [...seen.values()].filter((s) => !s.startsWith("sem mudança")).length;
  log(opts.dryRun ? `dry-run: ${changed} mudança(s) pendente(s).` : `${changed} mudança(s). Próximo passo: npm run refy:check`);
  return { changed, changes: [...seen], notes };
}
