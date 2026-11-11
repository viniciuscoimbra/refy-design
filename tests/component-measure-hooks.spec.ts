import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// add-component-measure-hooks (BRAND-12 a BRAND-17) e add-button-border-and-wrap-hooks (BRAND-18, BRAND-19).
const open = async (page: Page, id: string) => {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.locator("#storybook-root").waitFor();
};
const css = (page: Page, selector: string, props: string[]) =>
  page.locator(selector).first().evaluate((el, names) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(names.map((n) => [n, style.getPropertyValue(n)]));
  }, props);

test("Chip: padding, espaço e ícone do tema", async ({ page }) => {
  await open(page, "components-atoms-chip--medidas");
  const chip = '[data-testid="chip-measures"] button';
  expect(await css(page, chip, ["padding-left", "padding-right", "column-gap"])).toEqual({ "padding-left": "16px", "padding-right": "16px", "column-gap": "8px" });
  const icon = await page.locator(chip).first().locator("span").first().boundingBox();
  expect([icon!.width, icon!.height]).toEqual([16, 16]);
});

test("Badge: altura, padding e raio do tema", async ({ page }) => {
  await open(page, "components-atoms-badge--medidas");
  expect(await css(page, '[data-testid="badge-measures"]', ["height", "padding-left", "border-top-left-radius"])).toEqual({ height: "24px", "padding-left": "8px", "border-top-left-radius": "4px" });
});

test("Bubble: padding, largura, canto do remetente e borda do balão de saída", async ({ page }) => {
  await open(page, "components-atoms-bubble--medidas");
  const start = await css(page, '[data-testid="bubble-start"]', ["padding-top", "padding-left", "max-width", "border-top-left-radius", "border-top-right-radius", "border-top-width"]);
  expect(start).toEqual({ "padding-top": "8px", "padding-left": "16px", "max-width": "320px", "border-top-left-radius": "2px", "border-top-right-radius": "16px", "border-top-width": "1px" });
  const end = await css(page, '[data-testid="bubble-end"]', ["border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-top-width"]);
  expect(end).toEqual({ "border-top-left-radius": "16px", "border-top-right-radius": "2px", "border-bottom-left-radius": "16px", "border-top-width": "0px" });
  const width = await page.getByTestId("bubble-start").evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(320);
  // O espaço global não muda: o padding saiu do hook.
  expect(await page.getByTestId("bubble-start").evaluate((el) => getComputedStyle(el).getPropertyValue("--space-3"))).not.toBe("8px 16px");
});

test("IconButton: ícone de 20 px no lg", async ({ page }) => {
  await open(page, "components-atoms-iconbutton--tamanho-do-icone");
  const svg = await page.locator('[data-testid="iconbutton-lg"] svg').boundingBox();
  expect([svg!.width, svg!.height]).toEqual([20, 20]);
});

test("Switch: polegar a 4 px, centrado, e trilho desligado do tema", async ({ page }) => {
  await open(page, "components-atoms-switch--polegar-e-trilho");
  const wraps = page.locator('[data-testid="switch-measures"] > *');
  const off = wraps.nth(0);
  const [box, thumb] = [await off.boundingBox(), await off.locator("span span").first().boundingBox()];
  expect(Math.round(thumb!.y - box!.y)).toBe(4);
  expect(Math.round(thumb!.x - box!.x)).toBe(4);
  expect(Math.round(box!.y + box!.height - (thumb!.y + thumb!.height))).toBe(4);
  const [track, line] = await off.evaluate((el) => {
    const t = el.querySelector("span")!;
    return [getComputedStyle(t).backgroundColor, getComputedStyle(el).getPropertyValue("--line").trim()];
  });
  const probe = await page.evaluate((value) => { const d = document.createElement("div"); d.style.color = value; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, line);
  expect(track).toBe(probe);
  // Ligado: o polegar anda até 4 px da borda final.
  const on = wraps.nth(1);
  const [onBox, onThumb] = [await on.boundingBox(), await on.locator("span span").first().boundingBox()];
  await expect.poll(async () => Math.round(onBox!.x + onBox!.width - ((await on.locator("span span").first().boundingBox())!.x + onThumb!.width))).toBe(4);
});

test("Input: prefixo e fonte do campo do tema, sem mudar o resto", async ({ page }) => {
  await open(page, "components-atoms-input--prefixo-e-fonte");
  const field = page.locator('[data-testid="input-measures"]');
  const [prefix, ink4] = await field.evaluate((el) => {
    const affix = el.querySelector("input")!.parentElement!.firstElementChild!;
    return [getComputedStyle(affix).color, getComputedStyle(el).getPropertyValue("--ink-4").trim()];
  });
  const probe = await page.evaluate((value) => { const d = document.createElement("div"); d.style.color = value; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, ink4);
  expect(prefix).toBe(probe);
  expect(await field.locator("input").evaluate((el) => getComputedStyle(el).fontFamily)).toBe("system-ui, sans-serif");
  expect(await field.locator("label").evaluate((el) => getComputedStyle(el).fontFamily)).not.toBe("system-ui, sans-serif");
});

test("Button: borda por variante e quebra pelo tema", async ({ page }) => {
  await open(page, "components-atoms-button--borda-e-quebra");
  const buttons = page.locator('[data-testid="button-border"] > button');
  expect(await buttons.nth(0).evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("0px");
  expect(await buttons.nth(1).evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("1px");
  // 16 + ícone 16 + gap + texto + 16, sem os 2 px de borda.
  const width = await buttons.nth(0).evaluate((el) => {
    const s = getComputedStyle(el);
    const parts = [...el.children].map((c) => c.getBoundingClientRect().width).filter((w) => w > 0);
    return { total: el.getBoundingClientRect().width, inner: parts.reduce((a, b) => a + b, 0) + parseFloat(s.columnGap) * (parts.length - 1) + parseFloat(s.paddingLeft) + parseFloat(s.paddingRight) };
  });
  expect(Math.round(width.total)).toBe(Math.round(width.inner));
  const wrap = page.getByTestId("button-wrap");
  expect(await wrap.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe("normal");
  const lines = await wrap.evaluate((el) => { const r = document.createRange(); r.selectNodeContents(el); return new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size; });
  expect(lines).toBeGreaterThan(1);
});
