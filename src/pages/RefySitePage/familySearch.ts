import { useEffect, useState } from "react";
import type { CommandItem } from "../../index";
import { componentCatalog } from "../PlaygroundPage/catalog";
import { normalizeSearchText } from "../PlaygroundPage/collections";

export type RankFamilies = (query: string) => string[];

/** Carrega o índice de busca na primeira vez que `enabled` fica verdadeiro; até lá devolve null. */
export function useFamilySearch(enabled = true): RankFamilies | null {
  const [rank, setRank] = useState<RankFamilies | null>(null);
  useEffect(() => {
    if (!enabled || rank) return;
    let live = true;
    import("./familyIndex").then((module) => { if (live) setRank(() => module.rankFamilies); });
    return () => { live = false; };
  }, [enabled, rank]);
  return rank;
}

/**
 * Famílias que respondem à consulta: primeiro as que o índice ranqueou, na ordem dele; depois as que
 * só casam pelo texto (`matchesText`), para um nome digitado pela metade ("Tab") continuar achando.
 */
export function searchFamilies<T extends { id: string }>(items: T[], query: string, rank: RankFamilies | null, matchesText: (item: T) => boolean): T[] {
  if (!query.trim()) return items;
  const ranked = rank?.(query) ?? [];
  const byId = new Map(items.map((item) => [item.id, item]));
  const first = ranked.flatMap((id) => byId.get(id) ?? []);
  return [...first, ...items.filter((item) => !ranked.includes(item.id) && matchesText(item))];
}

const familyIds = new Set(componentCatalog.map((item) => item.id));

/**
 * Busca da paleta do site: páginas e documentos casam pelo texto; as famílias vêm de `searchFamilies`
 * e ficam no lugar em que o grupo Componentes já aparecia.
 */
export function searchCommands(items: CommandItem[], query: string, rank: RankFamilies | null): CommandItem[] {
  const text = normalizeSearchText(query);
  const matchesText = (item: CommandItem) => normalizeSearchText(`${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`).includes(text);
  const families = searchFamilies(items.filter((item) => familyIds.has(item.id)), query, rank, matchesText);
  const firstFamily = items.findIndex((item) => familyIds.has(item.id));
  const others = items.filter((item) => !familyIds.has(item.id) && matchesText(item));
  const before = others.filter((item) => items.indexOf(item) < firstFamily);
  return [...before, ...families, ...others.slice(before.length)];
}
