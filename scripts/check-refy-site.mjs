import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { refySiteTheme, ThemeProvider, Button, Accordion, Calendar } from "@refy-design/web";
import { themeValues } from "./tokens.mjs";
import { measurePairs } from "../tools/refy-agent/contrast.mjs";

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
for (const mode of ["light", "dark"]) {
  const values = {
    ...themeValues(mode),
    ...source.tokens,
    ...source.modes[mode],
  };
  for (const token of Object.keys(source.tokens)) resolve(token, values);
  // Pares do site, mais estritos que os do validador: todos com 4,5:1 e cores sólidas.
  const sitePairs = [
    ["--ink-1", "--bg", 4.5],
    ["--ink-2", "--surface", 4.5],
    ["--ink-3", "--surface", 4.5],
    ["--on-primary", "--primary", 4.5],
    ["--on-primary", "--primary-hover", 4.5],
    ["--on-primary-container", "--primary-container", 4.5],
    ["--primary-ink", "--primary-soft", 4.5],
    ["--code-text", "--code-surface", 4.5],
    ["--code-syntax-keyword", "--code-surface", 4.5],
    ["--code-syntax-string", "--code-surface", 4.5],
  ];
  const colors = Object.fromEntries(sitePairs.flatMap(([fg, bg]) => [fg, bg]).map((name) => [name, resolve(name, values)]));
  for (const name of Object.keys(colors)) assert.match(colors[name], /^#[\da-f]{6}$/i, mode + ": " + name + " precisa ser #rrggbb");
  for (const pair of measurePairs(colors, sitePairs))
    assert(pair.passed, mode + ": contraste " + pair.foreground + "/" + pair.background + " = " + pair.ratio);
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
