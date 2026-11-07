import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseComponentUsage } from "../scripts/component-usage.mjs";

const guide = readFileSync("docs/COMPONENT_USAGE.md", "utf8");
const ids = JSON.parse(readFileSync("ai/catalog.json", "utf8")).components.map((entry) => entry.id);
const section = (id) => guide.match(new RegExp(`#### ${id}\\n[\\s\\S]*?(?=\\n#{1,4} )`))[0];
const button = section("Button");

test("guide covers every family with how to use, alternatives and a key table", () => {
  const result = parseComponentUsage(guide, ids);
  assert.equal(result.families.size, ids.length);
  const table = result.families.get("Table");
  assert(table.howToUse.some((item) => item.includes("`onRowClick`")));
  assert(table.alternatives.some((item) => item.includes("KanbanBoard")));
  assert.deepEqual(table.keyboard.at(-1), { keys: "`Escape`", action: "Closes the open filter list." });
});

test("public guidance carries no internal process references", () => {
  assert.doesNotMatch(guide, /OpenSpec|c3f03fd|Original Refy|in checkout|QUALITY\.md/);
});

test("missing and duplicate families block generation", () => {
  assert.throws(() => parseComponentUsage(guide.replace(button, ""), ids), /Missing usage family: Button/);
  assert.throws(() => parseComponentUsage(`${guide}\n${button}\n## End`, ids), /Duplicate usage family: Button/);
});

test("missing parts, empty items and unknown family block generation", () => {
  assert.throws(() => parseComponentUsage(guide.replace(button, button.replace("How to use:", "Usage:")), ids), /Missing "How to use:" in Button/);
  assert.throws(() => parseComponentUsage(guide.replace(button, button.replace("| Key | What it does |", "| Key |")), ids), /Missing key table in Button/);
  assert.throws(() => parseComponentUsage(guide.replace(button, button.replace(/\| `Tab` \|[^\n]*/, "| `Tab` | a | b |")), ids), /two columns/);
  assert.throws(() => parseComponentUsage(guide.replace("#### Button\n", "#### Unknown\n"), ids), /Unknown usage family/);
});
