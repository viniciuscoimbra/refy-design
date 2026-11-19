import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
test.use({ screenshot: "off", trace: "off" });

const story = (page: Page, id: string, mode = "light") =>
  page.goto(`/iframe.html?id=components-organisms-coverflow--${id}&viewMode=story&globals=theme:refy;mode:${mode}`);
const ref = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

for (const mode of ["light", "dark"]) {
  test(`Coverflow loop: botões, teclado e arrasto cruzam o limite (${mode})`, async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await story(page, "circular", mode);
    const region = page.getByRole("region", { name: "Circular references" });
    await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
    const previous = region.getByRole("button", { name: "Previous item" });
    await expect(previous).toBeEnabled();
    await previous.click();
    await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
    await region.getByRole("button", { name: "Next item" }).click();
    await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
    await ref(page, "First reference").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(ref(page, "Fourth reference")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(ref(page, "First reference")).toBeFocused();
    await page.keyboard.press("End");
    await expect(ref(page, "Fourth reference")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(ref(page, "First reference")).toBeFocused();
    // Arrasto para a direita no primeiro: volta um e cai no último.
    const box = (await region.locator("[data-dragging], div").first().boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 60, y, { steps: 4 });
    await page.mouse.move(box.x + box.width / 2 + 260, y, { steps: 8 });
    await page.mouse.up();
    await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
  });
}

test("Coverflow sem loop continua finito (regressão)", async ({ page }) => {
  await story(page, "padrao");
  const region = page.getByRole("region", { name: "Browse content" });
  await expect(region.getByRole("button", { name: "Previous item" })).toBeDisabled();
  await ref(page, "First reference").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowRight");
  await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
  await expect(region.getByRole("button", { name: "Next item" })).toBeDisabled();
  await expect(region.getByRole("button", { name: "Pause automatic advance" })).toHaveCount(0);
});

test("Coverflow autoplay avança, pausa por hover, foco, botão e aba oculta, e para no último sem loop", async ({ page }) => {
  await page.clock.install();
  await story(page, "automatico");
  const region = page.getByRole("region", { name: "References that advance on their own" });
  const status = region.getByRole("status");
  await expect(status).toHaveAttribute("aria-live", "off");
  await page.mouse.move(1, 1);
  await page.clock.runFor(4100);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  // hover pausa
  await ref(page, "Second reference").hover();
  await expect(region).toHaveAttribute("data-autoplay", "paused");
  await expect(status).toHaveAttribute("aria-live", "polite");
  await page.clock.runFor(9000);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  // foco dentro pausa
  await ref(page, "Second reference").focus();
  await page.mouse.move(1, 1);
  await page.clock.runFor(9000);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  // botão pausa (aria-pressed) mesmo sem foco dentro
  const pause = region.getByRole("button", { name: "Pause automatic advance" });
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.mouse.move(1, 1);
  await page.clock.runFor(9000);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  await pause.click();
  await expect(pause).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.mouse.move(1, 1);
  // aba oculta pausa
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(9000);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(4100);
  await expect(ref(page, "Third reference")).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(4100);
  await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(12000);
  await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
  await expect(region).toHaveAttribute("data-autoplay", "paused");
});

test("Coverflow loop + autoplay volta ao primeiro depois do último", async ({ page }) => {
  await page.clock.install();
  await story(page, "circular-automatico");
  await page.mouse.move(1, 1);
  await expect(page.getByRole("region", { name: "References in a continuous cycle" })).toHaveAttribute("data-autoplay", "running");
  for (const name of ["Second reference", "Third reference", "Fourth reference", "First reference"]) {
    await page.clock.runFor(5100);
    await expect(ref(page, name)).toHaveAttribute("aria-pressed", "true");
  }
});

test("Coverflow autoplay não começa com movimento reduzido e para quando a preferência muda", async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await story(page, "circular-automatico");
  const region = page.getByRole("region", { name: "References in a continuous cycle" });
  await page.mouse.move(1, 1);
  await expect(region.getByRole("button", { name: "Pause automatic advance" })).toHaveCount(0);
  await page.clock.runFor(11000);
  await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
  await expect(region.getByRole("status")).toHaveAttribute("aria-live", "polite");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(5100);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(region).not.toHaveAttribute("data-autoplay", /.*/);
  await page.clock.runFor(11000);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
});

// Espera as transições de posição terminarem antes de medir geometria.
const settle = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);
const verification = (page: Page, id: string) =>
  page.goto(`/iframe.html?id=verification-coverflow-contracts--${id}&viewMode=story&globals=theme:refy;mode:light`);

