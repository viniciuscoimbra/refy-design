import { test, expect } from "@playwright/test";
import { mkdtempSync, writeFileSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
test.use({ screenshot: "off", trace: "off" });
test("o código de cada família de gráfico compila como consumidor público", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "A compilação de TypeScript não varia entre navegadores.",
  );
  test.setTimeout(180000);
  const temp = mkdtempSync(join(tmpdir(), "refy-chart-code-"));
  try {
    await page.goto(
      "/iframe.html?id=fundamentos-playground--charts&viewMode=story&globals=theme:refy-site;mode:light",
    );
    const docs = page.getByRole("main", { name: "Documentação de charts", exact: true });
    const nav = docs.getByRole("navigation", { name: "Escolher gráfico", exact: true });
    await expect(nav.getByRole("button").first()).toBeVisible();
    const families = await nav.getByRole("button").allTextContents();
    expect(families.length).toBeGreaterThanOrEqual(20);
    const sources = new Set<string>();
    for (const [index, family] of families.entries()) {
      await nav.getByRole("button", { name: family, exact: true }).click();
      // Streaming tem a própria alternância ("Código do streaming"); as demais famílias usam "Código".
      await docs.getByRole("radio", { name: /^Código/ }).first().click();
      const source = await docs.locator("pre code").filter({ visible: true }).first().innerText();
      expect(source, family).toContain("@refy-design/web");
      sources.add(source);
      writeFileSync(join(temp, `example-${index}.tsx`), source);
    }
    expect(sources.size).toBe(families.length);
    symlinkSync(resolve("node_modules"), join(temp, "node_modules"), "dir");
    writeFileSync(
      join(temp, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          paths: { "@refy-design/web": [resolve("dist/index.d.ts")] },
        },
        include: ["*.tsx"],
      }),
    );
    execFileSync(
      process.execPath,
      [
        resolve("node_modules/typescript/bin/tsc"),
        "-p",
        join(temp, "tsconfig.json"),
      ],
      { stdio: "pipe" },
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
