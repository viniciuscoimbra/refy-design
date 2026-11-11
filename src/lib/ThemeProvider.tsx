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
  /** false só fora de qualquer provider. */
  nested: boolean;
  /** Temas aplicados da raiz até este escopo, na ordem em que valem. */
  chain: RefyTheme[];
}
const Context = createContext<ThemeScope>({ mode: "light", portal: null, nested: false, chain: [] });

/** `modes[modo]` vence `tokens` dentro de um tema; o tema de dentro vence o de fora. */
function themeValues(themes: RefyTheme[], mode: string): ThemeTokens {
  const values: ThemeTokens = {};
  for (const item of themes) Object.assign(values, item.tokens, item.modes?.[mode as ThemeMode]);
  return values;
}

export interface ThemeProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  theme?: RefyTheme;
  mode?: ThemeMode;
  /**
   * Começa um escopo novo dentro de outro: volta à fundação, pinta fundo e base tipográfica
   * e não herda o que o escopo de fora sobrepôs. Use em vitrine ou prévia de outro tema.
   * Sem `isolate`, o provider aninhado herda os tokens do pai e aplica só os próprios.
   */
  isolate?: boolean;
  children: ReactNode;
}

/** Escopo de identidade/modo. Não muda estado dos filhos ao trocar a aparência. */
export function ThemeProvider({ theme, mode, isolate = false, style, children, ...rest }: ThemeProviderProps) {
  const parent = useContext(Context);
  const identity = theme ?? parent.theme;
  const root = !parent.nested || isolate;
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
  const own = root ? (identity ? [identity] : []) : theme ? [theme] : [];
  const chain = root ? own : [...parent.chain, ...own];
  const modeChanged = !root && appearance !== parent.mode;
  // O CSS redeclara os aliases (valores com var()) em todo aninhado, para que resolvam com os tokens
  // deste escopo; trocando de modo, também os papéis do modo novo. Os temas de fora vêm de novo em
  // linha para que o que eles sobrepõem continue valendo sobre essas redeclarações.
  const variables = themeValues(chain, appearance);
  for (const [key, value] of Object.entries(variables)) {
    if (value === undefined) continue;
    if (!/^--[\w-]+$/.test(key) || !["string", "number"].includes(typeof value)) {
      throw new Error(`Invalid theme token: ${key}`);
    }
  }
  return <Context.Provider value={{ theme: identity, mode: appearance, portal, nested: true, chain }}>
    <div {...rest} data-refy-scope="" data-refy-root={root ? "" : undefined} data-refy-brand={identity?.name ?? "refy"} data-theme={appearance} data-refy-mode-switch={modeChanged ? "" : undefined} data-mode-preference={preference} data-refy-motion={String(variables["--motion-reduced"]) === "1" ? "reduce" : undefined}
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