test("Coverflow autoplay avança mesmo com o pai renderizando a cada segundo", async ({ page }) => {
  await page.clock.install();
  await verification(page, "pai-renderiza");
  const region = page.getByRole("region", { name: "Parent rerenders" });
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(2100);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(2100);
  await expect(ref(page, "Third reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow: item focado removido não deixa o autoplay pausado; loop com um item desabilita a navegação", async ({ page }) => {
  await page.clock.install();
  await verification(page, "lista-encolhe");
  const region = page.getByRole("region", { name: "Shrinking list" });
  await page.mouse.move(1, 1);
  await ref(page, "First reference").focus();
  await expect(region).toHaveAttribute("data-autoplay", "paused");
  await page.evaluate(() => window.dispatchEvent(new Event("refy:test-coverflow-shrink")));
  await expect(ref(page, "First reference")).toHaveCount(0);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(2100);
  await expect(ref(page, "Third reference")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => window.dispatchEvent(new Event("refy:test-coverflow-shrink")));
  await expect(region.getByRole("button", { name: "Previous item" })).toBeDisabled();
  await expect(region.getByRole("button", { name: "Next item" })).toBeDisabled();
});

test("Coverflow loop com dois itens: arrasto longo fica no item mostrado; caneta com hover pausa o autoplay", async ({ page }) => {
  // O arrasto de 520 px para a esquerda precisa caber na janela: fora dela o Firefox não informa posição.
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.clock.install();
  await verification(page, "dois-itens");
  const region = page.getByRole("region", { name: "Two items" });
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  // Caneta com hover: o React deriva pointerenter de pointerover vindo de fora.
  await region.evaluate((node) =>
    node.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "pen", pointerId: 7, isPrimary: true })),
  );
  await expect(region).toHaveAttribute("data-autoplay", "paused");
  await page.clock.runFor(4100);
  await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
  await region.evaluate((node) =>
    node.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, pointerType: "pen", pointerId: 7, isPrimary: true })),
  );
  await expect(region).toHaveAttribute("data-autoplay", "running");
  // Arrasto de quase dois passos: a tela trava em um passo, e a seleção segue a tela.
  await region.getByRole("button", { name: "Pause automatic advance" }).click();
  const box = (await region.locator("div").first().boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 - 60, y, { steps: 4 });
  await page.mouse.move(box.x + box.width / 2 - 520, y, { steps: 10 });
  await page.mouse.up();
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow loop: arrastar o primeiro para a direita traz o último pelo lado esquerdo, a um passo", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await story(page, "circular");
  const region = page.getByRole("region", { name: "Circular references" });
  await settle(page);
  const viewport = (await region.locator("div").first().boundingBox())!;
  const first = (await ref(page, "First reference").boundingBox())!;
  const last = (await ref(page, "Fourth reference").boundingBox())!;
  const stride = first.width + 16;
  // Antes do arrasto, o último já está à esquerda do primeiro, um passo antes.
  expect(Math.abs(first.x - last.x - stride)).toBeLessThan(first.width * 0.5);
  const y = viewport.y + viewport.height / 2;
  await page.mouse.move(viewport.x + viewport.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(viewport.x + viewport.width / 2 + 40, y, { steps: 4 });
  await page.mouse.move(viewport.x + viewport.width / 2 + stride * 0.8, y, { steps: 8 });
  const during = (await ref(page, "Fourth reference").boundingBox())!;
  const center = viewport.x + viewport.width / 2;
  expect(Math.abs(during.x + during.width / 2 - center)).toBeLessThan(stride * 0.5);
  await page.mouse.up();
  await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow autoplay com intervalo inválido usa o padrão", async ({ page }) => {
  await page.clock.install();
  await verification(page, "intervalo-invalido");
  const region = page.getByRole("region", { name: "Invalid interval" });
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(1000);
  await expect(page.getByText("Changes: 0")).toBeVisible();
  await page.clock.runFor(4100);
  await expect(page.getByText("Changes: 1")).toBeVisible();
});

test("Coverflow loop com movimento reduzido mantém a posição circular", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await story(page, "circular");
  const region = page.getByRole("region", { name: "Circular references" });
  await region.getByRole("button", { name: "Previous item" }).click();
  await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
  const viewport = (await region.locator("div").first().boundingBox())!;
  const center = viewport.x + viewport.width / 2;
  await expect.poll(async () => {
    const box = (await ref(page, "Fourth reference").boundingBox())!;
    return Math.abs(box.x + box.width / 2 - center);
  }).toBeLessThan(4);
});

