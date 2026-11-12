// viniciuscoimbra/refy-design#7: a busca do site, a do Playground e o `refy-agent catalog` não
// achavam "tabela", "botao", "formulário", "senha" e "upload de arquivo", e o ranking subia a
// família que cita o termo para recusá-lo. Os três usam o mesmo searchCatalog; esta tabela cobre
// o motor e a CLI com os termos da issue em pt, en e es. REFY_SEARCH_ROOT aponta para outra cópia
// (motor e ai/) quando se quer ver a mesma tabela contra uma versão anterior.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.env.REFY_SEARCH_ROOT ?? ".");
const { buildIndex, searchCatalog } = await import(`${root}/tools/refy-agent/search.mjs`);
const catalog = JSON.parse(readFileSync(`${root}/ai/catalog.json`, "utf8"));
const index = buildIndex(
  catalog,
  (component) => JSON.parse(readFileSync(`${root}/ai/${component.document}`, "utf8")),
  readFileSync(`${root}/ai/control-choices.md`, "utf8"),
);

const firstFamily = [
  ["tabela", "Table"], ["tabla", "Table"], ["table", "Table"], ["Table", "Table"],
  ["botao", "Button"], ["botão", "Button"], ["botón", "Button"], ["button", "Button"],
  ["formulário", "Input"], ["formulario", "Input"], ["form", "Input"],
  ["gráfico de barras", "Charts"], ["gráfica de barras", "Charts"], ["bar chart", "Charts"],
  ["senha", "Input"], ["contraseña", "Input"], ["password", "Input"],
  ["upload de arquivo", "FileUpload"], ["subir archivo", "FileUpload"], ["file upload", "FileUpload"],
  ["login", "OAuthButton"], ["inicio de sesión", "OAuthButton"], ["sign in", "OAuthButton"],
  // Vizinhos que a tradução dos nomes não pode estragar.
  ["índice", "TableOfContents"], ["sumário", "TableOfContents"], ["nome", "Input"],
  ["planilha", "Table"], ["entrar", "OAuthButton"], ["sesión", "OAuthButton"], ["logar", "OAuthButton"],
];

function cliCatalog(query) {
  const result = spawnSync(process.execPath, [`${root}/tools/refy-agent/cli.mjs`, "catalog", query], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout).components.map((component) => component.id);
}

const ranked = (query, limit = 5) => searchCatalog(index, query, { limit }).results.map((result) => result.id);

for (const [query, family] of firstFamily) {
  test(`busca "${query}" põe ${family} em primeiro`, () => {
    const ids = ranked(query);
    assert.equal(ids[0], family, ids.join(" "));
  });
  test(`refy-agent catalog "${query}" põe ${family} em primeiro`, () => {
    const ids = cliCatalog(query);
    assert.equal(ids[0], family, ids.slice(0, 5).join(" "));
  });
}

test("formulário não põe StickyFooter, que só cita formulário para recusar a validação, em primeiro", () => {
  for (const query of ["formulário", "formulario", "form"]) assert.notEqual(ranked(query, 1)[0], "StickyFooter", query);
});

test("gráfico de barras põe peças de dado logo depois de Charts, não barras de tela", () => {
  const ids = ranked("gráfico de barras", 3);
  assert.ok(!ids.includes("StickyBar") && !ids.includes("ProgressBar"), ids.join(" "));
});

test("a tabela de escolha não sobe a peça para o que ela recusa: digitação livre é Input, não DatePicker", () => {
  // control-choices.md: "Escolher data sem digitação livre | DatePicker".
  const ids = ranked("digitação livre");
  assert.equal(ids[0], "Input", ids.join(" "));
  assert.ok(!ids.includes("DatePicker"), ids.join(" "));
});

test("refy-agent catalog acha o membro da API pelo nome: BarChart está em Charts", () => {
  assert.deepEqual(cliCatalog("BarChart"), ["Charts"]);
});
