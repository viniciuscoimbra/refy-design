"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import "../styles/scoped.css";
import "../styles/motion.css";

/** editorial is retained for existing consumers; new interfaces use light, dark or system. */
export type ThemeMode = "light" | "dark" | "system" | "editorial";
export type ThemeTokens = Partial<Record<`--${string}`, string | number>>;
export interface RefyTheme {
  /** Identificador da aplicação; não controla o modo. */
  name: string;
  /** Nome de exibição do tema (seletores, documentação). */
  label?: string;
  /** Descrição curta do tema. */
  description?: string;
  /** Conjunto de fontes com que o tema foi desenhado (chave de `fontSets`). */
  fonts?: string;
  /** Posição na vitrine de temas do site; sem o campo, não aparece. */
  featured?: number;
  tokens?: ThemeTokens;
  modes?: Partial<Record<ThemeMode, ThemeTokens>>;
}
interface ThemeScope {
  theme?: RefyTheme;
  mode: ThemeMode;
  portal: HTMLDivElement | null;
}
const Context = createContext<ThemeScope>({ mode: "light", portal: null });

export interface ThemeProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  theme?: RefyTheme;
  mode?: ThemeMode;
  children: ReactNode;
}

/** Escopo de identidade/modo. Não muda estado dos filhos ao trocar a aparência. */
export function ThemeProvider({ theme, mode, style, children, ...rest }: ThemeProviderProps) {
  const parent = useContext(Context);
  const identity = theme ?? parent.theme;
  const preference = mode ?? parent.mode;
  const [systemMode, setSystemMode] = useState<"light" | "dark">("light");
  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemMode(query.matches ? "dark" : "light");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preference]);
  const appearance = preference === "system" ? systemMode : preference;
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);
  const variables = { ...identity?.tokens, ...identity?.modes?.[appearance] };
  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined) continue;
    if (!/^--[\w-]+$/.test(key) || !["string", "number"].includes(typeof value)) {
      throw new Error(`Invalid theme token: ${key}`);
    }
  }
  return <Context.Provider value={{ theme: identity, mode: appearance, portal }}>
    <div {...rest} data-refy-scope="" data-refy-brand={identity?.name ?? "refy"} data-theme={appearance} data-mode-preference={preference} data-refy-motion={String(variables["--motion-reduced"]) === "1" ? "reduce" : undefined}
      style={{ ...variables, ...style } as CSSProperties}>
      {children}
      <div ref={setPortal} data-refy-portal="" style={{ display: "contents" }} />
    </div>
  </Context.Provider>;
}

/** Portais permanecem no escopo visual da instância, inclusive nos escopos aninhados. */
export function useThemePortal() {
  return useContext(Context).portal;
}

export function useResolvedMode() { return useContext(Context).mode; }
