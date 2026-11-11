import { test, expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";
import { readFileSync } from "node:fs";

const hooks = {
  "--drawer-body-padding": "32px",
  "--drawer-surface": "#123456",
  "--card-sm-title-size": "18px",
  "--card-sm-description-size": "15px",
  "--card-sm-icon-size": "40px",
  "--card-sm-icon-glyph-size": "24px",
};
test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
// O catálogo e as páginas de componente vivem no iframe da prévia, com o tema escolhido.
const preview = (page: Page) => page.frameLocator('[data-testid="playground-frame"]');
async function component(page: Page, id: string) {
  await expect(page.getByTestId("theme-workbench")).toBeVisible();
  const frame = preview(page);
  // A primeira h1 é a do componente; exemplos de página inteira (AppShell) trazem a própria h1.
  const title = frame.getByRole("heading", { level: 1 }).first();
  const search = frame.getByLabel("Buscar no catálogo", { exact: true });
  await expect(title.or(search).first()).toBeVisible();
  if ((await title.isVisible()) && (await title.innerText()) === id) return;
  const nav = frame.getByRole("navigation", { name: "Catálogo de componentes", exact: true });
  if (await nav.isVisible()) await nav.getByRole("link", { name: id, exact: true }).click();
  else {
    // No celular a página do componente não tem menu lateral: volta ao catálogo e busca.
    const back = frame.getByRole("button", { name: "← Todos os componentes", exact: true });
    if (await back.isVisible()) await back.click();
    await search.fill(id);
    await frame.getByRole("button", { name: `Ver ${id}`, exact: true }).click();
  }
  await expect(title).toHaveText(id);
}
async function editor(page: Page) {
  await page
    .getByTestId("theme-workbench")
    .getByRole("button", { name: "Personalizar tema", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Personalizar tema",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("tab", { name: "Exportar", exact: true }).click();
  return dialog;
}
async function exported(dialog: Locator) {
  return JSON.parse(
    await dialog
      .getByLabel("Tema aplicado", { exact: true })
      .locator("code")
      .innerText(),
  );
}
async function importTheme(dialog: Locator, value: unknown) {
  await dialog
    .getByLabel("Importar tema JSON", { exact: true })
    .fill(JSON.stringify(value));
  await dialog
    .getByRole("button", { name: "Importar tema", exact: true })
    .click();
  expect(await exported(dialog)).toEqual(value);
  await dialog.getByRole("button", { name: "Ver prévia", exact: true }).click();
  await expect(dialog).toBeHidden();
}
async function openDrawer(page: Page) {
  await component(page, "Drawer");
  const example = page
    .locator('[data-testid="playground-frame"]').contentFrame()
    .locator('[data-example="Drawer-Direita"]');
  await expect(example).toBeVisible();
  await example
    .getByRole("button", { name: "Open drawer right", exact: true })
    .click();
  const dialog = preview(page).getByRole("dialog", {
    name: "Analysis details",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function drawerMetrics(dialog: Locator) {
  const text = dialog.getByText(
    "Domain analysis details: 84 pages crawled, 12 critical issues and 31 warnings.",
    { exact: true },
  );
  const body = text.locator("xpath=../..");
  return {
    padding: await body.evaluate((el) => getComputedStyle(el).padding),
    surface: await dialog.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    ),
  };
}
async function openAppShellNavigation(page: Page) {
  await component(page, "AppShell");
  const example = page
    .locator('[data-testid="playground-frame"]').contentFrame()
    .locator('[data-example="AppShell-Completo"]');
  await example.scrollIntoViewIfNeeded();
  const launch = example.getByRole("button", {
    name: "Testar exemplo",
    exact: true,
  });
  if (await launch.isVisible()) await launch.click();
  await example
    .locator("[data-demo-ready]")
    .getByRole("button", { name: "Abrir navegação", exact: true })
    .click();
  const dialog = preview(page).getByRole("dialog").filter({ visible: true });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function appShellDrawerMetrics(dialog: Locator) {
  return {
    padding: await dialog
      .locator(":scope > div:has(aside)")
      .evaluate((el) => getComputedStyle(el).padding),
    surface: await dialog.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    ),
  };
}
async function cardExample(page: Page) {
  await component(page, "Card");
  const example = page
    .locator('[data-testid="playground-frame"]').contentFrame()
    .locator('[data-example="Card-HeaderCompacto"]');
  await example.scrollIntoViewIfNeeded();
  await expect(
    example.getByRole("heading", { name: "Team deliveries", exact: true }),
  ).toBeVisible();
  return example;
}
async function cardMetrics(example: Locator) {
  return {
    mainTitle: await example
      .getByRole("heading", { name: "Aurora project", exact: true })
      .evaluate((el) => getComputedStyle(el).fontSize),
    smallTitle: await example
      .getByRole("heading", { name: "Team deliveries", exact: true })
      .evaluate((el) => getComputedStyle(el).fontSize),
    smallDescription: await example
      .getByText("Secondary header, with the same API.", { exact: true })
      .evaluate((el) => getComputedStyle(el).fontSize),
  };
}

test("seis hooks públicos são aceitos e constam no inventário/editor/kit", async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const { createServer } = await import("vite");
  const server = await createServer({
    root: new URL("..", import.meta.url).pathname,
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false },
    appType: "custom",
  });
  try {
    const { parseTheme, tokenNames, tokenProperty } =
      await server.ssrLoadModule("/src/pages/PlaygroundPage/themeConfig.ts");
    const theme = { name: "Seis hooks públicos", tokens: hooks };
    for (const name of [
      "--drawer-surface",
      "--accordion-surface",
      "--code-surface",
      "--fab-surface",
      "--navigation-surface",
      "--dialog-surface",
    ]) {
      expect(tokenProperty(name)).toBe("background");
    }
    expect(tokenProperty("--primary")).toBe("color");
    expect(tokenProperty("--surface")).toBe("color");
    const parsed = parseTheme(JSON.stringify(theme));
    expect(parsed.name).toBe(theme.name);
    expect(parsed.tokens).toEqual(hooks);
    const inventory = readFileSync(
      new URL("../docs/TOKEN_INVENTORY.md", import.meta.url),
      "utf8",
    );
    const catalog = JSON.parse(
      readFileSync(new URL("../ai/catalog.json", import.meta.url), "utf8"),
    );
    for (const name of Object.keys(hooks)) {
      expect(tokenNames).toContain(name);
      expect(inventory).toContain(`| ${name} |`);
      expect(catalog.themeTokens).toContain(name);
    }
  } finally {
    await server.close();
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

for (const mode of ["light"])
  for (const width of [1280, 390]) {
    test(`importação real aplica Card compacto e Drawer preservando defaults — ${mode}/${width}`, async ({
      page,
    }) => {
      test.setTimeout(60000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `/iframe.html?id=fundamentos-playground--bancada&viewMode=story&globals=theme:refy-site;mode:${mode}`,
      );
      const firstDrawer = await openDrawer(page);
      const baselineDrawer = await drawerMetrics(firstDrawer);
      await page.keyboard.press("Escape");
      await expect(firstDrawer).toBeHidden();
      let baselineNavigation:
        Awaited<ReturnType<typeof appShellDrawerMetrics>> | undefined;
      if (width === 390) {
        const navigation = await openAppShellNavigation(page);
        baselineNavigation = await appShellDrawerMetrics(navigation);
        expect(baselineNavigation.padding).toBe("0px");
        await page.keyboard.press("Escape");
        await expect(navigation).toBeHidden();
      }
      const baselineCard = await cardMetrics(await cardExample(page));
      let dialog = await editor(page);
      const baselineTheme = await exported(dialog);
      const custom = {
        ...baselineTheme,
        name: "Hooks públicos de Card e Drawer",
        tokens: { ...baselineTheme.tokens, ...hooks },
      };
      await importTheme(dialog, custom);
      const card = await cardExample(page);
      await expect
        .poll(() => cardMetrics(card))
        .toEqual({
          ...baselineCard,
          smallTitle: "18px",
          smallDescription: "15px",
        });
      const explicit = card.getByRole("heading", {
        name: "Custom header",
        exact: true,
      });
      await expect(explicit).toHaveCSS("font-size", "20px");
      const explicitHeader = explicit.locator("xpath=../..");
      const explicitIcon = explicitHeader.locator(
        ':scope > span[aria-hidden="true"]',
      );
      await expect(explicitIcon).toHaveCSS("width", "42px");
      await expect(explicitIcon.locator("svg")).toHaveCSS("width", "22px");
      const drawer = await openDrawer(page);
      await expect
        .poll(() => drawerMetrics(drawer))
        .toEqual({ padding: "32px", surface: "rgb(18, 52, 86)" });
      await expect
        .poll(() =>
          drawer.evaluate((el) => el.contains(document.activeElement)),
        )
        .toBe(true);
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      if (width === 390) {
        const navigation = await openAppShellNavigation(page);
        await expect
          .poll(() => appShellDrawerMetrics(navigation))
          .toEqual({ padding: "32px", surface: "rgb(18, 52, 86)" });
        await page.keyboard.press("Escape");
        await expect(navigation).toBeHidden();
      }
      dialog = await editor(page);
      expect(await exported(dialog)).toEqual(custom);
      await importTheme(dialog, baselineTheme);
      const restoredDrawer = await openDrawer(page);
      await expect
        .poll(() => drawerMetrics(restoredDrawer))
        .toEqual(baselineDrawer);
      await page.keyboard.press("Escape");
      await expect(restoredDrawer).toBeHidden();
      if (width === 390) {
        const navigation = await openAppShellNavigation(page);
        await expect
          .poll(() => appShellDrawerMetrics(navigation))
          .toEqual(baselineNavigation);
        await page.keyboard.press("Escape");
        await expect(navigation).toBeHidden();
      }
      await expect
        .poll(async () => cardMetrics(await cardExample(page)))
        .toEqual(baselineCard);
      await expect(page.getByTestId("theme-workbench")).toHaveAttribute(
        "data-theme",
        mode,
      );
      expect(errors).toEqual([]);
    });
  }

for (const mode of ["light"])
  for (const width of [1280, 390]) {
    test(`superfície aceita gradiente e token de cor o rejeita sem perder o tema — ${mode}/${width}`, async ({
      page,
    }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(
        `/iframe.html?id=fundamentos-playground--bancada&viewMode=story&globals=theme:refy-site;mode:${mode}`,
      );
      let dialog = await editor(page);
      const baseline = await exported(dialog);
      const gradient = "linear-gradient(90deg, #123456, #654321)";
      const themed = {
        ...baseline,
        name: "Superfície em gradiente",
        tokens: { ...baseline.tokens, "--drawer-surface": gradient },
      };
      await dialog
        .getByLabel("Importar tema JSON", { exact: true })
        .fill(JSON.stringify(themed));
      await dialog
        .getByRole("button", { name: "Importar tema", exact: true })
        .click();
      await expect(
        dialog.getByText("Tema importado. Confira a prévia nos dois modos.", {
          exact: true,
        }),
      ).toBeVisible();
      const saved = await exported(dialog);
      expect(saved).toEqual(themed);
      await dialog
        .getByRole("button", { name: "Ver prévia", exact: true })
        .click();
      let drawer = await openDrawer(page);
      const image = "linear-gradient(90deg, rgb(18, 52, 86), rgb(101, 67, 33))";
      await expect(drawer).toHaveCSS("background-image", image);
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      dialog = await editor(page);
      expect(await exported(dialog)).toEqual(saved);
      await importTheme(dialog, baseline);
      dialog = await editor(page);
      expect(await exported(dialog)).toEqual(baseline);
      await dialog
        .getByLabel("Importar tema JSON", { exact: true })
        .fill(JSON.stringify(saved));
      await dialog
        .getByRole("button", { name: "Importar tema", exact: true })
        .click();
      await expect(
        dialog.getByText("Tema importado. Confira a prévia nos dois modos.", {
          exact: true,
        }),
      ).toBeVisible();
      expect(await exported(dialog)).toEqual(saved);
      const invalid = {
        ...saved,
        name: "Cor inválida",
        tokens: { ...saved.tokens, "--primary": gradient },
      };
      await dialog
        .getByLabel("Importar tema JSON", { exact: true })
        .fill(JSON.stringify(invalid));
      await dialog
        .getByRole("button", { name: "Importar tema", exact: true })
        .click();
      await expect(
        dialog.getByText("Valor inválido em --primary.", { exact: true }),
      ).toBeVisible();
      expect(await exported(dialog)).toEqual(saved);
      await dialog
        .getByRole("button", { name: "Ver prévia", exact: true })
        .click();
      drawer = await openDrawer(page);
      await expect(drawer).toHaveCSS("background-image", image);
      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(page.getByTestId("theme-workbench")).toHaveAttribute(
        "data-theme",
        mode,
      );
    });
  }
