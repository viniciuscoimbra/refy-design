import type { Page } from "@playwright/test";
import { chartExamples } from "../src/_demo/chartExamples";
export async function chooseChart(page: Page, id: string) {
  const select = page.getByLabel("Tipo de gráfico", { exact: true });
  await select.waitFor({state:"attached"});
  if (await select.isVisible()) return select.selectOption(id);
  const name =
    id === "streaming"
      ? "Streaming"
      : chartExamples.find((item) => item.id === id)?.name;
  if (!name) throw new Error(`Gráfico desconhecido: ${id}`);
  await page
    .getByRole("navigation", { name: "Escolher gráfico" })
    .getByRole("button", { name, exact: true })
    .click();
}
