import { test, expect } from "@playwright/test";

// Command.search (viniciuscoimbra/refy-design#7): quem usa a paleta decide o que aparece e em que
// ordem. A busca recebe o texto aparado e não é chamada com o campo vazio.
const story = "/iframe.html?id=components-organisms-command--busca-propria&viewMode=story&globals=theme:refy-site;mode:light";

async function openPalette(page: import("@playwright/test").Page) {
  await page.goto(story);
  // A story carrega sob demanda: a primeira espera cobre o download dela.
  const trigger = page.getByRole("button", { name: "Search by keyword", exact: true });
  await expect(trigger).toBeVisible({ timeout: 20000 });
  await trigger.click();
  return page.getByRole("dialog");
}

// interação: Command
test("Command.search recebe o texto aparado e substitui o filtro embutido", async ({ page }) => {
  const dialog = await openPalette(page);
  const search = dialog.getByRole("combobox");
  await search.fill("  tabela  ");
  await expect(dialog.getByRole("option")).toHaveCount(1);
  await expect(dialog.getByRole("option")).toContainText("Table");
  // O filtro embutido acharia Table por "tab"; a busca própria só aceita a palavra inteira.
  await search.fill("tab");
  await expect(dialog.getByRole("option")).toHaveCount(0);
});

test("Command.search não é chamada com o campo vazio: a paleta mostra todos os itens", async ({ page }) => {
  const dialog = await openPalette(page);
  await dialog.getByRole("combobox").fill("   ");
  await expect(dialog.getByRole("option")).toHaveCount(3);
});
