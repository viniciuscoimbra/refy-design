import { expect, test } from "@playwright/test";

// O Playground do site mostra um componente funcionando, as propriedades dele e o código.
// No celular as propriedades sobem numa gaveta pelo rodapé e o componente continua à vista.
const story = "/iframe.html?id=refy-site--playground&viewMode=story&globals=theme:refy-site;mode:light";

test("desktop: trocar a variante muda o componente e o código", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(story);
  // O Playground carrega sob demanda: a primeira espera cobre o download do pedaço dele.
  const studio = page.getByTestId("playground-studio");
  await expect(studio).toBeVisible({ timeout: 20000 });
  await expect(studio.getByText("Button · Átomo")).toBeVisible();
  const panel = studio.getByRole("complementary", { name: "Personalizar" });
  const button = page.frameLocator("iframe").first().locator("button").first();
  const primary = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  await panel.getByRole("radio", { name: "danger", exact: true }).click();
  await expect(studio.getByRole("region", { name: "Código de Button" })).toContainText('variant="danger"');
  await expect(studio.getByRole("region", { name: "Código de Button" })).toContainText('from "@refy-design/web"');
  await expect.poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(primary);
});

test("desktop: escolher outro componente na lista troca a prévia", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(story);
  // O Playground carrega sob demanda: a primeira espera cobre o download do pedaço dele.
  const studio = page.getByTestId("playground-studio");
  await expect(studio).toBeVisible({ timeout: 20000 });
  await studio.getByRole("link", { name: "Badge", exact: true }).click();
  await expect(studio.getByText("Badge · Átomo")).toBeVisible();
  await expect(studio.getByRole("heading", { name: "Propriedades do Badge" })).toBeVisible();
});

test("celular: a gaveta abre pelo rodapé sem cobrir o componente", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(story);
  // O Playground carrega sob demanda: a primeira espera cobre o download do pedaço dele.
  const studio = page.getByTestId("playground-studio");
  await expect(studio).toBeVisible({ timeout: 20000 });
  await studio.getByRole("button", { name: "Propriedades do Button ↑" }).click();
  const sheet = page.getByRole("dialog", { name: "Propriedades do Button" });
  await expect(sheet).toBeVisible();
  const button = page.frameLocator("iframe").first().locator("button").first();
  const primary = await button.evaluate((el) => getComputedStyle(el).backgroundColor);
  await sheet.getByRole("radio", { name: "danger", exact: true }).click();
  await expect.poll(() => button.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(primary);
  const sheetBox = await sheet.boundingBox();
  const buttonBox = await button.boundingBox();
  expect(sheetBox && buttonBox).toBeTruthy();
  // O botão aparece inteiro acima da gaveta.
  expect(buttonBox!.y + buttonBox!.height).toBeLessThanOrEqual(sheetBox!.y);
});
