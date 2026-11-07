import { test, expect, type Locator } from "@playwright/test";

test.use({ screenshot: "off", trace: "off" });

async function reachable(target: Locator) {
  await expect(target).toBeVisible();
  await expect
    .poll(() =>
      target.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    )
    .toBe(true);
}

for (const mode of ["Light", "Dark", "System"]) {
  test(`consumidor isolado: modal/drawer, menu, seleção e foco — ${mode}`, async ({
    page,
  }) => {
    test.skip(
      !process.env.REFY_CONSUMER_URL,
      "Requer consumidor instalado com ConsumerOverlays.tsx.",
    );
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(process.env.REFY_CONSUMER_URL!);
    const root = page.getByTestId("consumer");
    await root.getByRole("radio", { name: mode, exact: true }).click();
    await expect(root).toHaveAttribute(
      "data-theme",
      mode === "Light" ? "light" : "dark",
    );
    const carousel = page.getByRole("region", {
      name: "Verificação de conteúdo inativo",
      exact: true,
    });
    const inactive = carousel.locator('[aria-roledescription="slide"]').nth(1);
    await expect(inactive).toHaveAttribute("inert");
    expect(
      await inactive.evaluate((el) => {
        const control = el.querySelector("button")!;
        control.focus();
        return document.activeElement === control;
      }),
    ).toBe(false);
    await carousel
      .getByRole("button", { name: "Next item", exact: true })
      .click();
    await expect(inactive).not.toHaveAttribute("inert");
    expect(
      await inactive.evaluate((el) => {
        const control = el.querySelector("button")!;
        control.focus();
        return document.activeElement === control;
      }),
    ).toBe(true);
    for (const kind of ["modal", "drawer"]) {
      const trigger = root.getByRole("button", {
        name: `Testar ${kind}`,
        exact: true,
      });
      await trigger.click();
      const panel = page.getByRole("dialog", {
        name: `${kind === "modal" ? "Modal" : "Drawer"} de compatibilidade`,
        exact: true,
      });
      await expect(panel).toBeVisible();
      await expect(panel).toHaveCSS(
        "background-color",
        mode === "Light" ? "rgb(255, 255, 255)" : "rgb(21, 24, 33)",
      );
      await expect(panel).toHaveCSS("font-family", /IBM Plex Sans/);
      const picker = panel.getByRole("combobox", {
        name: "Pessoa revisora",
        exact: true,
      });
      await picker.click();
      const option = panel.getByRole("option", {
        name: "Clara Dias",
        exact: true,
      });
      await reachable(option);
      await option.click();
      await expect(picker).toHaveValue("Clara Dias");
      await expect(panel.getByRole("listbox")).not.toBeVisible();
      await picker.click();
      await expect(panel.getByRole("listbox")).toBeVisible();
      await picker.press("Escape");
      await expect(panel.getByRole("listbox")).not.toBeVisible();
      await expect(panel).toBeVisible();
      const action = panel.getByRole("button", {
        name: "Ações de revisão",
        exact: true,
      });
      await action.click();
      const menu = page.getByRole("menu", {
        name: "Ações de compatibilidade",
        exact: true,
      });
      const item = menu.getByRole("menuitem", {
        name: "Confirmar revisão",
        exact: true,
      });
      await reachable(item);
      await expect(menu).toHaveCSS("font-family", /IBM Plex Sans/);
      await expect(menu).toHaveCSS(
        "background-color",
        mode === "Light" ? "rgb(255, 255, 255)" : "rgb(21, 24, 33)",
      );
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
      await expect(action).toBeFocused();
      await expect(panel).toBeVisible();
      await action.click();
      await item.click();
      await expect(panel.getByRole("status")).toHaveText("Revisão confirmada");
      await page.keyboard.press("Escape");
      await expect(panel).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
    expect(errors).toEqual([]);
  });
}
