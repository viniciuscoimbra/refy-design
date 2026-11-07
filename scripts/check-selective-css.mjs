import assert from "node:assert/strict";
import { selectiveCss } from "./selective-css.mjs";
const original = "export const value = 1;\n//# sourceMappingURL=Button.js.map";
const bundle = {
  "assets/button.css": {
    type: "asset",
    fileName: "assets/button.css",
    source: ".button{color:red}",
  },
  "components/Button.js": {
    type: "chunk",
    fileName: "components/Button.js",
    code: original,
    viteMetadata: { importedCss: new Set(["assets/button.css"]) },
  },
  "components/Button.js.map": {
    type: "asset",
    fileName: "components/Button.js.map",
    source: JSON.stringify({
      version: 3,
      sources: ["../../src/Button.tsx"],
      mappings: "AAAA",
    }),
  },
};
const emitted = [];
selectiveCss().generateBundle.call(
  { emitFile: (asset) => emitted.push(asset) },
  {},
  bundle,
);
assert.equal(
  bundle["components/Button.js"].code,
  'export const value = 1;\nimport "../assets/button.css";\n//# sourceMappingURL=Button.js.map',
);
assert.equal(bundle["node/components/Button.js"].code, original);
assert.deepEqual(
  JSON.parse(bundle["node/components/Button.js.map"].source).sources,
  ["../../../src/Button.tsx"],
);
assert.equal(emitted[0].fileName, "style.css");
assert.equal(emitted[0].source, ".button{color:red}");
console.log(
  "OK: selective CSS imports, native Node fallback, sourcemap offsets and legacy stylesheet.",
);
