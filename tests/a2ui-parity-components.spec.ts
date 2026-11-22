import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
const story = (page: Page, id: string, mode = "light") =>
  page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:refy;mode:${mode}`);

for (const mode of ["light", "dark"]) {
  // interação: Rating
  test(`Rating: setas, Home e End mudam a nota e o foco acompanha (${mode})`, async ({ page }) => {
    await story(page, "components-atoms-rating--escolha", mode);
    const three = page.getByRole("radio", { name: "3 out of 5 stars" });
    await expect(three).toHaveAttribute("aria-checked", "true");
    await three.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "4 out of 5 stars" })).toBeFocused();
    await expect(page.getByText("Value: 4", { exact: true })).toBeVisible();
    await page.keyboard.press("Home");
    await expect(page.getByText("Value: 1", { exact: true })).toBeVisible();
    await page.keyboard.press("End");
    await expect(page.getByText("Value: 5", { exact: true })).toBeVisible();
    // Clicar de novo na estrela escolhida limpa a nota.
    await page.getByRole("radio", { name: "5 out of 5 stars" }).click();
    await expect(page.getByText("Value: 0", { exact: true })).toBeVisible();
  });
}

test("Rating: leitura com fração é uma imagem com a nota e as avaliações", async ({ page }) => {
  await story(page, "components-atoms-rating--leitura");
  await expect(page.getByRole("img", { name: /^Restaurant rating: 4\.5 out of 5, 128 reviews$/ })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
});

// interação: ImageGallery
test("ImageGallery: a foto abre ampliada, as setas trocam, Esc fecha e o foco volta", async ({ page }) => {
  await story(page, "components-molecules-imagegallery--padrao");
  const first = page.getByRole("button", { name: /^Open photo 1 of 6: / });
  await first.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("1 of 6", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText("2 of 6", { exact: true })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByText("6 of 6", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(first).toBeFocused();
});

// interação: Citation
test("Citation: o foco abre a fonte e Esc fecha", async ({ page }) => {
  await story(page, "components-atoms-citation--padrao");
  const marker = page.getByRole("button", { name: /^Source 1: / });
  await marker.focus();
  const snippet = page.getByText("Text and images of text have a contrast ratio of at least 4.5:1.");
  await expect(snippet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(snippet).toBeHidden();
});

// interação: FollowUp
test("FollowUp: a sugestão entrega a mensagem longa ao app", async ({ page }) => {
  await story(page, "components-molecules-followup--padrao");
  await page.getByRole("button", { name: "Export as a table" }).click();
  await expect(page.getByText("Sent: Export these orders as a table", { exact: true })).toBeVisible();
});

// interação: Video
test("Video: nada do arquivo toca antes do clique; o clique troca a capa pelo player", async ({ page }) => {
  await story(page, "components-molecules-video--arquivo");
  await expect(page.locator("video")).toHaveCount(0);
  await page.getByRole("button", { name: "Play video: Theme colors in motion" }).click();
  await expect(page.locator("video")).toHaveCount(1);
});

test("Video: YouTube abre no domínio sem cookies só depois do clique", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", (request) => { if (/youtube/.test(new URL(request.url()).hostname)) calls.push(request.url()); });
  await page.route(/youtube(-nocookie)?\.com/, (route) => route.fulfill({ status: 200, body: "" }));
  await story(page, "components-molecules-video--you-tube");
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(calls).toEqual([]);
  await page.getByRole("button", { name: /^Play video: / }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /^https:\/\/www\.youtube-nocookie\.com\/embed\//);
});

// interação: Agenda
test("Agenda: compromisso clicável é botão e entrega o evento", async ({ page }) => {
  await story(page, "components-organisms-agenda--clicavel");
  await page.getByRole("button", { name: /Opening keynote/ }).click();
  await expect(page.getByText("Picked: Opening keynote", { exact: true })).toBeVisible();
});

// interação: ComparisonTable
test("ComparisonTable: marcas de sim e não têm texto para leitor de tela", async ({ page }) => {
  await story(page, "components-organisms-comparisontable--padrao");
  const table = page.getByRole("table", { name: "Plan comparison" });
  await expect(table).toBeVisible();
  await expect(table.getByText("Yes", { exact: true }).first()).toBeAttached();
  await expect(table.getByText("No", { exact: true }).first()).toBeAttached();
  await expect(table.getByText("Recommended", { exact: true })).toBeVisible();
});

// interação: Quote
test("Quote: citação em bloco com autor e origem na legenda", async ({ page }) => {
  await story(page, "components-molecules-quote--bloco");
  const figure = page.locator("figure").first();
  await expect(figure.locator("blockquote")).toContainText("We changed the theme file on a Friday");
  await expect(figure.locator("figcaption")).toContainText("Ana Ribeiro");
  await expect(figure.locator("figcaption")).toContainText("Product lead, Horizon");
  await expect(page.getByRole("button")).toHaveCount(0);
});

// interação: KeyValueList
test("KeyValueList: cada valor fica ligado ao rótulo numa lista de descrição com título", async ({ page }) => {
  await story(page, "components-molecules-keyvaluelist--linhas");
  await expect(page.getByRole("heading", { name: "Order #48213" })).toBeVisible();
  const list = page.locator("dl").first();
  await expect(list).toHaveAttribute("aria-labelledby", /.+/);
  await expect(list.locator("dt")).toHaveText(["Placed on", "Delivery", "Payment", "Total"]);
  await expect(list.locator("dt + dd").last()).toContainText("$ 184.90");
});

// interação: EntityCard
test("EntityCard: a nota é lida inteira e as ações são botões na ordem", async ({ page }) => {
  await story(page, "components-organisms-entitycard--produto");
  await expect(page.getByRole("img", { name: /4\.7 out of 5, 212 reviews/ })).toBeVisible();
  const actions = page.getByRole("button");
  await expect(actions).toHaveText(["Add to cart", "Details"]);
  await actions.first().focus();
  await page.keyboard.press("Tab");
  await expect(actions.nth(1)).toBeFocused();
});

// interação: AudioPlayer
test("AudioPlayer: total antes de carregar, tocar vira pausar e o salto de 15 s anda", async ({ page }) => {
  await story(page, "components-molecules-audioplayer--padrao");
  const position = page.getByRole("slider", { name: "Position" });
  await expect(position).toHaveAttribute("aria-valuetext", "0:00 of 0:10");
  await page.getByRole("button", { name: "Play Four tones" }).click();
  await expect(page.getByRole("button", { name: "Pause Four tones" })).toBeVisible();
  await page.getByRole("button", { name: "Pause Four tones" }).click();
  await page.getByRole("button", { name: "Forward 15 seconds" }).click();
  await expect(position).toHaveAttribute("aria-valuetext", /of 0:10$/);
});

// interação: LinkCard
test("LinkCard: o cartão inteiro é um link que avisa da nova aba", async ({ page }) => {
  await story(page, "components-molecules-linkcard--horizontal");
  const link = page.getByRole("link", { name: /Getting started with refy.*\(opens in a new tab\)/ });
  await expect(link).toHaveAttribute("href", "https://refy.design/docs");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(page.getByText("refy.design", { exact: true })).toBeVisible();
});

test("Rating: com showLabel o rótulo aparece em cima e a nota continua lida inteira", async ({ page }) => {
  await story(page, "components-atoms-rating--com-rotulo");
  await expect(page.getByText("Customer rating", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /^Customer rating: 4\.6 out of 5, 1,284 reviews$/ })).toBeVisible();
});

test("Agenda: cartão com título e dia sem compromisso dentro do intervalo", async ({ page }) => {
  await story(page, "components-organisms-agenda--padrao");
  await expect(page.getByRole("heading", { name: "Conference week" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Thursday, November 26/ })).toBeVisible();
  await expect(page.getByText("Nothing scheduled", { exact: true })).toBeVisible();
});

test("EntityCard: sem foto vira cartão compacto com categoria e selo na mesma linha", async ({ page }) => {
  await story(page, "components-organisms-entitycard--compacto");
  await expect(page.locator("article img")).toHaveCount(0);
  const category = page.getByText("Teapots", { exact: true });
  const badge = page.getByText("In stock", { exact: true });
  const [a, b] = await Promise.all([category.boundingBox(), badge.boundingBox()]);
  expect(Math.abs((a!.y + a!.height / 2) - (b!.y + b!.height / 2))).toBeLessThan(4);
});
