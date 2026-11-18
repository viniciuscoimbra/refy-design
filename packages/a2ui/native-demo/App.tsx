// Task 3.2 de add-a2ui-catalog: o mesmo JSON do agente da demo web (demo/visita.ts) desenhado no
// iPhone pela ponte React Native (src/native.tsx) sobre o @refy-design/mobile.
//
// O tema é do app anfitrião, não da superfície: o A2UI 1.0 não manda tema, e este app escolhe o seu
// pelo link que o abre (exp://…/--/?tema=terracota&modo=escuro). Nada na tela troca tema. `estado`
// só posiciona a prova, sempre depois de a superfície montar e sem remontá-la: `preenchido` chama os
// mesmos `setValue` que o toque nos chips e a digitação chamam, `marcada` dispara ainda a ação do
// botão "Agendar visita", `rotulo` troca o texto do botão pelo agente, `erro-inicial` manda um check
// com regex inválido e `abrir`/`abrir-invalido`/`abrir-tel` usam a função `openUrl`.
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Image, Linking, SafeAreaView, ScrollView, StatusBar, Text, View } from "react-native";
import { useFonts } from "expo-font";
import { ComponentContext, GenericBinder } from "@a2ui/web_core";
import { ButtonApi, ChoicePickerApi, TextFieldApi } from "@a2ui/web_core/src/catalogs/basic/v1/components/basic_components.js";
import { RefyProvider, useRefy } from "@refy-design/mobile";
import type { FontResolver, RefyProviderProps } from "@refy-design/mobile";
type RefyTheme = NonNullable<RefyProviderProps["theme"]>;
import { A2uiNativeSurface, createRefyNativeProcessor } from "../src/native";
import { visitaAgent } from "../demo/visita";
import { v } from "../demo/visita";
import type { Message } from "../demo/visita";
import refy from "../../../src/themes/refy.json";
import terracota from "../../../src/themes/terracota.json";
import { FONT_FILES } from "./fonts";

const THEMES: Record<string, RefyTheme> = { refy: refy as RefyTheme, terracota: terracota as RefyTheme };
const foto = Image.resolveAssetSource(require("../../../src/blocks/photos/ape-varanda.webp")).uri;
const agent = visitaAgent(foto);

/** Cada família e peso do token vira o arquivo estático gerado por fonts.py (sem negrito sintético). */
const fonts: FontResolver = (family, weight) => {
  const name = family.replace(/^["']|["']$/g, "").replace(/\s+/g, "");
  const weights = Object.keys(FONT_FILES)
    .filter((key) => key.startsWith(`${name}-`))
    .map((key) => Number(key.slice(name.length + 1)));
  if (!weights.length) return { fontWeight: String(weight) as "400" };
  const nearest = weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best));
  return { fontFamily: `${name}-${nearest}` };
};

function params(url: string | null) {
  const query = new URLSearchParams(url?.split("?")[1] ?? "");
  return { tema: query.get("tema") ?? "refy", estado: query.get("estado") ?? "form", modo: query.get("modo") === "escuro" ? "dark" : "light" } as const;
}

export default function App() {
  const [loaded] = useFonts(FONT_FILES);
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    Linking.getInitialURL().then(setUrl);
    const sub = Linking.addEventListener("url", (event) => setUrl(event.url));
    return () => sub.remove();
  }, []);
  if (!loaded || url === undefined) return null;
  const { tema, estado, modo } = params(url);
  return (
    <RefyProvider key={`${tema}-${estado}-${modo}`} theme={THEMES[tema] ?? THEMES.refy} mode={modo} fonts={fonts}>
      <Host estado={estado} escuro={modo === "dark"} />
    </RefyProvider>
  );
}

