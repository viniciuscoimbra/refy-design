export interface Release {
  version: string;
  /** Data ISO (AAAA-MM-DD) da seção do CHANGELOG. */
  date: string;
  summary: string;
  changes: string[];
}
export function parseReleases(markdown: string): Release[];
