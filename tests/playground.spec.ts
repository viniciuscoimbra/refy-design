import { test, expect, type Page } from "@playwright/test";
import { componentCatalog } from "../src/pages/PlaygroundPage/catalog";
import { readFileSync } from "node:fs";
const axe = readFileSync("node_modules/axe-core/axe.min.js", "utf8");
const url =
  "/iframe.html?id=verification-component-matrix--matriz&viewMode=story";
const appUrl = "/iframe.html?id=fundamentos-playground--pagina&viewMode=story";
const frameOf = (page: Page) => page.frameLocator("#storybook-preview-iframe");
async function choose(
  page: Page,
  type: "theme" | "skin" | "fonts",
  value: string,
) {
  if (type === "fonts") {
    const frame = frameOf(page);
    await frame
      .getByRole("button", { name: "Personalizar tema", exact: true })
      .click();
    const editor = frame.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    await editor.getByRole("tab", { name: "Tipografia", exact: true }).click();
    await editor
      .getByLabel("Conjunto de fontes", { exact: true })
      .selectOption(value);
    await editor
      .getByRole("button", { name: "Ver prévia", exact: true })
      .click();
    return;
  }
  const names = {
    theme: /^\s*(Claro|Escuro|Sistema)$/,
    skin: /^\s*(Refy|Refy original|Geométrico|Fluido|Terracota|Cobalto|Personalizado)$/,
  };
  await page.getByRole("button", { name: names[type] }).click();
  await page.locator(`#list-item-${value}`).click();
}

test("toolbar única compartilha modo, tema e fonte com todas as visões e catálogo", async ({
  page,
  request,
}) => {
  await page.goto("/?path=/story/fundamentos-playground--aplicacao");
  const tree = page.locator("#storybook-explorer-tree");
  await expect(tree).toContainText("Playground");
  await expect(tree).toContainText("Componentes");
  await expect(tree).not.toContainText(
    /Fundamentos|Verificacao|Revisão|Configurações|Exemplos/,
  );
  const index = await (await request.get("/index.json")).json();
  expect(
    Object.keys(index.entries).some((id) =>
      id.startsWith("verificacao-contratos-essenciais--"),
    ),
  ).toBe(true);
  const frame = frameOf(page);
  await expect(frame.getByLabel("Modo", { exact: true })).toHaveCount(0);
  await expect(frame.getByLabel("Tema", { exact: true })).toHaveCount(0);
  await expect(frame.getByLabel("Fontes", { exact: true })).toHaveCount(0);
  await choose(page, "theme", "dark");
  await choose(page, "skin", "gradient");
  await choose(page, "fonts", "plex");
  // Theme, Components and Typography render in the preview iframe; Templates render each template in its own frame.
  for (const view of ["Tema", "Componentes", "Tipografia", "Templates"]) {
    await frame.getByRole("radio", { name: view, exact: true }).click();
    const scope =
      view === "Templates"
        ? frame.locator("main iframe").first().contentFrame().locator("[data-refy-scope]").first()
        : frame.locator('[data-testid="playground-frame"]').contentFrame().getByTestId("playground");
    await expect(scope, view).toHaveAttribute("data-theme", "dark");
    await expect(scope, view).toHaveAttribute("data-refy-brand", "Meu tema");
    await expect(scope, view).toHaveCSS("font-family", /IBM Plex Sans/);
  }
  await page.goto("/?path=/story/components-atoms-button--primary");
  await expect(frame.getByRole("button").first()).toHaveCSS(
    "font-family",
    /IBM Plex Sans/,
  );
});

test("sistema acompanha dispositivo sem mudar geometria", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(`${appUrl}&globals=theme:system;skin:terracota`);
  const scope = page.getByTestId("playground"),
    button = scope.getByRole("button", { name: "Criar projeto", exact: true });
  await expect(scope).toHaveAttribute("data-theme", "dark");
  await expect(scope).toHaveAttribute("data-refy-brand", "terracota");
  const radius = await button.evaluate((el) => getComputedStyle(el).borderRadius);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(scope).toHaveAttribute("data-theme", "light");
  await expect(button).toHaveCSS("border-radius", radius);
});

