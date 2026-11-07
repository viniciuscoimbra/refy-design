import { mkdirSync, writeFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
test("exportação real de tema para o starter local", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=fundamentos-playground--aplicacao&viewMode=story&globals=theme:cobalto;mode:light",
  );
  await page
    .getByRole("button", { name: "Personalizar tema", exact: true })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Personalizar tema",
    exact: true,
  });
  await editor
    .getByLabel("Nome do tema", { exact: true })
    .fill("Minha aplicação");
  await editor.getByRole("tab", { name: "Forma", exact: true }).click();
  await editor.getByLabel("Arredondamento geral (px)").fill("0");
  await editor.getByRole("tab", { name: "Tipografia", exact: true }).click();
  await editor
    .getByLabel("Conjunto de fontes", { exact: true })
    .selectOption("plex");
  await editor.getByRole("tab", { name: "Cores", exact: true }).click();
  for (const [mode, action, data] of [
    ["light", "#2455b6", "#7c3aed"],
    ["dark", "#88b8ff", "#c4b5fd"],
  ]) {
    const modeSelect = editor.getByLabel("Editar cores do modo", { exact: true });
    await modeSelect.selectOption(mode);
    // No Storybook o modo chega pelos globals, de forma assíncrona: só edita depois que o editor mostra o modo novo.
    await expect(modeSelect).toHaveValue(mode);
    await editor.getByLabel("Ação principal", { exact: true }).fill(action);
    await editor.getByLabel("Dados · série 1", { exact: true }).fill(data);
  }
  await editor.getByRole("tab", { name: "Exportar", exact: true }).click();
  const theme = JSON.parse(
    await editor
      .getByLabel("Tema aplicado", { exact: true })
      .locator("code")
      .innerText(),
  );
  if (process.env.REFY_THEME_EXPORT_PATH)
    writeFileSync(
      process.env.REFY_THEME_EXPORT_PATH,
      JSON.stringify(theme, null, 2) + "\n",
    );
  expect(theme.name).toBe("Minha aplicação");
  expect(theme.tokens["--control-radius"]).toBe("0px");
  expect(theme.tokens["--font-body"]).toContain("IBM Plex Sans");
  expect(theme.modes.light["--primary"]).toBe("#2455b6");
  expect(theme.modes.dark["--chart-primary"]).toBe("#c4b5fd");
  if (process.env.REFY_BLOCK_EXPORT_DIR) {
    await page.goto(
      "/iframe.html?id=fundamentos-playground--blocks&viewMode=story&globals=theme:refy-site;mode:light",
    );
    await page
      .getByRole("navigation", { name: "Escolher template" })
      .locator('[data-block-target="dashboard-01"]')
      .click();
    const block = page.getByRole("region", {
      name: "Template: dashboard-01",
      exact: true,
    });
    await block.getByRole("radio", { name: "Código", exact: true }).click();
    const nav = block.getByRole("navigation", {
      name: "Arquivos dashboard-01",
      exact: true,
    });
    await expect(nav.getByRole("button")).toHaveCount(8);
    mkdirSync(process.env.REFY_BLOCK_EXPORT_DIR); // Never overwrite an earlier export.
    for (const name of await nav.getByRole("button").allTextContents()) {
      expect(["page.tsx", "NavigationBlock.tsx", "DashboardBlock.tsx", "ChartExplorer.tsx", "LibraryBlock.tsx", "SettingsBlock.tsx", "blocks.module.css", "photos.ts"]).toContain(
        name,
      );
      await nav.getByRole("button", { name, exact: true }).click();
      const source = await block.locator("pre code").innerText();
      expect(source).not.toContain("../index");
      writeFileSync(`${process.env.REFY_BLOCK_EXPORT_DIR}/${name}`, source);
    }
  }
});

test("Refy Site exporta e reimporta configuração completa sem depender do nome", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=refy-site--temas&viewMode=story&globals=theme:refy-site;mode:light",
  );
  await page.getByRole("button", { name: "Personalizar tema", exact: true }).first().click();
  const editor = page.getByRole("dialog", { name: "Personalizar tema", exact: true });
  await editor.getByRole("tab", { name: "Exportar", exact: true }).click();
  const readTheme = async () => {
    const snippets = await editor.locator("pre").allTextContents();
    const source = snippets.find(
      (value) => value.includes('"modes"') && value.includes('"tokens"'),
    );
    expect(source).toBeTruthy();
    return JSON.parse(source!);
  };
  const exported = await readTheme();
  expect(exported.name).toBe("Refy Site");
  // Owner decision 2026-11-01: approved density, 34px inherited from the foundation.
  const buttonHeight =
    exported.tokens["--button-height-md"] ??
    (await page
      .locator("[data-refy-scope]")
      .first()
      .evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--button-height-md").trim(),
      ));
  expect(buttonHeight).toBe("34px");
  expect(exported.tokens["--font-body"]).toContain("Inter");
  expect(exported.modes.light).toBeTruthy();
  expect(exported.modes.dark).toBeTruthy();
  const renamed = { ...exported, name: "Configuração reimportada" };
  await editor
    .getByLabel("Importar tema JSON", { exact: true })
    .fill(JSON.stringify(renamed));
  await editor
    .getByRole("button", { name: "Importar tema", exact: true })
    .click();
  await expect(
    editor.getByText("Tema importado. Confira a prévia nos dois modos."),
  ).toBeVisible();
  // The exported JSON re-renders after the import message; wait for it instead of reading once.
  await expect.poll(readTheme).toEqual(renamed);
  const restored = await readTheme();
  if (process.env.REFY_SITE_THEME_EXPORT_PATH)
    writeFileSync(
      process.env.REFY_SITE_THEME_EXPORT_PATH,
      JSON.stringify(restored, null, 2) + "\n",
    );
});