test("Coverflow loop: arrasto de três passos recicla os itens e solta no que está no centro", async ({ page }) => {
  // O arrasto de três passos (até x=1809) precisa caber na janela: fora dela o Firefox não informa posição.
  await page.setViewportSize({ width: 1920, height: 900 });
  await story(page, "circular");
  const region = page.getByRole("region", { name: "Circular references" });
  await settle(page);
  const viewport = (await region.locator("div").first().boundingBox())!;
  const first = (await ref(page, "First reference").boundingBox())!;
  const second = (await ref(page, "Second reference").boundingBox())!;
  const stride = second.x - first.x;
  const center = viewport.x + viewport.width / 2;
  const y = viewport.y + viewport.height / 2;
  await page.mouse.move(center, y);
  await page.mouse.down();
  await page.mouse.move(center + 40, y, { steps: 4 });
  await page.mouse.move(center + stride * 3, y, { steps: 16 });
  // O centro não fica vazio: o Second chegou dando a volta pela esquerda.
  const during = (await ref(page, "Second reference").boundingBox())!;
  expect(Math.abs(during.x + during.width / 2 - center)).toBeLessThan(stride * 0.25);
  await page.mouse.up();
  // Ao soltar, o item não pula para longe enquanto a trilha volta.
  const after = (await ref(page, "Second reference").boundingBox())!;
  expect(Math.abs(after.x + after.width / 2 - center)).toBeLessThan(stride * 0.5);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow autoplay espera o toque terminar antes de avançar", async ({ page }) => {
  // Relógio parado: o tempo só anda pelo runFor, sem depender da carga da máquina.
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  await story(page, "automatico");
  const region = page.getByRole("region", { name: "References that advance on their own" });
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(3800);
  await ref(page, "First reference").dispatchEvent("pointerdown", { pointerType: "touch", isPrimary: true, pointerId: 3, button: 0 });
  await expect(region).toHaveAttribute("data-autoplay", "paused");
  await page.clock.runFor(1000);
  await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
  // Um segundo dedo que solta não retoma.
  await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", isPrimary: false, pointerId: 4 })));
  await expect(region).toHaveAttribute("data-autoplay", "paused");
  await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", isPrimary: true, pointerId: 3 })));
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(4100);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow autoplay: toque longo em Próximo avança um item só", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  await story(page, "automatico");
  const region = page.getByRole("region", { name: "References that advance on their own" });
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(3800);
  const next = region.getByRole("button", { name: "Next item", exact: true });
  await next.dispatchEvent("pointerdown", { pointerType: "touch", isPrimary: true, pointerId: 5, button: 0 });
  await expect(region).toHaveAttribute("data-autoplay", "paused");
  await page.clock.runFor(500);
  await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
  await page.evaluate(() => document.dispatchEvent(new PointerEvent("pointerup", { pointerType: "touch", isPrimary: true, pointerId: 5 })));
  await next.dispatchEvent("click");
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow autoplay com intervalo acima do limite do timer não dispara na hora", async ({ page }) => {
  await page.clock.install();
  await verification(page, "intervalo-enorme");
  const region = page.getByRole("region", { name: "Huge interval" });
  await page.mouse.move(1, 1);
  await expect(region).toHaveAttribute("data-autoplay", "running");
  await page.clock.runFor(5000);
  await expect(page.getByText("Changes: 0")).toBeVisible();
});

test("Coverflow loop com dois itens: avançar duas vezes não cruza os cards", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await verification(page, "dois-itens");
  const region = page.getByRole("region", { name: "Two items" });
  await region.getByRole("button", { name: "Pause automatic advance" }).click();
  await settle(page);
  const viewport = (await region.locator("div").first().boundingBox())!;
  const center = viewport.x + viewport.width / 2;
  const middle = async (name: string) => {
    const box = (await ref(page, name).boundingBox())!;
    return box.x + box.width / 2;
  };
  const next = region.getByRole("button", { name: "Next item" });
  await next.click();
  await settle(page);
  // Depois de avançar, o que saiu fica à esquerda.
  expect(await middle("First reference")).toBeLessThan(center);
  await next.click();
  // O que volta ao centro chega sem atravessar o outro: salta direto para o centro.
  expect(Math.abs((await middle("First reference")) - center)).toBeLessThan(20);
  await settle(page);
  expect(await middle("Second reference")).toBeLessThan(center);
  await expect(ref(page, "First reference")).toHaveAttribute("aria-pressed", "true");
});

test("Coverflow loop: tocar o card à esquerda do primeiro anima para a esquerda, sem teleporte", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await story(page, "circular");
  const region = page.getByRole("region", { name: "Circular references" });
  await settle(page);
  await ref(page, "Fourth reference").click();
  await expect(ref(page, "Fourth reference")).toHaveAttribute("aria-pressed", "true");
  // Os cards andam com transição: nenhum está marcado para saltar além do que dá a volta.
  const jumping = await region.locator("[data-wrapping]").count();
  expect(jumping).toBeLessThanOrEqual(1);
});

test("Coverflow: mouse que solta fora da janela, sem pointerup, termina o arrasto no último ponto visto", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 900 });
  await story(page, "circular");
  const region = page.getByRole("region", { name: "Circular references" });
  await settle(page);
  const viewport = region.locator("div").first();
  const box = (await viewport.boundingBox())!;
  await viewport.evaluate((node) => node.addEventListener("pointerdown", (event) => { (window as any).__pointer = event.pointerId; }, { once: true }));
  const center = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(center, y);
  await page.mouse.down();
  await page.mouse.move(center - 40, y, { steps: 4 });
  await page.mouse.move(center - 250, y, { steps: 8 });
  // O que o Firefox manda quando o botão solta fora da janela: só o movimento, sem botão e com clientX 0.
  await viewport.evaluate((node) =>
    node.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse", pointerId: (window as any).__pointer, isPrimary: true, buttons: 0, clientX: 0, clientY: 0 })),
  );
  await expect(region.locator("[data-dragging]")).toHaveCount(0);
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
  await page.mouse.up();
  await expect(ref(page, "Second reference")).toHaveAttribute("aria-pressed", "true");
});
