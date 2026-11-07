import { componentCatalog } from "../../src/pages/PlaygroundPage/catalog";

/**
 * Story principal do componente no Storybook, no tema Refy. É o mesmo exemplo que a
 * documentação do site mostra, sem depender da interface do site ou do playground.
 */
export function componentUrl(id: string, mode = "light", theme = "refy") {
  const entry = componentCatalog.find((item) => item.id === id);
  if (!entry) throw new Error(`Componente fora do catálogo: ${id}`);
  return `/iframe.html?id=${entry.storyId}&viewMode=story&globals=theme:${theme};mode:${mode}`;
}

/** Onde a story é montada; equivale ao primeiro exemplo da documentação. */
export const storyRoot = "#storybook-root";
