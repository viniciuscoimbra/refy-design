// O check diz o que fazer: prop deprecada com a substituta (AI-06) e sugestão em todo literal (AI-02).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
function project(files) {
  const dir = mkdtempSync(join(tmpdir(), "refy-check-"));
  mkdirSync(join(dir, "node_modules"));
  symlinkSync(resolve("node_modules/typescript"), join(dir, "node_modules/typescript"), "junction");
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return dir;
}
const check = (dir, ...files) => {
  const run = spawnSync(process.execPath, [resolve("tools/refy-agent/cli.mjs"), "check", ...files], { cwd: dir, encoding: "utf8" });
  return { status: run.status, report: JSON.parse(run.stdout || "{}"), stderr: run.stderr };
};

test("AI-05: o catálogo leva as props deprecadas de ContentCard com a substituta", () => {
  assert.deepEqual(catalog.deprecatedProps.ContentCard, { address: "subtitle", price: "value", priceSuffix: "valueSuffix" });
  const card = JSON.parse(readFileSync("ai/components/PropertyCard.json", "utf8")).api[0].props;
  assert.deepEqual(card.find((p) => p.name === "price").deprecated, { replacement: "value", note: "Use value." });
  assert.equal(card.find((p) => p.name === "value").deprecated, undefined);
});

test("AI-06: price em ContentCard vira aviso com a substituta, sem mudar o código de saída", () => {
  const dir = project({
    "Tela.tsx": `import { ContentCard } from '@refy-design/web';\nexport const T = () => <ContentCard title="Casa" media={[]} price="R$ 720.000" />;\n`,
    "Vizinha.tsx": `import { ContentCard } from '@refy-design/web';\nexport const T = () => <ContentCard title="Casa" media={[]} value="R$ 720.000" />;\n`,
    "Origem.tsx": `import { PropertyCard as Card } from '@refy-design/web/PropertyCard';\nexport const T = () => <Card title="Casa" media={[]} address="Rua A" />;\n`,
  });
  try {
    const bad = check(dir, "Tela.tsx");
    assert.equal(bad.status, 0, bad.stderr);
    assert.equal(bad.report.passed, true);
    const finding = bad.report.findings.find((f) => f.rule === "deprecated-prop");
    assert.equal(finding.severity, "warning");
    assert.equal(finding.line, 2);
    assert.match(finding.message, /price is deprecated; use value/);
    assert.match(finding.suggestion, /Troque price por value/);
    assert.deepEqual(check(dir, "Vizinha.tsx").report.findings, []);
    assert.match(check(dir, "Origem.tsx").report.findings[0].message, /address is deprecated; use subtitle/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("AI-02: cada achado de aparência literal diz o que fazer, com as três linhas do teste de listagem", () => {
  const dir = project({
    "tela.css": [
      ".busca { border: var(--surface-border-width) solid var(--line); }",
      ".rotulo { font-size: var(--field-label-size, 11px); }",
      ".rotulo { letter-spacing: var(--field-label-tracking, 0.08em); }",
      ".nota { font-size: 13px; }",
      ".nota { line-height: 1.37; }",
      ".tela { --card-radius: 6px; }",
    ].join("\n") + "\n",
    "Tela.tsx": `export const T = () => <div style={{ fontSize: "13px", borderRadius: "6px" }} />;\n`,
  });
  try {
    const { status, report } = check(dir, "tela.css", "Tela.tsx");
    assert.equal(status, 1);
    const at = (file, line) => report.findings.filter((f) => f.file === file && f.line === line && f.rule === "appearance-literal");
    const one = (file, line) => { const found = at(file, line); assert.equal(found.length, 1, `${file}:${line}`); return found[0].suggestion; };
    assert.match(one("tela.css", 1), /use <Card>.*--card-border-width/);
    assert.match(one("tela.css", 2), /Remova o fallback: --field-label-size é token do tema.*var\(--field-label-size\)/);
    assert.match(one("tela.css", 3), /Remova o fallback: --field-label-tracking/);
    assert.match(one("tela.css", 4), /Use var\(--text-sm\)/);
    assert.match(one("tela.css", 5), /Não há token com o valor 1\.37 no tema padrão/);
    assert.match(one("tela.css", 6), /--card-radius é token do tema: defina no arquivo de tema/);
    const jsx = report.findings.filter((f) => f.file === "Tela.tsx" && f.rule === "appearance-literal");
    assert.equal(jsx.length, 2);
    assert(jsx.every((f) => typeof f.suggestion === "string" && f.suggestion.length > 20));
    assert.match(jsx.find((f) => /borderRadius/.test(f.message)).suggestion, /Card/);
    assert(report.findings.filter((f) => f.rule === "appearance-literal").every((f) => f.suggestion));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
