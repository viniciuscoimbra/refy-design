import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";

// O tema escolhido e o editor de tema no site de verdade (site/app.tsx), não na story: a escolha
// sobreviver ao recarregar é coisa da página do site, que o Storybook não monta.
// Issues viniciuscoimbra/refy-design#8 e #10.
const port = Number(process.env.REFY_SITE_TEST_PORT || 5391);
const siteURL = `http://127.0.0.1:${port}`;
let server: ChildProcess | undefined;

test.describe.configure({ mode: "serial" });
test.use({ baseURL: siteURL, viewport: { width: 1440, height: 900 } });

test.beforeAll(async () => {
  test.setTimeout(120000);
  server = spawn("node_modules/.bin/vite", ["--config", "vite.site.config.ts", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
  for (let started = Date.now(); Date.now() - started < 90000; await new Promise((done) => setTimeout(done, 500))) {
    if (await fetch(siteURL).then((response) => response.ok, () => false)) return;
  }
  throw Error(`O site não subiu em ${siteURL}.`);
});
test.afterAll(() => {
  server?.kill();
});

// O botão primário pinta a cor principal do tema que o envolve: a do site no cabeçalho e a da prévia no iframe.
const primary = (selector: Locator) =>
  selector.evaluate((element) => getComputedStyle(element).getPropertyValue("--primary").trim());

async function chooseTerracotaAtHome(page: Page) {
  await page.goto("/");
  const themes = page.getByRole("radiogroup", { name: "Tema do site" });
  // O seletor só habilita depois que as fontes dos temas chegam.
  await expect(themes.getByRole("radio", { name: "Terracota" })).toBeEnabled({ timeout: 30000 });
  await themes.getByRole("radio", { name: "Terracota" }).click();
  await expect(themes.getByRole("radio", { name: "Terracota" })).toBeChecked();
}

test("#10: o Playground abre com o tema escolhido na home e o mantém ao recarregar", async ({ page }) => {
  await chooseTerracotaAtHome(page);
  const cta = page.getByRole("banner").getByRole("link", { name: "Playground", exact: true });
  const chosen = await primary(cta);
  await cta.click();
  const preview = page.frameLocator('[data-testid="playground-studio"] iframe').first().getByRole("button", { name: "Continuar" });
  await expect(preview).toBeVisible({ timeout: 30000 });
  await expect.poll(() => primary(preview)).toBe(chosen);

  await page.reload();
  await expect.poll(() => primary(page.getByRole("banner").getByRole("link", { name: "Playground", exact: true })), { timeout: 30000 }).toBe(chosen);
  await expect(preview).toBeVisible({ timeout: 30000 });
  await expect.poll(() => primary(preview)).toBe(chosen);
});

test("#10: o seletor Tema da prévia mostra o tema escolhido na home", async ({ page }) => {
  await chooseTerracotaAtHome(page);
  await page.getByRole("navigation").getByRole("link", { name: "Temas", exact: true }).first().click();
  const select = page.getByLabel("Tema da prévia");
  await expect(select).toHaveValue("terracota", { timeout: 30000 });
  await page.reload();
  await expect(page.getByLabel("Tema da prévia")).toHaveValue("terracota", { timeout: 30000 });
});

test("#10: trocar a prévia em Temas não muda o tema do site, e o reload volta ao tema do site", async ({ page }) => {
  await chooseTerracotaAtHome(page);
  const cta = page.getByRole("banner").getByRole("link", { name: "Playground", exact: true });
  const site = await primary(cta);
  await page.getByRole("navigation").getByRole("link", { name: "Temas", exact: true }).first().click();
  const select = page.getByLabel("Tema da prévia");
  await expect(select).toHaveValue("terracota", { timeout: 30000 });
  const frame = page.frameLocator('[data-testid="playground-frame"]').getByTestId("playground");
  await expect.poll(() => primary(frame), { timeout: 30000 }).toBe(site);
  await select.selectOption("cobalto");
  await expect(select).toHaveValue("cobalto");
  // A prévia aplicou Cobalto; só então vale conferir que o site ficou onde estava.
  await expect.poll(() => primary(frame), { timeout: 30000 }).not.toBe(site);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("refy:skin"))).toBe("terracota");
  await expect.poll(() => primary(cta)).toBe(site);
  await page.reload();
  await expect(page.getByLabel("Tema da prévia")).toHaveValue("terracota", { timeout: 30000 });
  await expect.poll(() => primary(page.getByRole("banner").getByRole("link", { name: "Playground", exact: true })), { timeout: 30000 }).toBe(site);
  await expect.poll(() => primary(frame), { timeout: 30000 }).toBe(site);
});

test("#8: ação principal amarela com texto branco avisa o contraste ao lado do campo e sugere texto preto", async ({ page }) => {
  await page.goto("/temas");
  await page.getByRole("button", { name: "Personalizar tema" }).click();
  const editor = page.getByRole("dialog", { name: "Personalizar tema" });
  await editor.getByLabel("Editar cores do modo").selectOption("dark");
  const action = editor.getByLabel("Ação principal em hexadecimal");
  await action.fill("#ffeb3b");
  await action.press("Enter");
  await expect(editor.getByLabel("Texto da ação em hexadecimal")).toHaveValue("#ffffff");
  const warning = editor.getByRole("note").filter({ hasText: "Pouco contraste para texto" });
  await expect(warning).toBeVisible();
  await expect(warning).toContainText("1,22:1");
  await warning.getByRole("button", { name: "Usar texto preto" }).click();
  await expect(editor.getByLabel("Texto da ação em hexadecimal")).toHaveValue("#000000");
  await expect(warning).toHaveCount(0);
});

test("#10: as fotos da equipe na home dizem de quem são", async ({ page }) => {
  await page.goto("/");
  const team = page.getByRole("group", { name: "3 pessoas" }).first();
  await expect(team.getByRole("img", { name: "Rui Costa" })).toBeAttached({ timeout: 30000 });
  await expect(team.getByRole("img", { name: "Ana Lima" })).toBeAttached();
  await expect(team.getByRole("img", { name: "Leo Melo" })).toBeAttached();
});
