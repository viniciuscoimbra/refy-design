import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
for (const mode of ["light"])
  for (const width of [1280, 390])
    test(`Command largo e busca na descrição — ${mode}/${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `${process.env.REFY_FAMILY_STORYBOOK_URL ?? "http://127.0.0.1:6006"}/iframe.html?id=components-organisms-command--com-descricoes&viewMode=story&globals=theme:refy-site;mode:${mode}`,
      );
      const trigger = page.getByRole("button", {
        name: "Search components",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
        name: "Command palette",
        exact: true,
      });
      await expect(dialog).toBeVisible();
      const measured = await dialog.evaluate(
        (el) => el.getBoundingClientRect().width,
      );
      if (width === 1280) expect(measured).toBe(760);
      else expect(measured).toBeLessThanOrEqual(width);
      const search = dialog.getByRole("combobox");
      await expect(search).toBeFocused();
      await search.fill("export to your");
      await expect(dialog.getByRole("option")).toHaveCount(1);
      await expect(dialog.getByRole("option")).toContainText("Themes");
      await search.press("Enter");
      await expect(dialog).toBeHidden();
      await expect(page.getByRole("status")).toHaveText("Themes");
      await expect(trigger).toBeFocused();
    });
