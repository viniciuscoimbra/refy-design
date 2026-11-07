import { useSyncExternalStore } from "react";
import type {
  RefyTheme,
  ThemeMode,
  ThemeTokens,
} from "../../lib/ThemeProvider";
import { fontSets, type FontSet } from "../../lib/fontSets";
import { skins } from "../../stories/skins";
import source from "../../tokens/foundations.tokens.json";
import componentHooks from "../../tokens/component-hooks.json";

// Each theme file names the font set it was designed with.
export const presetFonts: Record<string, FontSet> = Object.fromEntries(
  Object.entries(skins).map(([id, skin]) => [id, skin.fonts]),
);
export type Skin = string;
export interface PlaygroundConfig {
  theme: ThemeMode;
  fonts: FontSet;
  skin: Skin;
  customTheme: string;
}
// Sem escolha salva, valem o tema Refy e o conjunto de fontes do próprio arquivo dele.
export const defaultConfig: PlaygroundConfig = {
  theme: "light",
  fonts: presetFonts["refy-site"],
  skin: "refy-site",
  customTheme: "",
};
export const preferenceKey = "refy.playground.theme.v1";
export const tokenDefinitions = Object.fromEntries([
  ...componentHooks.map((name) => [name, { type: "css" }]),
  ...[source.base, source.light, source.dark].flatMap((group) => [
    ...Object.entries(group)
      .filter(([key]) => !key.startsWith("$"))
      .map(([key, token]) => [
        `--${key}`,
        { type: (token as { $type: string }).$type },
      ]),
    ...Object.keys(group.$extensions["org.refy.css"]).map((key) => [
      key,
      { type: "css" },
    ]),
  ]),
]) as Record<string, { type: string }>;
export const tokenNames = Object.keys(tokenDefinitions).sort();
export const textScale = Object.fromEntries(
  Object.entries(source.base)
    .filter(([name]) => name.startsWith("text-"))
    .map(([name, token]) => [
      `--${name}`,
      (token as { $value: { value: number } }).$value.value,
    ]),
);

export function tokenProperty(name: string): string {
  const type = tokenDefinitions[name]?.type;
  if (type === "color") return "color";
  if (type === "fontFamily") return "font-family";
  if (type === "dimension") return "padding";
  if (type === "duration") return "animation-duration";
  if (type === "cubicBezier") return "animation-timing-function";
  if (/background|gradient|surface$/.test(name)) return "background";
  if (/shadow|elev-|glow|focus-ring|critical-ring/.test(name))
    return "box-shadow";
  if (/radius/.test(name)) return "border-radius";
  if (/-angle$/.test(name)) return "rotate";
  if (/-perspective$/.test(name)) return "perspective";
  if (/-gap$/.test(name)) return "gap";
  if (/border-style/.test(name)) return "border-style";
  if (/border-width/.test(name)) return "border-width";
  if (/tracking/.test(name)) return "letter-spacing";
  if (/pressed-transform|enter-transform/.test(name)) return "transform";
  if (/transform$/.test(name)) return "text-transform";
  if (/opacity/.test(name)) return "opacity";
  if (/white-space/.test(name)) return "white-space";
  if (/-text-wrap$/.test(name)) return "text-wrap";
  if (/-wrap$/.test(name)) return "flex-wrap";
  if (/-label-align$/.test(name)) return "text-align";
  if (/-columns$/.test(name)) return "grid-template-columns";
  if (/-areas$/.test(name)) return "grid-template-areas";
  if (/-justify$/.test(name)) return "justify-content";
  if (/-case$/.test(name)) return "text-transform";
  if (/-fill$/.test(name)) return "background";
  if (/-order-\d+$/.test(name)) return "order";
  if (/-descender$/.test(name)) return "padding-bottom";
  if (/-align$/.test(name)) return "align-items";
  if (/-aspect$/.test(name)) return "aspect-ratio";
  if (/-order$/.test(name)) return "order";
  if (/-flex$/.test(name)) return "flex";
  if (/-display$/.test(name)) return "display";
  if (/-resize$/.test(name)) return "resize";
  if (/-outline$/.test(name)) return "outline";
  if (/weight/.test(name)) return "font-weight";
  if (/margin-block/.test(name)) return "margin-block";
  if (/margin/.test(name)) return "margin";
  if (/measure$|max-width$/.test(name)) return "max-width";
  if (/leading|line-height/.test(name)) return "line-height";
  if (/^--z-/.test(name)) return "z-index";
  if (type === "number") return "opacity";
  if (type === "fontFamily" || /-font$|--prose-font-/.test(name))
    return "font-family";
  if (type === "duration" || /duration/.test(name)) return "animation-duration";
  if (type === "cubicBezier" || /ease/.test(name))
    return "animation-timing-function";
  if (
    type === "dimension" ||
    /height|width|padding|gap|size|^--text-|offset|travel|icon-button|item-max|prose-measure|prose-flow|overlap/.test(
      name,
    )
  )
    return "padding";
  return "color";
}

