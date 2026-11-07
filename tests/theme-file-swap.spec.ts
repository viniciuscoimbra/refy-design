import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";

// Trocar o arquivo de configuração muda tudo. Só o arquivo de tema muda entre as
// duas rodadas: o mesmo site, com terracota.json e depois cobalto.json, muda o hero inteiro.
const file = (name: string) => readFileSync(new URL(`../src/themes/${name}.json`, import.meta.url), "utf8");

// O seletor "Tema do site" troca apenas o arquivo de tema aplicado ao site inteiro.
async function useFile(page: Page, label: string) {
  await page.goto("/iframe.html?id=refy-site--inicio&viewMode=story&globals=theme:refy-site;mode:light");
  const choice = page.getByRole("radiogroup", { name: "Tema do site", exact: true }).getByRole("radio", { name: label, exact: true });
  await choice.click();
  // A troca passa por uma View Transition: o tema novo só vale depois que a escolha aparece marcada.
  await expect(choice).toBeChecked();
  await page.evaluate(() => (document as Document & { activeViewTransition?: { finished: Promise<void> } }).activeViewTransition?.finished.catch(() => {}));
  await expect.poll(() => page.getByRole("button", { name: "Abrir no Playground" }).first().evaluate((b) => getComputedStyle(b).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  const title = page.getByRole("heading", { level: 1, name: /Seu design/ });
  await expect(title).toBeVisible();
  return page.evaluate(() => {
    const root = document.querySelector("[data-refy-site-root]")!;
    const token = (name: string) => {
      const probe = document.createElement("span"); probe.style.color = `var(${name})`; root.appendChild(probe);
      const value = getComputedStyle(probe).color; probe.remove(); return value;
    };
    const h1 = [...document.querySelectorAll("h1")].find((el) => el.textContent?.includes("Seu design"))!;
    const style = getComputedStyle(h1);
    const button = [...document.querySelectorAll("a, button")].find((b) => b.textContent?.includes("Abrir no Playground"))!;
    const mark = document.querySelector("[data-refy-brand-mark]")!;
    let hero: Element | null = h1.parentElement;
    while (hero && getComputedStyle(hero).display !== "grid") hero = hero.parentElement;
    const columns = hero ? getComputedStyle(hero).gridTemplateColumns : "none";
    return {
      titleFont: style.fontFamily, titleAlign: style.textAlign, titleWeight: style.fontWeight,
      primary: getComputedStyle(button).backgroundColor, radius: getComputedStyle(button).borderRadius,
      good: token("--good"), chart: token("--chart-primary"), mark: getComputedStyle(mark).color, columns,
    };
  });
}

test("trocar só o arquivo de tema muda o hero, cores, raio, estado, gráfico e marca", async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const a = await useFile(page, JSON.parse(file("terracota")).label);
  const b = await useFile(page, JSON.parse(file("cobalto")).label);
  expect(a.titleFont).toContain("IBM Plex Serif");
  expect(b.titleFont).toContain("Space Grotesk");
  expect(a.titleAlign).toBe("start");
  expect(b.titleAlign).toBe("center");
  for (const key of ["titleWeight", "primary", "radius", "good", "chart", "mark", "columns"] as const) expect.soft(a[key], key).not.toBe(b[key]);
});
