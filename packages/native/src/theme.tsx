// Tema do Refy no React Native. O RN não tem cascata: cada escopo resolve os
// tokens de novo a partir dos valores crus, para que um alias como --brand
// acompanhe a troca de --primary, igual à web.
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import type { TextStyle } from "react-native";
import { colorMix, createNativeTheme } from "@refy/tokens";
import type { NativeTheme, RefyMode, RefyTheme } from "@refy/tokens";

export type RefyNativeMode = RefyMode | "system";
type Value = string | number | number[];

/** Converte família e peso do token no nome de fonte registrado no app (expo-font). */
export type FontResolver = (family: string, weight: number) => Pick<TextStyle, "fontFamily" | "fontWeight">;

const defaultFont: FontResolver = (family, weight) => ({ fontFamily: family, fontWeight: String(weight) as TextStyle["fontWeight"] });

export interface RefyContext {
  theme: RefyTheme;
  mode: RefyMode;
  native: NativeTheme;
  fonts: FontResolver;
  /** Primeiro candidato definido: nomes `--x` são tokens; o resto é valor literal (o fallback do CSS). */
  pick<T extends Value = Value>(...candidates: (string | number)[]): T;
  /** Tamanho em pontos; `em` vira múltiplo de `fontSize`. */
  size(name: string, fallback: number, fontSize?: number): number;
  /** Curva cubic-bezier do token, no formato de Easing.bezier. */
  easing(name: string, fallback?: [number, number, number, number]): [number, number, number, number];
  /** color-mix(in srgb, a pct%, b), para os fallbacks que o CSS calcula na hora. */
  mix(a: string, percent: number, b: string): string;
  font(familyTokens: string | string[], weightToken: string | number): Pick<TextStyle, "fontFamily" | "fontWeight">;
}

const Context = createContext<RefyContext | null>(null);

function build(theme: RefyTheme, mode: RefyMode, fonts: FontResolver): RefyContext {
  const native = createNativeTheme(theme, mode);
  const has = (name: string) => Object.prototype.hasOwnProperty.call(native.values, name);
  const pick = <T extends Value>(...candidates: (string | number)[]) => {
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.startsWith("--")) {
        if (has(candidate)) return native.values[candidate] as T;
        continue;
      }
      return candidate as T;
    }
    throw new Error(`Nenhum candidato definido: ${candidates.join(", ")}`);
  };
  const size = (name: string, fallback: number, fontSize = 16) => {
    if (!has(name)) return fallback;
    const value = native.values[name];
    if (typeof value !== "number") return fallback;
    return native.kinds[name] === "em" ? value * fontSize : value;
  };
  const font = (familyTokens: string | string[], weightToken: string | number) => {
    const family = String(pick(...(Array.isArray(familyTokens) ? familyTokens : [familyTokens]), "System"));
    const weight = typeof weightToken === "number" ? weightToken : Number(pick(weightToken, 400));
    return fonts(family, weight);
  };
  const easing = (name: string, fallback: [number, number, number, number] = [0.2, 0.8, 0.2, 1]) => {
    const value = has(name) ? native.values[name] : undefined;
    return Array.isArray(value) && value.length === 4 ? (value as [number, number, number, number]) : fallback;
  };
  const mix = (a: string, percent: number, b: string) => colorMix(`color-mix(in srgb, ${a} ${percent}%, ${b})`);
  return { theme, mode, native, fonts, pick, size, easing, mix, font };
}

export interface RefyProviderProps {
  /** Mesmo formato do ThemeProvider web: `{ name, tokens, modes }` (o JSON do tema do produto). */
  theme?: RefyTheme;
  mode?: RefyNativeMode;
  fonts?: FontResolver;
  children: ReactNode;
}

export function RefyProvider({ theme, mode, fonts, children }: RefyProviderProps) {
  const parent = useContext(Context);
  const scheme = useColorScheme();
  const preference = mode ?? parent?.mode ?? "light";
  const resolved: RefyMode = preference === "system" ? (scheme === "dark" ? "dark" : "light") : preference;
  const identity = theme ?? parent?.theme ?? { name: "refy" };
  const resolver = fonts ?? parent?.fonts ?? defaultFont;
  const value = useMemo(() => build(identity, resolved, resolver), [identity, resolved, resolver]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** Reescopa tokens para os filhos, como `.inverted` no Card web faz com --ink-1 e companhia. */
export function RefyScope({ tokens, children }: { tokens: Record<`--${string}`, string>; children: ReactNode }) {
  const parent = useRefy();
  const theme = useMemo<RefyTheme>(() => ({ ...parent.theme, tokens: { ...parent.theme.tokens, ...tokens } }), [parent.theme, tokens]);
  const value = useMemo(() => build(theme, parent.mode, parent.fonts), [theme, parent.mode, parent.fonts]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

const fallbackContext = build({ name: "refy" }, "light", defaultFont);

export function useRefy(): RefyContext {
  return useContext(Context) ?? fallbackContext;
}
