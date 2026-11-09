import { defineConfig, devices } from "@playwright/test";
// REFY_STORYBOOK_PORT muda a porta do servidor que o Playwright sobe: no runner próprio a 6006
// pode estar ocupada por um Storybook de quem hospeda a máquina.
const port = Number(process.env.REFY_STORYBOOK_PORT || 6006);
const baseURL = process.env.REFY_STORYBOOK_URL || `http://127.0.0.1:${port}`;
// Firefox e WebKit rodam só onde o navegador muda o comportamento: foco, select
// nativo e conteúdo em portal. O resto da suíte pública roda no Chromium.
const crossBrowser = [
  "core", "themes", "refy-residual-focus", "control-focus-ring",
  "combobox-focus-ring", "native-select-state", "consumer-overlays",
].map((name) => `**/${name}.spec.ts`);
export default defineConfig({
  testDir: "./tests",
  // Os *.test.mjs são do node --test; tests/oficina/ é a matriz da oficina
  // (playwright.oficina.config.ts), fora do repositório público.
  testMatch: "**/*.spec.ts",
  testIgnore: "oficina/**",
  outputDir: "./test-results",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { open: "never" }]],
  // A interface do site e do playground segue o idioma do navegador; os testes leem
  // os rótulos em português. Exemplos e código são sempre em inglês.
  use: { baseURL, locale: "pt-BR", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", testMatch: crossBrowser, use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", testMatch: crossBrowser, use: { ...devices["Desktop Safari"] } },
  ],
  webServer: process.env.REFY_STORYBOOK_URL ? undefined : { command: process.env.CI ? `vite preview --outDir storybook-static --host 127.0.0.1 --port ${port} --strictPort` : `storybook dev -p ${port} --host 127.0.0.1 --no-open --ci`, url: `http://127.0.0.1:${port}`, reuseExistingServer: !process.env.CI, timeout: 120000 },
});
