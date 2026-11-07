import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, symlinkSync, existsSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, relative } from "node:path";
import { createHash } from "node:crypto";
import { inspectFiles } from "../tools/refy-agent/check.mjs";
import { init } from "../tools/refy-agent/init.mjs";
const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));

function project(prefix) {
  const temp = mkdtempSync(join(tmpdir(), prefix));
  mkdirSync(join(temp, "node_modules/@refy-design/web"), { recursive: true });
  writeFileSync(join(temp, "node_modules/@refy-design/web/package.json"), '{"name":"@refy-design/web","version":"0.4.0"}');
  symlinkSync(resolve("node_modules/typescript"), join(temp, "node_modules/typescript"), "dir");
  for (const peer of ["react", "react-dom"]) symlinkSync(resolve("node_modules", peer), join(temp, "node_modules", peer), "dir");
  return temp;
}
const snapshot = (root) => {
  const out = {};
  const walk = (dir) => { for (const name of readdirSync(dir)) { if (name === "node_modules") continue; const p = join(dir, name); if (statSync(p).isDirectory()) walk(p); else out[relative(root, p)] = createHash("sha256").update(readFileSync(p)).digest("hex"); } };
  walk(root);
  return out;
};

test("gate barra import interno, caminho absoluto, controle cru e cor literal; vizinho público passa", async () => {
  const temp = project("refy-gate-");
  try {
    mkdirSync(join(temp, "src/theme"), { recursive: true });
    writeFileSync(join(temp, "src/Bad.jsx"), `import {Button} from '/tmp/projeto/refy-design/dist/components/Button/Button.js';
import {useThemePortal} from '@refy-design/web/lib/ThemeProvider';
export {Card} from '@refy-design/web/dist/index.js';
const util = require('/opt/tools/util.js');
export const Bad = () => <form><button>Ok</button><input/><select/><textarea/></form>;`);
    writeFileSync(join(temp, "src/Good.jsx"), `import {Button, Input} from '@refy-design/web';
import {Card} from '@refy-design/web/Card';
import catalog from '@refy-design/web/ai/catalog.json';
export const Good = () => <Card><Input label="Nome"/><Button>Ok</Button></Card>;`);
    writeFileSync(join(temp, "src/bad.css"), `.hero{--accent:#ff0055;display:grid}.icon{fill:rgb(0 0 0)}`);
    writeFileSync(join(temp, "src/good.css"), `.hero{--accent:var(--primary);display:grid}.icon{fill:currentColor}`);
    writeFileSync(join(temp, "src/theme/brand.css"), `:root{--brand:#ff0055}`);
    writeFileSync(join(temp, "build.cjs"), `const esbuild = require('/tmp/projeto/refy-design/node_modules/esbuild');`);
    const rules = (report) => report.findings.filter((f) => f.severity === "error").map((f) => `${f.file}:${f.rule}`).sort();
    const bad = await inspectFiles(temp, ["src/Bad.jsx", "src/bad.css", "build.cjs"], catalog);
    assert.equal(bad.passed, false);
    assert.deepEqual(rules(bad), [
      "build.cjs:absolute-import",
      "src/Bad.jsx:absolute-import", "src/Bad.jsx:internal-import", "src/Bad.jsx:internal-import", "src/Bad.jsx:internal-import",
      "src/Bad.jsx:raw-control", "src/Bad.jsx:raw-control", "src/Bad.jsx:raw-control", "src/Bad.jsx:raw-control",
      "src/bad.css:color-literal", "src/bad.css:color-literal",
    ].sort());
    const good = await inspectFiles(temp, ["src/Good.jsx", "src/good.css"], catalog);
    assert.deepEqual(good.findings, []);
    assert.equal(good.passed, true);
    // Theme files may hold literal colors only when declared explicitly.
    assert.equal((await inspectFiles(temp, ["src/theme/brand.css"], catalog)).passed, false);
    writeFileSync(join(temp, "refy-agent.config.json"), JSON.stringify({ version: 1, themeFiles: ["src/theme/brand.css"], exceptions: [] }));
    assert.equal((await inspectFiles(temp, ["src/theme/brand.css"], catalog)).passed, true);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("exceção com count cobre só os achados contados; include/exclude ficam no relatório", async () => {
  const temp = project("refy-count-");
  try {
    mkdirSync(join(temp, "src"));
    writeFileSync(join(temp, "src/Flow.jsx"), `export const Flow = () => <div><button>capa</button></div>;`);
    writeFileSync(join(temp, "src/legacy.css"), `.x{color:#000}`);
    const config = { version: 1, include: ["src"], exclude: [{ path: "src/legacy.css", reason: "CSS legado em migração para tokens do tema." }], exceptions: [{ file: "src/Flow.jsx", rule: "raw-control", reason: "Capa clicável aguardando migração para Coverflow.", count: 1 }] };
    writeFileSync(join(temp, "refy-agent.config.json"), JSON.stringify(config));
    let report = await inspectFiles(temp, [], catalog);
    assert.deepEqual(report.scanned, ["src/Flow.jsx"]);
    assert.equal(report.excluded[0].path, "src/legacy.css");
    assert.equal(report.passed, true);
    writeFileSync(join(temp, "src/Flow.jsx"), `export const Flow = () => <div><button>capa</button><button>novo</button></div>;`);
    report = await inspectFiles(temp, [], catalog);
    assert.equal(report.passed, false, "um segundo controle cru não é absorvido pela exceção");
    config.exclude[0].reason = "curto";
    writeFileSync(join(temp, "refy-agent.config.json"), JSON.stringify(config));
    await assert.rejects(inspectFiles(temp, [], catalog), /exclude/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("init prepara projeto Vite React e segunda execução não muda nada", async () => {
  const temp = project("refy-init-");
  try {
    mkdirSync(join(temp, "src"));
    writeFileSync(join(temp, "package.json"), JSON.stringify({ name: "app", private: true, dependencies: { "@refy-design/web": "file:../refy-design-web-0.4.0.tgz" }, scripts: { dev: "vite" } }, null, 2) + "\n");
    writeFileSync(join(temp, "AGENTS.md"), "# Regras do projeto\n\nTexto do usuário.\n");
    writeFileSync(join(temp, "src/main.jsx"), `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`);
    const log = [];
    const first = await init([], { cwd: temp, log: (line) => log.push(line) });
    assert(first.changed >= 5, log.join("\n"));
    const main = readFileSync(join(temp, "src/main.jsx"), "utf8");
    for (const css of ["@refy-design/web/tokens.css", "@refy-design/web/global.css", "@refy-design/web/styles.css"]) assert(main.includes(`import "${css}";`));
    assert(main.indexOf("@refy-design/web/styles.css") < main.indexOf("./index.css"), "CSS do Refy antes do CSS do projeto");
    assert.match(main, /<ThemeProvider>\s*<App \/>\s*<\/ThemeProvider>/);
    assert.match(main, /import \{ ThemeProvider \} from "@refy-design\/web";/);
    assert(log.some((line) => line.startsWith("--- src/main.jsx")), "diff mostrado antes de alterar arquivo existente");
    const agents = readFileSync(join(temp, "AGENTS.md"), "utf8");
    assert(agents.startsWith("# Regras do projeto\n\nTexto do usuário."));
    assert.match(agents, /## Telas são Refy[\s\S]*REFY-GAPS\.md/);
    assert.equal(readFileSync(join(temp, "CLAUDE.md"), "utf8"), "@AGENTS.md\n");
    assert(existsSync(join(temp, ".claude/skills/refy/SKILL.md")));
    assert(existsSync(join(temp, "REFY-GAPS.md")));
    assert.equal(JSON.parse(readFileSync(join(temp, "package.json"), "utf8")).scripts["refy:check"], "refy check");
    assert.deepEqual(JSON.parse(readFileSync(join(temp, "refy-agent.config.json"), "utf8")).include, ["src"]);
    const before = snapshot(temp);
    const second = await init([], { cwd: temp, log: () => {} });
    assert.equal(second.changed, 0);
    assert.deepEqual(snapshot(temp), before);
    await assert.rejects(init(["--from", resolve(".")], { cwd: temp, log: () => {} }), /directory/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("prancha em pasta de entrega precisa de código de origem registrado", async () => {
  const temp = project("refy-boards-");
  try {
    mkdirSync(join(temp, "src"));
    mkdirSync(join(temp, "entrega"));
    writeFileSync(join(temp, "src/Tela.jsx"), `import {Button} from '@refy-design/web';export const Tela = () => <Button>Ok</Button>;`);
    writeFileSync(join(temp, "entrega/tela.png"), "png");
    writeFileSync(join(temp, "entrega/desenho.png"), "png");
    writeFileSync(join(temp, "aprovacoes.json"), JSON.stringify({ pranchas: [
      { id: "T1", origem: ["src/Tela.jsx"], capturas: ["entrega/tela.png"], status: "proposta" },
    ] }));
    writeFileSync(join(temp, "refy-agent.config.json"), JSON.stringify({ version: 1, include: ["src"], boards: { dirs: ["entrega"], registry: "aprovacoes.json" }, exceptions: [] }));
    let report = await inspectFiles(temp, [], catalog);
    assert.equal(report.passed, false);
    assert.deepEqual(report.findings.map((f) => `${f.file}:${f.rule}`), ["entrega/desenho.png:board-source"]);
    rmSync(join(temp, "entrega/desenho.png"));
    report = await inspectFiles(temp, [], catalog);
    assert.equal(report.passed, true);
    assert.deepEqual(report.boards, ["entrega/tela.png"]);
    writeFileSync(join(temp, "aprovacoes.json"), JSON.stringify({ pranchas: [{ id: "T1", origem: ["src/Sumiu.jsx"], capturas: ["entrega/tela.png"] }] }));
    assert.equal((await inspectFiles(temp, [], catalog)).passed, false, "origem inexistente também falha");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("init preserva seção 'Telas são Refy' escrita pelo projeto e não duplica", async () => {
  const temp = project("refy-init-secao-");
  try {
    mkdirSync(join(temp, "src"));
    writeFileSync(join(temp, "package.json"), JSON.stringify({ name: "app", private: true, dependencies: { "@refy-design/web": "file:x.tgz" } }, null, 2) + "\n");
    const original = "# Projeto\n\n## Telas são Refy\n\nRegra própria do time.\n";
    writeFileSync(join(temp, "AGENTS.md"), original);
    writeFileSync(join(temp, "src/main.jsx"), "import { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\ncreateRoot(document.getElementById('root')).render(<App />)\n");
    const log = [];
    await init([], { cwd: temp, log: (l) => log.push(l) });
    assert.equal(readFileSync(join(temp, "AGENTS.md"), "utf8"), original);
    assert(log.some((l) => l.includes("seção")));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
