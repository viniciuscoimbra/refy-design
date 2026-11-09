import { createContext, useContext, useSyncExternalStore } from "react";
import type { RefyTheme } from "../../index";

// Plataforma escolhida nas fichas (Web ou Mobile). Vale para todas as fichas da visita e fica
// na URL (?plataforma=mobile) para o link abrir na mesma aba.
export type Platform = "web" | "mobile";
const param = "plataforma";
const storageKey = "refy.plataforma";
const listeners = new Set<() => void>();

function initial(): Platform {
  if (typeof window === "undefined") return "web";
  if (new URLSearchParams(window.location.search).get(param) === "mobile") return "mobile";
  try {
    return window.sessionStorage.getItem(storageKey) === "mobile" ? "mobile" : "web";
  } catch {
    return "web";
  }
}
let current: Platform = initial();

/** Põe ou tira ?plataforma=mobile da URL atual, sem criar entrada nova no histórico. */
export function syncPlatformUrl(show: boolean) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (show && current === "mobile") url.searchParams.set(param, "mobile");
  else url.searchParams.delete(param);
  if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
}

export function setPlatform(next: Platform) {
  current = next;
  try {
    window.sessionStorage.setItem(storageKey, next);
  } catch {
    /* sem armazenamento: vale a URL */
  }
  syncPlatformUrl(true);
  listeners.forEach((listener) => listener());
}

export function usePlatform(): Platform {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => "web",
  );
}

// Tema do site em JSON, para a prévia nativa usar o mesmo arquivo que pinta a página.
export const SiteThemeContext = createContext<RefyTheme | undefined>(undefined);
export const useSiteTheme = () => useContext(SiteThemeContext);
