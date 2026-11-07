// Idioma do site refy.design. A escolha da pessoa fica guardada no navegador; sem escolha, vale o
// primeiro idioma do navegador que o site tem, e inglês para qualquer outro.
import { createContext, useContext, useEffect, useState } from "react";
import { LocaleProvider } from "../../lib/locale";
import type { ReactNode } from "react";
import styles from "./RefySitePage.module.css";
import en from "./locales/en.json";
import es from "./locales/es.json";
import docsPt from "./locales/docs.pt.json";
import docsEs from "./locales/docs.es.json";

export type Locale = "pt" | "en" | "es";
export const locales: Locale[] = ["pt", "en", "es"];
const storageKey = "refy.locale";
export const htmlLang: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es" };

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  const asked = new URLSearchParams(window.location.search).get("lang");
  if (locales.includes(asked as Locale)) return asked as Locale;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (locales.includes(saved as Locale)) return saved as Locale;
  } catch { /* armazenamento bloqueado: segue pelo navegador */ }
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const base = tag?.toLowerCase().split("-")[0];
    if (locales.includes(base as Locale)) return base as Locale;
  }
  return "en";
}

interface LocaleState { locale: Locale; setLocale: (locale: Locale) => void }
const LocaleContext = createContext<LocaleState | null>(null);

export function SiteLocaleProvider({ initial, children }: { initial?: Locale; children: ReactNode }) {
  const [locale] = useState<Locale>(() => initial ?? activeLocale);
  activeLocale = locale;
  useEffect(() => { document.documentElement.lang = htmlLang[locale]; }, [locale]);
  // Trocar de idioma recarrega a página: dados de módulo, templates em iframe e o título da aba
  // passam a nascer no idioma novo, sem nenhum texto preso no anterior.
  const setLocale = (next: Locale) => {
    if (next === locale) return;
    try { window.localStorage.setItem(storageKey, next); } catch { /* sem armazenamento: vale o parâmetro */ }
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.location.replace(url.toString());
  };
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <LocaleProvider locale={htmlLang[locale]}>{children}</LocaleProvider>
    </LocaleContext.Provider>
  );
}

// Fora do SiteLocaleProvider (templates no iframe, Storybook) vale o idioma definido por initLocale.
export const useSiteLocale = (): LocaleState => useContext(LocaleContext) ?? { locale: activeLocale, setLocale: () => {} };

/** Escolhe o texto do idioma atual: `pick({ pt: "Buscar", en: "Search", es: "Buscar" })`. */
export type Text = Record<Locale, string>;
export function useText() {
  const { locale } = useSiteLocale();
  return <T,>(text: Record<Locale, T>): T => text[locale];
}

// Texto do próprio site é escrito em português e os dicionários en/es o levam para os outros
// idiomas. A ficha de cada componente (descrição, quando usar, propriedades, exemplos) vem da
// biblioteca e é escrita em inglês, como o código; docs.pt/docs.es a levam para português e
// espanhol. Frase sem tradução aparece como está na fonte.
const dictionaries: Record<Exclude<Locale, "pt">, Record<string, string>> = { en, es };
const docDictionaries: Record<Exclude<Locale, "en">, Record<string, string>> = { pt: docsPt, es: docsEs };
export function translate(locale: Locale, text: string): string {
  if (!text) return text;
  if (locale === "pt") return docDictionaries.pt[text] ?? text;
  return dictionaries[locale][text] ?? (locale === "es" ? docDictionaries.es[text] : undefined) ?? text;
}
// Idioma em vigor para quem lê texto fora de hook (dados, templates). O SiteLocaleProvider o define
// antes de renderizar os filhos, e todo o site renderiza de novo quando ele muda.
let activeLocale: Locale = "pt";
/** Chamado pelas entradas do site antes de carregar dados: texto de nível de módulo já nasce no idioma certo. */
export function initLocale(locale: Locale = detectLocale()) {
  activeLocale = locale;
  if (typeof document !== "undefined") document.documentElement.lang = htmlLang[locale];
  return locale;
}
export const tr = (text: string) => translate(activeLocale, text);
export const currentLocale = () => activeLocale;
/** `tr("Buscar componente…")` devolve a frase no idioma atual. */
export function useTr() {
  const { locale } = useSiteLocale();
  return (text: string) => translate(locale, text);
}

const flag = (children: ReactNode) => (
  <svg viewBox="0 0 30 20" width="22" height="15" aria-hidden="true" className={styles.flag}>
    {children}
  </svg>
);
export const flags: Record<Locale, ReactNode> = {
  pt: flag(<>
    <rect width="30" height="20" fill="#009b3a" />
    <path d="M15 2.5 27 10 15 17.5 3 10z" fill="#fedf00" />
    <circle cx="15" cy="10" r="4.6" fill="#002776" />
  </>),
  en: flag(<>
    <rect width="30" height="20" fill="#fff" />
    {[0, 2, 4, 6, 8, 10, 12].map((row) => <rect key={row} y={(row * 20) / 13} width="30" height={20 / 13} fill="#b22234" />)}
    <rect width="13" height={(20 / 13) * 7} fill="#3c3b6e" />
  </>),
  es: flag(<>
    <rect width="30" height="20" fill="#aa151b" />
    <rect y="5" width="30" height="10" fill="#f1bf00" />
  </>),
};
export const localeNames: Record<Locale, string> = { pt: "Português", en: "English", es: "Español" };
