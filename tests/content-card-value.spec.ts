import { test, expect } from "@playwright/test";

// CARD-VAL-01 (fix-content-card-value-suffix): o sufixo do valor quebra inteiro.
test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
const base = process.env.REFY_FAMILY_STORYBOOK_URL ?? `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`;

test("sufixo curto fica na linha do valor, longo desce inteiro, valor longo não rola", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(`${base}/iframe.html?id=components-organisms-propertycard--sufixo-do-valor&viewMode=story&globals=theme:refy-site;mode:light`);
  const prices = page.locator("p").filter({ has: page.locator("small") });
  await expect(prices).toHaveCount(5);
  const rows = await prices.evaluateAll((list) =>
    list.map((p) => {
      const amount = p.firstElementChild!.getBoundingClientRect();
      const small = p.querySelector("small")!;
      const rects = [...small.getClientRects()];
      const range = document.createRange();
      range.selectNodeContents(small);
      const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size;
      const card = p.closest("article") ?? p.parentElement!;
      return {
        suffix: small.textContent,
        sameLine: rects[0].top < amount.bottom - 1 && rects[0].left > amount.right - 1,
        below: rects[0].top >= amount.bottom - 1,
        leftAligned: Math.abs(rects[0].left - amount.left) < 1,
        lines,
        overflow: card.scrollWidth - card.clientWidth,
        width: Math.round(p.getBoundingClientRect().width),
      };
    }),
  );
  const [short, long, huge, list, deck] = rows;
  expect(short).toMatchObject({ suffix: "/month", sameLine: true });
  expect(long).toMatchObject({ suffix: "+ $ 620 condo fee", sameLine: false, below: true, leftAligned: true, lines: 1 });
  expect(huge).toMatchObject({ below: true, leftAligned: true });
  for (const row of rows) expect(row.overflow, row.suffix!).toBeLessThanOrEqual(0);
  for (const row of [list, deck]) expect(row.lines, row.suffix!).toBe(1);
  if (process.env.REFY_CAPTURE) await page.locator("#storybook-root").screenshot({ path: process.env.REFY_CAPTURE });
});