for (const skin of ["refy-site"])
  for (const mode of ["light"])
    test(`${skin}/${mode}: shell, notificações, conta, projeto e avatar canônico`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${appUrl}&globals=theme:${mode};skin:${skin}`);
      const scope = page.getByTestId("playground");
      // Notifications belong to the space they came from (JOURNEY-03).
      await scope.getByRole("button", { name: /Notifications: 2 unread/ }).click();
      await scope
        .getByRole("dialog", { name: "Notifications" })
        .getByRole("button", { name: "Mark all as read" })
        .click();
      await page.keyboard.press("Escape");
      await expect(scope.getByRole("button", { name: "Notifications", exact: true })).toBeVisible();
      await scope.getByRole("button", { name: /Current workspace/ }).click();
      await scope
        .getByRole("listbox", { name: "Workspaces" })
        .press("ArrowDown");
      await scope.getByRole("listbox", { name: "Workspaces" }).press("Enter");
      await expect(scope.getByRole("table")).toContainText("Produto Horizonte");
      await expect(scope.getByRole("button", { name: "Notifications", exact: true }), "another space does not inherit notifications").toBeVisible();
      await scope
        .getByRole("button", { name: /Ana Lima/ })
        .first()
        .click();
      await scope.getByRole("menuitem", { name: /Settings/ }).click();
      await scope
        .getByLabel("Nome do workspace")
        .fill("Estúdio de experiências");
      // Preferences are a draft until saved (JOURNEY-04); projects start from the side menu.
      await scope.getByRole("button", { name: "Salvar preferências" }).click();
      await expect(scope.getByRole("button", { name: /Current workspace: Estúdio de experiências/ })).toBeVisible();
      await scope
        .getByRole("button", { name: "Novo projeto", exact: true })
        .click();
      const modal = scope.getByRole("dialog", { name: "Criar projeto" });
      await modal.getByLabel("Nome do projeto").fill("Projeto local");
      await modal.getByRole("button", { name: "Visibilidade: Equipe" }).click();
      await scope
        .getByRole("menuitem", { name: "Privado", exact: true })
        .click();
      await modal.getByRole("button", { name: "Criar", exact: true }).click();
      await scope
        .getByRole("button", { name: "Trabalho", exact: true })
        .click();
      await expect(scope.getByRole("table")).toContainText("Projeto local");
      const tableAvatar = scope
        .getByRole("table")
        .locator("[data-refy-avatar]")
        .first();
      const accountAvatar = scope
        .getByRole("button", { name: /Ana Lima's account/ })
        .locator("[data-refy-avatar]");
      await expect(tableAvatar).toHaveCSS(
        "border-radius",
        await accountAvatar.evaluate((el) => getComputedStyle(el).borderRadius),
      );
      await scope
        .getByRole("button", { name: "Visão geral", exact: true })
        .click();
      // Recent activity lists the actor by name; their avatar must be the canonical account avatar.
      const actor = scope
        .getByRole("heading", { name: /^Ana Lima/ })
        .first()
        .locator("xpath=ancestor::*[.//*[@data-refy-avatar]][1]")
        .locator("[data-refy-avatar]")
        .first();
      await expect(actor).toHaveCSS(
        "background-image",
        await accountAvatar.evaluate(
          (el) => getComputedStyle(el).backgroundImage,
        ),
      );
    });

for (const skin of ["refy-site"])
  for (const mode of ["light"])
    test(`${skin}/${mode}: rail alinhado, com dicas em todos os alvos`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: 1280, height: 850 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${appUrl}&globals=theme:${mode};skin:${skin}`);
      const scope = page.getByTestId("playground");
      await scope.getByRole("button", { name: "Collapse menu" }).click();
      const rail = scope.locator('aside[data-mode="compact"]'),
        box = (await rail.boundingBox())!;
      await page
        .getByRole("button", { name: "Personalizar tema", exact: true })
        .focus();
      for (const name of [
        "Expand menu",
        /Current workspace/,
        "Novo projeto",
        "Visão geral",
        "Trabalho",
        "Biblioteca",
        "Configurações",
        "Componentes",
      ]) {
        const button = rail.getByRole("button", {
          name,
          exact: typeof name === "string",
        });
        const rect = (await button.boundingBox())!;
        expect(Math.abs(rect.width - 40)).toBeLessThanOrEqual(1);
        expect(Math.abs(rect.height - 40)).toBeLessThanOrEqual(1);
        expect(
          Math.abs(rect.x + rect.width / 2 - box.x - box.width / 2),
        ).toBeLessThanOrEqual(1);
        await button.focus();
        await expect(scope.getByRole("tooltip")).toBeVisible();
        await expect(button).toHaveAttribute(
          "aria-describedby",
          (await scope.getByRole("tooltip").getAttribute("id"))!,
        );
        await page.keyboard.press("Escape");
      }
      const brand = rail.getByRole("button", { name: "Expand menu" });
      await expect(brand.locator('[class*="compactBrand"]')).toBeVisible();
      await brand.hover();
      await expect(brand.locator('svg[class*="expandIcon"]')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: info.outputPath("rail.jpg"),
        type: "jpeg",
        quality: 70,
      });
    });

