// Lê as versões publicadas do CHANGELOG.md. Só conta como release a seção com versão semântica e
// data (`## 1.0.0 (06/11/2026)`): é a que `promote.mjs` exige antes de criar a tag `vX.Y.Z`.
// Seções de trabalho local e propostas (`## 1.1.0 (proposta)`) ficam de fora.
//
// Dentro da versão, as mudanças seguem as categorias do Keep a Changelog na tradução pt-BR
// (https://keepachangelog.com/pt-BR/1.1.0/): `### Adicionado`, `### Modificado`, `### Obsoleto`,
// `### Removido`, `### Corrigido` e `### Segurança`. Item fora de categoria fica com `kind: null`, e o
// teste do site recusa isso em versão publicada.
const heading = /^## (\d+\.\d+\.\d+) \((\d{2})\/(\d{2})\/(\d{4})\)\s*$/;

/** Categoria do Keep a Changelog pelo título pt-BR usado no CHANGELOG.md. */
export const changeKinds = {
  Adicionado: "added",
  Modificado: "changed",
  Obsoleto: "deprecated",
  Removido: "removed",
  Corrigido: "fixed",
  "Segurança": "security",
};

/** @param {string} markdown */
export function parseReleases(markdown) {
  const releases = [];
  let current = null;
  let kind = null;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const match = heading.exec(line);
      current = match ? { version: match[1], date: `${match[4]}-${match[3]}-${match[2]}`, summary: "", groups: [] } : null;
      kind = null;
      if (current) releases.push(current);
      continue;
    }
    if (!current) continue;
    const text = line.trim();
    if (text.startsWith("### ")) {
      kind = changeKinds[text.slice(4).trim()] ?? null;
      continue;
    }
    if (text.startsWith("- ")) {
      let group = current.groups.at(-1);
      if (!group || group.kind !== kind) current.groups.push((group = { kind, changes: [] }));
      group.changes.push(text.slice(2));
    } else if (text && !current.groups.length) current.summary = current.summary ? `${current.summary} ${text}` : text;
  }
  return releases.map((release) => ({ ...release, changes: release.groups.flatMap((group) => group.changes) }));
}

const parse = (version) => version.split(".").map(Number);

/**
 * O que a versão significa para quem atualiza, pelo SemVer: maior quebra, menor acrescenta, correção
 * só conserta. `from` é a versão publicada anterior.
 * @param {string} version
 * @param {string | undefined} from
 */
export function upgradeKind(version, from) {
  if (!from) return "first";
  const [a, b] = [parse(version), parse(from)];
  if (a[0] !== b[0]) return "major";
  return a[1] !== b[1] ? "minor" : "patch";
}
