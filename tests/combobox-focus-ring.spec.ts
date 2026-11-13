import { expect, test } from "@playwright/test";

// A prévia do Combobox aberto (defaultOpen) não mostra anel de foco sem foco nenhum.
// O anel vem só do foco real (:focus-within).
const catalog = "/iframe.html?id=refy-site--componentes&viewMode=story&globals=theme:refy-site;mode:light";

// interação: Combobox
test("Combobox aberto sem foco não mostra anel de foco", async ({ page }) => {
  await page.goto(catalog);
  const input = page.getByRole("combobox").filter({ has: page.locator("xpath=.") }).first();
  const wrap = page.locator('[data-refy-field]').filter({ has: page.getByRole("combobox") }).first();
  await expect(wrap).toBeVisible();
  await expect(page.getByRole("listbox").first()).toBeVisible();
  await expect(wrap).toHaveCSS("outline-style", "none");
  await expect(wrap).toHaveCSS("box-shadow", "none");
  // Com foco real, o anel do tema volta.
  await input.focus();
  await expect(wrap).toHaveCSS("outline-style", "solid");
});
