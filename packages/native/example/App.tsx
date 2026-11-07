// App Expo da galeria do @refy-design/mobile. Roda no simulador para a comparação lado a lado com
// o Storybook web: `npm install` e `npx expo start --ios` dentro de packages/native/example.
import { useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { RefyProvider, Segmented } from "../src";
import type { FontResolver } from "../src";
import { Gallery } from "./Gallery";
import refySite from "../../../src/themes/refy-site.json";

const themes = {
  "refy-light": { theme: undefined, mode: "light" },
  "refy-dark": { theme: undefined, mode: "dark" },
  "refy-editorial": { theme: undefined, mode: "editorial" },
  "site-dark": { theme: refySite, mode: "dark" },
  "site-light": { theme: refySite, mode: "light" },
} as const;
type ThemeKey = keyof typeof themes;

// As famílias do tema (Manrope, Source Sans 3, Source Code Pro) não estão embarcadas neste
// exemplo; sem expo-font a fonte do sistema entra no lugar e o peso continua valendo.
const systemFonts: FontResolver = (_family, weight) => ({ fontWeight: String(weight) as "400" });

export default function App() {
  const [key, setKey] = useState<ThemeKey>("refy-light");
  const { theme, mode } = themes[key];
  return (
    <RefyProvider theme={theme as never} mode={mode} fonts={systemFonts}>
      <StatusBar barStyle={mode === "light" ? "dark-content" : "light-content"} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 12 }}>
          <Segmented label="Tema" value={key} onChange={(v) => setKey(v as ThemeKey)} options={Object.keys(themes).map((value) => ({ value, label: value }))} />
        </View>
        <Gallery />
      </SafeAreaView>
    </RefyProvider>
  );
}