export function tokenCanVaryByMode(name: string) {
  if (/^--(?:motion-|duration-|ease-)/.test(name)) return false;
  return ["color", "background", "box-shadow", "opacity"].includes(
    tokenProperty(name),
  );
}

export function validToken(name: string, value: unknown): boolean {
  if (
    !Object.prototype.hasOwnProperty.call(tokenDefinitions, name) ||
    !["string", "number"].includes(typeof value)
  )
    return false;
  const text = String(value).trim();
  if (
    [...text.matchAll(/var\(\s*(--[\w-]+)/g)].some((match) => match[1] === name)
  )
    return false;
  if (
    !text ||
    text.length > 1500 ||
    /[{};]|url\s*\(|expression\s*\(|@import/i.test(text)
  )
    return false;
  if (
    [...text.matchAll(/var\(\s*(--[\w-]+)/g)].some(
      (match) =>
        !Object.prototype.hasOwnProperty.call(tokenDefinitions, match[1]),
    )
  )
    return false;
  if (typeof CSS === "undefined") return true;
  if (
    /-angle$/.test(name) &&
    !CSS.supports("transform", `rotateY(calc(1 * ${text}))`)
  )
    return false;
  return CSS.supports(tokenProperty(name), text);
}

function rejectTokenCycles(theme: RefyTheme) {
  for (const mode of ["light", "dark"] as const) {
    const graph: Record<string, string> = {};
    for (const group of [source.base, source[mode]]) {
      for (const [name, token] of Object.entries(group))
        if (!name.startsWith("$"))
          graph[`--${name}`] = JSON.stringify(
            (token as { $value: unknown }).$value,
          );
      for (const [name, token] of Object.entries(
        group.$extensions["org.refy.css"],
      ))
        graph[name] = token.value;
    }
    Object.assign(graph, theme.tokens, theme.modes?.[mode]);
    const visited = new Set<string>(),
      visiting = new Set<string>();
    function visit(name: string) {
      if (visiting.has(name))
        throw new Error(
          `Referência circular em ${name}. A prévia foi preservada.`,
        );
      if (visited.has(name)) return;
      visiting.add(name);
      for (const match of String(graph[name] ?? "").matchAll(
        /var\(\s*(--[\w-]+)/g,
      ))
        visit(match[1]);
      visiting.delete(name);
      visited.add(name);
    }
    Object.keys(graph).forEach(visit);
  }
}

/** Troca var(--x) pelo valor que o próprio arquivo dá a --x quando --x não é um token do Refy
 * (ex.: "--primary": "var(--marca)" com "--marca": "#ff493f"). Referências a tokens do Refy ficam como estão. */
export function resolveFileReferences(tokens: Record<string, unknown>, base: Record<string, unknown> = {}) {
  const all = { ...base, ...tokens };
  const resolve = (text: string, depth: number): string =>
    depth > 10 ? text : text.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g, (whole, name: string) =>
      !Object.prototype.hasOwnProperty.call(tokenDefinitions, name) && typeof all[name] === "string"
        ? resolve(String(all[name]), depth + 1)
        : whole);
  return Object.fromEntries(Object.entries(tokens).map(([k, v]) => [k, typeof v === "string" ? resolve(v, 0) : v]));
}

/** Importação pelo editor: resolve referências do próprio arquivo, separa os tokens que o Refy não conhece
 * (devolvidos em `ignored`, para a tela listar) e valida o resto com parseTheme, sem afrouxar nada. */
export function importTheme(json: string): { theme: RefyTheme; ignored: string[] } {
  if (json.length > 200000)
    throw new Error("O arquivo de tema é grande demais. Limite: 200 KB.");
  const value = JSON.parse(json);
  const ignored = new Set<string>();
  const known = (group: Record<string, unknown>, base: Record<string, unknown> = {}) =>
    Object.fromEntries(Object.entries(resolveFileReferences(group, base)).filter(([key]) => {
      const ok = Object.prototype.hasOwnProperty.call(tokenDefinitions, key);
      if (!ok) ignored.add(key);
      return ok;
    }));
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const base = value.tokens && typeof value.tokens === "object" ? value.tokens : {};
    if (value.modes && typeof value.modes === "object")
      for (const mode of Object.keys(value.modes))
        if (value.modes[mode] && typeof value.modes[mode] === "object") value.modes[mode] = known(value.modes[mode], base);
    if (value.tokens && typeof value.tokens === "object") value.tokens = known(value.tokens);
  }
  return { theme: parseTheme(JSON.stringify(value)), ignored: [...ignored].sort() };
}

export function parseTheme(json: string): RefyTheme {
  if (json.length > 200000)
    throw new Error("O arquivo de tema é grande demais. Limite: 200 KB.");
  const value = JSON.parse(json);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.tokens && typeof value.tokens === "object") value.tokens = resolveFileReferences(value.tokens);
    if (value.modes && typeof value.modes === "object")
      for (const mode of Object.keys(value.modes))
        if (value.modes[mode] && typeof value.modes[mode] === "object") value.modes[mode] = resolveFileReferences(value.modes[mode], value.tokens);
  }
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== "object" ||
    typeof value.name !== "string" ||
    !value.name.trim()
  )
    throw new Error("Informe um tema com nome, tokens e modos.");
  const check = (tokens: unknown): ThemeTokens => {
    if (!tokens || typeof tokens !== "object" || Array.isArray(tokens))
      throw new Error("Os tokens precisam formar um objeto.");
    for (const [key, val] of Object.entries(tokens)) {
      if (!Object.prototype.hasOwnProperty.call(tokenDefinitions, key))
        throw new Error(
          `Token desconhecido: ${key}. Use os papéis listados no editor.`,
        );
      if (!validToken(key, val)) throw new Error(`Valor inválido em ${key}.`);
    }
    return tokens as ThemeTokens;
  };
  if (
    value.modes !== undefined &&
    (!value.modes ||
      typeof value.modes !== "object" ||
      Array.isArray(value.modes) ||
      Object.keys(value.modes).some((key) => !["light", "dark"].includes(key)))
  )
    throw new Error("Use apenas light e dark nos modos do tema.");
  const theme = {
    name: value.name.slice(0, 100),
    ...(typeof value.label === "string" && value.label.trim() ? { label: value.label.slice(0, 100) } : {}),
    tokens: check(value.tokens ?? {}),
    modes: Object.fromEntries(
      Object.entries(value.modes ?? {}).map(([mode, tokens]) => [
        mode,
        check(tokens),
      ]),
    ),
  };
  rejectTokenCycles(theme);
  return theme;
}

