import { chooseChart } from "./chart-navigation";
import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
for (const mode of ["light"])
  test(`zoom, brush, controles e opções · ${mode}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 375, height: 850 });
    await page.goto(
      `/iframe.html?id=fundamentos-playground--charts-d-3&viewMode=story&globals=theme:refy;mode:${mode}`,
    );
    const example = page.getByRole("region", { name: /^Exemplo de/ });
    await page.getByRole("switch", { name: "Zoom e pan", exact: true }).check();
    await page
      .getByRole("switch", { name: "Brush de intervalo", exact: true })
      .check();
    await example.getByRole("button", { name: "Zoom in" }).click();
    await expect(example.getByText("1.5×", { exact: true })).toBeVisible();
    const first = await example
      .locator("[data-mark]")
      .first()
      .locator("circle")
      .getAttribute("cx");
    await example.getByRole("button", { name: "Next", exact: true }).click();
    expect(
      await example
        .locator("[data-mark]")
        .first()
        .locator("circle")
        .getAttribute("cx"),
    ).not.toBe(first);
    const low = example.getByRole("slider", {
      name: "Visible range — minimum",
      exact: true,
    });
    await low.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(low).not.toHaveAttribute("aria-valuenow", "0");
    await example.getByRole("button", { name: "Clear range" }).click();
    await expect(low).toHaveAttribute("aria-valuenow", "0");
    const brush = example.locator("g .overlay");
    await expect(brush).toBeVisible();
    const box = await brush.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width * 0.2, box!.y + 20);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.7, box!.y + 20, { steps: 8 });
    await page.mouse.up();
    await expect(low).not.toHaveAttribute("aria-valuenow", "0");
    const before = await low.getAttribute("aria-valuenow");
    await page.setViewportSize({ width: 1000, height: 850 });
    await expect.poll(async () => Number(await low.getAttribute("aria-valuenow"))).toBeCloseTo(Number(before),8);
    await example.getByRole("button", { name: "Reset view" }).click();
    await expect(example.getByText("1.0×", { exact: true })).toBeVisible();
    const plot = example.locator("[data-chart-type] svg[role=img]").first();
    await plot.hover();
    const yBefore = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 100);
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(yBefore);
    await expect(example.getByText("1.0×", { exact: true })).toBeVisible();
    await plot.hover();
    await page.keyboard.down("Control");
    await page.mouse.wheel(0, -80);
    await page.keyboard.up("Control");
    await expect(example.getByText("1.0×", { exact: true })).toHaveCount(0);
    await example.getByRole("button", { name: "Reset view" }).click();
    await chooseChart(page, "pie");
    await expect(page.getByRole("switch", { name: "Zoom e pan" })).toHaveCount(
      0,
    );
    const radius = page.getByRole("slider", {
      name: "Raio interno",
      exact: true,
    });
    await expect(radius).toHaveAttribute("aria-valuenow", "0");
    const gap = page.getByRole("slider", {
      name: "Espaço entre setores",
      exact: true,
    });
    await expect(gap).toHaveAttribute("aria-valuenow", "0");
    const path = await example
      .locator("[data-mark] path")
      .first()
      .getAttribute("d");
    await gap.focus();
    await page.keyboard.press("ArrowRight");
    expect(
      await example.locator("[data-mark] path").first().getAttribute("d"),
    ).not.toBe(path);
    await page
      .getByRole("switch", { name: "Legenda interativa", exact: true })
      .uncheck();
    await expect(
      example.getByRole("button", { name: "Busca", exact: true }),
    ).toHaveCount(0);

    await chooseChart(page, "geo");
    await page.getByLabel("Projeção geográfica").selectOption("equal-earth");
    await expect(
      page.getByRole("slider", { name: "Espaço entre setores" }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
test("buffer, erro atômico, pausa, modo e cleanup da origem", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=verification-chart-exploration--fonte-controlada&viewMode=story",
  );
  const chart = page.locator("[data-chart-type=line]");
  await expect(page.getByTestId("subscriptions")).toHaveText("Assinaturas:1");
  for (let i = 0; i < 8; i++)
    await page
      .getByRole("button", { name: "Receber ponto", exact: true })
      .click();
  expect(await chart.locator("[data-mark]").count()).toBe(5);
  const ids = await chart
    .locator("[data-mark]")
    .evaluateAll((nodes) => nodes.map((n) => n.innerHTML));
  await page.getByRole("button", { name: "Lote inválido" }).click();
  await expect(chart.getByRole("alert")).toBeVisible();
  expect(
    await chart
      .locator("[data-mark]")
      .evaluateAll((nodes) => nodes.map((n) => n.innerHTML)),
  ).toEqual(ids);
  await page.getByRole("button", { name: "Pausar origem" }).click();
  await expect(page.getByTestId("subscriptions")).toHaveText("Assinaturas:0");
  await page
    .getByRole("button", { name: "Receber ponto", exact: true })
    .click();
  expect(await chart.locator("[data-mark]").count()).toBe(5);
  await page.getByRole("button", { name: "Trocar modo" }).click();
  expect(await chart.locator("[data-mark]").count()).toBe(5);
  await page.getByRole("button", { name: "Pausar origem" }).click();
  await expect(page.getByTestId("subscriptions")).toHaveText("Assinaturas:1");
  await page
    .getByRole("button", { name: "Receber ponto", exact: true })
    .click();
  await expect(chart.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Montar ou remover" }).click();
  await expect(page.getByTestId("subscriptions")).toHaveText("Assinaturas:0");
});
test("demonstração de streaming avança, pausa e retoma sem acumular", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto(
    "/iframe.html?id=fundamentos-playground--charts-d-3&viewMode=story&globals=theme:refy;mode:dark",
  );
  await chooseChart(page, "streaming");
  const live = page.getByRole("region", {
    name: "Zoom, brush e streaming",
    exact: true,
  });
  const marks = live.locator("[data-mark]");
  await expect(marks).toHaveCount(48);
  await live.getByRole("button", { name: "Retomar dados" }).click();
  await page.clock.runFor(15000);
  await expect(marks).toHaveCount(80);
  const latest = await marks.last().innerHTML();
  await live.getByRole("button", { name: "Pausar dados" }).click();
  await page.clock.runFor(3000);
  expect(await marks.last().innerHTML()).toBe(latest);
  await live.getByRole("button", { name: "Retomar dados" }).click();
  await page.clock.runFor(1200);
  expect(await marks.last().innerHTML()).not.toBe(latest);
  await chooseChart(page, "area");
  await expect(
    page.getByRole("region", { name: "Zoom, brush e streaming", exact: true }),
  ).toHaveCount(0);
});
