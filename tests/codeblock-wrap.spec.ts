import { expect, test } from "@playwright/test";

// Opção `wrap` do CodeBlock: quebra linhas longas sem rolagem; sem ela o padrão continua `pre`.
test("CodeBlock wrap quebra linhas longas; o padrão rola dentro do bloco", async ({ page }) => {
  await page.goto("/iframe.html?id=components-molecules-codeblock--quebra-de-linha&viewMode=story");
  const wrapped = page.locator("#storybook-root pre").first();
  await expect(wrapped.locator("code")).toHaveCSS("white-space", "pre-wrap");
  expect(await wrapped.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  await page.goto("/iframe.html?id=components-molecules-codeblock--overflow-horizontal&viewMode=story");
  const scrolled = page.locator("#storybook-root pre").first();
  await expect(scrolled.locator("code")).toHaveCSS("white-space", "pre");
  expect(await scrolled.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeGreaterThan(0);
});

