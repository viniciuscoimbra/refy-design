import { test, expect } from "@playwright/test";

// extend-plan-card-and-site-footer: BRAND-20 e BRAND-21.
test("PlanCard: descrição, botão no fim e etiqueta à direita", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-molecules-plancard--botao-no-fim&viewMode=story");
  const plans = page.locator('[data-testid="plans-bottom"]');
  await expect(plans).toBeVisible();
  const pro = plans.locator("h3", { hasText: "Pro" }).locator("..");
  const order = await pro.evaluate((el) => [...el.children].map((c) => c.tagName === "H3" ? "name" : c.tagName === "P" ? "description" : c.tagName === "UL" ? "features" : c.querySelector("button") ? "cta" : c.textContent?.includes("$") ? "price" : c.tagName === "SPAN" ? "tag" : "note"));
  expect(order.filter((x) => x !== "note" && x !== "tag")).toEqual(["name", "description", "price", "features", "cta"]);
  // Botões na mesma linha, embaixo.
  const tops = await plans.locator("button").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().bottom)));
  expect(new Set(tops).size).toBe(1);
  // Etiqueta do destaque encostada à direita.
  const [card, tag] = await pro.evaluate((el) => [el.getBoundingClientRect(), el.querySelector("span")!.getBoundingClientRect()].map((r) => ({ left: r.left, right: r.right })));
  expect(card.right - tag.right).toBeLessThan(card.left - tag.left + card.right - card.left);
  expect(tag.left - card.left).toBeGreaterThan(card.right - tag.right);
  // Destaque em modo escuro aninhado.
  await expect(pro.locator("xpath=ancestor::*[@data-refy-scope][1]")).toHaveAttribute("data-theme", "dark");
});

test("PlanCard sem ctaPosition mantém a ordem de antes", async ({ page }) => {
  await page.goto("/iframe.html?id=components-molecules-plancard--padrao&viewMode=story");
  const name = page.locator("#storybook-root h3").first();
  await expect(name).toBeVisible();
  const order = await name.locator("..").evaluate((el) => [...el.children].map((c) => c.tagName === "UL" ? "features" : c.querySelector("button") ? "cta" : c.tagName));
  expect(order.indexOf("cta")).toBeLessThan(order.indexOf("features"));
});

test("SiteFooter: quatro colunas iguais, título 500 e 8 px entre links", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/iframe.html?id=components-organisms-sitefooter--quatro-colunas&viewMode=story");
  const footer = page.getByTestId("footer-four");
  await expect(footer).toBeVisible();
  const widths = await footer.evaluate((el) => getComputedStyle(el.firstElementChild!).gridTemplateColumns.split(" ").map((w) => Math.round(parseFloat(w))));
  expect(widths).toHaveLength(4);
  expect(new Set(widths).size).toBe(1);
  const nav = footer.locator("nav").first();
  expect(await nav.locator("h2, h3, p, span").first().evaluate((el) => getComputedStyle(el).fontWeight)).toBe("500");
  const links = await nav.locator("a").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
  expect(Math.round(links[1].top - links[0].bottom)).toBe(8);
});
