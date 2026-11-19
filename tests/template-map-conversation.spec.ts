import { test, expect, type Page } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });
const base = "/iframe.html?id=fundamentos-playground--blocks&viewMode=story&globals=theme:refy-site;mode:light";

// Abre um template da vitrine e devolve a região e o documento do iframe (textos do template em inglês).
async function openTemplate(page: Page, id: string) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base);
  const root = page.getByTestId("playground");
  await root.getByRole("navigation", { name: "Escolher template" }).locator(`[data-block-target="${id}"]`).click();
  const block = root.getByRole("region", { name: `Template: ${id}`, exact: true });
  await block.scrollIntoViewIfNeeded();
  const frame = block.locator("iframe").contentFrame();
  await expect(frame.locator("[data-refy-scope]")).toBeVisible({ timeout: 15000 });
  return { block, frame };
}

// interação: Charts, Item, Segmented
test("route-01: mapa e lista escolhem a mesma parada, por clique e teclado", async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const { frame } = await openTemplate(page, "route-01");
  const stop = (title: string) => frame.getByRole("button", { name: new RegExp(`^${title}`) });
  const outline = frame.locator("path[data-selected]");

  // Estado inicial: a próxima parada (3, Itapoã) está escolhida nos dois lados.
  await expect(stop("Penthouse with terrace")).toHaveAttribute("aria-pressed", "true");
  await expect(outline).toHaveAttribute("data-selected", "itapoa");

  // Lista -> mapa.
  await stop("House with a backyard").click();
  await expect(stop("House with a backyard")).toHaveAttribute("aria-pressed", "true");
  await expect(stop("Penthouse with terrace")).toHaveAttribute("aria-pressed", "false");
  await expect(outline).toHaveAttribute("data-selected", "santa-amelia");
  await expect(frame.getByRole("heading", { name: "5. House with a backyard" })).toBeVisible();

  // Mapa pelo teclado -> lista: Home vai à primeira região (Campo Alegre), End à última (Vila Clóris).
  const map = frame.getByRole("img", { name: /^Route map\./ });
  await map.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(stop("Back-facing, no noise")).toHaveAttribute("aria-pressed", "true");
  await expect(outline).toHaveAttribute("data-selected", "campo-alegre");
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(stop("Furnished studio")).toHaveAttribute("aria-pressed", "true");
  await expect(outline).toHaveAttribute("data-selected", "vila-cloris");

  // Mapa pelo clique -> lista.
  await frame.locator('[data-mark="itapoa"]').click();
  await expect(stop("Penthouse with terrace")).toHaveAttribute("aria-pressed", "true");

  // Marcar a visita muda a cor do bairro, o contador e o filtro.
  const fill = () => frame.locator('[data-mark="itapoa"]').evaluate((el) => getComputedStyle(el).color);
  const before = await fill();
  await frame.getByRole("button", { name: "Mark as visited", exact: true }).click();
  await expect.poll(fill).not.toBe(before);
  await expect(frame.getByText("visits done")).toContainText("3 of 5");
  await expect(frame.getByRole("button", { name: "Undo visit", exact: true })).toBeVisible();
  await frame.getByRole("radio", { name: "Done", exact: true }).click();
  await expect(frame.getByRole("list").filter({ has: stop("Penthouse with terrace") }).getByRole("listitem")).toHaveCount(3);
  await frame.getByRole("radio", { name: "To visit", exact: true }).click();
  await expect(stop("Back-facing, no noise")).toBeVisible();
  await expect(stop("Penthouse with terrace")).toHaveCount(0);
  expect(errors).toEqual([]);
});

