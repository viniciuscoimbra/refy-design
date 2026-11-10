export type ChangeKind = "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
export interface ReleaseGroup {
  /** Categoria do Keep a Changelog; `null` quando o item está fora de `### Categoria`. */
  kind: ChangeKind | null;
  changes: string[];
}
export interface Release {
  version: string;
  /** Data ISO (AAAA-MM-DD) da seção do CHANGELOG. */
  date: string;
  summary: string;
  groups: ReleaseGroup[];
  changes: string[];
}
export const changeKinds: Record<string, ChangeKind>;
export function parseReleases(markdown: string): Release[];
export function upgradeKind(version: string, from: string | undefined): "first" | "major" | "minor" | "patch";
