import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
for (const surface of ["modal", "drawer"])
  test(`${surface}: mover aviso não reinicia a entrada`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=verificacao-contratos-essenciais--camadas&viewMode=story&args=mode:editorial;surface:${surface};before:true`,
    );
    const notice = page.getByRole("status");
    await notice.evaluate((el) =>
      Promise.all(el.getAnimations().map((animation) => animation.finished)),
    );
    await page
      .getByRole("button", { name: "Abrir fluxo", exact: true })
      .click();
    await expect
      .poll(() => notice.evaluate((el) => !!el.closest("[aria-modal=true]")))
      .toBe(true);
    const animations = await notice.evaluate((el) =>
      el
        .getAnimations()
        .map((a) => ({
          name: (a as CSSAnimation).animationName,
          state: a.playState,
          time: a.currentTime,
        })),
    );
    expect(animations.filter((a) => a.state !== "finished")).toEqual([]);
  });
