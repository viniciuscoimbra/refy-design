import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
  cpSync,
  mkdirSync,
  symlinkSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { inspectFiles } from "../tools/refy-agent/check.mjs";
const root = resolve("."),
  catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
const cli = resolve("tools/refy-agent/cli.mjs");

test("catálogo acompanha documentação, camadas e busca seletiva", () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(
    catalog.components.length,
    readdirSync("src/pages/PlaygroundPage/documentation").filter((file) =>
      file.endsWith(".json"),
    ).length,
  );
  for (const entry of catalog.components) {
    const doc = JSON.parse(readFileSync("ai/" + entry.document));
    assert.equal(doc.id, entry.id);
    assert.deepEqual(
      doc,
      JSON.parse(
        readFileSync(`src/pages/PlaygroundPage/documentation/${entry.id}.json`),
      ),
    );
    assert(entry.level);
    assert(doc.examples.length);
  }
  const result = spawnSync(process.execPath, [cli, "catalog", "Search"], {
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert(JSON.parse(result.stdout).components.some((c) => c.id === "Combobox"));
  const input = spawnSync(process.execPath, [cli, "component", "Input"], {
    encoding: "utf8",
  });
  assert.equal(JSON.parse(input.stdout).publicName, "Input");
  assert.equal(
    spawnSync(process.execPath, [cli, "component", "Unknown"], {
      encoding: "utf8",
    }).status,
    2,
  );
});

test("piloto antes é diagnosticado e composição pública depois passa", async () => {
  const before = await inspectFiles(
    root,
    ["tests/agent-kit/pilot/Before.tsx"],
    catalog,
  );
  assert.equal(before.passed, false);
  assert(before.findings.some((f) => f.rule === "raw-control"));
  assert(before.findings.some((f) => f.rule === "appearance-literal"));
  const after = await inspectFiles(
    root,
    ["tests/agent-kit/pilot/After.tsx"],
    catalog,
  );
  assert.equal(after.passed, true);
  assert.deepEqual(after.components, [
    "Button",
    "Card",
    "Input",
    "Modal",
    "Table",
  ]);
  assert.equal(
    spawnSync(
      process.execPath,
      [cli, "check", "tests/agent-kit/pilot/Before.tsx"],
      { encoding: "utf8" },
    ).status,
    1,
  );
  assert.equal(
    spawnSync(
      process.execPath,
      [cli, "check", "tests/agent-kit/pilot/After.tsx"],
      { encoding: "utf8" },
    ).status,
    0,
  );
});

test("regras, exceções rastreáveis, parse e limites de caminho", async () => {
  const temp = mkdtempSync(join(tmpdir(), "refy-agent-test-"));
  try {
    mkdirSync(join(temp, "node_modules"));
    symlinkSync(
      resolve("node_modules/typescript"),
      join(temp, "node_modules/typescript"),
      "dir",
    );
    writeFileSync(
      join(temp, "page.tsx"),
      `import {Input} from '@refy-design/web/dist/index.js';export const Page=()=> <div role="button" style={{backgroundColor:'#fff'}}>Teste</div>;`,
    );
    writeFileSync(
      join(temp, "page.css"),
      `.layout {display:grid;gap:var(--space-4)} .color{color:#fff} .fallback{color:var(--primary, red)} .local {--primary:var(--ink-1)} .literal {--card-radius:6px}`,
    );
    let report = await inspectFiles(temp, ["page.tsx", "page.css"], catalog);
    assert.equal(report.findings.length, 6);
    assert.equal(report.passed, false);
    const config = {
      version: 1,
      exceptions: [
        {
          file: "page.tsx",
          rule: "raw-control",
          reason: "Controle de widget externo preservado para este teste.",
        },
      ],
    };
    writeFileSync(join(temp, "refy-agent.config.json"), JSON.stringify(config));
    report = await inspectFiles(temp, ["page.tsx"], catalog);
    assert(report.findings.some((f) => f.exception));
    assert.equal(report.passed, false);
    config.exceptions[0].reason = "";
    writeFileSync(join(temp, "refy-agent.config.json"), JSON.stringify(config));
    await assert.rejects(
      inspectFiles(temp, ["page.tsx"], catalog),
      /exception/,
    );
    rmSync(join(temp, "refy-agent.config.json"));
    await assert.rejects(
      inspectFiles(temp, [resolve("README.md")], catalog),
      /outside/,
    );
    writeFileSync(join(temp, "broken.tsx"), "export const broken = <Button");
    await assert.rejects(
      inspectFiles(temp, ["broken.tsx"], catalog),
      /Cannot parse/,
    );
    for (const invalidCss of [".x {", ".x { color: ; }", ".x { color: 'red; }", "/* unterminated"]) {
      writeFileSync(join(temp, "broken.css"), invalidCss);
      await assert.rejects(inspectFiles(temp, ["broken.css"], catalog), /Cannot parse/);
    }
    await assert.rejects(inspectFiles(temp, [], catalog), /explicit/);
    assert(!existsSync(join(temp, "report.json")));
    writeFileSync(
      join(temp, "borders.tsx"),
      `export const Border = () => <div style={{borderTop:'5px solid red',color:'var(--invented-color)'}}/>;`,
    );
    const borders = await inspectFiles(temp, ["borders.tsx"], catalog);
    assert(
      borders.findings.some(
        (f) =>
          f.rule === "appearance-literal" && f.message.includes("borderTop"),
      ),
    );
    assert(
      borders.findings.some(
        (f) => f.rule === "unverified-token" && f.severity === "warning",
      ),
    );
    writeFileSync(
      join(temp, "custom.css"),
      `.custom {color:var(--project-color)}`,
    );
    const custom = await inspectFiles(temp, ["custom.css"], catalog);
    assert.equal(custom.passed, true);
    assert.equal(custom.findings[0].severity, "warning");
    writeFileSync(
      join(temp, "sides.css"),
      `.sides {border-left:5px solid red;border-top-color:red}`,
    );
    assert.equal(
      (await inspectFiles(temp, ["sides.css"], catalog)).findings.filter(
        (f) => f.severity === "error",
      ).length,
      2,
    );
    const external = join(tmpdir(), `refy-external-config-${process.pid}.json`);
    writeFileSync(
      external,
      JSON.stringify({
        version: 1,
        exceptions: [
          {
            file: "page.tsx",
            rule: "internal-import",
            reason: "External configuration must not be accepted.",
          },
        ],
      }),
    );
    symlinkSync(external, join(temp, "refy-agent.config.json"));
    try {
      await assert.rejects(
        inspectFiles(temp, ["page.tsx"], catalog),
        /regular project file/,
      );
    } finally {
      rmSync(external);
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("assets e CLI funcionam em cópia isolada com TypeScript do consumidor", () => {
  const temp = mkdtempSync(join(tmpdir(), "refy-agent-portable-"));
  try {
    const installed = join(temp, "node_modules/@refy-design/web");
    mkdirSync(installed, { recursive: true });
    cpSync("ai", join(installed, "ai"), { recursive: true });
    cpSync("tools/refy-agent", join(installed, "tools/refy-agent"), {
      recursive: true,
    });
    symlinkSync(
      resolve("node_modules/typescript"),
      join(temp, "node_modules/typescript"),
      "dir",
    );
    cpSync("tests/agent-kit/pilot/After.tsx", join(temp, "Page.tsx"));
    const installedCLI = join(installed, "tools/refy-agent/cli.mjs");
    let result = spawnSync(
      process.execPath,
      [installedCLI, "catalog", "Input"],
      { cwd: temp, encoding: "utf8" },
    );
    assert.equal(result.status, 0);
    assert(JSON.parse(result.stdout).components.length);
    result = spawnSync(process.execPath, [installedCLI, "check", "Page.tsx"], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).passed, true);
    rmSync(join(temp, "node_modules/typescript"));
    result = spawnSync(process.execPath, [installedCLI, "check", "Page.tsx"], {
      cwd: temp,
      encoding: "utf8",
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /TypeScript/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("literais estáticos equivalentes não contornam as regras por sintaxe", async () => {
  const temp = mkdtempSync(join(tmpdir(), "refy-agent-literals-"));
  try {
    mkdirSync(join(temp, "node_modules"));
    symlinkSync(resolve("node_modules/typescript"), join(temp, "node_modules/typescript"), "dir");
    writeFileSync(join(temp, "package.json"), '{"private":true}');
    const inspect = async (code) => {
      writeFileSync(join(temp, "page.tsx"), code);
      return inspectFiles(temp, ["page.tsx"], catalog);
    };
    const quoted = await inspect('export const Example = () => <div style={{color:"#ff0000",fontFamily:"Arial",borderTop:"5px solid red"}}/>;');
    const template = await inspect('export const Example = () => <div style={{color:`#ff0000`,fontFamily:`Arial`,borderTop:`5px solid red`}}/>;');
    assert.equal(quoted.passed, false);
    assert.equal(template.passed, false);
    assert.deepEqual(template.findings.map((finding) => finding.rule), quoted.findings.map((finding) => finding.rule));
    assert.equal(template.findings.filter((finding) => finding.rule === "appearance-literal").length, 3);
    for (const role of ['"button"', '{"button"}', '{`button`}']) {
      const result = await inspect(`export const Example = () => <div role=${role}/>;`);
      assert.equal(result.passed, false, role);
      assert.equal(result.findings[0].rule, "raw-control", role);
    }
    const validToken = await inspect('export const Example = () => <div style={{color:`var(--primary)`}}/>;');
    assert.equal(validToken.passed, true);
    assert.deepEqual(validToken.findings, []);
    const ownToken = await inspect('export const Example = () => <div style={{color:`var(--project-color)`}}/>;');
    assert.equal(ownToken.passed, true);
    assert.equal(ownToken.findings[0].rule, "unverified-token");
    assert.equal(ownToken.findings[0].severity, "warning");
    const dynamic = await inspect('export const Example = ({tone,role}) => <div role={role} style={{color:`${tone}`}}/>;');
    assert.deepEqual(dynamic.findings, []);
    assert(dynamic.limits.some((limit) => /known syntax/i.test(limit)));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
