import { expect, test } from "@playwright/test";

// viniciuscoimbra/refy-design#14: os cartões do catálogo mostravam a área ("Ação") no lugar da
// descrição da ficha, e a busca não achava pelas palavras dela. A chave de import.meta.glob com
// query não leva o "?description", e a procura voltava sempre vazia.
const story = (id: string) => `/iframe.html?id=refy-site--${id}&viewMode=story&globals=theme:refy-site;mode:light`;

test.use({ viewport: { width: 1440, height: 900 } });

test("catálogo: o cartão do Button mostra a descrição da ficha", async ({ page }) => {
  await page.goto(story("componentes"));
  const card = page.locator("h2", { hasText: /^Button\b/ }).locator("xpath=..");
  await expect(card).toBeVisible({ timeout: 20000 });
  await expect(card).toContainText("Ação acionável por mouse, toque ou teclado");
});

test("navegação: a busca acha o componente por uma palavra que só está na descrição", async ({ page }) => {
  await page.goto(story("accordion"));
  const search = page.getByLabel("Buscar componente na navegação", { exact: true });
  await expect(search).toBeVisible({ timeout: 20000 });
  await search.fill("acionável");
  const nav = page.getByRole("navigation", { name: "Catálogo de componentes", exact: true });
  await expect(nav.getByRole("link", { name: "Button", exact: true })).toBeVisible();
});
