// Tradução dos textos dos exemplos e templates no site (ver scripts/vite-demo-text.mjs). O código
// fica em inglês; aqui a tela renderizada troca cada texto pelo idioma em vigor.
import { currentLocale, demoDictionaries as dictionaries } from "./i18n";

export function __refyText(file: string, text: string): string {
  const locale = currentLocale();
  if (locale === "en") return text;
  const value = dictionaries[locale]?.[file]?.[text];
  return typeof value === "string" ? value : text;
}

export function __refyValue<T>(file: string, value: T): T | string {
  return typeof value === "string" ? __refyText(file, value) : value;
}

export function __refyTemplate(file: string, key: string, values: unknown[]): string {
  const locale = currentLocale();
  const value = locale === "en" ? undefined : dictionaries[locale]?.[file]?.[key];
  const parts = Array.isArray(value) ? value : key.slice(1).split("\u0001");
  return parts.reduce((out, part, i) => out + part + (i < values.length ? String(values[i]) : ""), "");
}

// Rótulo de exemplo vindo da documentação gerada (nome da story, em inglês): procura em todos os arquivos.
export function demoLabel(text: string): string {
  const locale = currentLocale();
  if (locale === "en") return text;
  for (const entries of Object.values(dictionaries[locale] ?? {})) {
    const value = entries[text];
    if (typeof value === "string") return value;
  }
  return text;
}
