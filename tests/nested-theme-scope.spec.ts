import { test, expect } from "@playwright/test";

// fix-nested-theme-scope: BRAND-04 a BRAND-07.
test("provider aninhado herda o escopo de fora e não repinta", async ({ page }) => {
  await page.goto("/iframe.html?id=fundacao-temas-por-aplicacao--heranca&viewMode=story");
  const child = page.getByTestId("inherit-child");
  await expect(child).toBeVisible();
  const read = (testId: string, name: string) =>
    page.getByTestId(testId).evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name);

  // BRAND-04: sobreposição do pai preservada, a do filho aplicada.
  expect(await read("inherit-child", "--space-3")).toBe("8px");
  expect(await read("inherit-child", "--card-radius")).toBe("16px");
  // BRAND-04: isolate volta à fundação.
  expect(await read("inherit-isolated", "--space-3")).not.toBe("8px");

  // BRAND-05: sem fundo próprio e com a tipografia de quem está em volta.
  expect(await child.evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  expect(await page.getByTestId("inherit-text").evaluate(el => getComputedStyle(el).fontSize)).toBe("14px");
  expect(await child.evaluate(el => getComputedStyle(el).overflowWrap)).toBe("normal");

  // BRAND-06: a palavra não quebra entre letras.
  const word = page.getByTestId("inherit-word");
  const lines = await word.evaluate(el => el.getClientRects().length);
  expect(lines).toBe(1);

  // BRAND-07: aninhado escuro em página clara usa o modo escuro e mantém o raio herdado.
  const dark = page.getByTestId("inherit-dark");
  await expect(dark).toHaveAttribute("data-theme", "dark");
  // O decorator do Storybook é a raiz, com o tema Refy: o modo escuro dele é reaplicado no aninhado.
  expect(await read("inherit-dark", "--bg")).not.toBe(await read("inherit-parent", "--bg"));
  expect(await dark.evaluate(el => getComputedStyle(el).colorScheme)).toBe("dark");
  expect(await read("inherit-dark", "--card-radius")).toBe("12px");
  expect(await read("inherit-dark", "--space-3")).toBe("8px");
  expect(await dark.evaluate(el => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  // Alias da fundação (--field-radius: var(--control-radius)) resolve com o token do aninhado.
  await expect(page.getByTestId("inherit-alias").locator("[data-refy-field]")).toHaveCSS("border-radius", "18px");
  // data-theme continua público em todo escopo; só a troca de modo marca data-refy-mode-switch.
  await expect(dark).toHaveAttribute("data-refy-mode-switch", "");
  await expect(child).toHaveAttribute("data-theme", "light");
  await expect(child).not.toHaveAttribute("data-refy-mode-switch", /.*/);
});
