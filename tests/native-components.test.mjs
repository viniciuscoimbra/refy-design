import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

test("a lista de componentes do mobile no site bate com o que o pacote exporta", () => {
  assert.match(execFileSync("node", ["scripts/native-components.mjs", "--check"], { encoding: "utf8" }), /^OK: \d+ componentes do mobile\./);
});
