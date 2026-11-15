// Task 3.1 de add-a2ui-catalog: o MessageProcessor do @a2ui/web_core roda no Hermes do Expo?
// Mesmo fluxo da prova web (createSurface, updateDataModel, ação com contexto, updateComponents,
// peça fora do catálogo), sem desenhar componentes: a ponte com o @refy-design/mobile é a 3.2.
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Catalog, ComponentContext, GenericBinder, MessageProcessor, STRICT_VALIDATION } from "@a2ui/web_core";

type Line = { ok: boolean; text: string };
const TAG = "[a2ui-hermes]";
const ID = "https://refy.design/a2ui/v1";
const v = (body: Record<string, unknown>) => ({ version: "1.0", ...body });

async function run(): Promise<Line[]> {
  const lines: Line[] = [];
  const check = (ok: boolean, text: string) => {
    lines.push({ ok, text });
    console.log(`${TAG} ${ok ? "ok" : "FALHOU"} · ${text}`);
  };
  const hermes = typeof (globalThis as { HermesInternal?: unknown }).HermesInternal === "object";
  check(hermes, `motor Hermes (HermesInternal ${hermes ? "presente" : "ausente"})`);
  check(true, `structuredClone ${typeof structuredClone === "function" ? "existe" : "ausente"}; window.open ${typeof (globalThis as { open?: unknown }).open === "function" ? "existe" : "ausente"}`);

  // O índice `@a2ui/web_core/catalogs/basic/v1` não carrega no Hermes: puxa
  // universal/basic_catalog/styles/default.js, que usa `document` ("Property 'document' doesn't exist").
  // Para repetir essa sonda (o LogBox cobre a tela): EXPO_PUBLIC_PROBE_BASIC_INDEX=1 npx expo start.
  if (process.env.EXPO_PUBLIC_PROBE_BASIC_INDEX === "1") {
    try {
      const basic = require("@a2ui/web_core/catalogs/basic/v1");
      check(Boolean(basic?.ButtonApi), `índice catalogs/basic/v1 ${basic?.ButtonApi ? "carrega" : "não carrega"} no Hermes`);
    } catch (error) {
      check(false, `índice catalogs/basic/v1 não carrega no Hermes: ${String(error)}`);
    }
  }
  // As APIs Zod das peças (as mesmas da web) ficam num arquivo sem DOM. O mapa de exports do
  // pacote não o expõe, então a ponte nativa importa pelo caminho do arquivo.
  const components = require("./node_modules/@a2ui/web_core/src/catalogs/basic/v1/components/basic_components.js");
  const apis: { name: string; schema: z.ZodTypeAny }[] = [components.ColumnApi, components.TextApi, components.ButtonApi];
  const buttonSchema: z.ZodTypeAny | undefined = components.ButtonApi?.schema;
  check(Boolean(buttonSchema), "APIs Zod do básico v1 (basic_components.js, sem DOM) carregam no Hermes");
  const catalog = new Catalog(ID, "1.0", apis);
  const actions: Record<string, unknown>[] = [];
  const processor = new MessageProcessor([catalog], (action) => {
    actions.push(action);
  }, { validationConfig: { ...STRICT_VALIDATION, allowOrphanComponents: true } });

  processor.processMessages([
    v({
      createSurface: {
        surfaceId: "visita",
        catalogId: ID,
        dataModel: { nome: "Marina", dia: ["sexta, 14/11"], vendo: "2 pessoas" },
        components: [
          { id: "root", component: "Column", children: ["titulo", "vendo", "agendar"] },
          { id: "titulo", component: "Text", text: "## Apartamento na Rua Augusta" },
          { id: "vendo", component: "Text", text: { "@path": "/vendo" } },
          {
            id: "agendar",
            component: "Button",
            child: "agendar_t",
            action: { event: { name: "agendar_visita", context: { nome: { "@path": "/nome" }, dia: { "@path": "/dia" } } } },
          },
          { id: "agendar_t", component: "Text", text: "Agendar visita" },
        ],
      },
    }),
  ] as never);
  const surface = processor.model.surfacesMap.get("visita");
  check(Boolean(surface), "createSurface criou a superfície visita");

  processor.processMessages([v({ updateDataModel: { surfaceId: "visita", path: "/vendo", value: "3 pessoas" } })] as never);
  const vendo = surface?.dataModel.get("/vendo");
  check(vendo === "3 pessoas", `updateDataModel /vendo = ${JSON.stringify(vendo)}`);

  // Ação pelo mesmo caminho do React: GenericBinder resolve os @path do contexto e devolve action().
  if (surface && buttonSchema) {
    const binder = new GenericBinder(new ComponentContext(surface as never, "agendar"), buttonSchema);
    await (binder.snapshot as { action?: () => unknown }).action?.();
    binder.dispose();
  }
  const received = actions[0] as { name?: string; context?: Record<string, unknown> } | undefined;
  check(
    received?.name === "agendar_visita" && received.context?.nome === "Marina",
    `ação recebida: ${JSON.stringify({ name: received?.name, context: received?.context })}`,
  );

  processor.processMessages([
    v({
      updateComponents: {
        surfaceId: "visita",
        components: [
          { id: "root", component: "Column", children: ["ok"] },
          { id: "ok", component: "Text", text: "### Visita marcada" },
        ],
      },
    }),
  ] as never);
  const root = surface?.componentsModel.get("root");
  check(
    JSON.stringify((root?.properties as { children?: unknown })?.children) === '["ok"]',
    "updateComponents trocou a árvore sem recriar a superfície",
  );

  try {
    processor.processMessages([
      v({ updateComponents: { surfaceId: "visita", components: [{ id: "root", component: "Video", url: "/v.mp4" }] } }),
    ] as never);
    check(false, "Video devia ser recusado");
  } catch (error) {
    check(/Video/.test(String(error)), `Video recusado: ${String(error)}`);
  }

  const failed = lines.filter((line) => !line.ok).length;
  console.log(`${TAG} fim · ${lines.length - failed} ok, ${failed} falharam`);
  return lines;
}

export default function App() {
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => {
    run().then(setLines, (error) => {
      console.log(`${TAG} FALHOU · erro não tratado: ${String(error)}`);
      setLines([{ ok: false, text: `erro não tratado: ${String(error)}` }]);
    });
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>A2UI no Hermes</Text>
      <Text style={styles.caption}>@a2ui/web_core 0.15.0 · MessageProcessor · Expo 54</Text>
      {lines.map((line, index) => (
        <View key={index} style={styles.row}>
          <Text style={[styles.mark, { color: line.ok ? "#0a7d4f" : "#b3261e" }]}>{line.ok ? "✓" : "✗"}</Text>
          <Text style={styles.line}>{line.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, paddingTop: 70, gap: 10 },
  title: { fontSize: 24, fontWeight: "700" },
  caption: { fontSize: 13, color: "#555", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8 },
  mark: { fontSize: 16, fontWeight: "700", width: 16 },
  line: { flex: 1, fontSize: 14, lineHeight: 20 },
});
