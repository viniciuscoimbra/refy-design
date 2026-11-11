"use client";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { en } from "./messages/en";
import { pt } from "./messages/pt";
import { es } from "./messages/es";
import type { RefyMessages } from "./messages/en";

export type { RefyMessages };
type DeepPartial<T> = { [K in keyof T]?: T[K] extends (...args: never[]) => unknown ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K] };

/** Textos que os componentes trazem prontos, por idioma. Outro idioma entra por `messages`. */
export const builtInMessages: Record<"en" | "pt" | "es", RefyMessages> = { en, pt, es };

// Sem provider não há dicionário no contexto: cada componente cai no próprio texto em inglês, que
// ele importa sozinho. Assim uma tela sem LocaleProvider não leva os textos dos outros componentes.
interface LocaleScope { locale: string; messages?: RefyMessages }
const Context = createContext<LocaleScope>({ locale: "en" });

export interface LocaleProviderProps {
  /** Tag BCP 47, como "en", "pt-BR" ou "es". Define os textos prontos e a formatação de datas e números. */
  locale: string;
  /** Substitui textos prontos, parcial ou inteiro. Para um idioma sem tradução embutida, passe o objeto completo. */
  messages?: DeepPartial<RefyMessages>;
  children: ReactNode;
}

function merge<T>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== "object") return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    const current = out[key];
    out[key] = value && typeof value === "object" && current && typeof current === "object" ? merge(current, value) : value ?? current;
  }
  return out as T;
}

/** Idioma dos componentes abaixo dele. Sem provider, vale inglês. */
export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  const base = builtInMessages[locale.toLowerCase().split("-")[0] as "en" | "pt" | "es"] ?? en;
  const value = useMemo(() => ({ locale, messages: merge(base, messages) }), [locale, base, messages]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** Tag de idioma em vigor, para `Intl` e `toLocaleString`. */
export function useLocale() { return useContext(Context).locale; }

/** Textos prontos de um componente no idioma em vigor. */
export function useMessages<K extends keyof RefyMessages>(component: K): RefyMessages[K] {
  return useContext(Context).messages?.[component] ?? en[component];
}

/** Uso interno: o componente passa o próprio texto em inglês e não puxa o dicionário inteiro. */
export function useComponentMessages<K extends keyof RefyMessages>(component: K, fallback: RefyMessages[K]): RefyMessages[K] {
  return useContext(Context).messages?.[component] ?? fallback;
}
