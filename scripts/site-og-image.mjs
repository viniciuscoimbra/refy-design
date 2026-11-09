// Gera site/og.png, a imagem que aparece quando alguém compartilha um link do refy.design
// (WhatsApp, LinkedIn, X, Slack). É a home real no tema Refy claro, 1200×630, só com o logo no topo.
// Uso: com o site no ar localmente (ex.: npx vite preview --outDir dist-site --port 4173),
//      node scripts/site-og-image.mjs http://localhost:4173
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:4173";
const browser = await chromium.launch({ executablePath: process.env.REFY_CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: "pt-BR", colorScheme: "light" });
await page.goto(`${base}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(4000); // a frase do hero entra animada
await page.evaluate(() => {
  const tabs = [...document.querySelectorAll("[role=tablist],[role=radiogroup]")].find((e) => /Fluido/.test(e.textContent ?? ""));
  if (tabs instanceof HTMLElement) tabs.style.visibility = "hidden";
  const header = document.querySelector("header");
  const logo = header?.querySelector("[class*=brandLink]");
  header?.querySelectorAll("*").forEach((e) => { if (logo && !e.contains(logo) && !logo.contains(e) && e instanceof HTMLElement) e.style.visibility = "hidden"; });
  if (header) { header.style.borderBottomColor = "transparent"; header.style.boxShadow = "none"; }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(500);
await page.screenshot({ path: "site/og.png" });
await browser.close();
console.log("site/og.png gravado");
