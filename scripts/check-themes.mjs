// Every theme is one configuration file in src/themes. This check holds each file to the same
// contract: recognised tokens only, a display label, resolvable references, AA text contrast,
// AA state colours (success, critical, info) and a brand mark visible against the page (3:1).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { themeValues } from "./tokens.mjs";

const hooks = JSON.parse(readFileSync("src/tokens/component-hooks.json", "utf8"));
const known = new Set([...Object.keys(themeValues("light")), ...hooks]);
const files = readdirSync("src/themes").filter((file) => file.endsWith(".json"));
assert(files.length >= 4, "Esperados ao menos quatro arquivos de tema");

function resolve(name, values, path = []) {
  assert(!path.includes(name), "Ciclo de tokens: " + name);
  assert(name in values, "Referência ausente: " + name);
  return String(values[name]).replace(/var\((--[\w-]+)\)/g, (_, next) => resolve(next, values, [...path, name]));
}
const hex = (value) => /^#[\da-f]{6}$/i.test(value);
function luminance(color) {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const value = parseInt(color.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

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
    const pairs = [
      ["--ink-1", "--bg", 4.5], ["--ink-2", "--surface", 4.5], ["--ink-3", "--surface", 4.5],
      ["--on-primary", "--primary", 4.5], ["--primary-ink", "--surface", 4.5],
      ["--good-ink", "--good-soft", 4.5], ["--on-good", "--good", 4.5], ["--good", "--surface", 3],
      ["--critical-ink", "--critical-soft", 4.5], ["--on-critical", "--critical", 4.5],
      ["--info-ink", "--info-soft", 4.5], ["--on-info", "--info", 4.5],
      ["--brand-mark", "--bg", 3],
      ["--code-syntax-string", "--code-surface", 4.5], ["--brand-on-primary-container", "--brand-primary-container", 3],
    ];
    for (const [fg, bg, min] of pairs) {
      if (!(fg in values) || !(bg in values)) continue;
      const [a, b] = [resolve(fg, values), resolve(bg, values)];
      if (!hex(a) || !hex(b)) continue; // color-mix() and gradients are checked in the browser suites
      const ratio = contrast(a, b);
      report.push(`${theme.label} ${mode} ${fg}/${bg} ${ratio.toFixed(2)}`);
      assert(ratio >= min, `${file} ${mode}: contraste ${fg}/${bg} = ${ratio.toFixed(2)} < ${min}`);
    }
  }
}
if (process.argv.includes("--report")) console.log(report.join("\n"));
console.log(`OK: ${files.length} arquivos de tema com tokens reconhecidos, label, referências e contraste AA de texto, estado e marca.`);
