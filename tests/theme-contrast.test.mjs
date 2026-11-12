// A régua de contraste do editor de tema do site é a mesma do validador (refy_theme_validate).
// Issue viniciuscoimbra/refy-design#8: amarelo #ffeb3b com texto branco passava sem aviso.
import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastIssues, measurePairs, readableText } from "../tools/refy-agent/contrast.mjs";
import { validateTheme } from "../tools/refy-agent/theme.mjs";
import { readFileSync } from "node:fs";

test("#8: texto branco sobre #ffeb3b fica abaixo de 4,5:1 e a sugestão é texto preto", () => {
  const issues = contrastIssues({ "--primary": "#ffeb3b", "--on-primary": "#ffffff" });
  assert.deepEqual(issues, [
    { foreground: "--on-primary", background: "--primary", min: 4.5, ratio: 1.22, suggestion: "#000000" },
  ]);
});

test("par que passa não gera aviso, e par com token ausente fica de fora", () => {
  assert.deepEqual(contrastIssues({ "--primary": "#1d4ed8", "--on-primary": "#ffffff", "--ink-1": "#777777" }), []);
});

test("a cor de texto sugerida é a de maior contraste com o fundo", () => {
  assert.equal(readableText("#ffeb3b"), "#000000");
  assert.equal(readableText("#1d4ed8"), "#ffffff");
});

test("o editor e o validador medem o mesmo par com a mesma razão", () => {
  const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
  const foundations = JSON.parse(readFileSync("src/tokens/foundations.tokens.json", "utf8"));
  const theme = { name: "amarelo", label: "Amarelo", modes: { dark: { "--primary": "#ffeb3b", "--on-primary": "#ffffff" } } };
  const measured = validateTheme(theme, { catalog, foundations }).pairs.find(
    (pair) => pair.mode === "dark" && pair.foreground === "--on-primary" && pair.background === "--primary",
  );
  const [issue] = contrastIssues({ "--primary": "#ffeb3b", "--on-primary": "#ffffff" });
  assert.equal(issue.ratio, measured.ratio);
});

// Fronteira: #ffffff sobre #118670 mede 4,49887:1. O WCAG 1.4.3 não arredonda o limite: abaixo de
// 4,5:1 reprova. A razão mostrada arredonda para baixo, para nunca exibir "4,5:1" num par reprovado.
// Uma régua só quer dizer o mesmo veredito em todo lugar que mede.
test("fronteira 4,49887:1 reprova no editor, no validador e na medição dos scripts, e aparece como 4,49", () => {
  const colors = { "--primary": "#118670", "--on-primary": "#ffffff" };
  assert.deepEqual(measurePairs(colors, [["--on-primary", "--primary", 4.5]]), [
    { foreground: "--on-primary", background: "--primary", min: 4.5, ratio: 4.49, passed: false },
  ]);
  assert.deepEqual(contrastIssues(colors, [["--on-primary", "--primary", 4.5]]), [
    { foreground: "--on-primary", background: "--primary", min: 4.5, ratio: 4.49, suggestion: "#000000" },
  ]);
  const catalog = JSON.parse(readFileSync("ai/catalog.json", "utf8"));
  const foundations = JSON.parse(readFileSync("src/tokens/foundations.tokens.json", "utf8"));
  const theme = { name: "verde", label: "Verde", modes: { light: colors } };
  const errors = validateTheme(theme, { catalog, foundations }).errors.filter((error) => error.includes("--on-primary/--primary "));
  assert.deepEqual(errors, ["light: contraste --on-primary/--primary = 4.49 < 4.5."]);
});

test("check-themes, check-refy-site e check-contrast não têm conta de contraste nem lista de pares própria", () => {
  for (const file of ["scripts/check-themes.mjs", "scripts/check-refy-site.mjs", "scripts/check-contrast.mjs"]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /from ["']\.\.\/tools\/refy-agent\/contrast\.mjs["']/, `${file} importa a régua`);
    assert.doesNotMatch(source, /luminance|0\.04045/, `${file} calcula luminância por conta própria`);
  }
  assert.doesNotMatch(readFileSync("scripts/check-themes.mjs", "utf8"), /\["--brand-mark", "--bg", 3\]/, "check-themes repete os pares do validador");
});
