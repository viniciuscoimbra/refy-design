// Idioma do site refy.design. O endereço manda: /en/... é inglês, /es/... é espanhol e o resto é
// português. Sem prefixo e sem escolha guardada, a pessoa vai para o idioma do navegador; robô de
// busca fica no endereço que pediu, para cada idioma ser indexado no próprio endereço.
import { createContext, useContext, useEffect, useState } from "react";
import { LocaleProvider } from "../../lib/locale";
import type { ReactNode } from "react";
import styles from "./RefySitePage.module.css";

export type Locale = "pt" | "en" | "es";
export const locales: Locale[] = ["pt", "en", "es"];
const storageKey = "refy.locale";
export const htmlLang: Record<Locale, string> = { pt: "pt-BR", en: "en", es: "es" };

/** Idiomas que levam prefixo no endereço; português fica na raiz. */
const prefixed = ["en", "es"] as const;
export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split("/")[1];
  return (prefixed as readonly string[]).includes(first) ? (first as Locale) : null;
}
/** Tira o prefixo de idioma: `/en/for-ai/mcp` vira `/for-ai/mcp` (o nome continua em inglês). */
export function stripLocale(pathname: string): string {
  return localeFromPath(pathname) ? pathname.slice(3) || "/" : pathname;
}
// Cada idioma tem o endereço na própria língua (pedido de 09/11: a busca em português é a prioridade).
// O caminho canônico, usado pelo roteador e pelo build, é o português; aqui ficam só os trechos que
// mudam. Nome de componente e de template é nome de código e fica igual nos três idiomas.
const slugs: Record<Exclude<Locale, "pt">, Record<string, string>> = {
  en: {
    componentes: "components", colecoes: "collections", temas: "themes", tipografia: "typography", "para-ias": "for-ai",
    contribuir: "contributing", "quem-mantem": "maintainer", "primeiros-passos": "getting-started", instalacao: "installation",
    "tema-por-arquivo": "theming", compatibilidade: "compatibility", versoes: "releases",
  },
  es: {
    colecoes: "colecciones", templates: "plantillas", "quem-mantem": "quien-lo-mantiene", "primeiros-passos": "primeros-pasos", instalacao: "instalacion",
    "tema-por-arquivo": "tema-por-archivo", compatibilidade: "compatibilidad", versoes: "versiones",
  },
};
const unslugs = Object.fromEntries(
  Object.entries(slugs).map(([locale, map]) => [locale, Object.fromEntries(Object.entries(map).map(([pt, other]) => [other, pt]))]),
) as Record<Exclude<Locale, "pt">, Record<string, string>>;
const mapSegments = (path: string, map: Record<string, string>) => path.split("/").map((part) => map[part] ?? part).join("/");
/** Caminho em português de qualquer endereço do site: `/en/for-ai/mcp` vira `/para-ias/mcp`. */
export function canonicalPath(pathname: string): string {
  const from = localeFromPath(pathname);
  const bare = stripLocale(pathname);
  return from && from !== "pt" ? mapSegments(bare, unslugs[from]) : bare;
}
/** Endereço da mesma página em outro idioma: `localePath("en", "/para-ias/mcp")` é `/en/for-ai/mcp`. */
export function localePath(locale: Locale, path: string): string {
  const canonical = canonicalPath(path);
  if (locale === "pt") return canonical;
  const local = mapSegments(canonical, slugs[locale]);
  return `/${locale}${local === "/" ? "" : local}`;
}
// Robô de busca e navegador de teste não são redirecionados: o Google renderiza sem idioma
// escolhido (navigator em inglês) e, antes, indexava o texto em inglês no endereço em português.
const robot = () => navigator.webdriver || /bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent);

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "pt";
  // ?lang= vale para a prévia de template no iframe, que tem endereço próprio.
  const asked = new URLSearchParams(window.location.search).get("lang");
  if (locales.includes(asked as Locale)) return asked as Locale;
  const fromPath = localeFromPath(window.location.pathname);
  if (fromPath) return fromPath;
  if (window.self !== window.top || robot()) return "pt";
  let wanted: Locale | null = null;
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (locales.includes(saved as Locale)) wanted = saved as Locale;
  } catch { /* armazenamento bloqueado: segue pelo navegador */ }
  if (!wanted) {
    const preferred = navigator.languages?.length ? navigator.languages : [navigator.language];
    const base = preferred.map((tag) => tag?.toLowerCase().split("-")[0]).find((tag) => locales.includes(tag as Locale));
    wanted = (base as Locale | undefined) ?? "en";
  }
  if (wanted !== "pt") window.location.replace(localePath(wanted, window.location.pathname) + window.location.search + window.location.hash);
  return wanted;
}

interface LocaleState { locale: Locale; setLocale: (locale: Locale) => void }
const LocaleContext = createContext<LocaleState | null>(null);

