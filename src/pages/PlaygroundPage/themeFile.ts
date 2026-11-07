import { skins } from "../../stories/skins";
import type { ThemeFile } from "../../stories/skins";
import { customTheme, resolveTheme } from "./themeConfig";
import type { PlaygroundConfig } from "./themeConfig";

/** The current Playground theme as a file in the shape of src/themes/*.json: drop it in that folder and it is a theme. */
export function themeFile(config: PlaygroundConfig): ThemeFile {
  const base = skins[config.skin];
  const theme = resolveTheme(config);
  const custom = config.customTheme ? customTheme(config) : undefined;
  return {
    name: theme.name,
    label: custom ? custom.name : (base?.label ?? theme.name),
    description: custom
      ? `Tema criado no Playground a partir de ${base?.label ?? config.skin}.`
      : (base?.description ?? ""),
    fonts: config.fonts,
    tokens: theme.tokens ?? {},
    modes: theme.modes,
  };
}

/** File name from the theme name: "Meu tema" becomes meu-tema.json. */
export function themeFileName(file: ThemeFile) {
  const slug = file.name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "tema"}.json`;
}

export function downloadThemeFile(config: PlaygroundConfig) {
  const file = themeFile(config);
  const url = URL.createObjectURL(new Blob([`${JSON.stringify(file, null, 2)}\n`], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = themeFileName(file);
  link.click();
  URL.revokeObjectURL(url);
}
