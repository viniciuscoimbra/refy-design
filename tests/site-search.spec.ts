import { expect, test } from "@playwright/test";

// viniciuscoimbra/refy-design#7: a busca do site (⌘K), a lista do Playground e a navegação de
// componentes respondiam "Nenhum resultado" para "tabela" e "botao". As três usam agora o mesmo
// índice do `refy-agent catalog`, carregado na primeira busca.
const story = (id: string) => `/iframe.html?id=refy-site--${id}&viewMode=story&globals=theme:refy-site;mode:light`;

test.use({ viewport: { width: 1440, height: 900 } });

for (const [query, family] of [["tabela", "Table"], ["botao", "Button"], ["botão", "Button"], ["formulário", "Input"]]) {
  test(`busca do site: "${query}" mostra ${family} em primeiro`, async ({ page }) => {
    await page.goto(story("busca"));
    const palette = page.getByRole("dialog");
    // A story carrega sob demanda: a primeira espera cobre o download dela.
    await expect(palette.getByRole("combobox")).toBeVisible({ timeout: 20000 });
    await palette.getByRole("combobox").fill(query);
    await expect(palette.getByRole("option").first()).toContainText(family);
    await expect(palette.getByText("Nenhum resultado. Tente outro termo.")).toHaveCount(0);
  });
}

test("busca do site: um nome digitado pela metade continua achando a família", async ({ page }) => {
  await page.goto(story("busca"));
  const palette = page.getByRole("dialog");
  await expect(palette.getByRole("combobox")).toBeVisible({ timeout: 20000 });
  await palette.getByRole("combobox").fill("Tab");
  await expect(palette.getByRole("option", { name: /^Table\b/ })).toBeVisible();
  await expect(palette.getByRole("option", { name: /^Tabs\b/ })).toBeVisible();
});

test('Playground: "botao" mostra Button na lista de componentes', async ({ page }) => {
  await page.goto(story("playground"));
  const studio = page.getByTestId("playground-studio");
  await expect(studio).toBeVisible({ timeout: 20000 });
  await studio.getByLabel("Buscar componente", { exact: true }).fill("botao");
  await expect(studio.getByRole("link", { name: "Button", exact: true })).toBeVisible();
});

test('navegação de componentes: "tabela" mostra Table', async ({ page }) => {
  await page.goto(story("accordion"));
  const search = page.getByLabel("Buscar componente na navegação", { exact: true });
  await expect(search).toBeVisible({ timeout: 20000 });
  await search.fill("tabela");
  const nav = page.getByRole("navigation", { name: "Catálogo de componentes", exact: true });
  await expect(nav.getByRole("link", { name: "Table", exact: true })).toBeVisible();
  await expect(page.getByText("Nenhum componente encontrado.")).toHaveCount(0);
});