test("galeria mantém FabMenu, NavCard e SettingsSubnav locais e contém links de exemplo", async ({
  page,
}) => {
  await page.goto(url);
  const scope = page.getByTestId("playground");
  await expect(page).toHaveURL(/globals=theme(%3A|:)/);
  const before = page.url();
  const pages = page.context().pages().length;
  const fab = scope.locator('[data-component="FabMenu"]');
  await fab.getByRole("button", { name: "Open actions" }).click();
  await scope.getByRole("menuitem", { name: "Search content" }).click();
  const search = scope.getByRole("dialog", { name: "Search content" });
  await expect(search).toBeVisible();
  await page.keyboard.press("Escape");
  const nav = scope.locator('[data-component="NavCard"]');
  await nav.getByRole("button", { name: /Example team/ }).click();
  await expect(nav.getByRole("status")).toContainText("selected");
  const settings = scope.locator('[data-component="SettingsSubnav"]');
  await settings.getByRole("link", { name: /Billing/ }).click();
  await expect(settings).toContainText("Selected section: Billing");
  await expect(
    settings.getByRole("link", { name: /Billing/ }),
  ).toHaveAttribute("aria-current", "page");
  const breadcrumb = scope.locator('[data-component="Breadcrumb"]');
  await breadcrumb
    .getByRole("button", { name: "Projects", exact: true })
    .click();
  await breadcrumb.getByRole("button", { name: "Open Library" }).click();
  await expect(
    breadcrumb.getByRole("button", { name: "Open Content guide" }),
  ).toBeVisible();
  expect(page.url()).toBe(before);
  expect(page.context().pages()).toHaveLength(pages);
});

for (const width of [375, 768, 1280])
  test(`${width}px: drawer direito por abas, validação, exportação e retorno de foco`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    // Refy's primary button is a gradient built from --primary; Fluido's gradient has fixed colors.
    await page.goto(`${appUrl}&globals=skin:refy-site;theme:dark;fonts:studio`);
    const scope = page.getByTestId("playground"),
      primary = scope.getByRole("button", {
        name: "Criar projeto",
        exact: true,
      });
    const trigger = page.getByRole("button", {
      name: "Personalizar tema",
      exact: true,
    });
    await trigger.click();
    const editor = page.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    await expect(editor).toBeVisible();
    await editor.evaluate((el) =>
      Promise.all(el.getAnimations().map((a) => a.finished)),
    );
    const rect = (await editor.boundingBox())!;
    expect(Math.abs(rect.x + rect.width - width)).toBeLessThanOrEqual(1);
    if (width === 1280) {
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: info.outputPath("editor.jpg"),
        type: "jpeg",
        quality: 70,
      });
    }
    await expect(editor.locator("details")).toHaveCount(0);
    await expect(editor.getByRole("tab")).toHaveCount(7);
    await editor.getByLabel("Ação principal", { exact: true }).fill("#1749b8");
    await expect(primary).toHaveCSS("background-image", /rgb\(23, 73, 184\)/);
    await editor.getByRole("tab", { name: "Forma", exact: true }).click();
    await editor.getByLabel("Arredondamento geral (px)").fill("0");
    await editor.getByLabel("Espessura das bordas (px)").fill("2");
    await expect(primary).toHaveCSS("border-radius", "0px");
    await expect(primary).toHaveCSS("border-top-width", "2px");
    await editor.getByRole("tab", { name: "Tipografia", exact: true }).click();
    await editor.getByLabel("Texto base (px)").fill("20");
    await editor.getByRole("tab", { name: "Tokens", exact: true }).click();
    await editor.getByLabel("Buscar token").fill("--button-primary-background");
    await editor
      .getByRole("option", { name: /^--button-primary-background (Cor|Degradê)$/ })
      .click();
    await editor
      .getByText("Editar valor CSS ou referência", { exact: true })
      .click();
    await editor.getByLabel("Valor do token").fill("not-a-color");
    await editor.getByRole("button", { name: "Aplicar valor" }).click();
    await expect(editor.getByRole("alert")).toContainText("inválido");
    await editor.getByRole("tab", { name: "Exportar", exact: true }).click();
    const exported = await editor
      .getByLabel("Tema aplicado", { exact: true })
      .locator("code")
      .innerText();
    await editor.getByLabel("Importar tema JSON").fill("{invalid");
    await editor
      .getByRole("button", { name: "Importar tema", exact: true })
      .click();
    await expect(editor).toContainText("JSON inválido");
    await editor.getByLabel("Importar tema JSON").fill(exported);
    await editor
      .getByRole("button", { name: "Importar tema", exact: true })
      .click();
    await expect(editor).toContainText("Tema importado");
    await expect(primary).toHaveCSS("background-image", /rgb\(23, 73, 184\)/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.keyboard.press("Escape");
    await expect(editor).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.reload();
    await expect(primary).toHaveCSS("background-image", /rgb\(23, 73, 184\)/);
  });

