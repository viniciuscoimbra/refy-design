import { test, expect, type Page } from "@playwright/test";

// CHIPG-01 a CHIPG-04 (add-chip-group).
test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
const base = process.env.REFY_FAMILY_STORYBOOK_URL ?? `http://127.0.0.1:${process.env.REFY_STORYBOOK_PORT || 6006}`;
const story = (page: Page, id: string, globals = "theme:refy;mode:light") =>
  page.goto(`${base}/iframe.html?id=${id}&viewMode=story&globals=${globals}`);
const labelStyle = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    const s = getComputedStyle(el);
    return { fontFamily: s.fontFamily, fontSize: s.fontSize, textTransform: s.textTransform, letterSpacing: s.letterSpacing, color: s.color };
  });

test("CHIPG-01: seleção única tem uma parada de Tab e setas movem foco e seleção", async ({ page }) => {
  await story(page, "components-atoms-chip--grupo-selecao-unica");
  const group = page.getByRole("radiogroup", { name: "Bedrooms" });
  await expect(group).toBeVisible();
  const radios = group.getByRole("radio");
  await expect(radios).toHaveCount(5);
  // Tab entra no selecionado ("Any"); os outros ficam fora da ordem de Tab.
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.keyboard.press("Tab");
  await expect(group.getByRole("radio", { name: "Any" })).toBeFocused();
  await expect(group.locator('[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  const one = group.getByRole("radio", { name: "1+" });
  await expect(one).toBeFocused();
  await expect(one).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("Selected: 1")).toBeVisible();
  // 3+ está desabilitado: de 2+ a seta pula para 4+.
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "4+" })).toBeFocused();
  await expect(page.getByText("Selected: 4")).toBeVisible();
  // Fim da lista volta ao primeiro; Home e End vão às pontas; ArrowLeft volta.
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "Any" })).toBeFocused();
  await page.keyboard.press("End");
  await expect(group.getByRole("radio", { name: "4+" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Home");
  await expect(group.getByRole("radio", { name: "Any" })).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(group.getByRole("radio", { name: "4+" })).toBeFocused();
  // Tab sai do grupo; Shift+Tab volta para o selecionado.
  await page.keyboard.press("Tab");
  await expect(group.locator(":focus")).toHaveCount(0);
  await page.keyboard.press("Shift+Tab");
  await expect(group.getByRole("radio", { name: "4+" })).toBeFocused();
  await expect(group.getByRole("radio", { name: "3+" })).toBeDisabled();
});

test("CHIPG-02: seleção múltipla alterna com Space e Enter e Tab passa por cada Chip", async ({ page }) => {
  await story(page, "components-atoms-chip--grupo-selecao-multipla");
  const group = page.getByRole("group", { name: "Amenities" });
  const balcony = group.getByRole("button", { name: /Balcony/ });
  await expect(balcony).toHaveAttribute("aria-pressed", "false");
  await balcony.focus();
  await page.keyboard.press("Space");
  await expect(balcony).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Selected: pool, balcony")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(group.getByRole("button", { name: /Pool/ })).toBeFocused();
  await page.keyboard.press("Tab");
  const garage = group.getByRole("button", { name: /Garage/ });
  await expect(garage).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(garage).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Space");
  await expect(balcony).toHaveAttribute("aria-pressed", "false");
});

test("CHIPG-03: rótulo do grupo usa os tokens de rótulo de campo, também quando o tema muda", async ({ page }) => {
  await story(page, "components-atoms-input--input-padrao");
  const input = await labelStyle(page, "label");
  await story(page, "components-atoms-chip--grupo-selecao-unica");
  const group = page.getByRole("radiogroup", { name: "Bedrooms" });
  const id = await group.getAttribute("aria-labelledby");
  expect(await labelStyle(page, `[id="${id}"]`)).toEqual(input);
  // O tema troca a caixa do rótulo de campo; o rótulo do grupo acompanha nos dois sentidos.
  for (const transform of ["uppercase", "none"]) {
    await page.locator(`[id="${id}"]`).evaluate((el, value) => el.parentElement!.style.setProperty("--field-label-transform", value), transform);
    expect((await labelStyle(page, `[id="${id}"]`)).textTransform).toBe(transform);
  }
});

// O aviso depende de NODE_ENV, que o bundler do consumidor substitui: o mesmo Chip é empacotado
// em desenvolvimento e em produção e montado sem ChipGroup.
async function mountRadioChip(page: Page, nodeEnv: string) {
  const { build } = await import("esbuild");
  const result = await build({
    stdin: {
      contents: `import { createElement } from "react"; import { createRoot } from "react-dom/client"; import { Chip } from "./src/components/Chip";
        createRoot(document.getElementById("root")).render(createElement(Chip, { selectionMode: "radio", selected: true }, "Any"));`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    format: "iife",
    jsx: "automatic",
    loader: { ".module.css": "local-css", ".css": "css" },
    outdir: "out",
    define: { "process.env.NODE_ENV": JSON.stringify(nodeEnv) },
    logLevel: "silent",
  });
  const js = result.outputFiles.find((f) => f.path.endsWith(".js"))!.text;
  const warnings: string[] = [];
  page.on("console", (message) => { if (message.type() === "warning") warnings.push(message.text()); });
  await page.setContent(`<div id="root"></div>`);
  await page.addScriptTag({ content: js });
  await expect(page.getByRole("radio", { name: "Any" })).toBeVisible();
  await page.waitForTimeout(100);
  return warnings;
}

test("CHIPG-04: Chip radio fora do grupo avisa em desenvolvimento e cala em produção", async ({ page, context }) => {
  const development = await mountRadioChip(page, "development");
  expect(development.some((w) => w.includes("ChipGroup") && w.includes('mode="single"'))).toBe(true);
  const production = await mountRadioChip(await context.newPage(), "production");
  expect(production.filter((w) => w.includes("ChipGroup"))).toEqual([]);
});
