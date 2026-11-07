import { test, expect, type Page } from "@playwright/test";
import {
  mkdtempSync,
  writeFileSync,
  mkdirSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
test.use({ screenshot: "off", trace: "off" });
const base = "/iframe.html?id=fundamentos-playground--blocks&viewMode=story";
// A lista sai do próprio menu: template novo entra no teste sem editar este arquivo.
async function templateIds(page: Page) {
  const nav = page.getByRole("navigation", { name: "Escolher template" });
  await expect(nav.locator("[data-block-target]").first()).toBeVisible();
  const ids = await nav.locator("[data-block-target]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("data-block-target")!).filter(Boolean),
  );
  expect(ids.length).toBeGreaterThanOrEqual(20);
  return ids;
}
// A largura da prévia mora na barra do Playground e vale para o template aberto.
const width = (page: Page, name: string) =>
  page.getByRole("radiogroup", { name: "Largura da prévia", exact: true }).getByRole("radio", { name, exact: true }).click();
for (const theme of ["refy-site"])
  for (const mode of ["light"])
    test(`${theme}/${mode}: catálogo, variantes e viewport real`, async ({
      page,
    }) => {
      test.setTimeout(180000);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`${base}&globals=theme:${theme};mode:${mode}`);
      const root = page.getByTestId("playground");
      expect(
        await root
          .locator("iframe")
          .first()
          .evaluate((el) => el.getBoundingClientRect().top),
      ).toBeLessThan(600);
      const expectedFont = await root.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--font-body").trim(),
      );
      const expectedRadius = await root.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--radius-lg").trim(),
      );
      {
        for (const id of await templateIds(page)) {
          await root
            .getByRole("navigation", { name: "Escolher template" })
            .locator(`[data-block-target="${id}"]`)
            .click();
          await expect(root.locator('section[id^="block-"]')).toHaveCount(1);
          const block = root.getByRole("region", {
            name: `Template: ${id}`,
            exact: true,
          });
          await block.scrollIntoViewIfNeeded();
          const frame = block.locator("iframe").contentFrame();
          await expect(frame.locator("[data-refy-scope]")).toHaveAttribute(
            "data-theme",
            mode,
            { timeout: 15000 },
          );
          await expect
            .poll(() =>
              frame
                .locator("[data-refy-scope]")
                .evaluate((el) =>
                  getComputedStyle(el).getPropertyValue("--font-body").trim(),
                ),
            )
            .toBe(expectedFont);
          expect(
            await frame
              .locator("[data-refy-scope]")
              .evaluate((el) =>
                getComputedStyle(el).getPropertyValue("--radius-lg").trim(),
              ),
          ).toBe(expectedRadius);
          await width(page, "Celular");
          await expect
            .poll(() =>
              block
                .locator("iframe")
                .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
            )
            .toBe(375);
          await expect
            .poll(
              () =>
                frame
                  .locator("html")
                  .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
              { message: `${id} sem rolagem lateral em 375 px` },
            )
            .toBe(true);
          await expect(block).toContainText("375 px");
          await width(page, "Tablet");
          await expect
            .poll(() =>
              block
                .locator("iframe")
                .evaluate((el) => Math.round(el.getBoundingClientRect().width)),
            )
            .toBe(768);
          await block
            .getByRole("radio", { name: "Código", exact: true })
            .click();
          await expect(block.locator("pre code")).toContainText(
            "export default function Page",
          );
          await expect(block.locator("[data-syntax]").first()).toBeVisible();
        }
      }
      await page.setViewportSize({ width: 375, height: 853 });
      await root
        .getByLabel("Template", { exact: true })
        .selectOption("library-01");
      const mobileBlock = root.getByRole("region", {
        name: "Template: library-01",
        exact: true,
      });
      await mobileBlock
        .getByRole("radio", { name: "Prévia", exact: true })
        .click();
      await mobileBlock.locator("iframe").scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          mobileBlock
            .locator("iframe")
            .contentFrame()
            .locator("html")
            .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });

