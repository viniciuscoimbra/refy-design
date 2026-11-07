import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { refySiteTheme, ThemeProvider, Button, Accordion, Calendar } from "@refy-design/web";
import { themeValues } from "./tokens.mjs";

const source = JSON.parse(readFileSync("src/themes/refy-site.json", "utf8"));
assert.deepEqual(
  refySiteTheme,
  source,
  "O export público precisa corresponder ao JSON",
);
assert.equal(source.name, "Refy Site");
const hooks = JSON.parse(
  readFileSync("src/tokens/component-hooks.json", "utf8"),
);
const known = new Set([...Object.keys(themeValues("light")), ...hooks]);
for (const group of [source.tokens, source.modes.light, source.modes.dark]) {
  for (const [key, value] of Object.entries(group)) {
    assert(known.has(key), "Token não reconhecido pelo editor: " + key);
    assert.equal(typeof value, "string");
  }
}
function resolve(name, values, path = []) {
  assert(!path.includes(name), "Ciclo de tokens: " + name);
  assert(name in values, "Referência ausente: " + name);
  return values[name].replace(/var\((--[\w-]+)\)/g, (_, next) =>
    resolve(next, values, [...path, name]),
  );
}
function luminance(hex) {
  assert.match(hex, /^#[\da-f]{6}$/i);
  const [r, g, b] = [1, 3, 5].map((index) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
for (const mode of ["light", "dark"]) {
  const values = {
    ...themeValues(mode),
    ...source.tokens,
    ...source.modes[mode],
  };
  for (const token of Object.keys(source.tokens)) resolve(token, values);
  for (const [fg, bg] of [
    ["--ink-1", "--bg"],
    ["--ink-2", "--surface"],
    ["--ink-3", "--surface"],
    ["--on-primary", "--primary"],
    ["--on-primary", "--primary-hover"],
    ["--on-primary-container", "--primary-container"],
    ["--primary-ink", "--primary-soft"],
    ["--code-text", "--code-surface"],
    ["--code-syntax-keyword", "--code-surface"],
    ["--code-syntax-string", "--code-surface"],
  ])
    assert(
      contrast(resolve(fg, values), resolve(bg, values)) >= 4.5,
      mode + ": contraste " + fg + "/" + bg,
    );
  for (const [name, value] of Object.entries(source.modes[mode]))
    assert(
      !/radius|height|font|padding|gap|--text-/.test(name),
      "Geometria não pertence ao modo: " + name + "=" + value,
    );
  const html = renderToStaticMarkup(
    React.createElement(ThemeProvider, { theme: refySiteTheme, mode }, [
      React.createElement(
        Button,
        { key: "button", variant: "primary" },
        "Começar",
      ),
      React.createElement(Accordion, {
        key: "accordion",
        items: [{ id: "one", title: "Arquivos", content: "Conteúdo" }],
        defaultValue: ["one"],
      }),
    ]),
  );
  assert(html.includes('data-refy-brand="Refy Site"'));
  assert(html.includes('data-theme="' + mode + '"'));
  assert(html.includes('aria-expanded="true"'));
}
assert(
  !renderToStaticMarkup(
    React.createElement(ThemeProvider, {}, "Original"),
  ).includes("--accordion-gap"),
);
console.log(
  "OK: Refy Site exportado, tokens reconhecidos, referências resolvidas, contraste textual, geometria estável e SSR nos dois modos.",
);

// Compact months must include every date, including months that need six weeks.
for (const [month, weekStartsOn, expected] of [[3, 0, 35], [4, 0, 42], [1, 1, 28]]) {
  const markup = renderToStaticMarkup(React.createElement(Calendar, {
    defaultMonth: new Date(2027, month, 1), fixedWeeks: false, weekStartsOn,
  }));
  assert.equal((markup.match(/role="gridcell"/g) ?? []).length, expected);
}
const defaultCalendar = renderToStaticMarkup(React.createElement(Calendar, {defaultMonth:new Date(2026,9,1)}));
assert.equal((defaultCalendar.match(/role="gridcell"/g) ?? []).length,42,'Default fixed six weeks preserved');

// A page-specific token override would make this exported preset diverge in consumers.
const siteCSS = readFileSync("src/pages/RefySitePage/RefySitePage.module.css", "utf8");
assert.doesNotMatch(siteCSS, /--[\w-]+\s*:/, "A composição não pode redefinir tokens de componentes fora do tema");
