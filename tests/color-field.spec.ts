import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
const story = (page: Page, id: string, mode = "light") =>
  page.goto(`/iframe.html?id=components-molecules-colorfield--${id}&viewMode=story&globals=theme:refy;mode:${mode}`);

for (const mode of ["light", "dark"]) {
  // interação: ColorField
  test(`ColorField: teclado abre o seletor, sliders mudam a cor e Esc fecha (${mode})`, async ({ page }) => {
    await story(page, "controlado", mode);
    const swatch = page.getByRole("button", { name: /^Primary: #0F7B5F\. Open the color picker$/ });
    await swatch.focus();
    await page.keyboard.press("Enter");
    await expect(swatch).toHaveAttribute("aria-expanded", "true");
    const dialog = page.getByRole("dialog", { name: "Primary: color picker" });
    await expect(dialog).toBeVisible();
    const light = dialog.getByRole("slider", { name: "Lightness" });
    const before = await light.getAttribute("aria-valuenow");
    await light.focus();
    await page.keyboard.press("ArrowRight");
    await expect(light).toHaveAttribute("aria-valuenow", String(Number(before) + 1));
    await expect(page.getByText(/^Value: #/)).not.toHaveText("Value: #0f7b5f");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
}

test("ColorField: hexadecimal digitado é aplicado no Enter, o curto é expandido e o inválido avisa", async ({ page }) => {
  await story(page, "controlado");
  const field = page.getByLabel("Primary in hexadecimal", { exact: true });
  await field.fill("#abc");
  await field.press("Enter");
  await expect(page.getByText("Value: #aabbcc", { exact: true })).toBeVisible();
  await expect(field).toHaveValue("#aabbcc");
  await field.fill("verde");
  // blur() em vez de Tab: no Firefox, o Tab no último focável leva o foco para fora do documento sem blur.
  await field.blur();
  await expect(page.getByText("Use a hexadecimal color such as #2163AD.")).toBeVisible();
  await expect(page.getByText("Value: #aabbcc", { exact: true })).toBeVisible();
});

test("ColorField: cor do tema em presets aplica num clique e fica marcada", async ({ page }) => {
  await story(page, "com-paleta");
  await page.getByRole("button", { name: /^Accent: #C2410C\. Open the color picker$/ }).click();
  const group = page.getByRole("group", { name: "Theme colors" });
  await expect(group.getByRole("button", { name: "#C2410C" })).toHaveAttribute("aria-pressed", "true");
  await group.getByRole("button", { name: "#7C3AED" }).click();
  await expect(group.getByRole("button", { name: "#7C3AED" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Accent in hexadecimal", { exact: true })).toHaveValue("#7c3aed");
});

test("ColorField: desabilitado não abre; aparência swatch mostra o valor e abre o mesmo seletor", async ({ page }) => {
  await story(page, "desabilitado");
  await expect(page.getByRole("button", { name: /Locked color/ })).toBeDisabled();
  await expect(page.getByLabel("Locked color in hexadecimal", { exact: true })).toBeDisabled();
  await story(page, "paleta");
  await expect(page.getByText("#C2410C", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Chart color 3: #C2410C\. Open the color picker$/ }).click();
  await expect(page.getByRole("dialog", { name: "Chart color 3: color picker" })).toBeVisible();
});

const verification = (page: import("@playwright/test").Page, id: string) =>
  page.goto(`/iframe.html?id=verification-colorfield-contracts--${id}&viewMode=story&globals=theme:refy;mode:light`);

test("ColorField: o formulário recebe a cor aceita, não o rascunho inválido", async ({ page }) => {
  await verification(page, "formulario");
  const hex = page.getByLabel("Brand color in hexadecimal", { exact: true });
  await hex.fill("verde");
  await hex.blur();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Sent: #2163ad")).toBeVisible();
  await hex.fill("#00ff00");
  await hex.press("Enter");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Sent: #00ff00")).toBeVisible();
});

test("ColorField controlado: se o app recusa, campo e sliders voltam ao value", async ({ page }) => {
  await verification(page, "recusa");
  const hex = page.getByLabel("Locked by the app in hexadecimal", { exact: true });
  await hex.fill("#0000ff");
  await hex.press("Enter");
  await expect(hex).toHaveValue("#ff0000");
  await page.getByRole("button", { name: /^Locked by the app: #FF0000\. Open the color picker$/ }).click();
  await expect(page.getByRole("slider", { name: "Hue" })).toHaveAttribute("aria-valuenow", "0");
  await page.getByRole("slider", { name: "Hue" }).press("ArrowRight");
  await expect(page.getByRole("slider", { name: "Hue" })).toHaveAttribute("aria-valuenow", "0");
});

test("ColorField controlado: valor aplicado um render depois não perde a matiz", async ({ page }) => {
  await verification(page, "atrasado");
  await page.getByRole("button", { name: /^Applied a render later: #00FF00\. Open the color picker$/ }).click();
  const lightness = page.getByRole("slider", { name: "Lightness" });
  await lightness.focus();
  await lightness.press("Home");
  await expect(lightness).toHaveAttribute("aria-valuenow", "0");
  for (let step = 1; step <= 10; step++) {
    await lightness.press("ArrowRight");
    await expect(lightness).toHaveAttribute("aria-valuenow", String(step));
  }
  await expect(page.getByRole("slider", { name: "Hue" })).toHaveAttribute("aria-valuenow", "120");
  await expect(page.getByLabel("Applied a render later in hexadecimal", { exact: true })).toHaveValue("#003300");
});

test("Editor de tokens: trocar de token não herda o rascunho inválido do anterior", async ({ page }) => {
  await page.goto("/iframe.html?id=fundamentos-playground--tema&viewMode=story");
  await page.getByRole("button", { name: "Personalizar tema", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio", { name: "Tokens" }).or(dialog.getByRole("tab", { name: "Tokens" })).or(dialog.getByRole("button", { name: "Tokens", exact: true })).first().click();
  const search = dialog.getByLabel("Buscar token", { exact: true });
  const hex = dialog.getByLabel("Cor do token in hexadecimal", { exact: true });
  await search.fill("--bg");
  await dialog.getByRole("option", { name: /^--bg(?![-\w])/ }).click();
  await hex.fill("verde");
  await hex.blur();
  await expect(hex).toHaveAttribute("aria-invalid", "true");
  await search.fill("--surface");
  await dialog.getByRole("option", { name: /^--surface(?![-\w])/ }).click();
  await expect(hex).not.toHaveValue("verde");
  await expect(hex).not.toHaveAttribute("aria-invalid", "true");
});

test("ColorField: no preset marcado, o foco do teclado continua visível e diferente da seleção", async ({ page, browserName }) => {
  // O WebKit do Playwright não leva Tab a botões nem aplica :focus-visible ao foco programático de botão.
  test.skip(browserName === "webkit", "WebKit: sem :focus-visible em foco programático de botão");
  await story(page, "com-paleta");
  await page.getByRole("button", { name: /^Accent: #C2410C\. Open the color picker$/ }).click();
  const selected = page.getByRole("group", { name: "Theme colors" }).getByRole("button", { name: "#C2410C" });
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  const look = () => selected.evaluate((node) => { const css = getComputedStyle(node); return `${css.outlineStyle} ${css.outlineColor} ${css.boxShadow}`; });
  const idle = await look();
  expect(idle).toMatch(/^none /);
  // Foco pelo teclado de verdade: do preset anterior, Tab até o marcado (o Firefox não aplica
  // :focus-visible ao foco programático).
  await page.getByRole("group", { name: "Theme colors" }).getByRole("button", { name: "#0F7B5F" }).focus();
  await page.keyboard.press("Tab");
  await expect(selected).toBeFocused();
  expect(await look()).not.toBe(idle);
  expect(await look()).toMatch(/^solid /);
});

test("ColorField controlado: sair do campo antes de o app aplicar a cor não desfaz a escolha", async ({ page }) => {
  await verification(page, "assincrono");
  const field = page.getByLabel("Applied a moment later in hexadecimal", { exact: true });
  await field.fill("#2455b6");
  await field.press("Enter");
  // O próximo campo recebe o foco antes de o app aplicar a cor (150 ms).
  await page.getByLabel("Next field in hexadecimal", { exact: true }).focus();
  await expect(page.getByText("Changes: #2455b6", { exact: true })).toBeVisible();
  await expect(field).toHaveValue("#2455b6");
  await page.waitForTimeout(400);
  await expect(page.getByText("Changes: #2455b6", { exact: true })).toBeVisible();
  await expect(field).toHaveValue("#2455b6");
});
