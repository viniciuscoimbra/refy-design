import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { chromium } from "playwright";
import { bundleHarness } from "./bundle.mjs";

const v = (component) => component;
let browser;
let page;
const pageErrors = [];

before(async () => {
  const { js, css } = await bundleHarness();
  browser = await chromium.launch();
  page = await browser.newPage();
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body></body></html>`);
  await page.addScriptTag({ content: js, type: "module" });
  await page.waitForFunction(() => typeof window.a2uiRender === "function");
});
after(async () => browser?.close());

const render = (components, dataModel = {}) =>
  page.evaluate(([c, d]) => window.a2uiRender(c, d), [components, dataModel]);

test("catálogo tem id próprio, protocolo 1.0 e as 12 peças", async () => {
  const catalog = await page.evaluate(() => window.a2uiCatalog);
  assert.equal(catalog.id, "https://refy.design/a2ui/v1");
  assert.equal(catalog.protocolVersion, "1.0");
  assert.deepEqual(catalog.components.sort(), [
    "Button", "Card", "CheckBox", "ChoicePicker", "Column", "Divider",
    "Image", "List", "Row", "Slider", "Text", "TextField",
  ]);
});

const cases = [
  ["Text (título)", [v({ id: "root", component: "Text", text: "## Olá" })], /<h3 class="ra-heading"[^>]*>Olá<\/h3>/],
  ["Text (legenda)", [v({ id: "root", component: "Text", text: "nota", variant: "caption" })], /<p class="ra-caption"[^>]*>nota<\/p>/],
  ["Image", [v({ id: "root", component: "Image", url: "/f.webp", description: "Foto", variant: "header" })], /<img class="ra-image ra-image-header" alt="Foto" src="\/f.webp" style="object-fit: cover;">/],
  ["Row", [v({ id: "root", component: "Row", justify: "end", children: ["a"] }), v({ id: "a", component: "Text", text: "x" })], /class="ra-row" style="justify-content: flex-end; align-items: center;"><div class="ra-slot">/],
  ["Column", [v({ id: "root", component: "Column", children: ["a"] }), v({ id: "a", component: "Text", text: "x" })], /class="ra-column" style="justify-content: flex-start; align-items: stretch;"/],
  ["List", [v({ id: "root", component: "List", direction: "horizontal", children: ["a"] }), v({ id: "a", component: "Text", text: "x" })], /role="list" class="ra-row"/],
  ["Card", [v({ id: "root", component: "Card", child: "a" }), v({ id: "a", component: "Text", text: "dentro" })], /class="[^"]*card[^"]*"[^>]*>.*dentro/is],
  ["Divider", [v({ id: "root", component: "Divider", axis: "vertical" })], /vertical/],
  ["Button", [v({ id: "root", component: "Button", variant: "primary", child: "t", action: { event: { name: "ok" } } }), v({ id: "t", component: "Text", text: "Agendar" })], /<button[^>]*>.*Agendar.*<\/button>/s],
  ["TextField", [v({ id: "root", component: "TextField", label: "Seu nome", value: { "@path": "/nome" } })], /Seu nome.*<input[^>]*type="text"/s],
  ["CheckBox", [v({ id: "root", component: "CheckBox", label: "Me avise", value: true })], /type="checkbox".*Me avise/s],
  ["ChoicePicker", [v({ id: "root", component: "ChoicePicker", label: "Dia", displayStyle: "chips", variant: "mutuallyExclusive", options: [{ label: "Qui 13", value: "q" }], value: [] })], /Dia.*Qui 13/s],
  ["Slider", [v({ id: "root", component: "Slider", label: "Quartos", min: 1, max: 5, value: 2 })], /Quartos.*role="slider"[^>]*aria-valuemin="1" aria-valuemax="5" aria-valuenow="2"/s],
];

for (const [name, components, pattern] of cases) {
  test(`desenha ${name} com o componente do refy`, async () => {
    const { html, errors } = await render(components, { nome: "Ana" });
    assert.deepEqual(errors, []);
    assert.match(html, pattern);
  });
}

test("TextField ligado a /nome mostra o valor do modelo", async () => {
  await render([v({ id: "root", component: "TextField", label: "Seu nome", value: { "@path": "/nome" } })], { nome: "Ana" });
  assert.equal(await page.inputValue("input"), "Ana");
});

test("ChoicePicker em chips volta a nenhum escolhido quando o agente manda []", async () => {
  await render(
    [v({ id: "root", component: "ChoicePicker", label: "Dia", displayStyle: "chips", variant: "mutuallyExclusive", options: [{ label: "Qui 13", value: "q" }, { label: "Sex 14", value: "s" }], value: { "@path": "/dia" } })],
    { dia: ["q"] },
  );
  assert.equal(await page.getAttribute('[role="radio"]:has-text("Qui 13")', "aria-checked"), "true");
  await page.evaluate(() => window.a2uiUpdate("/dia", []));
  assert.equal(await page.getAttribute('[role="radio"]:has-text("Qui 13")', "aria-checked"), "false");
});

test("dois ChoicePicker em rádio com o mesmo rótulo não dividem o grupo", async () => {
  const picker = (id, path) =>
    v({ id, component: "ChoicePicker", label: "Dia", variant: "mutuallyExclusive", options: [{ label: "Qui 13", value: "q" }], value: { "@path": path } });
  await render(
    [v({ id: "root", component: "Column", children: ["a", "b"] }), picker("a", "/a"), picker("b", "/b")],
    { a: [], b: [] },
  );
  const names = await page.$$eval('input[type="radio"]', (inputs) => inputs.map((input) => input.name));
  assert.equal(names.length, 2);
  assert.notEqual(names[0], names[1]);
});

test("Slider com steps anda em divisões da faixa", async () => {
  await render([v({ id: "root", component: "Slider", label: "Nota", min: 0, max: 1, steps: 10, value: { "@path": "/nota" } })], { nota: 0 });
  await page.focus('[role="slider"]');
  await page.keyboard.press("ArrowRight");
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(await page.getAttribute('[role="slider"]', "aria-valuenow"), "0.1");
});

test("Video fica fora do catálogo: erro de resolução e nada desenhado", async () => {
  const { html, errors } = await render([v({ id: "root", component: "Video", url: "/v.mp4" })]);
  assert.ok(errors.length > 0, "o processador devia recusar Video");
  assert.match(errors[0], /A2uiValidationError: Unknown component type 'Video' not found in catalog 'https:\/\/refy\.design\/a2ui\/v1'/);
  assert.doesNotMatch(html, /<video/);
  assert.doesNotMatch(html, /v\.mp4/);
});

test("nenhum erro de página", () => {
  assert.deepEqual(pageErrors, []);
});
