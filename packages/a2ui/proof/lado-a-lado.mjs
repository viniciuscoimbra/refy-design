// Task 3.2 de add-a2ui-catalog: o mesmo JSON do agente (demo/visita.ts) na web, em 390 px, e no
// iPhone (native-demo no Expo Go), lado a lado, nos temas Refy e Terracota, claro e escuro.
//
// Fotos do iPhone antes (uma por tema e estado, tela inteira do simulador):
//   (cd native-demo && ./sim-open.sh "tema=refy&modo=claro&estado=form" ../proof/out/nativo/refy-claro-form.png)
// Depois: node proof/lado-a-lado.mjs → proof/out/web/*.png e proof/out/lado-a-lado/*.png.
// Os estados da web são feitos na tela (chips, campo, botão); os do app vêm pelo link que o abre.
import { createServer } from "vite";
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
const native = path.join(out, "nativo");
for (const dir of ["web", "lado-a-lado"]) mkdirSync(path.join(out, dir), { recursive: true });

const TEMAS = ["refy", "terracota"];
const MODOS = ["claro", "escuro"];
const ESTADOS = ["form", "preenchido", "marcada"];
const LEGENDA = { form: "Como o agente mandou", preenchido: "Dia, horário e nome escolhidos", marcada: "Depois de Agendar visita" };

const server = await createServer({ configFile: path.join(here, "..", "vite.config.ts"), server: { port: 0 }, logLevel: "error" });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const problems = [];

try {
  for (const tema of TEMAS) for (const modo of MODOS) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    page.on("pageerror", (error) => problems.push(`${tema}-${modo}: ${error}`));
    // Relógio parado: o "N pessoas estão vendo" troca a cada 4 s na demo; o app nativo fica em 2.
    await page.clock.install();
    await page.goto(`${base}?tema=${tema}&modo=${modo}`);
    await page.clock.runFor(1000);
    const surface = page.getByTestId("superficie");
    await surface.getByText("Apartamento na Rua Augusta").waitFor();
    await page.locator("img.ra-image").evaluate((img) => img.decode());
    await page.evaluate(() => document.fonts.ready);
    const shot = (estado) => surface.screenshot({ path: path.join(out, "web", `${tema}-${modo}-${estado}.png`), animations: "disabled" });
    await shot("form");
    await surface.getByRole("radio", { name: "Sex 14" }).or(surface.getByText("Sex 14", { exact: true })).first().click();
    await surface.getByRole("radio", { name: "14h" }).or(surface.getByText("14h", { exact: true })).first().click();
    await surface.getByLabel("Seu nome").fill("Ana");
    await page.mouse.move(0, 0);
    await page.locator(":focus").evaluate((el) => el.blur()).catch(() => undefined);
    await shot("preenchido");
    await surface.getByRole("button", { name: "Agendar visita" }).click();
    await surface.getByText("Visita marcada").waitFor();
    await page.mouse.move(0, 0);
    await page.locator(":focus").evaluate((el) => el.blur()).catch(() => undefined);
    await shot("marcada");
    const detalhe = await surface.getByText(/Ana, sua visita é/).textContent();
    if (detalhe?.trim() !== "Ana, sua visita é sexta, 14/11, às 14h. Te aviso 1 hora antes.") problems.push(`${tema}-${modo}: confirmação "${detalhe}"`);
    await page.close();
  }

  // Composição: web à esquerda, iPhone à direita, cada um na escala 3x, para ver no celular.
  const page = await browser.newPage({ viewport: { width: 1080, height: 800 }, deviceScaleFactor: 1 });
  for (const tema of TEMAS) for (const modo of MODOS) {
    for (const estado of ESTADOS) {
      const nativeFile = path.join(native, `${tema}-${modo}-${estado}.png`);
      if (!existsSync(nativeFile)) {
        problems.push(`falta ${nativeFile}`);
        continue;
      }
      const data = (file) => `data:image/png;base64,${readFileSync(file).toString("base64")}`;
      await page.setContent(`<!doctype html><html><body style="margin:0;background:#e9e9e6;font:600 26px system-ui">
        <div id="frame" style="padding:28px;display:grid;gap:18px;width:1024px">
          <div style="font-size:30px">${tema === "refy" ? "Refy" : "Terracota"} ${modo} · ${LEGENDA[estado]}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
            <figure style="margin:0"><figcaption style="margin-bottom:10px;color:#555">Web · 390 px</figcaption><img id="web" style="display:block"></figure>
            <figure style="margin:0"><figcaption style="margin-bottom:10px;color:#555">iPhone 16 · Expo Go</figcaption><canvas id="ios" style="display:block"></canvas></figure>
          </div>
        </div></body></html>`);
      await page.evaluate(
        async ([web, ios]) => {
          const load = (src) => new Promise((resolve) => { const img = new Image(); img.onload = () => resolve(img); img.src = src; });
          const webImg = await load(web);
          document.getElementById("web").src = web;
          // O iPhone: só o cartão da superfície (a web fotografa o elemento), na mesma escala 3x.
          const img = await load(ios);
          const scratch = document.createElement("canvas");
          scratch.width = img.width;
          scratch.height = img.height;
          const ctx = scratch.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const pad = 48; // --space-4 (16 pt) do app em volta da superfície, a 3x
          const bg = ctx.getImageData(5, img.height - 5, 1, 1).data;
          const blank = (y) => { const d = ctx.getImageData(pad, y, img.width - 2 * pad, 1).data; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 12) return false; return true; };
          let top = 170;
          while (top < img.height && blank(top)) top += 1;
          let bottom = img.height - 1;
          while (bottom > top && blank(bottom)) bottom -= 1;
          const canvas = document.getElementById("ios");
          canvas.width = img.width - 2 * pad;
          canvas.height = bottom + 1 - top;
          canvas.getContext("2d").drawImage(img, pad, top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          // Mesma escala nas duas colunas: 1 pt da web = 1 pt do iPhone.
          const scale = 488 / Math.max(webImg.width, canvas.width);
          document.getElementById("web").style.width = `${webImg.width * scale}px`;
          canvas.style.width = `${canvas.width * scale}px`;
          return webImg.width;
        },
        [data(path.join(out, "web", `${tema}-${modo}-${estado}.png`)), data(nativeFile)],
      );
      await page.locator("#frame").screenshot({ path: path.join(out, "lado-a-lado", `${tema}-${modo}-${estado}.png`) });
    }
  }
} finally {
  await browser.close();
  await server.close();
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`ok: ${TEMAS.length * MODOS.length * ESTADOS.length} pares em ${path.join(out, "lado-a-lado")}`);
