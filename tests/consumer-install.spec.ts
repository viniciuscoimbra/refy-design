import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
test("tarball isolado: fontes, geometria, modo e menu dentro de modal", async ({
  page,
}) => {
  test.skip(
    !process.env.REFY_CONSUMER_URL,
    "Execute com a URL do consumidor instalado fora do repo.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.REFY_CONSUMER_URL!);
  const root = page.getByTestId("consumer");
  await expect(root).toHaveAttribute("data-refy-brand", "Minha aplicação");
  await expect(root).toHaveCSS("font-family", /IBM Plex Sans/);
  expect(
    await page.evaluate(
      async () =>
        (await document.fonts.load('400 14px "IBM Plex Sans"')).length > 0,
    ),
  ).toBe(true);
  const button = root.getByRole("button", {
    name: "Review project",
    exact: true,
  });
  await expect(button).toHaveCSS("border-radius", "0px");
  await root
    .getByLabel("Project name", { exact: true })
    .fill("Projeto instalado");
  await root
    .getByRole("combobox", { name: "Owner", exact: true })
    .click();
  await page.getByRole("option", { name: "Clara Dias", exact: true }).click();
  await expect(root.getByRole("status").filter({ hasText: "Projeto instalado" })).toContainText(
    "Projeto instalado · Clara Dias",
  );
  const owner = root.getByRole("combobox", {name:"Owner",exact:true});
  await owner.press("Escape");
  await owner.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await owner.press("Escape");
  for (const mode of ["Dark", "Light", "System"]) {
    await root.getByRole("radio", { name: mode, exact: true }).click();
    if (mode !== "System")
      await expect(root).toHaveAttribute(
        "data-theme",
        mode === "Dark" ? "dark" : "light",
      );
    else {
      await page.emulateMedia({ colorScheme: "dark" });
      await expect(root).toHaveAttribute("data-theme", "dark");
    }
    await expect(button).toHaveCSS("border-radius", "0px");
    await expect(root).toHaveCSS("font-family", /IBM Plex Sans/);
  }
  await button.click();
  const modal = page.getByRole("dialog", {
    name: "Review project",
    exact: true,
  });
  await modal.getByRole("combobox", { name: "Reviewer", exact: true }).click();
  const option = modal.getByRole("option", { name: "Clara Dias", exact: true });
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
  await expect(
    modal.getByRole("combobox", { name: "Reviewer", exact: true }),
  ).toHaveValue("Clara Dias");
  await modal
    .getByRole("button", { name: "Keep editing", exact: true })
    .click();
  await expect(modal).not.toBeVisible();
  expect(errors).toEqual([]);
});