export function SiteLocaleProvider({ initial, children }: { initial?: Locale; children: ReactNode }) {
  const [locale] = useState<Locale>(() => initial ?? activeLocale);
  activeLocale = locale;
  useEffect(() => { document.documentElement.lang = htmlLang[locale]; }, [locale]);
  // Links internos escritos como /docs/... ganham o prefixo do idioma, para quem abre em nova aba
  // e para o robô seguir a versão certa. O clique continua no roteador da página.
  useEffect(() => {
    if (locale === "pt" || typeof MutationObserver === "undefined") return;
    const fix = (root: ParentNode) => root.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach((a) => {
      const href = a.getAttribute("href")!;
      if (href.startsWith("//") || localeFromPath(href) || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)) return;
      a.setAttribute("href", localePath(locale, href));
    });
    fix(document);
    let queued = 0;
    const observer = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(() => { queued = 0; fix(document); });
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["href"] });
    return () => { observer.disconnect(); cancelAnimationFrame(queued); };
  }, [locale]);
  // Trocar de idioma recarrega a página: dados de módulo, templates em iframe e o título da aba
  // passam a nascer no idioma novo, sem nenhum texto preso no anterior.
  const setLocale = (next: Locale) => {
    if (next === locale) return;
    try { window.localStorage.setItem(storageKey, next); } catch { /* sem armazenamento: vale o parâmetro */ }
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    url.pathname = localePath(next, url.pathname);
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
// Cada visita baixa só os dicionários do próprio idioma: eram 1,3 MB dos três idiomas no primeiro
// carregamento, e quem lê em português nunca usa o espanhol. As entradas chamam loadLocaleText (ou
// o site, loadSiteText) antes de importar a página, porque há texto traduzido no nível de módulo.
type Dictionary = Record<string, string>;
const dictionaries: Partial<Record<Exclude<Locale, "pt">, Dictionary>> = {};
const docDictionaries: Partial<Record<Exclude<Locale, "en">, Dictionary>> = {};
/** Textos dos exemplos e templates por idioma, arquivo e frase (ver demoText.ts). */
export const demoDictionaries: Partial<Record<"pt" | "es", Record<string, Record<string, string | string[]>>>> = {};
/** Registra dicionários já importados. O Storybook importa os do português antes das stories, que
 * traduzem texto no nível de módulo e rodariam antes de qualquer carga assíncrona. */
export function registerLocaleText(locale: Locale, text: { site?: Dictionary; docs?: Dictionary; demo?: Record<string, Record<string, string | string[]>> }) {
  if (locale !== "pt" && text.site) dictionaries[locale] ??= text.site;
  if (locale !== "en" && text.docs) docDictionaries[locale] ??= text.docs;
  if (locale !== "en" && text.demo) demoDictionaries[locale] ??= text.demo;
}
/** Texto do próprio site (menus, home, rodapé). Em português não há o que baixar. */
export async function loadSiteText(locale: Locale): Promise<void> {
  if (locale === "en") dictionaries.en ??= (await import("./locales/en.json")).default;
  if (locale === "es") dictionaries.es ??= (await import("./locales/es.json")).default;
}
// A ficha dos componentes e os textos dos exemplos e templates somam 140 KB gzip em português e
// a home não mostra nenhum deles: o site os baixa depois da home ou na primeira página que os usa.
const referenceLoaders: Record<Exclude<Locale, "en">, () => Promise<[{ default: Dictionary }, { default: typeof demoDictionaries.pt }]>> = {
  pt: () => Promise.all([import("./locales/docs.pt.json"), import("./locales/demo.pt.json")]),
  es: () => Promise.all([import("./locales/docs.es.json"), import("./locales/demo.es.json")]),
};
const referenceLoads = new Map<Locale, Promise<void>>();
const hasReferenceText = (locale: Locale) => locale === "en" || (!!docDictionaries[locale] && !!demoDictionaries[locale]);
/** Ficha dos componentes, exemplos e templates traduzidos. Em inglês não há o que baixar. */
export function loadReferenceText(locale: Locale): Promise<void> {
  if (locale === "en" || hasReferenceText(locale)) return Promise.resolve();
  let load = referenceLoads.get(locale);
  if (!load) {
    load = referenceLoaders[locale]().then(([docs, demo]) => {
      docDictionaries[locale] ??= docs.default;
      demoDictionaries[locale] ??= demo.default;
    });
    // Uma falha de rede não fica guardada: a próxima tentativa baixa de novo.
    load.catch(() => referenceLoads.delete(locale));
    referenceLoads.set(locale, load);
  }
  return load;
}
export async function loadLocaleText(locale: Locale): Promise<void> {
  await Promise.all([loadSiteText(locale), loadReferenceText(locale)]);
}
// Quem pediu economia de dados, ou está em 2G, só baixa a ficha quando abre uma página que a usa.
const savingData = () => {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "");
};
/** Baixa a ficha e os exemplos quando o navegador fica ocioso depois da carga; devolve o cancelamento. */
export function prefetchReferenceText(locale: Locale): () => void {
  if (typeof window === "undefined" || hasReferenceText(locale) || savingData()) return () => undefined;
  const idle = window.requestIdleCallback ?? ((run: () => void) => window.setTimeout(run, 2000));
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
  let handle = 0;
  const schedule = () => { handle = idle(() => { loadReferenceText(locale).catch(() => undefined); }); };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => { window.removeEventListener("load", schedule); cancelIdle(handle); };
}
/**
 * Pede a ficha e os exemplos quando `needed` e diz se a página já pode aparecer. Se o download
 * falhar, a página aparece com o texto da fonte, e a próxima `page` tenta baixar de novo.
 */
export function useReferenceText(needed: boolean, page: string): boolean {
  const { locale } = useSiteLocale();
  const [settledPage, setSettledPage] = useState<string | null>(null);
  const ready = hasReferenceText(locale) || settledPage === page;
  useEffect(() => {
    if (!needed || ready) return;
    let alive = true;
    const settle = () => { if (alive) setSettledPage(page); };
    loadReferenceText(locale).then(settle, settle);
    return () => { alive = false; };
  }, [needed, ready, locale, page]);
  return ready;
}
export function translate(locale: Locale, text: string): string {
  if (!text) return text;
  if (locale === "pt") return docDictionaries.pt?.[text] ?? text;
  return dictionaries[locale]?.[text] ?? (locale === "es" ? docDictionaries.es?.[text] : undefined) ?? text;
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