export function customTheme(config: PlaygroundConfig): RefyTheme {
  try {
    return config.customTheme
      ? parseTheme(config.customTheme)
      : { name: "Meu tema" };
  } catch {
    return { name: "Meu tema" };
  }
}
export function changeConfig(
  config: PlaygroundConfig,
  patch: Partial<PlaygroundConfig>,
): PlaygroundConfig {
  if (patch.skin)
    patch = {
      ...patch,
      fonts: patch.fonts ?? presetFonts[patch.skin],
      ...(patch.customTheme === undefined ? { customTheme: "" } : {}),
    };
  if (patch.customTheme === undefined && patch.fonts && config.customTheme) {
    const custom = customTheme(config);
    for (const tokens of [
      custom.tokens,
      custom.modes?.light,
      custom.modes?.dark,
    ]) {
      for (const name of Object.keys(fontSets[patch.fonts].tokens))
        delete tokens?.[name as `--${string}`];
    }
    patch = { ...patch, customTheme: JSON.stringify(custom) };
  }
  return { ...config, ...patch };
}
export function resolveTheme(config: PlaygroundConfig): RefyTheme {
  const base = skins[config.skin]?.theme;
  const custom = customTheme(config);
  return {
    name: config.customTheme ? custom.name : (base?.name ?? config.skin),
    tokens: {
      ...base?.tokens,
      // A theme file's own fonts win while the user keeps the theme's preset font set.
      ...(base?.tokens?.["--font-heading"] && config.fonts === presetFonts[config.skin] ? {} : fontSets[config.fonts].tokens),
      ...custom.tokens,
    },
    modes: {
      light: { ...base?.modes?.light, ...custom.modes?.light },
      dark: { ...base?.modes?.dark, ...custom.modes?.dark },
    },
  };
}
export function readConfig(): PlaygroundConfig {
  try {
    const value = JSON.parse(localStorage.getItem(preferenceKey) ?? "{}");
    const skin: Skin = Object.prototype.hasOwnProperty.call(skins, value.skin)
      ? value.skin
      : "refy-site";
    return {
      theme: ["light", "dark", "system"].includes(value.theme)
        ? value.theme
        : "light",
      fonts:
        Object.prototype.hasOwnProperty.call(fontSets, value.fonts) &&
        value.fonts !== "legacy"
          ? value.fonts
          : presetFonts[skin],
      skin,
      customTheme:
        value.customTheme && parseTheme(value.customTheme)
          ? value.customTheme
          : "",
    };
  } catch {
    return defaultConfig;
  }
}