test("editor de fontes substitui override tipográfico e preserva personalização", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/?path=/story/fundamentos-playground--acesso");
  const frame = frameOf(page);
  await frame
    .getByRole("button", { name: "Personalizar tema", exact: true })
    .click();
  const editor = frame.getByRole("dialog", {
    name: "Personalizar tema",
    exact: true,
  });
  await editor.getByRole("tab", { name: "Tokens", exact: true }).click();
  await editor.getByLabel("Buscar token").fill("--font-body");
  await editor.getByRole("option", { name: /--font-body/ }).click();
  await editor
    .getByText("Editar valor CSS ou referência", { exact: true })
    .click();
  await editor.getByLabel("Valor do token").fill("Georgia, serif");
  await editor.getByRole("button", { name: "Aplicar valor" }).click();
  await expect(frame.getByLabel("Email")).toHaveCSS("font-family", /Georgia/);
  await editor.getByRole("button", { name: "Close", exact: true }).click();
  await choose(page, "fonts", "plex");
  await expect(frame.getByLabel("Email")).toHaveCSS(
    "font-family",
    /IBM Plex Sans/,
  );
});

for (const width of [375, 768, 1280])
  test(`${width}px: acesso e setup completos nas três fontes`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(
      "/?path=/story/fundamentos-playground--acesso&globals=theme:dark",
    );
    const frame = frameOf(page),
      scope = frame.getByTestId("playground");
    await scope.getByLabel("Email").fill("teste@example.com");
    await scope.getByLabel("Password", { exact: true }).fill("exemplo-local");
    await scope.getByRole("button", { name: "Sign in to the demo" }).click();
    await expect(
      scope.getByRole("heading", { name: "Visão geral", exact: true }),
    ).toBeVisible();
    await page.goto("/?path=/story/fundamentos-playground--setup&globals=theme:dark");
    await scope
      .getByLabel("Space name")
      .fill("Espaço de demonstração com nome comprido");
    await scope.getByRole("button", { name: "Continue", exact: true }).click();
    await scope.getByRole("radio", { name: /Invited only/ }).click();
    await scope.getByRole("button", { name: "Continue", exact: true }).click();
    await scope
      .getByRole("button", { name: "Create space and open the app" })
      .click();
    for (const font of ["humanist", "plex", "studio"]) {
      await choose(page, "fonts", font);
      expect(
        await frame
          .locator("html")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await expect(
        scope.getByRole("heading", { name: "Visão geral", exact: true }),
      ).toBeVisible();
    }
  });

