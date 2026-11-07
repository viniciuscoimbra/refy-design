// Primeiro import das entradas do site: define o idioma antes de qualquer módulo de dados carregar.
// O valor exportado é usado pela entrada; sem esse uso, o build descarta o módulo (o pacote declara
// `sideEffects` só para CSS).
import { initLocale } from "../src/pages/RefySitePage/i18n";

export const siteLocale = initLocale();