const customPreferenceKey = "refy.playground.custom-theme.v1";
// Capture legacy fields before Storybook normalizes the current URL.
const legacyURLGlobals: Record<string, string> = (() => {
  try {
    const query =
      new URLSearchParams(window.location.search).get("globals") ?? "";
    return Object.fromEntries(
      query.split(";").flatMap((pair) => {
        const split = pair.indexOf(":");
        return split < 0 ? [] : [[pair.slice(0, split), pair.slice(split + 1)]];
      }),
    );
  } catch {
    return {};
  }
})();
function readCustomConfig(): PlaygroundConfig {
  try {
    const saved = JSON.parse(
      localStorage.getItem(customPreferenceKey) ?? "null",
    );
    if (saved?.customTheme) parseTheme(saved.customTheme);
    if (
      saved &&
      Object.prototype.hasOwnProperty.call(skins, saved.skin) &&
      Object.prototype.hasOwnProperty.call(fontSets, saved.fonts)
    )
      return saved;
  } catch {
    /* A damaged preference never replaces the current theme. */
  }
  return readConfig();
}
let customSnapshot = readCustomConfig();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function rememberCustomTheme(config: PlaygroundConfig) {
  if (JSON.stringify(config) === JSON.stringify(customSnapshot)) return;
  customSnapshot = config;
  try {
    localStorage.setItem(customPreferenceKey, JSON.stringify(config));
  } catch {
    /* Editing remains available without persistence. */
  }
  listeners.forEach((listener) => listener());
}

/** Only theme and mode are public Storybook globals; font/color/spacing live in the theme. */
export function configFromGlobals(
  globals: Record<string, unknown>,
  custom = customSnapshot,
): PlaygroundConfig {
  const legacyMode = ["light", "dark", "system"].includes(
    String(globals.theme),
  );
  const mode = legacyMode ? globals.theme : globals.mode;
  const theme = ["light", "dark", "system"].includes(String(mode))
    ? (mode as ThemeMode)
    : "light";
  if (legacyMode) {
    globals = {
      ...legacyURLGlobals,
      ...Object.fromEntries(
        Object.entries(globals).filter(([, value]) => value !== undefined),
      ),
    };

    const skin = Object.prototype.hasOwnProperty.call(
      skins,
      String(globals.skin),
    )
      ? (globals.skin as Skin)
      : "refy-site";
    return {
      theme,
      skin,
      fonts:
        Object.prototype.hasOwnProperty.call(fontSets, String(globals.fonts)) &&
        globals.fonts !== "legacy"
          ? (globals.fonts as FontSet)
          : presetFonts[skin],
      customTheme:
        typeof globals.customTheme === "string" ? globals.customTheme : "",
    };
  }
  if (globals.theme === "custom")
    return {
      ...custom,
      theme,
      customTheme: custom.customTheme || JSON.stringify({ name: "Meu tema" }),
    };
  const skin = Object.prototype.hasOwnProperty.call(
    skins,
    String(globals.theme),
  )
    ? (globals.theme as Skin)
    : "refy-site";
  return { theme, skin, fonts: presetFonts[skin], customTheme: "" };
}
export function usePlaygroundConfig(globals: Record<string, unknown>) {
  const custom = useSyncExternalStore(
    subscribe,
    () => customSnapshot,
    () => defaultConfig,
  );
  return configFromGlobals(globals, custom);
}
export function configGlobals(config: PlaygroundConfig) {
  return {
    theme:
      config.customTheme || config.fonts !== presetFonts[config.skin]
        ? "custom"
        : config.skin,
    mode: config.theme,
  };
}
