// A definição do catálogo roda em Node puro, sem DOM: é o que o servidor do app importa.
import assert from "node:assert/strict";
import { test } from "node:test";

test("definição carrega sem DOM", async () => {
  assert.equal(typeof globalThis.HTMLElement, "undefined");
  const definicao = await import("../src/definition.ts");
  assert.equal(definicao.REFY_CATALOG_ID, "https://refy.design/a2ui/v1");
  assert.equal(definicao.REFY_VALIDATION.allowOrphanComponents, true);
  assert.deepEqual([...definicao.refyCatalogDefinition.components.keys()].sort(), [
    "Button", "Card", "CheckBox", "ChoicePicker", "Column", "Divider",
    "Image", "List", "Row", "Slider", "Text", "TextField",
  ]);
});

const superficie = (components, extra = {}) => ({
  version: "1.0",
  createSurface: { surfaceId: "s", catalogId: "https://refy.design/a2ui/v1", components, ...extra },
});

test("validador aceita peça do catálogo e recusa Video e tema do agente", async () => {
  const { createRefyValidator } = await import("../src/definition.ts");
  const texto = [{ id: "root", component: "Text", text: "oi" }];
  assert.doesNotThrow(() => createRefyValidator().processMessages([superficie(texto)]));
  assert.throws(() => createRefyValidator().processMessages([superficie([{ id: "root", component: "Video", url: "/v.mp4" }])]));
  assert.throws(() => createRefyValidator().processMessages([superficie(texto, { theme: { primaryColor: "#00ff00" } })]));
});

test("peça que sai da árvore fica guardada, como no renderizador", async () => {
  const { createRefyValidator } = await import("../src/definition.ts");
  const validador = createRefyValidator();
  validador.processMessages([
    superficie([
      { id: "root", component: "Column", children: ["a"] },
      { id: "a", component: "Text", text: "antes" },
    ]),
  ]);
  assert.doesNotThrow(() =>
    validador.processMessages([
      {
        version: "1.0",
        updateComponents: {
          surfaceId: "s",
          components: [
            { id: "root", component: "Column", children: ["b"] },
            { id: "b", component: "Text", text: "depois" },
          ],
        },
      },
    ]),
  );
});