for (const skin of ["terracota"])
  for (const mode of ["light"])
    for (const surface of ["modal", "drawer"])
      test(`${skin}/${mode}/${surface}: menu, tooltip e aviso herdam tema e prioridade`, async ({
        page,
      }, info) => {
        await page.setViewportSize({ width: 1280, height: 850 });
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(
          `/iframe.html?id=verificacao-contratos-essenciais--camadas&viewMode=story&args=mode:${mode};surface:${surface}&globals=theme:${mode};skin:${skin};fonts:plex`,
        );
        await page.addScriptTag({ content: axe });
        await page.getByRole("button", { name: "Abrir fluxo" }).click();
        const dialog = page.getByRole("dialog", {
          name: surface === "modal" ? "Fluxo modal" : "Fluxo drawer",
          exact: true,
        });
        const trigger = dialog.getByRole("button", { name: "Ações do fluxo" });
        await trigger.click();
        const menu = page.getByRole("menu");
        // The menu is portaled: its radius must come from the theme scope of the dialog that opened it.
        await expect(menu).toHaveCSS(
          "border-radius",
          await dialog.evaluate((el) => {
            const probe = document.createElement("span");
            probe.style.borderRadius = "var(--radius-default)";
            el.appendChild(probe);
            const value = getComputedStyle(probe).borderRadius;
            probe.remove();
            return value;
          }),
        );
        await expect(menu).toHaveCSS("font-family", /IBM Plex Sans/);
        const menuBox = (await menu.boundingBox())!;
        expect(
          await page.evaluate(
            ({ x, y }) =>
              document.elementFromPoint(x, y)?.closest('[role="menu"]') != null,
            { x: menuBox.x + 12, y: menuBox.y + 12 },
          ),
        ).toBe(true);
        const failures = await menu.evaluate(
          async (el) =>
            (await (window as any).axe.run(el, { runOnly: ["color-contrast"] }))
              .violations,
        );
        expect(failures).toEqual([]);
        await dialog.getByRole("button", { name: "Ajuda do fluxo" }).hover();
        await expect(page.getByRole("tooltip")).toBeVisible();
        await expect(dialog.getByRole("status")).toContainText("Aviso global");
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await expect(menu).toHaveCount(0);
        await expect(trigger).toBeFocused();
        await trigger.click();
        await page
          .getByRole("menuitem", { name: "Confirmar", exact: true })
          .click();
        await expect(dialog).toContainText("Seleções: 1");
        await page.keyboard.press("Escape");
        await expect(dialog).toHaveCount(0);
        await expect(
          page.getByRole("button", { name: "Abrir fluxo" }),
        ).toBeFocused();
      });

for (const skin of ["refy-site"])
  for (const mode of ["light"])
    test(`${skin}/${mode}: Fab e calendário compartilham a ação de Button`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${url}&globals=skin:${skin};theme:${mode}`);
      const scope = page.getByTestId("playground");
      await scope
        .getByRole("radio", {
          name: `All (${componentCatalog.length})`,
          exact: true,
        })
        .click();
      await expect(scope.locator("[data-demo-ready]")).toHaveCount(
        componentCatalog.length,
      );
      const button = scope.locator('[data-component="Button"] button').first();
      const fab = scope.locator('[data-component="FabMenu"] button').first();
      const appearance = async (el: typeof button) =>
        el.evaluate((node) => {
          const s = getComputedStyle(node);
          return [s.backgroundImage, s.backgroundColor, s.color];
        });
      const normal = await appearance(button);
      expect(await appearance(fab)).toEqual(normal);
      await button.hover();
      await button.evaluate((el) =>
        Promise.all(el.getAnimations().map((a) => a.finished)),
      );
      const hovered = await appearance(button);
      await fab.hover();
      await expect.poll(() => appearance(fab)).toEqual(hovered);
      await fab.press("Tab");
      const calendar = scope.locator('[data-component="Calendar"]');
      await calendar
        .locator('[role="gridcell"]:not([disabled])')
        .nth(14)
        .click();
      await page.mouse.move(0, 0);
      const selected = calendar.locator('[aria-selected="true"] span').first();
      await expect.poll(() => appearance(selected)).toEqual(normal);
      const input = scope.locator('[data-component="Input"] input');
      await input.focus();
      const focusColors = await input.evaluate((el) => {
        const shadow = getComputedStyle(el.parentElement!).boxShadow.match(
          /(?:rgba?|color)\([^)]*\)/,
        )?.[0];
        const primary = getComputedStyle(el).getPropertyValue("--primary");
        const canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d")!;
        const rgb = (value: string) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = value;
          ctx.fillRect(0, 0, 1, 1);
          return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
        };
        return [rgb(shadow ?? "transparent"), rgb(primary)];
      });
      for (let i = 0; i < 3; i++)
        expect(
          Math.abs(focusColors[0][i] - focusColors[1][i]),
        ).toBeLessThanOrEqual(3);
    });
