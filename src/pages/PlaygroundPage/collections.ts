import registry from '../../catalog/collections.json';

/** Capability metadata only; Atomic Design levels and runtime imports are unchanged. */
export const collectionDefinitions = registry.collections;
export function componentCollectionIds(id: string): string[] {
  const memberships = registry.memberships as Record<string, string[]>;
  return Object.prototype.hasOwnProperty.call(memberships, id) ? [...memberships[id]] : ['core'];
}
export function matchesCollection(id: string, filter: string): boolean {
  return !filter || filter === 'all' || componentCollectionIds(id).includes(filter);
}
export function collectionSearchTerms(id: string): string[] {
  return collectionDefinitions.filter(item => componentCollectionIds(id).includes(item.id))
    .flatMap(item => [item.id, item.label, ...item.keywords]);
}
export function collectionLabels(id: string): string[] {
  return collectionDefinitions.filter(item => componentCollectionIds(id).includes(item.id)).map(item => item.label);
}

/** Texto de busca sem acento e em minúsculas: "Botão" e "botao" casam igual. */
export function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase();
}

export function matchesCollectionSearch(id: string, query: string, text = ""): boolean {
  const haystack = normalizeSearchText([id, text, ...collectionSearchTerms(id)].join(" "));
  return normalizeSearchText(query).trim().split(/\s+/).filter(Boolean).every(term => haystack.includes(term));
}
