import { test, expect, type Locator } from "@playwright/test";

test.use({ screenshot: "off", trace: "off", reducedMotion: "reduce" });
async function exported(editor: Locator) {
  await editor.getByRole("tab", { name: "Exportar", exact: true }).click();
  return JSON.parse(
    await editor
      .getByLabel("Tema aplicado", { exact: true })
      .locator("code")
      .innerText(),
  );
}
async function load(editor: Locator, theme: unknown) {
  await editor.getByRole("tab", { name: "Exportar", exact: true }).click();
  await editor
    .getByLabel("Importar tema JSON", { exact: true })
    .fill(JSON.stringify(theme));
  await editor
    .getByRole("button", { name: "Importar tema", exact: true })
    .click();
}
async function token(editor: Locator, name: string) {
  await editor.getByRole("tab", { name: "Tokens", exact: true }).click();
  await editor.getByLabel("Buscar token", { exact: true }).fill(name);
  await editor.getByRole("option").filter({ hasText: name }).first().click();
  return editor.getByRole("region", {
    name: "Editar token selecionado",
    exact: true,
  });
}
for (const mode of ["light"]) {
  test(`imported measurements and expressions preserve CSS — ${mode}`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=fundamentos-playground--bancada&viewMode=story&globals=theme:refy-site;mode:${mode}`,
    );
    await page
      .getByTestId("theme-workbench")
      .getByRole("button", { name: "Personalizar tema", exact: true })
      .click();
    const editor = page.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    const base = await exported(editor);
    for (const unit of ["vw", "pt"]) {
      await load(editor, {
        ...base,
        tokens: { ...base.tokens, "--drawer-body-padding": `2${unit}` },
      });
      const detail = await token(editor, "--drawer-body-padding");
      await expect(detail.getByLabel("Unidade", { exact: true })).toHaveValue(
        unit,
      );
      await detail.getByLabel("Medida do token", { exact: true }).fill("3");
      expect((await exported(editor)).tokens["--drawer-body-padding"]).toBe(
        `3${unit}`,
      );
    }
    const expression = "calc(2vw + 4px)";
    await load(editor, {
      ...base,
      tokens: { ...base.tokens, "--drawer-body-padding": expression },
    });
    const detail = await token(editor, "--drawer-body-padding");
    await expect(
      detail.getByLabel("Medida do token", { exact: true }),
    ).toBeDisabled();
    await detail
      .getByText("Editar valor CSS ou referência", { exact: true })
      .click();
    await detail
      .getByLabel("Valor do token", { exact: true })
      .fill("calc(3vw + 4px)");
    await detail
      .getByRole("button", { name: "Aplicar valor", exact: true })
      .click();
    expect((await exported(editor)).tokens["--drawer-body-padding"]).toBe(
      "calc(3vw + 4px)",
    );
  });
  test(`quoted font presets retain original tokens — ${mode}`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=fundamentos-playground--bancada&viewMode=story&globals=theme:refy-site;mode:${mode}`,
    );
    await page
      .getByTestId("theme-workbench")
      .getByRole("button", { name: "Personalizar tema", exact: true })
      .click();
    const editor = page.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    const base = await exported(editor);
    const tokens = {
      ...base.tokens,
      ...Object.fromEntries(
        ["heading", "headline", "brand", "body"].map((role) => [
          `--font-${role}`,
          "  'IBM Plex Sans' , system-ui, sans-serif",
        ]),
      ),
      "--font-mono": " 'IBM Plex Mono' , ui-monospace, monospace",
    };
    await load(editor, { ...base, tokens });
    await editor.getByRole("tab", { name: "Tipografia", exact: true }).click();
    await expect(
      editor.getByLabel("Conjunto de fontes", { exact: true }),
    ).toHaveValue("plex");
    expect((await exported(editor)).tokens).toEqual(tokens);
  });
  test(`max-width accepts none and preserves theme on unsafe CSS — ${mode}`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=fundamentos-playground--bancada&viewMode=story&globals=theme:refy-site;mode:${mode}`,
    );
    await page
      .getByTestId("theme-workbench")
      .getByRole("button", { name: "Personalizar tema", exact: true })
      .click();
    const editor = page.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    const base = await exported(editor);
    const theme = {
      ...base,
      tokens: { ...base.tokens, "--calendar-max-width": "none" },
    };
    await load(editor, theme);
    expect((await exported(editor)).tokens["--calendar-max-width"]).toBe(
      "none",
    );
    for (const bad of [
      "garbage",
      "none; color: red",
      "url(https://example.com)",
    ]) {
      await load(editor, {
        ...theme,
        tokens: { ...theme.tokens, "--calendar-max-width": bad },
      });
      await expect(
        editor.getByText("Valor inválido em --calendar-max-width.", {
          exact: true,
        }),
      ).toBeVisible();
      expect(await exported(editor)).toEqual(theme);
    }
  });
  test(`restore respects mode and shared scopes with effective fallback — ${mode}`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=fundamentos-playground--bancada&viewMode=story&globals=theme:refy-site;mode:${mode}`,
    );
    await page
      .getByTestId("theme-workbench")
      .getByRole("button", { name: "Personalizar tema", exact: true })
      .click();
    const editor = page.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    const base = await exported(editor);
    const theme = {
      ...base,
      tokens: { ...base.tokens, "--drawer-surface": "#123456" },
      modes: {
        ...base.modes,
        light: { ...base.modes.light, "--drawer-surface": "#345678" },
        dark: { ...base.modes.dark, "--drawer-surface": "#abcdef" },
      },
    };
    await load(editor, theme);
    let detail = await token(editor, "--drawer-surface");
    await detail.getByLabel("Aplicar em", { exact: true }).selectOption("mode");
    await detail
      .getByRole("button", { name: "Restaurar este token", exact: true })
      .click();
    const after = await exported(editor);
    expect(after.tokens["--drawer-surface"]).toBe("#123456");
    expect(after.modes[mode]["--drawer-surface"]).toBeUndefined();
    expect(
      after.modes[mode === "light" ? "dark" : "light"]["--drawer-surface"],
    ).toBe(
      theme.modes[mode === "light" ? "dark" : "light"]["--drawer-surface"],
    );
    // A prévia é um iframe que recebe o tema por mensagem: o valor efetivo chega logo depois.
    await expect
      .poll(() =>
        page
          .locator('[data-testid="playground-frame"]')
          .contentFrame()
          .getByTestId("playground")
          .evaluate((el) =>
            getComputedStyle(el).getPropertyValue("--drawer-surface").trim(),
          ),
      )
      .toBe("#123456");
    detail = await token(editor, "--drawer-surface");
    await detail
      .getByLabel("Aplicar em", { exact: true })
      .selectOption("shared");
    await detail
      .getByRole("button", { name: "Restaurar este token", exact: true })
      .click();
    const shared = await exported(editor);
    expect(shared.tokens["--drawer-surface"]).toBeUndefined();
    expect(shared.modes).toEqual(after.modes);
  });
}

