import { test, expect, type Page } from "@playwright/test";

// TYPE-02 (align-range-label-tokens): o rótulo de Range e Slider é o rótulo de campo.
test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
const base = process.env.REFY_FAMILY_STORYBOOK_URL ?? `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`;
const keys = ["fontFamily", "fontSize", "fontWeight", "textTransform", "letterSpacing", "color"] as const;
async function label(page: Page, id: string, theme: string, selector: string, transform?: string) {
  await page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};mode:light`);
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  return el.evaluate((node, [names, value]) => {
    if (value) node.parentElement!.style.setProperty("--field-label-transform", value as string);
    const s = getComputedStyle(node);
    return Object.fromEntries((names as string[]).map((k) => [k, s[k as keyof CSSStyleDeclaration]]));
  }, [keys as unknown as string[], transform ?? ""] as const);
}

for (const theme of ["refy-site", "cobalto"])
  for (const transform of [undefined, "none", "uppercase"])
    test(`Range e Slider têm o rótulo do Input — tema ${theme}${transform ? `, --field-label-transform: ${transform}` : ""}`, async ({ page }) => {
      const input = await label(page, "components-atoms-input--input-padrao", theme, "label", transform);
      const range = await label(page, "components-atoms-range--playground", theme, '[id$="-label"]', transform);
      const slider = await label(page, "components-atoms-slider--playground", theme, '[id$="-label"]', transform);
      expect(range).toEqual(input);
      expect(slider).toEqual(input);
      if (transform) expect(range.textTransform).toBe(transform);
    });
