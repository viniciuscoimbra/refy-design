import { test, expect } from "@playwright/test";

// fix-hero-layout-hooks: BRAND-09, BRAND-10 e BRAND-11.
const story = "/iframe.html?id=components-organisms-hero--layout-hooks&viewMode=story";

test("margem do título e entrelinha do lead vêm do tema", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(story);
  const title = page.locator("#storybook-root h1");
  await expect(title).toBeVisible();
  const lead = title.locator("xpath=following-sibling::*[1]");
  const [titleBox, leadBox] = [await title.boundingBox(), await lead.boundingBox()];
  expect(Math.round(leadBox!.y - (titleBox!.y + titleBox!.height))).toBe(24);
  expect(await lead.evaluate(el => getComputedStyle(el).lineHeight)).toBe("29.25px");
});

test("alinhamento central também em 390 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(story);
  const title = page.locator("#storybook-root h1");
  await expect(title).toBeVisible();
  expect(await title.evaluate(el => getComputedStyle(el).textAlign)).toBe("center");
  const lead = title.locator("xpath=following-sibling::*[1]");
  expect(await lead.evaluate(el => getComputedStyle(el).textAlign)).toBe("center");
  const [button, titleBox] = [await page.getByRole("button", { name: "Start selling" }).boundingBox(), await title.boundingBox()];
  expect(Math.abs(button!.x + button!.width / 2 - (titleBox!.x + titleBox!.width / 2))).toBeLessThan(2);
});

test("o tema do site devolve o espaço do descender, como antes", async ({ page }) => {
  // O decorator do Storybook aplica o tema do site, que declara --hero-title-margin com a compensação.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-organisms-hero--playground&viewMode=story");
  const title = page.locator("#storybook-root h1");
  await expect(title).toBeVisible();
  const [margin, padding] = await title.evaluate(el => [getComputedStyle(el).marginBottom, getComputedStyle(el).paddingBottom].map(parseFloat));
  expect(padding).toBeGreaterThan(0);
  expect(margin).toBeCloseTo(-padding, 1);
});
