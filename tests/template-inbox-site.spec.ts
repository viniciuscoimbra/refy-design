import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";

// No site (não no Storybook), o plugin vite-demo-text traduz os textos dos templates. O que a
// pessoa digita não pode passar por essa tradução: "Yesterday" enviado continua "Yesterday".
const port = Number(process.env.REFY_SITE_TEST_PORT_INBOX || 5392);
const siteURL = `http://127.0.0.1:${port}`;
let server: ChildProcess | undefined;

// Roda só no Chromium (fora de webkitOnly): o defeito é do plugin de tradução, não do navegador,
// e dois projetos subindo o mesmo servidor na mesma porta disputariam o ciclo de vida dele.
test.describe.configure({ mode: "serial" });
test.use({ baseURL: siteURL, viewport: { width: 1280, height: 900 }, locale: "pt-BR" });

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

// interação: IntentComposer, MessageScroller
test("inbox-01 no site em pt: resposta enviada aparece como foi digitada", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/block-preview.html?refy-block=inbox-01&lang=pt");
  // Os textos semeados seguem o idioma do site.
  await expect(page.getByRole("heading", { name: "Atendimento", level: 1 })).toBeVisible({ timeout: 30000 });
  const log = page.getByRole("log", { name: "Mensagens" });
  await expect(log).toContainText("Oi! O apartamento em Perdizes ainda está disponível?");
  await page.getByLabel("Resposta", { exact: true }).fill("Yesterday");
  await page.getByRole("button", { name: "Enviar resposta", exact: true }).click();
  await expect(log.getByText("Yesterday", { exact: true })).toBeVisible();
  await expect(log).not.toContainText("Ontem");
  await expect(page.getByRole("button", { name: /Ana Souza/ })).toContainText("Você: Yesterday");
});