test("arquivos de cada variante compilam contra os tipos públicos", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.goto(`${base}&globals=theme:refy-site;mode:light`);
  const temp = mkdtempSync(join(tmpdir(), "refy-block-gallery-"));
  try {
    symlinkSync(resolve("node_modules"), join(temp, "node_modules"), "dir");
    writeFileSync(
      join(temp, "css.d.ts"),
      "declare module '*.module.css' {const classes:Record<string,string>;export default classes;}",
    );
    {
      for (const id of await templateIds(page)) {
        await page
          .getByRole("navigation", { name: "Escolher template" })
          .locator(`[data-block-target="${id}"]`)
          .click();
        const block = page.getByRole("region", {
          name: `Template: ${id}`,
          exact: true,
        });
        await block.getByRole("radio", { name: "Código", exact: true }).click();
        const nav = block.getByRole("navigation", { name: `Arquivos ${id}` });
        const names = await nav.getByRole("button").allTextContents();
        mkdirSync(join(temp, id));
        for (const name of names) {
          await nav.getByRole("button", { name, exact: true }).click();
          const code = await block.locator("pre code").innerText();
          expect(code).not.toMatch(/from ["']\.\.\/index/);
          writeFileSync(join(temp, id, name), code);
        }
      }
    }
    writeFileSync(
      join(temp, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: false,
          types: ["react", "react-dom"],
          noEmit: true,
          paths: { "@refy-design/web": [resolve("dist/index.d.ts")] },
        },
        include: ["**/*.tsx", "*.d.ts"],
      }),
    );
    execFileSync(
      process.execPath,
      [
        resolve("node_modules/typescript/bin/tsc"),
        "-p",
        join(temp, "tsconfig.json"),
      ],
      { stdio: "inherit" },
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

for (const mode of ["light"])
  test(`${mode}: navegação, modal, drawer, acesso e tema ao vivo`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}&globals=theme:refy-site;mode:${mode}`);
    const root = page.getByTestId("playground");
    await root
      .getByRole("navigation", { name: "Escolher template" })
      .locator('[data-block-target="sidebar-01"]')
      .click();
    const block = root.getByRole("region", {
      name: "Template: sidebar-01",
      exact: true,
    });
    await block.scrollIntoViewIfNeeded();
    const frame = block.locator("iframe").contentFrame();
    await frame
      .getByRole("button", { name: "New project", exact: true })
      .click();
    const modal = frame.getByRole("dialog", {
      name: "New project",
      exact: true,
    });
    await modal.getByLabel("Project name").fill("Projeto da prévia");
    await modal
      .getByRole("button", { name: "Create project", exact: true })
      .click();
    await expect(
      frame.getByText("Projeto da prévia", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Personalizar tema", exact: true })
      .click();
    const editor = page.getByRole("dialog", {
      name: "Personalizar tema",
      exact: true,
    });
    await editor.getByRole("tab", { name: "Tipografia", exact: true }).click();
    await editor.getByLabel("Conjunto de fontes").selectOption("studio");
    await editor
      .getByRole("button", { name: "Ver prévia", exact: true })
      .click();
    await expect(
      frame.getByText("Projeto da prévia", { exact: true }),
    ).toBeVisible();
    const font = await root.evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--font-body").trim(),
    );
    await expect
      .poll(() =>
        frame
          .locator("[data-refy-scope]")
          .evaluate((el) =>
            getComputedStyle(el).getPropertyValue("--font-body").trim(),
          ),
      )
      .toBe(font);
    await width(page, "Celular");
    // The iframe sits partly below the fold; bring it in before working inside it.
    await block.locator("iframe").scrollIntoViewIfNeeded();
    await frame
      .getByRole("button", { name: "Abrir navegação", exact: true })
      .click();
    const drawer = frame.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await drawer
      .getByRole("button", { name: "Library", exact: true })
      .click();
    await expect(drawer).toBeHidden();
    await expect(
      frame.getByRole("heading", { name: "Library", exact: true }),
    ).toBeVisible();
    await block.getByRole("button", { name: "Reiniciar", exact: true }).click();
    await expect(
      frame.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
    await root
      .getByRole("navigation", { name: "Escolher template" })
      .locator('[data-block-target="library-01"]')
      .click();
    const library = root
      .getByRole("region", { name: "Template: library-01", exact: true })
      .locator("iframe")
      .contentFrame();
    await library.getByRole("button", { name: /^Content guide/ }).click();
    await expect(
      library.getByRole("dialog", { name: /Content guide/ }),
    ).toBeVisible();
    await library
      .getByRole("dialog")
      .getByRole("button", { name: "Fechar", exact: true })
      .click();
    await root
      .getByRole("navigation", { name: "Escolher template" })
      .locator('[data-block-target="login-01"]')
      .click();
    const login = root
      .getByRole("region", { name: "Template: login-01", exact: true })
      .locator("iframe")
      .contentFrame();
    await login
      .getByRole("button", { name: "I forgot my password", exact: true })
      .click();
    await login
      .getByLabel("Sample email", { exact: true })
      .fill("demo@example.com");
    await login
      .getByRole("button", { name: "Prepare recovery", exact: true })
      .click();
    await login
      .getByRole("button", {
        name: "Continue with the sample code",
        exact: true,
      })
      .click();
    await expect(
      login.getByRole("heading", { name: "Check your email", exact: true }),
    ).toBeVisible();
  });