test("parser preserves imported CSS strings and rejects injection independently of DOM", async () => {
  const previous = process.env.NODE_ENV;
  const { createServer } = await import("vite");
  const server = await createServer({
    root: new URL("..", import.meta.url).pathname,
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false },
    appType: "custom",
  });
  try {
    const { parseTheme, tokenProperty } = await server.ssrLoadModule(
      "/src/pages/PlaygroundPage/themeConfig.ts",
    );
    expect(tokenProperty("--calendar-max-width")).toBe("max-width");
    const tokens = {
      "--drawer-body-padding": "calc(2vw + 4px)",
      "--calendar-max-width": "none",
      "--font-body": " 'IBM Plex Sans' , system-ui, sans-serif",
    };
    expect(
      parseTheme(JSON.stringify({ name: "Imported CSS", tokens })).tokens,
    ).toEqual(tokens);
    expect(() =>
      parseTheme(
        JSON.stringify({
          name: "Unsafe CSS",
          tokens: { "--calendar-max-width": "none; color:red" },
        }),
      ),
    ).toThrow();
    expect(() =>
      parseTheme(
        JSON.stringify({
          name: "Unknown reference",
          tokens: { "--drawer-body-padding": "var(--unregistered-injection)" },
        }),
      ),
    ).toThrow();
  } finally {
    await server.close();
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
