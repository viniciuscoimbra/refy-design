import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });

for (const theme of ["refy"])
  for (const mode of ["light"]) {
    test(`${theme}/${mode}: Chip compartilhado e contorno contínuo nas duas direções`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 729, height: 900 });
      await page.goto(
        `/iframe.html?id=components-molecules-multiselect--sobreposto&viewMode=story&globals=theme:${theme};mode:${mode}`,
      );
      const input = page.getByRole("combobox");
      const frame = page.locator("[data-refy-field]");
      await frame.evaluate((el) =>
        Object.assign((el as HTMLElement).style, {
          position: "fixed",
          top: "60px",
          left: "40px",
          width: "260px",
        }),
      );
      const counter = frame.locator("[data-selection-overflow]");
      await expect(counter).toBeVisible();
      const chip = frame
        .locator("[data-selection-chip]:not([aria-hidden=true])")
        .first();
      const appearance = (el: HTMLElement) => {
        const s = getComputedStyle(el);
        return [
          el.tagName,
          s.height,
          s.backgroundColor,
          s.color,
          s.fontFamily,
          s.fontSize,
          s.borderRadius,
          s.borderWidth,
        ];
      };
      expect(await counter.evaluate(appearance)).toEqual(
        await chip.evaluate(appearance),
      );
      await expect(counter).not.toHaveAttribute("aria-pressed");
      await counter.click();
      const list = page.getByRole("listbox");
      for (const side of ["bottom", "top"]) {
        if (side === "top")
          await frame.evaluate((el) =>
            Object.assign((el as HTMLElement).style, {
              top: "auto",
              bottom: "8px",
            }),
          );
        if (side === "top")
          await page.setViewportSize({ width: 729, height: 800 });
        await expect(list).toHaveAttribute("data-side", side);
        await expect
          .poll(async () =>
            list.evaluate((el) => {
              const list = el.getBoundingClientRect(),
                f = el.parentElement!.getBoundingClientRect();
              return el.getAttribute("data-side") === "bottom"
                ? Math.abs(list.top - f.bottom)
                : Math.abs(list.bottom - f.top);
            }),
          )
          .toBeLessThan(1);
        const style = await list.evaluate((el) => {
          const s = getComputedStyle(el),
            f = getComputedStyle(el.parentElement!);
          return {
            outline: s.outlineStyle,
            frameOutline: f.outlineStyle,
            border: s.borderLeftWidth,
            frameBorder: f.borderLeftWidth,
            color: s.borderLeftColor,
            frameColor: f.borderLeftColor,
            join:
              el.getAttribute("data-side") === "bottom"
                ? s.borderTopWidth
                : s.borderBottomWidth,
          };
        });
        expect(style).toMatchObject({
          outline: "none",
          frameOutline: "none",
          join: "0px",
          border: style.frameBorder,
          color: style.frameColor,
        });
      }
      await input.press("Escape");
      await expect(list).not.toBeVisible();
      const removed = await chip.getAttribute("aria-label");
      await chip.focus();
      await chip.press("Enter");
      await expect(
        frame.getByRole("button", { name: removed!, exact: true }),
      ).toHaveCount(0);
      await expect(input).toBeFocused();
      await input.press("ArrowDown");
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.goto(
        `/iframe.html?id=components-molecules-multiselect--sobreposto&viewMode=story&globals=theme:${theme};mode:${mode}&args=error:Selecione mais`,
      );
      await page.getByRole("combobox").click();
      await expect(page.getByRole("combobox")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      const errorColors = await page.getByRole("listbox").evaluate((el) => ({
        list: getComputedStyle(el).borderLeftColor,
        field: getComputedStyle(el.parentElement!).borderLeftColor,
      }));
      expect(errorColors.list).toBe(errorColors.field);
    });
  }
