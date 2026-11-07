import type { Preview } from "@storybook/react";
import { createElement, useEffect } from "react";
import type { ReactNode } from "react";
import { useGlobals } from "@storybook/preview-api";
import "../src/tokens/tokens.css";
import "../src/styles/fonts.css";
import "../src/styles/global.css";
import "./preview.css";
import { ThemeProvider } from "../src/lib/ThemeProvider";
import {
  configGlobals,
  preferenceKey,
  presetFonts,
  readConfig,
  rememberCustomTheme,
  resolveTheme,
  usePlaygroundConfig,
} from "../src/pages/PlaygroundPage/themeConfig";
import { skins } from "../src/stories/skins";
import type { PlaygroundConfig } from "../src/pages/PlaygroundPage/themeConfig";

function SharedConfiguration({
  config,
  update,
  children,
  legacy,
}: {
  config: PlaygroundConfig;
  update: (patch: Record<string, unknown>) => void;
  children: ReactNode;
  legacy: boolean;
}) {
  useEffect(() => {
    // Standalone previews must not restore a stale legacy URL after customization.
    if (window.parent === window) {
      const url = new URL(window.location.href);
      url.searchParams.set(
        "globals",
        Object.entries(configGlobals(config))
          .map(([name, value]) => `${name}:${value}`)
          .join(";"),
      );
      window.history.replaceState(window.history.state, "", url);
    }
    if (legacy) {
      if (config.customTheme || config.fonts !== presetFonts[config.skin])
        rememberCustomTheme(config);
      update({
        ...configGlobals(config),
        fonts: undefined,
        skin: undefined,
        customTheme: undefined,
      });
    }
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(config));
    } catch {
      /* Editing works without persistence. */
    }
  }, [
    config.theme,
    config.skin,
    config.fonts,
    config.customTheme,
    update,
    legacy,
  ]);
  return children;
}

const preview: Preview = {
  initialGlobals: configGlobals(readConfig()),
  globalTypes: {
    theme: {
      description: "Tema completo",
      toolbar: {
        icon: "paintbrush",
        items: [
          ...Object.entries(skins).map(([value, skin]) => ({
            value,
            title: skin.label,
          })),
          { value: "custom", title: "Personalizado" },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: "Modo de cor",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Escuro" },
          { value: "system", title: "Sistema" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "fullscreen",
    options: {
      storySort: {
        order: [
          "Playground",
          "Refy Site",
          "Componentes",
          ["Átomos", "Moléculas", "Organismos", "Páginas"],
        ],
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  decorators: [
    (Story, context) => {
      const [globals, updateGlobals] = useGlobals();
      const config = usePlaygroundConfig(globals);
      const content = context.parameters.refyFullPage
        ? createElement(Story)
        : createElement(
            ThemeProvider,
            {
              mode: config.theme,
              theme: resolveTheme(config),
              className: "refy-canvas",
            },
            createElement(Story),
          );
      return createElement(SharedConfiguration, {
        config,
        update: updateGlobals,
        children: content,
        legacy: ["light", "dark", "system"].includes(String(globals.theme)),
      });
    },
  ],
};
export default preview;
