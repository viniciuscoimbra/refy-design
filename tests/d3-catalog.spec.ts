import { chooseChart } from "./chart-navigation";
import { test, expect } from "@playwright/test";
import { writeFileSync, mkdtempSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
test.use({ screenshot: "off", trace: "off" });
const types = [
  "line",
  "area",
  "bar",
  "scatter",
  "bubble",
  "histogram",
  "boxplot",
  "candlestick",
  "heatmap",
  "pie",
  "donut",
  "radial-bar",
  "gauge",
  "radar",
  "treemap",
  "pack",
  "tree",
  "cluster",
  "partition",
  "sunburst",
  "network",
  "chord",
  "sankey",
  "geo",
];
for (const mode of ["light"])
  for (const theme of ["refy-site"])
    test(`24 famílias · ${mode} · ${theme}`, async ({ page }) => {
      test.setTimeout(90000);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.route("**/*", (route) =>
        new URL(route.request().url()).hostname === "127.0.0.1"
          ? route.continue()
          : route.abort(),
      );
      await page.setViewportSize({ width: 375, height: 850 });
      await page.goto(
        `/iframe.html?id=fundamentos-playground--charts-d-3&viewMode=story&globals=theme:${theme};mode:${mode}`,
      );
      for (const type of types) {
        await chooseChart(page, type);
        const chart = page
          .getByRole("region", { name: /^Exemplo de/ })
          .locator(`[data-chart-type="${type}"]`);
        await expect(chart.locator("[role=alert]"), type).toHaveCount(0);
        const svg = chart.getByRole("img");
        await expect(svg, type).toBeVisible();
        await expect(svg).toHaveCSS(
          "font-family",
          new RegExp(
            {
              refy: "Source Sans 3",
              outline: "IBM Plex Sans",
              gradient: "DM Sans",
            }[theme]!,
          ),
        );
        await expect(page.getByTestId("playground")).toHaveAttribute(
          "data-theme",
          mode,
        );
        expect(
          await chart.locator("[data-mark]").count(),
          type,
        ).toBeGreaterThan(0);
        expect(
          await chart.locator("figcaption button").evaluateAll((buttons) =>
            buttons.every((button) => {
              const marker = button.querySelector("[data-marker]");
              if (!marker) return true;
              const b = button.getBoundingClientRect(),
                m = marker.getBoundingClientRect();
              const label = button
                .querySelector("[data-legend-label]")
                ?.getBoundingClientRect();
              if (label && label.left - m.right < 6) return false;
              return (
                m.width === 10 &&
                m.left >= b.left &&
                m.right <= b.right &&
                m.top >= b.top &&
                m.bottom <= b.bottom
              );
            }),
          ),
          type,
        ).toBe(true);
        const cropped = await svg.evaluate((plot) =>
          [...plot.querySelectorAll("text")]
            .filter((label) => {
              const rect = label.getBoundingClientRect(),
                bounds = plot.getBoundingClientRect();
              return (
                rect.width > 0 &&
                (rect.left < bounds.left - 1 ||
                  rect.right > bounds.right + 1 ||
                  rect.top < bounds.top - 1 ||
                  rect.bottom > bounds.bottom + 1)
              );
            })
            .map((label) => label.textContent),
        );
        expect(cropped, type).toEqual([]);
        expect(
          await svg.evaluate((el) => !/NaN|Infinity/.test(el.innerHTML)),
          type,
        ).toBe(true);
        await svg.focus();
        await page.keyboard.press("End");
        await expect(chart.getByRole("status")).toBeVisible();
        await page.keyboard.press("Enter");
        await expect(page.getByText(/^Selecionado:/), type).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(chart.getByRole("status")).toHaveCount(0);
        await chart.locator("summary").click();
        await expect(chart.getByRole("table")).toBeVisible();
        await chart.locator("summary").click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          type,
        ).toBe(true);
      }
      expect(errors).toEqual([]);
    });
