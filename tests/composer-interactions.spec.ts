import { test, expect } from "@playwright/test";
import { componentUrl, storyRoot } from "./support/component";
test.use({ screenshot: "off", trace: "off" });
const base = (theme: string, mode: string) => componentUrl("IntentComposer", mode, theme);
for (const theme of ["refy"])
  for (const mode of ["light"])
    test(`${theme}/${mode}: indicador, sobreposição e sugestões`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.setViewportSize({ width: 1280, height: 1000 });
      await page.goto(base(theme, mode));
      await page.evaluate(() => document.fonts.ready);
      const demo = page.locator(storyRoot);
      const operation = demo.getByRole("radiogroup", {
        name: "Operation",
        exact: true,
      });
      const indicator = operation.locator("[aria-hidden=true]");
      await indicator.evaluate((el) =>
        Promise.allSettled(el.getAnimations().map((a) => a.finished)),
      );
      await operation.evaluate((el) =>
        el.addEventListener("transitionrun", (event) => {
          el.setAttribute(
            "data-motion-ran",
            `${el.getAttribute("data-motion-ran") || ""} ${(event as TransitionEvent).propertyName}`,
          );
        }),
      );
      await operation
        .getByRole("radio", { name: "Organize", exact: true })
        .click();
      await expect
        .poll(() => operation.getAttribute("data-motion-ran"))
        .toContain("transform");
      await indicator.evaluate((el) =>
        Promise.allSettled(el.getAnimations().map((a) => a.finished)),
      );
      const aligned = await operation.evaluate((el) => {
        const selected = el
          .querySelector("[aria-checked=true]")!
          .getBoundingClientRect();
        const white = el
          .querySelector("[aria-hidden=true]")!
          .getBoundingClientRect();
        return Math.max(
          Math.abs(selected.left - white.left),
          Math.abs(selected.width - white.width),
        );
      });
      expect(aligned).toBeLessThanOrEqual(1);
      await operation
        .getByRole("radio", { name: "Organize", exact: true })
        .press("ArrowLeft");
      await expect(
        operation.getByRole("radio", { name: "Create", exact: true }),
      ).toBeChecked();
      for (const width of [375, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        const input = demo.getByRole("combobox", {
          name: "Format",
          exact: true,
        });
        const text = demo.getByRole("textbox");
        const before = await text.evaluate(
          (el) => el.getBoundingClientRect().top,
        );
        await input.click();
        const list = demo.getByRole("listbox");
        await expect(list).toBeVisible();
        expect(
          await text.evaluate((el) => el.getBoundingClientRect().top),
        ).toBeCloseTo(before, 0);
        const option = list.getByRole("option", { name: "Video", exact: true });
        await expect
          .poll(() =>
            option.evaluate((el) => {
              const r = el.getBoundingClientRect();
              return el.contains(
                document.elementFromPoint(
                  r.x + r.width / 2,
                  r.y + r.height / 2,
                ),
              );
            }),
          )
          .toBe(true);
        const wasSelected =
          (await option.getAttribute("aria-selected")) === "true";
        await option.click();
        await expect(option).toHaveAttribute(
          "aria-selected",
          String(!wasSelected),
        );
        await input.press("Escape");
        const suggestions = demo.getByLabel("Request examples", {
          exact: true,
        });
        const last = suggestions.getByRole("button").last();
        await last.focus();
        if (width === 375)
          await expect
            .poll(() => suggestions.evaluate((el) => el.scrollLeft))
            .toBeGreaterThan(0);
        const voice = demo.getByRole("button", {
          name: "Describe by voice",
          exact: true,
        });
        const boundary = await suggestions.evaluate(
          (el) => el.getBoundingClientRect().right,
        );
        expect(boundary).toBeLessThanOrEqual(
          await voice.evaluate((el) => el.getBoundingClientRect().left),
        );
        expect(
          await voice.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            );
          }),
        ).toBe(true);
      }
    });
for (const mode of ["light"])
  test(`${mode}: contador depende do espaço, sem chips cortados`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=components-molecules-multiselect--playground&viewMode=story&globals=theme:refy;mode:${mode}`,
    );
    const count = () =>
      page.locator("[data-selection-chip]:not([aria-hidden=true])").count();
    await page.setViewportSize({ width: 600, height: 900 });
    await expect(page.getByRole("combobox")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const wide = await count();
    await page.setViewportSize({ width: 200, height: 900 });
    await expect.poll(count).toBeLessThan(wide);
    const narrow = await count();
    await expect(page.locator("[data-selection-overflow]")).toHaveText(
      `+${6 - narrow}`,
    );
    expect(
      await page
        .locator("[data-selection-chip]:not([aria-hidden=true]) > span")
        .evaluateAll((nodes) =>
          nodes.every((el) => el.scrollWidth <= el.clientWidth),
        ),
    ).toBe(true);
    await page.getByRole("combobox").fill("Performance");
    await expect(
      page.getByRole("option", { name: "Performance", exact: true }),
    ).toBeVisible();
    await page.getByRole("combobox").fill("");
    await page.setViewportSize({ width: 600, height: 900 });
    await expect.poll(count).toBe(wide);
    const largeCounter = await page.addStyleTag({
      content:
        "[data-selection-overflow], [data-selection-counter-measure] { font-size: 160px !important; }",
    });
    await expect.poll(count).toBeLessThan(wide);
    await largeCounter.evaluate((el) => el.remove());
    await expect.poll(count).toBe(wide);
  });
for (const mode of ["light"])
  for (const surface of ["modal", "drawer"])
    test(`${mode}/${surface}: opções acima do diálogo e Escape em duas etapas`, async ({
      page,
    }) => {
      await page.goto(
        `/iframe.html?id=verificacao-contratos-essenciais--movimento&viewMode=story&globals=theme:refy;mode:${mode}`,
      );
      await page
        .getByRole("button", {
          name: `Abrir ${surface} de movimento`,
          exact: true,
        })
        .click();
      const dialog = page.getByRole("dialog");
      const field = dialog.getByRole("combobox", {
        name: "Materiais",
        exact: true,
      });
      await field.click();
      const option = dialog.getByRole("option", { name: "Vídeo", exact: true });
      await expect(option).toBeVisible();
      await expect
        .poll(() =>
          option.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            );
          }),
        )
        .toBe(true);
      await option.click();
      await expect(option).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Escape");
      await expect(field).toHaveAttribute("aria-expanded", "false");
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
    });
test("reduzir movimento remove a transição do indicador", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base("refy", "light"));
  const operation = page
    .locator(storyRoot)
    .getByRole("radiogroup", { name: "Operation", exact: true });
  await operation
    .getByRole("radio", { name: "Organize", exact: true })
    .click();
  expect(
    await operation
      .locator("[aria-hidden=true]")
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration)),
  ).toBeLessThan(0.001);
});
