import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
test("pacote isolado: identidade, D3, sintaxe e artigo neutro", async ({
  page,
}) => {
  test.skip(
    !process.env.REFY_CONSUMER_URL,
    "Requer consumidor limpo com ConsumerPackageFeatures.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.REFY_CONSUMER_URL!);
  const features = page.getByRole("region", { name: "Recursos do pacote" });
  const theme = features.getByTestId("theme-consumer");
  const action = theme.getByRole("button", {
    name: "Alterar identidade",
    exact: true,
  });
  for (const radius of ["0px", "18px"]) {
    await expect(action).toHaveCSS("border-radius", radius);
    await expect(theme.locator("[data-refy-field]")).toHaveCSS(
      "border-radius",
      radius,
    );
    await expect(theme).toHaveCSS(
      "font-family",
      radius === "0px" ? /IBM Plex Sans/ : /DM Sans/,
    );
    for (const mode of ["light", "dark"]) {
      await expect(theme).toHaveAttribute("data-theme", mode);
      await expect(action).toHaveCSS("border-radius", radius);
      const field = theme.getByRole("textbox", {
        name: "Campo tematizado",
        exact: true,
      });
      await field.focus();
      await expect(field).toHaveCSS("outline-style", "none");
      await expect(theme.locator("[data-refy-field]")).toHaveCSS(
        "outline-style",
        "solid",
      );
      await theme
        .getByRole("button", { name: "Alternar modo de teste", exact: true })
        .click();
    }
    if (radius === "0px") await action.click();
  }
  await expect(action).toHaveCSS("background-image", /linear-gradient/);
  await expect(
    features.getByRole("img", { name: "Série empacotada", exact: true }),
  ).toBeVisible();
  await expect(features.locator("svg path").first()).toHaveAttribute(
    "d",
    /[MLC]/,
  );
  await expect(features.locator("code", { hasText: "const exemplo = 42;" })).toBeVisible();
  expect(
    await features.locator("code span[data-syntax]").count(),
  ).toBeGreaterThan(0);
  await expect(
    features.getByRole("heading", {
      name: "How to change your product's theme",
      exact: true,
    }),
  ).toBeVisible();
  await expect(features).not.toContainText("ROI do não");
  expect(errors).toEqual([]);
});
