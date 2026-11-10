// A página Releases do site lê o CHANGELOG.md. Cada frase de versão publicada precisa de inglês e
// espanhol em locales/changelog.json, senão o site mostra português para quem lê em outro idioma.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseReleases, upgradeKind } from "../src/pages/RefySitePage/releases.mjs";
import { unreleasedEntry } from "../tools/refy-agent/contribute.mjs";

const changelog = readFileSync("CHANGELOG.md", "utf8");
const text = JSON.parse(readFileSync("src/pages/RefySitePage/locales/changelog.json", "utf8"));

test("só seção com versão e data vira release", () => {
  const parsed = parseReleases("# C\n\n## 1.1.0 (proposta)\n\n- x\n\n## 1.0.0 (06/11/2026)\n\nResumo.\n\n- a\n- b\n\n## Desenvolvimento local — 29/10/2026\n- c\n");
  assert.deepEqual(parsed, [{ version: "1.0.0", date: "2026-11-06", summary: "Resumo.", groups: [{ kind: null, changes: ["a", "b"] }], changes: ["a", "b"] }]);
});

test("mudança fica na categoria do Keep a Changelog", () => {
  const [release] = parseReleases("## 1.1.0 (07/11/2026)\n\n### Adicionado\n\n- a\n\n### Obsoleto\n\n- b\n");
  assert.deepEqual(release.groups, [{ kind: "added", changes: ["a"] }, { kind: "deprecated", changes: ["b"] }]);
});

// Item solto em versão publicada não diz se acrescenta, quebra ou corrige: quem atualiza não sabe o
// que olhar. A 1.0.0 nasceu com itens soltos e foi reorganizada em 09/11/2026.
test("toda mudança de versão publicada tem categoria", () => {
  const loose = parseReleases(changelog).flatMap((r) => r.groups.filter((g) => !g.kind).map(() => r.version));
  assert.deepEqual(loose, []);
});

test("SemVer diz o que a atualização pede", () => {
  assert.equal(upgradeKind("1.0.0", undefined), "first");
  assert.equal(upgradeKind("1.2.0", "1.1.0"), "minor");
  assert.equal(upgradeKind("1.2.1", "1.2.0"), "patch");
  assert.equal(upgradeKind("2.0.0", "1.2.0"), "major");
});

test("contribuição entra em Não publicado, na categoria certa", () => {
  const base = "# Changelog\n\n## 1.0.0 (07/11/2026)\n\n### Adicionado\n\n- x\n";
  const once = unreleasedEntry(base, "Adicionado", "Novo.");
  assert.equal(once, "# Changelog\n\n## Não publicado\n\n### Adicionado\n\n- Novo.\n\n## 1.0.0 (07/11/2026)\n\n### Adicionado\n\n- x\n");
  const twice = unreleasedEntry(once, "Adicionado", "Outro.");
  assert.match(twice, /- Novo\.\n- Outro\.\n\n## 1\.0\.0/);
  assert.equal(parseReleases(twice).length, 1, "Não publicado não vira release");
});

test("toda frase de release publicada tem inglês e espanhol", () => {
  const releases = parseReleases(changelog);
  assert.ok(releases.length > 0, "CHANGELOG sem versão publicada");
  const missing = releases.flatMap((r) => [r.summary, ...r.changes].filter(Boolean))
    .flatMap((line) => ["en", "es"].filter((l) => !text[l][line]).map((l) => `${l}: ${line}`));
  assert.deepEqual(missing, []);
});