function Host({ estado, escuro }: { estado: string; escuro: boolean }) {
  const t = useRefy();
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const send = useRef<(messages: Message[]) => void>(() => undefined);
  const processor = useMemo(
    () =>
      createRefyNativeProcessor((action) => {
        console.log(`[a2ui-native] ação ${JSON.stringify(action)}`);
        send.current(agent.reply(action.name, action.context as Record<string, unknown>).messages);
      }),
    [],
  );
  // O app só redesenha quando a superfície nasce. Daí em diante quem atualiza a tela é a própria
  // superfície (modelo de dados e peças), sem remontar nem depender de render do anfitrião.
  send.current = (messages) => {
    if (!messages.length) return;
    const existed = processor.model.surfacesMap.has("visita");
    processor.processMessages(messages as never);
    if (!existed) rerender();
  };
  useEffect(() => {
    const first = [agent.createSurface()];
    // Um check com regex inválido: o erro sai quando o GenericBinder resolve a peça, na montagem.
    if (estado === "erro-inicial") {
      first.push(
        v({
          updateComponents: {
            surfaceId: "visita",
            components: [
              {
                id: "nome",
                component: "TextField",
                label: "Seu nome",
                value: { "@path": "/nome" },
                checks: [{ condition: { "@call": "regex", args: { value: { "@path": "/nome" }, pattern: "[" } }, message: "Nome inválido" }],
              },
            ],
          },
        }),
      );
    }
    send.current(first);
    const surface = processor.model.surfacesMap.get("visita")!;
    /** As props de uma peça já montada, pelo GenericBinder: o mesmo objeto que a ponte desenha. */
    const press = (id: string, api: { schema: never }, use: (props: Record<string, any>) => unknown) => {
      const binder = new GenericBinder(new ComponentContext(surface as never, id), api.schema);
      return Promise.resolve(use(binder.snapshot as Record<string, any>)).finally(() => binder.dispose());
    };
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));
    // Este Expo Go não recebe toque pelo simctl: os passos usam os mesmos callbacks que o onPress dos
    // chips, o onChangeText do campo e o onPress do botão chamam.
    if (estado === "preenchido" || estado === "marcada") {
      later(700, () => {
        console.log("[a2ui-native] toque em Sex 14, 14h e digita Ana (superfície já montada)");
        press("dias", ChoicePickerApi as never, (p) => p.setValue(["sexta, 14/11"]));
        press("horas", ChoicePickerApi as never, (p) => p.setValue(["14h"]));
        press("nome", TextFieldApi as never, (p) => p.setValue("Ana"));
      });
    }
    if (estado === "marcada") {
      later(1200, () => {
        console.log('[a2ui-native] toque em "Agendar visita"');
        press("agendar", ButtonApi as never, (p) => p.action());
      });
    }
    // O agente troca o Text do rótulo do botão depois da montagem: o botão tem de acompanhar.
    if (estado === "rotulo") {
      later(700, () => {
        console.log('[a2ui-native] agente troca o rótulo de "Agendar visita" para "Confirmar visita"');
        send.current([v({ updateComponents: { surfaceId: "visita", components: [{ id: "agendar_t", component: "Text", text: "Confirmar visita" }] } })]);
      });
    }
    // `abrir*`: o agente manda um botão cuja ação é a função `openUrl` (roda no app, não vai ao
    // agente). https abre pelo Linking; esquema fora da lista e `tel:` que o sistema não abre
    // (o simulador não tem app de telefone) viram erro da superfície.
    const URLS: Record<string, string> = { abrir: "https://refy.design", "abrir-invalido": "javascript:alert(1)", "abrir-tel": "tel:+5511999999999" };
    if (URLS[estado]) {
      const url = URLS[estado];
      send.current([
        v({
          updateComponents: {
            surfaceId: "visita",
            components: [
              { id: "acoes", component: "Row", justify: "end", children: ["depois", "site"] },
              { id: "site", component: "Button", variant: "primary", child: "site_t", action: { functionCall: { call: "openUrl", args: { url } } } },
              { id: "site_t", component: "Text", text: "Ver no site" },
            ],
          },
        }),
      ]);
      later(800, () => {
        console.log(`[a2ui-native] toque em "Ver no site" (${url})`);
        press("site", ButtonApi as never, (p) => p.action());
      });
    }
    return () => timers.forEach(clearTimeout);
  }, [estado, processor]);
  const surface = processor.model.surfacesMap.get("visita");
  return (
    <View style={{ flex: 1, backgroundColor: t.pick<string>("--surface-1", t.pick<string>("--bg")) }}>
      <StatusBar barStyle={escuro ? "light-content" : "dark-content"} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: t.pick<number>("--space-4", 16) }} keyboardShouldPersistTaps="handled">
          <View testID="superficie">{surface ? <A2uiNativeSurface surface={surface as never} /> : <Text>O agente está montando…</Text>}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
