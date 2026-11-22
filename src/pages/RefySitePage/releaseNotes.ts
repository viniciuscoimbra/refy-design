// O CHANGELOG.md e as traduções dele pesam mais de 40 kB gzip e só a página Versões usa:
// SiteProject.tsx importa este módulo sob demanda, fora da primeira carga da home.
import changelog from "../../../CHANGELOG.md?raw";
import changelogText from "./locales/changelog.json";
import { parseReleases } from "./releases.mjs";
import type { Locale } from "./i18n";

export const releases = parseReleases(changelog);

// O CHANGELOG é escrito em inglês; changelog.json traduz cada frase para pt e es.
const notes: Record<Exclude<Locale, "en">, Record<string, string>> = changelogText;
export const note = (locale: Locale, text: string) => (locale === "en" ? text : notes[locale][text] ?? text);
