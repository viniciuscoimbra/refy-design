// A página Releases do site lê o CHANGELOG.md, escrito em inglês. Cada frase de versão publicada
// precisa de português e espanhol em locales/changelog.json, senão o site mostra inglês para quem lê
// em outro idioma.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { missingMobileDeclaration, parseReleases, upgradeKind } from "../src/pages/RefySitePage/releases.mjs";
import { unreleasedEntry } from "../tools/refy-agent/contribute.mjs";

const changelog = readFileSync("CHANGELOG.md", "utf8");
const text = JSON.parse(readFileSync("src/pages/RefySitePage/locales/changelog.json", "utf8"));

test("só seção com versão e data vira release", () => {
  const parsed = parseReleases("# C\n\n## [Unreleased]\n\n- x\n\n## [1.0.0] - 2026-11-06\n\nSummary.\n\n- a\n- b\n\n## Local notes\n- c\n");
  assert.deepEqual(parsed, [{ version: "1.0.0", date: "2026-11-06", summary: "Summary.", groups: [{ kind: null, changes: ["a", "b"] }], changes: ["a", "b"] }]);
});

test("mudança fica na categoria do Keep a Changelog", () => {
  const [release] = parseReleases("## [1.1.0] - 2026-11-07\n\n### Added\n\n- a\n\n### Deprecated\n\n- b\n");
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

test("contribuição entra em Unreleased, na categoria certa", () => {
  const base = "# Changelog\n\n## [1.0.0] - 2026-11-07\n\n### Added\n\n- x\n";
  const once = unreleasedEntry(base, "Added", "New.");
  assert.equal(once, "# Changelog\n\n## [Unreleased]\n\n### Added\n\n- New.\n\n## [1.0.0] - 2026-11-07\n\n### Added\n\n- x\n");
  const twice = unreleasedEntry(once, "Added", "Other.");
  assert.match(twice, /- New\.\n- Other\.\n\n## \[1\.0\.0\]/);
  assert.equal(parseReleases(twice).length, 1, "Unreleased não vira release");
});

test("toda frase de release publicada tem português e espanhol", () => {
  const releases = parseReleases(changelog);
  assert.ok(releases.length > 0, "CHANGELOG sem versão publicada");
  const missing = releases.flatMap((r) => [r.summary, ...r.changes].filter(Boolean))
    .flatMap((line) => ["pt", "es"].filter((l) => !text[l][line]).map((l) => `${l}: ${line}`));
  assert.deepEqual(missing, []);
});

// NATP-03: toda versão desde a 1.1.0 diz se o @refy-design/mobile acompanha e o que ficou só na web.
test("versão sem declaração do mobile é recusada; com a linha passa", () => {
  const sem = "## [1.2.0] - 2026-11-09\n\n### Added\n\n- x\n\n## [1.0.0] - 2026-11-07\n\n### Added\n\n- a\n";
  assert.deepEqual(missingMobileDeclaration(sem), ["1.2.0"], "1.0.0 é anterior ao mobile e não precisa da linha");
  const com = "## [1.2.0] - 2026-11-09\n\nMobile: `@refy-design/mobile` does not follow; web only: `Combobox.creatable`.\n\n### Added\n\n- x\n";
  assert.deepEqual(missingMobileDeclaration(com), []);
  const resumo = "## [1.6.0] - 2026-11-12\n\nFixes.\n\nMobile: follows.\n\n### Fixed\n\n- y\n";
  assert.deepEqual(missingMobileDeclaration(resumo), [], "a linha pode vir depois de outro resumo");
  for (const fim of ["Summary!", "Summary?", "Summary"]) {
    assert.deepEqual(missingMobileDeclaration(`## [1.6.0] - 2026-11-12\n\n${fim}\n\nMobile: follows.\n\n### Fixed\n\n- y\n`), [], `depois de "${fim}"`);
  }
  assert.deepEqual(missingMobileDeclaration("## [1.6.0] - 2026-11-12\n\n### Fixed\n\n- Mobile: false positive.\n"), ["1.6.0"], "item da lista não declara");
});

test("o CHANGELOG declara o mobile em toda versão desde a 1.1.0", () => {
  assert.deepEqual(missingMobileDeclaration(changelog), []);
});

// O sumário da página Versões sai de versions.json para o CHANGELOG ficar fora da primeira carga
// da home (SiteProject.tsx): as duas listas precisam ser a mesma.
test("versions.json lista as mesmas versões do CHANGELOG, na mesma ordem", () => {
  const versions = JSON.parse(readFileSync("src/catalog/versions.json", "utf8"));
  assert.deepEqual(versions.releases.map((r) => r.version), parseReleases(changelog).map((r) => r.version));
});
