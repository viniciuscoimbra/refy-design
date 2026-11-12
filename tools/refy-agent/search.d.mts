export interface SearchFamily {
  id: string;
  publicName?: string;
  label?: string;
  description?: string;
  area?: string;
  level?: string;
  collections?: string[];
  howToUse?: string[];
  alternatives?: string[];
  document?: string;
}
export interface SearchCollection {
  id: string;
  label: string;
  kind?: string;
  description?: string;
  keywords?: string[];
}
export interface SearchDocument {
  api?: Array<{ name: string; props?: Array<{ name: string }> }>;
}
export interface SearchIndex {
  total: number;
}
export interface SearchResult {
  id: string;
  score: number;
}
export function normalize(value: unknown): string;
export function buildIndex(
  catalog: { components: SearchFamily[]; collections?: SearchCollection[] },
  documentFor?: (component: SearchFamily) => SearchDocument | undefined,
  choicesMarkdown?: string,
): SearchIndex;
export function searchCatalog(
  index: SearchIndex,
  query: string,
  options?: { limit?: number; collection?: string },
): { query: string; results: SearchResult[] };
