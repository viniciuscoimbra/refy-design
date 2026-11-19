// Lê as versões publicadas do CHANGELOG.md, no formato do Keep a Changelog 1.1
// (https://keepachangelog.com/en/1.1.0/). Só conta como release a seção com versão semântica e
// data ISO (`## [1.0.0] - 2026-11-06`): é a que `promote.mjs` exige antes de criar a tag `vX.Y.Z`.
// `## [Unreleased]` e qualquer outra seção ficam de fora.
//
// O CHANGELOG é escrito em inglês. Dentro da versão, as mudanças seguem as categorias `### Added`,
// `### Changed`, `### Deprecated`, `### Removed`, `### Fixed` e `### Security`. Item fora de
// categoria fica com `kind: null`, e o teste do site recusa isso em versão publicada.
const heading = /^## \[(\d+\.\d+\.\d+)\] - (\d{4})-(\d{2})-(\d{2})\s*$/;

/** Categoria do Keep a Changelog pelo título usado no CHANGELOG.md. */
export const changeKinds = {
  Added: "added",
  Changed: "changed",
  Deprecated: "deprecated",
  Removed: "removed",
  Fixed: "fixed",
  Security: "security",
};

/** @param {string} markdown */
export function parseReleases(markdown) {
  const releases = [];
  let current = null;
  let kind = null;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const match = heading.exec(line);
      current = match ? { version: match[1], date: `${match[2]}-${match[3]}-${match[4]}`, summary: "", groups: [] } : null;
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
 * NATP-03: desde a 1.1.0, quando o `@refy-design/mobile` nasceu, toda versão publicada diz no resumo
 * se o mobile acompanha e o que ficou só na web, num parágrafo que começa com "Mobile:". Devolve as
 * versões sem essa declaração.
 * @param {string} markdown
 */
export function missingMobileDeclaration(markdown) {
  // Lê os parágrafos antes da primeira categoria direto do markdown: o parseReleases junta o resumo
  // numa linha só, e a pontuação do parágrafo anterior não pode decidir se a linha existe.
  const declared = new Map();
  let version = null;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      version = heading.exec(line)?.[1] ?? null;
      if (version) declared.set(version, false);
      continue;
    }
    if (!version) continue;
    if (line.startsWith("### ") || line.trim().startsWith("- ")) version = null;
    else if (line.trim().startsWith("Mobile: ")) declared.set(version, true);
  }
  return parseReleases(markdown)
    .filter((release) => {
      const [a, b] = [parse(release.version), parse("1.1.0")];
      return a[0] > b[0] || (a[0] === b[0] && a[1] >= b[1]);
    })
    .filter((release) => !declared.get(release.version))
    .map((release) => release.version);
}


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