// interação: Item, IntentComposer, MessageScroller, EmptyState, IconButton, Segmented
test("inbox-01: abrir, responder, resolver e telas separadas no celular", async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const { block, frame } = await openTemplate(page, "inbox-01");
  const person = (name: string) => frame.getByRole("button", { name: new RegExp(name) });
  const inbox = frame.getByRole("region", { name: "Conversations", exact: true });
  const thread = frame.getByRole("region", { name: "Open conversation", exact: true });
  const counter = inbox.locator("header");

  // Abrir pelo teclado zera as não lidas e mostra a conversa.
  await expect(counter).toContainText("2 unread");
  await person("Bruno Lima").focus();
  await page.keyboard.press("Enter");
  await expect(person("Bruno Lima")).toHaveAttribute("aria-pressed", "true");
  await expect(frame.getByRole("heading", { name: "Bruno Lima", level: 2 })).toBeVisible();
  await expect(counter).not.toContainText("unread");

  // Responder entra no histórico e na prévia da lista; o campo esvazia.
  const reply = "Only the last page, initial the others.";
  await frame.getByLabel("Reply", { exact: true }).fill(reply);
  await frame.getByRole("button", { name: "Send reply", exact: true }).click();
  await expect(frame.getByRole("log", { name: "Messages" })).toContainText(reply);
  await expect(person("Bruno Lima")).toContainText(`You: ${reply}`);
  await expect(frame.getByLabel("Reply", { exact: true })).toHaveValue("");

  // Resolver todas as abertas deixa o estado vazio; o filtro mostra as resolvidas.
  for (const name of ["Ana Souza", "Bruno Lima", "Clara Reis"]) {
    await person(name).click();
    await frame.getByRole("button", { name: "Resolve", exact: true }).click();
  }
  await expect(frame.getByText("No open conversations")).toBeVisible();
  await frame.getByRole("radio", { name: "Resolved", exact: true }).click();
  await expect(person("Diego Alves")).toBeVisible();
  await expect(person("Clara Reis")).toBeVisible();
  await frame.getByRole("button", { name: "Reopen", exact: true }).click();
  await frame.getByRole("radio", { name: "Open", exact: true }).click();
  await expect(person("Clara Reis")).toBeVisible();

  // Celular: lista e conversa são duas telas, com volta.
  await page.getByRole("radiogroup", { name: "Largura da prévia", exact: true }).getByRole("radio", { name: "Celular", exact: true }).click();
  await expect.poll(() => block.locator("iframe").evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(375);
  await block.locator("iframe").scrollIntoViewIfNeeded();
  // A última conversa aberta continua na tela; a volta leva à lista.
  await expect(thread).toBeVisible();
  await expect(inbox).toBeHidden();
  await frame.getByRole("button", { name: "Back to conversations", exact: true }).click();
  await expect(inbox).toBeVisible();
  await expect(thread).toBeHidden();
  await person("Clara Reis").click();
  await expect(thread).toBeVisible();
  await expect(inbox).toBeHidden();
  await frame.getByRole("button", { name: "Back to conversations", exact: true }).click();
  await expect(inbox).toBeVisible();
  await expect(thread).toBeHidden();
  expect(await frame.locator("html").evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

// interação: Item, IntentComposer, IconButton
test("inbox-01: rascunho por conversa e foco entre as telas no celular", async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const { block, frame } = await openTemplate(page, "inbox-01");
  const person = (name: string) => frame.getByRole("button", { name: new RegExp(name) });
  const reply = frame.getByLabel("Reply", { exact: true });

  // Reabrir a mesma conversa ou trocar de conversa não apaga o rascunho; cada conversa tem o seu.
  await reply.fill("Draft for Ana");
  await person("Ana Souza").click();
  await expect(reply).toHaveValue("Draft for Ana");
  await person("Bruno Lima").click();
  await expect(reply).toHaveValue("");
  await reply.fill("Draft for Bruno");
  await person("Ana Souza").click();
  await expect(reply).toHaveValue("Draft for Ana");
  await person("Bruno Lima").click();
  await expect(reply).toHaveValue("Draft for Bruno");
  await frame.getByRole("button", { name: "Send reply", exact: true }).click();
  await expect(reply).toHaveValue("");

  // Celular, só teclado: o foco vai para a conversa ao abrir e volta ao item ao sair.
  await page.getByRole("radiogroup", { name: "Largura da prévia", exact: true }).getByRole("radio", { name: "Celular", exact: true }).click();
  await expect.poll(() => block.locator("iframe").evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(375);
  await block.locator("iframe").scrollIntoViewIfNeeded();
  await frame.getByRole("button", { name: "Back to conversations", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(person("Bruno Lima")).toBeFocused();
  await person("Clara Reis").focus();
  await page.keyboard.press("Enter");
  await expect(frame.getByRole("heading", { name: "Clara Reis", level: 2 })).toBeFocused();
  await reply.fill("Draft for Clara");
  await frame.getByRole("button", { name: "Back to conversations", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(person("Clara Reis")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(frame.getByRole("heading", { name: "Clara Reis", level: 2 })).toBeFocused();
  await expect(reply).toHaveValue("Draft for Clara");
  expect(errors).toEqual([]);
});

// interação: Item, IconButton, Segmented
test("inbox-01: voltar depois de resolver leva o foco a quem ficou na lista", async ({ page }) => {
  test.setTimeout(90000);
  const { block, frame } = await openTemplate(page, "inbox-01");
  const person = (name: string) => frame.getByRole("button", { name: new RegExp(name) });
  await page.getByRole("radiogroup", { name: "Largura da prévia", exact: true }).getByRole("radio", { name: "Celular", exact: true }).click();
  await expect.poll(() => block.locator("iframe").evaluate((el) => Math.round(el.getBoundingClientRect().width))).toBe(375);
  await block.locator("iframe").scrollIntoViewIfNeeded();
  // Ana sai de "Open" ao ser resolvida: o foco vai para a primeira conversa que restou.
  await person("Ana Souza").focus();
  await page.keyboard.press("Enter");
  await frame.getByRole("button", { name: "Resolve", exact: true }).click();
  await frame.getByRole("button", { name: "Back to conversations", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(person("Bruno Lima")).toBeFocused();
  // Em "Resolved", reabrir tira a conversa da lista; sem item, o foco vai para o filtro ativo.
  await frame.getByRole("radio", { name: "Resolved", exact: true }).click();
  for (const name of ["Diego Alves", "Ana Souza"]) {
    await person(name).click();
    await frame.getByRole("button", { name: "Reopen", exact: true }).click();
    await frame.getByRole("button", { name: "Back to conversations", exact: true }).focus();
    await page.keyboard.press("Enter");
  }
  await expect(frame.getByText("Nothing resolved yet")).toBeVisible();
  await expect(frame.getByRole("radio", { name: "Resolved", exact: true })).toBeFocused();
});

// interação: MessageScroller, Item, IntentComposer
test("inbox-01: cada conversa abre no fim, sem herdar a rolagem da anterior", async ({ page }) => {
  test.setTimeout(90000);
  const { frame } = await openTemplate(page, "inbox-01");
  const person = (name: string) => frame.getByRole("button", { name: new RegExp(name) });
  const reply = frame.getByLabel("Reply", { exact: true });
  const log = frame.getByRole("log", { name: "Messages" });
  const send = async (text: string) => {
    await reply.fill(text);
    await frame.getByRole("button", { name: "Send reply", exact: true }).click();
    await expect(log).toContainText(text);
  };
  const atEnd = () => log.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight < 24);
  // Duas conversas longas o bastante para rolar.
  await person("Bruno Lima").click();
  for (let i = 1; i <= 5; i++) await send(`Bruno note ${i}: the contract annex, page by page, with the signatures.`);
  await person("Ana Souza").click();
  for (let i = 1; i <= 5; i++) await send(`Ana note ${i}: the visit on Saturday, the dog and the keys at the desk.`);
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  // Rolar Ana para o começo e abrir Bruno: Bruno abre no fim e segue as respostas novas.
  await log.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  await person("Bruno Lima").click();
  await expect(log).toContainText("Bruno note 5");
  await expect.poll(atEnd).toBe(true);
  await send("Bruno, last one: see you Saturday.");
  await expect.poll(atEnd).toBe(true);
});
