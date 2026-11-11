// fix-theme-token-precedence: THM-04 e BRAND-08.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { generateTheme, validateTheme } from "../tools/refy-agent/theme.mjs";

const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
const foundations = JSON.parse(readFileSync("src/tokens/foundations.tokens.json", "utf8"));
const context = { catalog, foundations };

test("token em tokens e em modes gera token-shadowed-by-mode com o modo que vence", () => {
  const report = validateTheme({ name: "x", label: "X", tokens: { "--ink-1": "#111111" }, modes: { light: { "--ink-1": "#222222" } } }, context);
  assert.deepEqual(report.warnings.map(({ code, token, mode }) => ({ code, token, mode })), [{ code: "token-shadowed-by-mode", token: "--ink-1", mode: "light" }]);
});

test("sem duplicata, sem aviso; os temas do repositório e o gerado seguem o padrão", () => {
  const clean = validateTheme({ name: "x", label: "X", tokens: { "--radius-default": "8px" }, modes: { light: { "--ink-1": "#222222" } } }, context);
  assert.deepEqual(clean.warnings, []);
  for (const file of readdirSync("src/themes").filter((f) => f.endsWith(".json")))
    assert.deepEqual(validateTheme(JSON.parse(readFileSync(`src/themes/${file}`, "utf8")), context).warnings, [], file);
  const generated = generateTheme({ name: "gerado", label: "Gerado", primary: "#2163ad" }, context);
  assert.deepEqual(validateTheme(generated.theme ?? generated, context).warnings, []);
});

test("THEMING.md declara a precedência e mostra o tema derivado", () => {
  const guide = readFileSync("docs/THEMING.md", "utf8");
  assert.match(guide, /## Precedência dentro do tema/);
  assert.match(guide, /`modes\[modo\]` prevalece sobre `tokens`/);
  assert.match(guide, /token-shadowed-by-mode/);
  assert.match(guide, /name: 'loja-destaque'/);
});
