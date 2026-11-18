// O site baixa os dicionários em partes (scripts/vite-locale-split.mjs): a página só pede o que mostra.
// As entradas do site chamam registerLocaleChunks() antes de qualquer texto traduzido (uma chamada, e
// não um import solto: o pacote declara `sideEffects` só para CSS e o build descartaria o import).
import { registerLocaleLoaders } from "../src/pages/RefySitePage/i18n";

export const registerLocaleChunks = () => registerLocaleLoaders({
  site: {
    en: () => import("virtual:refy-locale/site/en"),
    es: () => import("virtual:refy-locale/site/es"),
  },
  reference: {
    pt: () => import("virtual:refy-locale/reference/pt"),
    en: () => import("virtual:refy-locale/reference/en"),
    es: () => import("virtual:refy-locale/reference/es"),
  },
});
