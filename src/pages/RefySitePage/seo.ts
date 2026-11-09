// Título e descrição da home nos três idiomas. A aba (RefySitePage) e o HTML pré-renderizado
// (scripts/site-seo.mjs) leem daqui: o Google usa o título renderizado, e antes a aba trocava o
// título da home por só "refy".
import type { Locale } from "./i18n";

export const homeSeo: Record<Locale, { title: string; description: string }> = {
  pt: {
    title: "refy: design system com tema por arquivo e IA nativa",
    description: "Design system open source para web e mobile: componentes prontos, tema num arquivo de tokens e catálogo que agentes de IA leem antes de montar a tela.",
  },
  en: {
    title: "refy: design system with file-based themes and native AI",
    description: "Open source design system for web and mobile: ready components, a theme in one token file and a catalog AI agents read before they build the screen.",
  },
  es: {
    title: "refy: design system con tema por archivo e IA nativa",
    description: "Design system de código abierto para web y móvil: componentes listos, tema en un archivo de tokens y catálogo que los agentes de IA leen antes de montar la pantalla.",
  },
};
