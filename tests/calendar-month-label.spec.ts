import { expect, test } from "@playwright/test";

// O calendário da home mostra "Outubro 2026", sem o "de" do formato longo.
test("monthLabelStyle compact mostra só mês e ano; o padrão segue o idioma", async ({ page }) => {
  await page.goto("/iframe.html?id=refy-site--inicio&viewMode=story&globals=theme:refy-site;mode:light");
  await expect(page.getByText("Outubro 2026", { exact: true })).toBeVisible();
  await expect(page.getByText("Outubro de 2026", { exact: true })).toHaveCount(0);
  await page.goto("/iframe.html?id=components-molecules-calendar--single-default&viewMode=story");
  await expect(page.getByText(/^[A-Z][a-z]+ \d{4}$/).first()).toBeVisible();
});
