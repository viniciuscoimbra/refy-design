// Every theme is one configuration file in src/themes. This check holds each file to the same
// contract: recognised tokens only, a display label, resolvable references, AA text contrast,
// AA state colours (success, critical, info) and a brand mark visible against the page (3:1).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { themeValues } from "./tokens.mjs";
import { CONTRAST_PAIRS, measurePairs } from "../tools/refy-agent/contrast.mjs";

const hooks = JSON.parse(readFileSync("src/tokens/component-hooks.json", "utf8"));
const known = new Set([...Object.keys(themeValues("light")), ...hooks]);
const files = readdirSync("src/themes").filter((file) => file.endsWith(".json"));
assert(files.length >= 4, "Esperados ao menos quatro arquivos de tema");

function resolve(name, values, path = []) {
  assert(!path.includes(name), "Ciclo de tokens: " + name);
  assert(name in values, "Referência ausente: " + name);
  return String(values[name]).replace(/var\((--[\w-]+)\)/g, (_, next) => resolve(next, values, [...path, name]));
}
const report = [];
for (const file of files) {
  const theme = JSON.parse(readFileSync(`src/themes/${file}`, "utf8"));
  assert.equal(typeof theme.name, "string", `${file}: name`);
  assert(typeof theme.label === "string" && theme.label.trim(), `${file}: label de exibição`);
  for (const group of [theme.tokens ?? {}, ...Object.values(theme.modes ?? {})])
    for (const [key, value] of Object.entries(group)) {
      assert(known.has(key), `${file}: token não reconhecido: ${key}`);
      assert.equal(typeof value, "string", `${file}: ${key}`);
    }
  for (const mode of ["light", "dark"]) {
    const values = { ...themeValues(mode), ...theme.tokens, ...theme.modes?.[mode] };
    // Só cores sólidas entram na conta: color-mix() e gradiente são conferidos nas suítes de navegador.
    const tokens = new Set(CONTRAST_PAIRS.flatMap(([fg, bg]) => [fg, bg]).filter((name) => name in values));
    const colors = Object.fromEntries([...tokens].map((name) => [name, resolve(name, values)]).filter(([, value]) => /^#[\da-f]{6}$/i.test(value)));
    for (const { foreground, background, min, ratio, passed } of measurePairs(colors)) {
      report.push(`${theme.label} ${mode} ${foreground}/${background} ${ratio.toFixed(2)}`);
      assert(passed, `${file} ${mode}: contraste ${foreground}/${background} = ${ratio.toFixed(2)} < ${min}`);
    }
  }
}
if (process.argv.includes("--report")) console.log(report.join("\n"));
console.log(`OK: ${files.length} arquivos de tema com tokens reconhecidos, label, referências e contraste AA de texto, estado e marca.`);