test("opções, legendas, código público e configurações refletem a prévia", async ({
  page,
  browserName,
}) => {
  test.setTimeout(90000);
  test.skip(
    browserName !== "chromium",
    "A compilação é independente do navegador.",
  );
  await page.goto(
    "/iframe.html?id=fundamentos-playground--charts-d-3&viewMode=story",
  );
  await chooseChart(page, "area");
  const chart = page
    .getByRole("region", { name: /^Exemplo de/ })
    .locator("[data-chart-type=area]");
  await page.getByRole("switch", { name: "Eixo Y", exact: true }).uncheck();
  await expect(chart.locator("[data-axis=y]")).toHaveCount(0);
  await page.getByLabel("Curva", { exact: true }).selectOption("linear");
  await page
    .getByLabel("Composição das séries", { exact: true })
    .selectOption("percent");
  await page
    .getByLabel("Posição da legenda", { exact: true })
    .selectOption("top");
  await expect(chart.locator("[data-axis=y]")).toHaveCount(0);
  await page.getByRole("switch", { name: "Eixo Y", exact: true }).check();
  await expect(chart.locator("[data-axis=y]")).toContainText("%");
  const desktop = chart.getByRole("button", { name: "Desktop", exact: true });
  await desktop.click();
  await expect(desktop).toHaveAttribute("aria-pressed", "false");
  await expect(chart.locator('[data-mark^="desktop-"]')).toHaveCount(0);
  await desktop.click();
  await page
    .getByLabel("Formato dos valores", { exact: true })
    .selectOption("compact");
  const temp = mkdtempSync(join(tmpdir(), "refy-d3-code-"));
  try {
    for (const [i, type] of types.entries()) {
      await chooseChart(page, type);
      await page.getByRole("radio", { name: "Código", exact: true }).click();
      const source = await page
        .getByRole("region", { name: /Exemplo de/ })
        .locator("pre code")
        .innerText();
      expect(source).toContain("from '@refy-design/web'");
      writeFileSync(join(temp, `chart-${i}.tsx`), source);
      await page.getByRole("radio", { name: "Prévia", exact: true }).click();
    }
    await chooseChart(page, "streaming");
    const live = page.getByRole("region", {
      name: "Zoom, brush e streaming",
      exact: true,
    });
    await live
      .getByRole("radio", { name: "Código do streaming", exact: true })
      .click();
    writeFileSync(
      join(temp, "stream.tsx"),
      await live.locator("pre code").innerText(),
    );
    symlinkSync(resolve("node_modules"), join(temp, "node_modules"), "dir");
    writeFileSync(
      join(temp, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          strict: true,
          jsx: "react-jsx",
          module: "ESNext",
          moduleResolution: "Bundler",
          target: "ES2020",
          skipLibCheck: true,
          noEmit: true,
          paths: { "@refy-design/web": [resolve("dist/index.d.ts")] },
        },
        include: ["*.tsx"],
      }),
    );
    execFileSync(
      resolve("node_modules/.bin/tsc"),
      ["-p", join(temp, "tsconfig.json")],
      { stdio: "pipe" },
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
test("inválidos, vazios, negativos, zeros, datas e extensões", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    "/iframe.html?id=verification-d3-contracts--entradas&viewMode=story",
  );
  const chart = page.locator("figure");
  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Caso${i}`, { exact: true })).toBeVisible();
    if (i < 5) await expect(chart.getByRole("alert")).toBeVisible();
    else {
      await expect(chart.getByRole("alert")).toHaveCount(0);
      expect(
        await chart
          .locator("svg")
          .evaluate((el) => !/NaN|Infinity/.test(el.innerHTML)),
      ).toBe(true);
      if (i > 5) {
        await expect(chart.locator("[data-mark]").first()).toBeAttached();
        await chart.getByRole("img").focus();
        await page.keyboard.press("End");
        await expect(chart.getByRole("status")).toBeVisible();
      }
    }
    if (i === 9) {
      await expect(chart.getByTestId("custom-overlay")).toBeVisible();
      await expect(chart.getByText(/^Customizado:/)).toBeVisible();
    }
    await page.getByRole("button", { name: "Próximo caso" }).click();
  }
  expect(errors).toEqual([]);
});

test.describe("toque", () => {
  test.use({
    hasTouch: true,
    viewport: { width: 375, height: 850 },
    reducedMotion: "reduce",
  });
  test("toque seleciona sem hover prévio e tooltip pode ser desligado", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=fundamentos-playground--charts-d-3&viewMode=story&globals=theme:refy;mode:dark",
    );
    const chart = page
      .getByRole("region", { name: /^Exemplo de/ })
      .locator("[data-chart-type=area]");
    const svg = chart.getByRole("img");
    await svg.tap({ position: { x: 120, y: 100 } });
    await expect(page.getByText(/^Selecionado:/)).toBeVisible();
    await expect(chart.getByRole("status")).toBeVisible();
    await page.getByRole("switch", { name: "Tooltip", exact: true }).uncheck();
    await svg.tap({ position: { x: 180, y: 140 } });
    await expect(chart.getByRole("status")).toHaveCount(0);
    expect(await chart.locator("[data-mark]").count()).toBeGreaterThan(0);
  });
});
