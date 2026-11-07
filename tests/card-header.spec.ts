import { test, expect } from "@playwright/test";

test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
for (const theme of ["refy"])
  for (const mode of ["light"])
    test(`CardHeader preserva md e expõe sm — ${theme}/${mode}`, async ({
      page,
    }) => {
      await page.goto(
        `${process.env.REFY_FAMILY_STORYBOOK_URL ?? "http://127.0.0.1:6006"}/iframe.html?id=components-molecules-card--header-compacto&viewMode=story&globals=theme:${theme};mode:${mode}`,
      );
      const main = page.getByRole("heading", {
        name: "Aurora project",
        exact: true,
      });
      const compact = page.getByRole("heading", {
        name: "Team deliveries",
        exact: true,
      });
      await expect(main).toBeVisible();
      await expect(compact).toBeVisible();
      const sizes = await page.evaluate(() => {
        const headings = [...document.querySelectorAll("h3")];
        return headings.map((el) => ({
          actual: getComputedStyle(el).fontSize,
          base: getComputedStyle(el).getPropertyValue("--text-base").trim(),
          title: getComputedStyle(el)
            .getPropertyValue("--card-title-size")
            .trim(),
          fallback: getComputedStyle(el).getPropertyValue("--text-h5").trim(),
          sm: getComputedStyle(el).getPropertyValue("--card-sm-title-size").trim(),
        }));
      });
      expect(sizes[0].actual).toBe(sizes[0].title || sizes[0].fallback);
      // The compact title reads --card-sm-title-size when the theme sets it (Refy Site: 16px);
      // otherwise it falls back to --text-base.
      expect(sizes[1].actual).toBe(sizes[1].sm || sizes[1].base);
      const custom = page.getByRole("heading", {
        name: "Custom header",
        exact: true,
      });
      await expect(custom).toHaveCSS("font-size", "20px");
      await expect(
        page.getByText("Metrics provided by the public configuration.", {
          exact: true,
        }),
      ).toHaveCSS("font-size", "15px");
      const icon = custom
        .locator("xpath=../..")
        .locator('[aria-hidden="true"]');
      await expect(icon).toHaveCSS("width", "42px");
      await expect(icon.locator("svg")).toHaveCSS("width", "22px");
      await expect(main).toHaveCSS(
        "font-family",
        await compact.evaluate((el) => getComputedStyle(el).fontFamily),
      );
    });
