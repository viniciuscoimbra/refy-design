import { test, expect, type Locator } from "@playwright/test";

test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
const properties = [
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "padding",
  "height",
  "border-radius",
  "border-width",
  "border-color",
  "color",
  "background-color",
  "background-image",
  "box-shadow",
];
async function appearance(element: Locator) {
  return element.evaluate((node, keys) => {
    const style = getComputedStyle(node);
    return Object.fromEntries(
      keys.map((key) => [key, style.getPropertyValue(key)]),
    );
  }, properties);
}
for (const mode of ["light", "dark"])
  for (const width of [390, 800])
    test(`tema público no pacote: exportação, nome, fallback e portais — ${mode}/${width}`, async ({
      page,
    }) => {
      test.skip(
        !process.env.REFY_CONSUMER_URL,
        "Requer build de consumidor isolado com site.html.",
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${process.env.REFY_CONSUMER_URL}/site.html`);
      const root = page.getByTestId("site-consumer");
      await root
        .getByRole("radio", {
          name: mode === "dark" ? "Dark" : "Light",
          exact: true,
        })
        .click();
      await expect(root).toHaveAttribute("data-theme", mode);
      expect(
        await page.evaluate(
          async () =>
            (await document.fonts.load('400 16px "Inter"')).length,
        ),
      ).toBeGreaterThan(0);
      expect(
        await page.evaluate(
          async () => (await document.fonts.load('600 24px "Manrope"')).length,
        ),
      ).toBeGreaterThan(0);
      await root
        .getByLabel("Projeto do tema", { exact: true })
        .fill("Estado entre identidades");
      const controls = {
        action: root.getByRole("button", {
          name: "Ação portátil",
          exact: true,
        }),
        field: root
          .getByLabel("Projeto do tema", { exact: true })
          .locator("xpath=.."),
        card: root.getByTestId("site-card"),
        heading: root.getByRole("heading", {
          name: "Configuração transportável",
          exact: true,
        }),
        accordion: root.getByRole("button", {
          name: "Como o tema funciona?",
          exact: true,
        }),
        chip: root.getByRole("button", { name: "Selecionado", exact: true }),
      };
      await controls.action.focus();
      const reference: Record<string, Record<string, string>> = {};
      for (const [key, node] of Object.entries(controls))
        reference[key] = await appearance(node);
      await root.getByLabel("Projeto do tema", { exact: true }).focus();
      const fieldFocus = await appearance(controls.field);
      for (const label of ["JSON reimportado", "Nome independente"]) {
        await root.getByRole("radio", { name: label, exact: true }).click();
        await expect(
          root.getByLabel("Projeto do tema", { exact: true }),
        ).toHaveValue("Estado entre identidades");
        await controls.action.focus();
        for (const [key, node] of Object.entries(controls))
          await expect
            .poll(() => appearance(node), { message: `${label}/${key}` })
            .toEqual(reference[key]);
        await root.getByLabel("Projeto do tema", { exact: true }).focus();
        await expect.poll(() => appearance(controls.field)).toEqual(fieldFocus);
      }
      await expect(root).toHaveAttribute(
        "data-refy-brand",
        "Identidade independente",
      );
      for (const surface of ["modal", "drawer"]) {
        const trigger = root.getByRole("button", {
          name: `Abrir ${surface} portátil`,
          exact: true,
        });
        await trigger.click();
        const dialog = root.getByRole("dialog", {
          name: `${surface === "modal" ? "Modal" : "Drawer"} do tema portátil`,
          exact: true,
        });
        await expect(dialog).toBeVisible();
        await dialog
          .getByRole("combobox", {
            name: "Pessoa revisora do tema",
            exact: true,
          })
          .click();
        const option = root.getByRole("option", {
          name: "Clara Dias",
          exact: true,
        });
        await expect(option).toBeVisible();
        await expect(option).toHaveCSS("font-family", /Inter/);
        await expect
          .poll(() =>
            option.evaluate((node) =>
              node.closest("[data-theme]")?.getAttribute("data-theme"),
            ),
          )
          .toBe(mode);
        await option.click();
        await dialog
          .getByRole("button", { name: "Abrir ações do tema", exact: true })
          .click();
        const menu = root.getByRole("menu", {
          name: "Ações do tema portátil",
          exact: true,
        });
        await expect(menu).toBeVisible();
        await expect(menu).toHaveCSS("font-family", /Inter/);
        await menu
          .getByRole("menuitem", { name: "Confirmar tema", exact: true })
          .click();
        await expect(dialog.getByRole("status")).toHaveText("Tema confirmado");
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
      }
      await root
        .getByRole("radio", { name: "Refy original", exact: true })
        .click();
      await expect(root).toHaveAttribute("data-refy-brand", "Refy original");
      await expect(
        root.getByLabel("Projeto do tema", { exact: true }),
      ).toHaveValue("Estado entre identidades");
      await expect(controls.action).toHaveCSS("height", "34px");
      expect(await appearance(controls.action)).not.toEqual(reference.action);
      await root
        .getByRole("radio", { name: "Preset público", exact: true })
        .click();
      await controls.action.focus();
      for (const [key, node] of Object.entries(controls))
        await expect
          .poll(() => appearance(node), { message: `preset restored/${key}` })
          .toEqual(reference[key]);
      expect(
        await root.evaluate((node) => node.scrollWidth <= innerWidth),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
