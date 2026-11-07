import { test, expect } from "@playwright/test";

test.use({ screenshot: "off", trace: "off" });
for (const mode of ["light", "dark"])
  for (const width of [1280, 375])
    test(`adoção real: tema, componentes, Block e D3 — ${mode}/${width}`, async ({
      page,
    }) => {
      test.skip(
        !process.env.REFY_CONSUMER_URL,
        "Requer consumidor instalado por tarball com Block exportado.",
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(process.env.REFY_CONSUMER_URL!);
      const root = page.getByTestId("consumer");
      await root
        .getByRole("radio", {
          name: mode === "dark" ? "Dark" : "Light",
          exact: true,
        })
        .click();
      await expect(root).toHaveAttribute("data-refy-brand", "Minha aplicação");
      await expect(root).toHaveAttribute("data-theme", mode);
      await expect(root).toHaveCSS("font-family", /IBM Plex Sans/);
      const action = root.getByRole("button", {
        name: "Review project",
        exact: true,
      });
      await expect(action).toHaveCSS("border-radius", "0px");
      await expect(action).toHaveCSS(
        "background-color",
        mode === "dark" ? "rgb(136, 184, 255)" : "rgb(36, 85, 182)",
      );
      const journey = root.getByRole("region", {
        name: "Jornada de adoção",
        exact: true,
      });
      const chart = journey.locator('[data-chart-type="line"]');
      const plot = chart.getByRole("img", {
        name: "Entregas do projeto",
        exact: true,
      });
      await plot.scrollIntoViewIfNeeded();
      await expect(chart.locator("path[stroke]").first()).toHaveCSS(
        "stroke",
        mode === "dark" ? "rgb(196, 181, 253)" : "rgb(124, 58, 237)",
      );
      await plot.focus();
      await expect(chart.getByRole("status")).toContainText("Planejadas");
      await plot.press("Enter");
      await expect(
        journey.getByRole("status").filter({ hasText: "Jan:" }),
      ).toContainText("Planejadas · 12");
      const legend = chart.getByRole("button", {
        name: "Planejadas",
        exact: true,
      });
      await legend.click();
      await expect(legend).toHaveAttribute("aria-pressed", "false");
      await expect(chart.locator('[data-mark^="planned-"]')).toHaveCount(0);
      await legend.click();
      await expect(chart.locator('[data-mark^="planned-"]')).toHaveCount(3);
      await chart.locator("summary").click();
      await expect(chart.getByRole("table")).toContainText("Planejadas");
      await journey
        .getByRole("button", { name: "Limpar seleção", exact: true })
        .click();
      await expect(
        journey
          .getByRole("status")
          .filter({ hasText: "Nenhum dado selecionado" }),
      ).toBeVisible();
      await journey
        .getByRole("radio", { name: "Block copiado", exact: true })
        .click();
      const block = journey.getByRole("region", {
        name: "Projects dashboard",
        exact: true,
      });
      const finish = block.getByRole("button", {
        name: "Complete Aurora project",
        exact: true,
      });
      await expect(finish).toHaveCSS("border-radius", "0px");
      await finish.click();
      await expect(finish).toBeDisabled();
      await expect(
        block.getByRole("row").filter({ hasText: "Aurora project" }),
      ).toContainText("Completed");
      await expect(block).toHaveCSS("font-family", /IBM Plex Sans/);
      const overflows = await journey.evaluate((el) =>
        [...el.querySelectorAll("h2,h3,button,input")]
          .filter((node) => {
            const r = node.getBoundingClientRect();
            return (
              !node.closest("table") &&
              r.width > 0 &&
              (r.left < -1 || r.right > innerWidth + 1)
            );
          })
          .map((el) => el.textContent),
      );
      expect(overflows).toEqual([]);
      await root.getByRole("radio", { name: "System", exact: true }).click();
      await page.emulateMedia({
        colorScheme: mode === "dark" ? "light" : "dark",
      });
      await expect(root).toHaveAttribute(
        "data-theme",
        mode === "dark" ? "light" : "dark",
      );
      await expect(finish).toBeDisabled();
      await expect(finish).toHaveCSS("border-radius", "0px");
      expect(errors).toEqual([]);
    });
