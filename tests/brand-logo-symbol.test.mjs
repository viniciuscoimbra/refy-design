import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { BrandLogo } = require("../dist/node/index.js");
const render = (props) => renderToStaticMarkup(React.createElement(BrandLogo, { brand: "refy", ...props }));

test("BrandLogo symbol + markOnly mostra só o símbolo; symbol sozinho mantém a palavra", () => {
  const so = render({ symbol: true, markOnly: true }), completo = render({ symbol: true });
  assert.match(so, /data-refy-brand-mark=""/);
  assert.doesNotMatch(so, />refy</, "sem a palavra refy");
  assert.match(so, /aria-label="refy"/, "nome acessível preservado");
  assert.match(completo, /data-refy-brand-mark=""/);
  assert.match(completo, />refy</, "com a palavra refy");
});
