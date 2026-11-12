// O mesmo índice do `refy-agent catalog` e do refy_search: catálogo, API documentada de cada
// família e a tabela de escolha de controles. Este módulo só carrega quando alguém busca.
import { buildIndex, searchCatalog } from "../../../tools/refy-agent/search.mjs";
import type { SearchDocument } from "../../../tools/refy-agent/search.mjs";
import { collections, components } from "../../../ai/catalog.json";
import choices from "../../../ai/control-choices.md?raw";

const apis = import.meta.glob<SearchDocument["api"]>("../../../ai/components/*.json", { eager: true, import: "api" });
const index = buildIndex({ components, collections }, (family) => ({ api: apis[`../../../ai/${family.document}`] }), choices);

/** Família por relevância para a consulta, em pt, en ou es. */
export function rankFamilies(query: string): string[] {
  return searchCatalog(index, query, { limit: 8 }).results.map((result) => result.id);
}
