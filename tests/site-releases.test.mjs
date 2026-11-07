// A página Releases do site lê o CHANGELOG.md. Cada frase de versão publicada precisa de inglês e
// espanhol em locales/changelog.json, senão o site mostra português para quem lê em outro idioma.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseReleases } from "../src/pages/RefySitePage/releases.mjs";

const changelog = readFileSync("CHANGELOG.md", "utf8");
const text = JSON.parse(readFileSync("src/pages/RefySitePage/locales/changelog.json", "utf8"));

test("só seção com versão e data vira release", () => {
  const parsed = parseReleases("# C\n\n## 1.1.0 (proposta)\n\n- x\n\n## 1.0.0 (06/11/2026)\n\nResumo.\n\n- a\n- b\n\n## Desenvolvimento local — 29/10/2026\n- c\n");
  assert.deepEqual(parsed, [{ version: "1.0.0", date: "2026-11-06", summary: "Resumo.", changes: ["a", "b"] }]);
});

test("toda frase de release publicada tem inglês e espanhol", () => {
  const releases = parseReleases(changelog);
  assert.ok(releases.length > 0, "CHANGELOG sem versão publicada");
  const missing = releases.flatMap((r) => [r.summary, ...r.changes].filter(Boolean))
    .flatMap((line) => ["en", "es"].filter((l) => !text[l][line]).map((l) => `${l}: ${line}`));
  assert.deepEqual(missing, []);
});
