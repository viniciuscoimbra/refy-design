import { expect, test } from "@playwright/test";
import { settleFamily } from "./refy-family-measurements";

test.use({ screenshot: "off", trace: "off" });

test("settlement includes the rendered frame scheduled by effect completion", async ({ page }) => {
  await page.setContent('<div data-refy-scope><div id="sample" data-phase="pending">Content</div></div>');
  const sample = page.locator("#sample");
  await sample.evaluate((element) => {
    const effect = element.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 200 });
    effect.finished.then(() => requestAnimationFrame(() => { element.setAttribute("data-phase", "ready"); }));
  });
  await settleFamily(page, sample);
  expect(await sample.getAttribute("data-phase")).toBe("ready");
});

test("settlement leaves an infinite effect running", async ({ page }) => {
  test.setTimeout(3000);
  await page.setContent('<div id="sample">Content</div>');
  const sample = page.locator("#sample");
  await sample.evaluate((element) => {
    element.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 100, iterations: Infinity });
  });
  await settleFamily(page, sample);
  expect(await sample.evaluate((element) => element.getAnimations()[0]?.playState)).toBe("running");
});
