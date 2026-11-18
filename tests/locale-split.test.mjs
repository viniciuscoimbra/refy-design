// A divisão dos dicionários no build do site (scripts/vite-locale-split.mjs) não pode perder nem
// trocar tradução: cada frase de cada arquivo em locales/ cai em exatamente uma parte, com o
// mesmo valor.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { computeLocaleSplit, sourceFiles } from "../scripts/vite-locale-split.mjs";

const read = (name) => JSON.parse(readFileSync(new URL(`../src/pages/RefySitePage/locales/${name}`, import.meta.url), "utf8"));
const split = computeLocaleSplit();

for (const locale of ["pt", "es"]) {
  test(`docs.${locale}: parte comum mais as famílias somam o arquivo inteiro, sem repetir frase`, () => {
    const whole = read(`docs.${locale}.json`);
    const parts = [split.reference[locale].docs, ...Object.values(split.family[locale])];
    const seen = {};
    for (const part of parts) for (const [phrase, value] of Object.entries(part)) {
      assert.ok(!(phrase in seen), `frase em duas partes: ${phrase}`);
      seen[phrase] = value;
    }
    assert.deepEqual(seen, whole);
  });
  test(`demo.${locale}: cada arquivo leva os próprios textos, e os nomes de exemplo têm o valor do primeiro arquivo`, () => {
    const whole = read(`demo.${locale}.json`);
    for (const [file, entries] of Object.entries(whole)) assert.deepEqual(split.demo[file][locale], entries);
    for (const [phrase, value] of Object.entries(split.reference[locale].demoLabels)) {
      const first = Object.values(whole).find((entries) => typeof entries[phrase] === "string");
      assert.equal(value, first[phrase]);
    }
  });
}

for (const locale of ["en", "es"]) {
  test(`${locale}.json: texto escrito no código mais o resto somam o arquivo inteiro`, () => {
    const whole = read(`${locale}.json`);
    const site = split.site[locale];
    const rest = split.reference[locale].site;
    for (const phrase of Object.keys(site)) assert.ok(!(phrase in rest), `frase nas duas partes: ${phrase}`);
    assert.deepEqual({ ...site, ...rest }, whole);
  });
}

test("a descrição de uma família (que o catálogo mostra) nunca vai para a parte da família", () => {
  for (const locale of ["pt", "es"]) for (const [family, part] of Object.entries(split.family[locale])) {
    const description = JSON.parse(readFileSync(new URL(`../src/pages/PlaygroundPage/documentation/${family}.json`, import.meta.url), "utf8")).description;
    assert.ok(!(description in part), `${locale}/${family}`);
  }
});

// O build do site roda também sem .git (clone da promoção, `git archive` da tag publicada): a lista de
// código vem das pastas. Num checkout do repositório ela tem de ser a mesma do git.
test("os arquivos de código lidos das pastas são os mesmos que o git conhece", (t) => {
  const dirs = ["src", "site", "tools", "ai", "packages/a2ui/src"];
  let tracked;
  try {
    tracked = execFileSync("git", ["ls-files", ...dirs], { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    t.skip("fora de um repositório git");
    return;
  }
  const code = tracked.split("\n").filter((file) => /\.(ts|tsx|js|mjs|json|md|css)$/.test(file)).sort();
  assert.deepEqual(sourceFiles(dirs), code);
});
