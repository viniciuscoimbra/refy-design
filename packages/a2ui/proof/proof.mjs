// Prova web do A2UI: sobe a demo com vite e fotografa em 390 px, temas Refy e Terracota,
// claro e escuro. Em cada combinação: tela inicial, Agendar sem dados (aviso) e com dados
// (confirmação). Grava as ações que o agente recebeu. Usa os navegadores do Playwright já instalados.
import { createServer } from "vite";
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
mkdirSync(out, { recursive: true });

const server = await createServer({
  configFile: path.join(here, "..", "vite.config.ts"),
  server: { port: 0, strictPort: false },
  logLevel: "error",
});
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const report = { base, runs: [], problems: [] };

try {
  for (const tema of ["refy", "terracota"]) {
    for (const modo of ["claro", "escuro"]) {
      const name = `${tema}-${modo}`;
      const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
      const errors = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
      await page.goto(`${base}?tema=${tema}&modo=${modo}`);
      const surface = page.getByTestId("superficie");
      await surface.getByText("Apartamento na Rua Augusta").waitFor();
      await page.locator("img.ra-image").evaluate((img) => img.decode());
      await page.evaluate(() => document.fonts.ready);
      const shot = (step) => {
        const file = path.join(out, `${name}-${step}.png`);
        return page.screenshot({ path: file, fullPage: true }).then(() => file);
      };
      const shots = [await shot("1-inicial")];

      const agendar = surface.getByRole("button", { name: "Agendar visita" });
      await agendar.click();
      await surface.getByText("Falta escolher o dia, o horário ou dizer seu nome.").waitFor();
      shots.push(await shot("2-sem-dados"));

      await surface.getByRole("radio", { name: "Sex 14" }).or(surface.getByRole("button", { name: "Sex 14" })).first().click();
      await surface.getByRole("radio", { name: "14h" }).or(surface.getByRole("button", { name: "14h" })).first().click();
      await surface.getByLabel("Seu nome").fill("Marina");
      await agendar.click();
      await surface.getByText("Visita marcada").waitFor();
      await page.getByText("Pronto, Marina. Mandei o convite pro corretor.").waitFor();
      shots.push(await shot("3-com-dados"));

      const actions = await page.evaluate(() => window.a2uiActions);
      const last = actions.at(-1);
      const expected = { dia: ["sexta, 14/11"], hora: ["14h"], nome: "Marina", lembrete: true };
      for (const [key, value] of Object.entries(expected)) {
        if (JSON.stringify(last?.context?.[key]) !== JSON.stringify(value)) {
          report.problems.push(`${name}: context.${key} = ${JSON.stringify(last?.context?.[key])}`);
        }
      }
      if (errors.length) report.problems.push(...errors.map((e) => `${name}: ${e}`));
      report.runs.push({ name, shots: shots.map((f) => path.relative(here, f)), actions, errors });
      await page.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}

writeFileSync(path.join(out, "acoes.json"), JSON.stringify(report, null, 2));
for (const run of report.runs) console.log(`${run.name}: ${run.shots.join(", ")} · ações: ${run.actions.map((a) => a.name).join(", ")}`);
if (report.problems.length) {
  console.error("Problemas:\n" + report.problems.join("\n"));
  process.exit(1);
}
console.log(`ok · ${report.runs.length} combinações · ${path.relative(process.cwd(), path.join(out, "acoes.json"))}`);
