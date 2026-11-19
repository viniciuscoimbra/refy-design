import { test } from "node:test";
import assert from "node:assert/strict";
import { hexToHsl, hslToHex, normalizeHex } from "../src/components/ColorField/color.ts";

test("normalizeHex aceita #rgb e #rrggbb, com ou sem #, e recusa o resto", () => {
  assert.equal(normalizeHex("#ABC"), "#aabbcc");
  assert.equal(normalizeHex("2163AD"), "#2163ad");
  assert.equal(normalizeHex(" #0f7b5f "), "#0f7b5f");
  for (const bad of ["", "#12", "#12345", "verde", "#ggg000", "rgb(0,0,0)"]) assert.equal(normalizeHex(bad), null, bad);
});

test("hex → HSL → hex volta ao mesmo valor nas cores do tema", () => {
  for (const hex of ["#000000", "#ffffff", "#2163ad", "#0f7b5f", "#c2410c", "#7c3aed", "#808080"]) {
    const back = hslToHex(hexToHsl(hex));
    const diff = [1, 3, 5].map((i) => Math.abs(parseInt(back.slice(i, i + 2), 16) - parseInt(hex.slice(i, i + 2), 16)));
    assert.ok(Math.max(...diff) <= 3, `${hex} → ${back}`);
  }
  assert.deepEqual(hexToHsl("#ff0000"), { h: 0, s: 100, l: 50 });
  assert.equal(hslToHex({ h: 120, s: 100, l: 50 }), "#00ff00");
});
