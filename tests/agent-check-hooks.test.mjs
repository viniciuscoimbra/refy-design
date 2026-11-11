// align-checker-with-hooks (AI-07, AI-08) e read-project-theme-in-checker (AI-09).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

function project(files) {
  const dir = mkdtempSync(join(tmpdir(), "refy-hooks-"));
  mkdirSync(join(dir, "node_modules"));
  symlinkSync(resolve("node_modules/typescript"), join(dir, "node_modules/typescript"), "junction");
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}
const check = (dir, ...args) => {
  const run = spawnSync(process.execPath, [resolve("tools/refy-agent/cli.mjs"), "check", ...args], { cwd: dir, encoding: "utf8" });
  return { status: run.status, report: JSON.parse(run.stdout || "{}"), stderr: run.stderr };
};
const rules = (report, rule) => report.findings.filter((f) => f.rule === rule);

test("AI-07: hook com var(--token) passa em media query e pseudo-classe; com literal, erro com sugestão", () => {
  const dir = project({
    "theme.json": JSON.stringify({ name: "app", tokens: { "--app-hero-title-size-sm": "36px", "--app-line": "#ddd" } }),
    "hero.css": "@media (max-width: 639px) { .hero { --hero-title-size: var(--app-hero-title-size-sm); } }\n.cards:hover { --border: var(--app-line); }\n",
    "literal.css": ".hero { --hero-title-size: 36px; }\n",
  });
  try {
    const ok = check(dir, "hero.css");
    assert.equal(ok.status, 0, ok.stderr);
    assert.deepEqual(ok.report.findings, []);
    const bad = check(dir, "literal.css");
    assert.equal(bad.status, 1);
    const [finding] = rules(bad.report, "appearance-literal");
    assert.equal(finding.line, 1);
    assert.match(finding.suggestion, /tema/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AI-08: classe que muda aparência de componente do Refy vira aviso com o hook; classe de layout não", () => {
  const dir = project({
    "theme.json": JSON.stringify({ name: "app", modes: { light: { "--app-line": "#ddd" } } }),
    "Lista.tsx": `import { Card } from '@refy-design/web';\nimport styles from './lista.module.css';\nexport const L = () => <><Card className="anuncio">A</Card><Card className={styles.destaque}>B</Card></>;\n`,
    "lista.module.css": ".anuncio:hover { border-color: var(--app-line); }\n.anuncio { grid-column: span 2; }\n.destaque { background: var(--app-line); }\n.grade .titulo { color: var(--app-line); }\n",
  });
  try {
    const run = check(dir, "Lista.tsx", "lista.module.css");
    assert.equal(run.status, 0, run.stderr);
    const found = rules(run.report, "class-override");
    assert.deepEqual(found.map((f) => [f.line, f.severity]), [[1, "warning"], [3, "warning"]]);
    assert.match(found[0].suggestion, /--border/);
    assert.match(found[0].suggestion, /Card/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AI-09: token do tema do projeto não gera aviso; o que falta sai uma vez, com a contagem", () => {
  const uses = Array.from({ length: 30 }, (_, i) => `.a${i} { color: var(--app-ink); }`).join("\n");
  const missing = Array.from({ length: 12 }, (_, i) => `.b${i} { box-shadow: var(--app-sombra); }`).join("\n");
  const theme = JSON.stringify({ light: { name: "app", modes: { light: { "--app-ink": "#111" } } }, dark: { name: "app-dark", modes: { dark: { "--app-ink": "#eee" } } } });
  const dir = project({ "tema.json": theme, "tela.css": uses + "\n" + missing + "\n", "quebrado.json": "{ não é json" });
  try {
    const run = check(dir, "--theme", "tema.json", "tela.css");
    assert.equal(run.status, 0, run.stderr);
    const warnings = rules(run.report, "unverified-token");
    assert.deepEqual(warnings.map((w) => [w.token, w.count, w.line]), [["--app-sombra", 12, 31]]);
    assert.equal(run.report.projectTheme, "tema.json");
    const without = check(dir, "tela.css");
    assert.deepEqual(rules(without.report, "unverified-token").map((w) => [w.token, w.count]), [["--app-ink", 30], ["--app-sombra", 12]]);
    const broken = check(dir, "--theme", "quebrado.json", "tela.css");
    assert.equal(broken.status, 2);
    assert.match(broken.stderr, /quebrado\.json/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
