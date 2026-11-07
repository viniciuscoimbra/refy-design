// `refy contribute` sai no pacote público: valida o contribution.json antes de mexer no repositório.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { generality, isNewFamily, validateSpec } from "../tools/refy-agent/contribute.mjs";

const base = { component: "Segmented", capability: "Fill the container width", why: "Mobile filters.", patch: "x.patch", changelog: "`block` prop.", props: [{ name: "block", default: false }], preview: { before: [{}], after: [{ block: true }] } };

test("extensão de componente existente passa sem camada", () => {
  assert.equal(isNewFamily(base), false);
  assert.deepEqual(validateSpec(base), []);
});

test("família nova exige camada e finalidade", () => {
  const fresh = { ...base, component: "ProgressRing", preview: { after: [{ value: 40 }] } };
  assert.equal(isNewFamily(fresh), true);
  assert.equal(validateSpec(fresh).length, 2);
  assert.deepEqual(validateSpec({ ...fresh, level: "Átomos", area: "feedback", collections: ["core"] }), []);
});

test("campo desconhecido e falta de imagem nova são recusados", () => {
  assert.match(validateSpec({ ...base, extra: 1 }).join(), /extra/);
  assert.match(validateSpec({ ...base, preview: { before: [{}] } }).join(), /preview.after/);
});

test("vocabulário vem só do contribuidor", () => {
  const patch = "+const label = 'Acme orders';";
  assert.equal(generality(base, patch).passed, true);
  assert.deepEqual(generality({ ...base, productWords: ["acme"] }, patch).productWords, ["acme"]);
});

test("o pacote não aponta para pasta irmã do repositório", () => {
  const source = readFileSync("tools/refy-agent/contribute.mjs", "utf8");
  assert.doesNotMatch(source, /"\.\.\/refy-(?!design")[a-z]+"/);
});
