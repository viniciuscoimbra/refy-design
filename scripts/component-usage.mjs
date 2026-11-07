import assert from "node:assert/strict";

const plainText = (text) => text
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\\\|/g, "|")
  .trim();
const cellsOf = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "")
  .split(/(?<!\\)\|/).map((value) => plainText(value));

/**
 * Strict reader for the per-family sections of COMPONENT_USAGE.md, not a general Markdown parser.
 * Each family is a `#### Id` heading with its API link, a "How to use:" list, a
 * "Choose something else:" list and a two-column key table. Inline code keeps its backticks so the
 * site can render it as code.
 */
export function parseComponentUsage(markdown, expectedIds) {
  const expected = new Set(expectedIds);
  assert.equal(expected.size, expectedIds.length, "Registry contains duplicate family IDs");
  const families = new Map();
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const heading = lines[index].match(/^#### ([A-Za-z0-9]+)\s*$/);
    if (!heading) continue;
    const id = heading[1];
    assert(expected.has(id), `Unknown usage family: ${id}`);
    assert(!families.has(id), `Duplicate usage family: ${id}`);
    let end = index + 1;
    while (end < lines.length && !/^#{1,4} /.test(lines[end])) end++;
    const body = lines.slice(index + 1, end);
    assert(body.some((line) => line.includes(`](../ai/components/${id}.json)`)), `Missing API link: ${id}`);
    const list = (label) => {
      const start = body.findIndex((line) => line.trim() === label);
      assert(start >= 0, `Missing "${label}" in ${id}`);
      const items = [];
      for (const line of body.slice(start + 1)) {
        if (line.startsWith("- ")) items.push(plainText(line.slice(2)));
        else if (line.trim() && items.length) break;
        else if (line.trim()) break;
      }
      return items;
    };
    const howToUse = list("How to use:");
    const alternatives = list("Choose something else:");
    const header = body.findIndex((line) => /^\|\s*Key\s*\|\s*What it does\s*\|\s*$/.test(line));
    assert(header >= 0, `Missing key table in ${id}`);
    const keyboard = [];
    for (const line of body.slice(header + 2)) {
      if (!line.startsWith("|")) break;
      const cells = cellsOf(line);
      assert.equal(cells.length, 2, `Key rows require exactly two columns: ${id}`);
      keyboard.push({ keys: cells[0], action: cells[1] });
    }
    const usage = { howToUse, alternatives, keyboard };
    assert(howToUse.length && alternatives.length && keyboard.length
      && [...howToUse, ...alternatives, ...keyboard.flatMap((row) => [row.keys, row.action])].every(Boolean),
      `Empty usage guidance: ${id}`);
    families.set(id, usage);
  }
  for (const id of expected) assert(families.has(id), `Missing usage family: ${id}`);
  return { families };
}
