// Roda no Chromium: desenha uma superfície A2UI com o catálogo do refy e devolve o HTML e os erros.
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { A2uiSurface } from "@a2ui/react";
import { ThemeProvider } from "@refy-design/web";
import "@refy-design/web/tokens.css";
import "@refy-design/web/global.css";
import "@refy-design/web/styles.css";
import "../src/catalog.css";
import { REFY_CATALOG_ID, createRefyProcessor, refyCatalog } from "../src/catalog";

declare global {
  interface Window {
    a2uiCatalog: { id: string; protocolVersion: string; components: string[] };
    a2uiRender: (
      components: Record<string, unknown>[],
      dataModel?: Record<string, unknown>,
    ) => Promise<{ html: string; errors: string[] }>;
    a2uiUpdate: (path: string, value: unknown) => Promise<string>;
  }
}

window.a2uiCatalog = {
  id: refyCatalog.id,
  protocolVersion: String(refyCatalog.protocolVersion),
  components: [...refyCatalog.components.keys()],
};

let previous: ReturnType<typeof createRoot> | undefined;
let current: ReturnType<typeof createRefyProcessor> | undefined;

window.a2uiRender = async (components, dataModel = {}) => {
  previous?.unmount();
  document.body.innerHTML = "";
  const host = document.createElement("div");
  document.body.append(host);
  const processor = createRefyProcessor();
  current = processor;
  const errors: string[] = [];
  try {
    processor.processMessages([
      { version: "1.0", createSurface: { surfaceId: "s", catalogId: REFY_CATALOG_ID, dataModel, components } },
    ] as never);
  } catch (error) {
    errors.push(String(error));
  }
  const surface = processor.model.surfacesMap.get("s");
  const root = createRoot(host);
  flushSync(() =>
    root.render(<ThemeProvider>{surface ? <A2uiSurface surface={surface} /> : null}</ThemeProvider>),
  );
  await new Promise((resolve) => setTimeout(resolve, 50));
  previous = root;
  return { html: host.innerHTML, errors };
};

// O agente muda o modelo depois do primeiro desenho (updateDataModel); devolve o HTML novo.
window.a2uiUpdate = async (path, value) => {
  current?.processMessages([{ version: "1.0", updateDataModel: { surfaceId: "s", path, value } }] as never);
  await new Promise((resolve) => setTimeout(resolve, 50));
  return document.body.innerHTML;
};
