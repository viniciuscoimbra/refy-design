// Lê as versões publicadas do CHANGELOG.md. Só conta como release a seção com versão semântica e
// data (`## 1.0.0 (06/11/2026)`): é a que `promote.mjs` exige antes de criar a tag `vX.Y.Z`.
// Seções de trabalho local e propostas (`## 1.1.0 (proposta)`) ficam de fora.
const heading = /^## (\d+\.\d+\.\d+) \((\d{2})\/(\d{2})\/(\d{4})\)\s*$/;

/** @param {string} markdown */
export function parseReleases(markdown) {
  const releases = [];
  let current = null;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      const match = heading.exec(line);
      current = match ? { version: match[1], date: `${match[4]}-${match[3]}-${match[2]}`, summary: "", changes: [] } : null;
      if (current) releases.push(current);
      continue;
    }
    if (!current) continue;
    const text = line.trim();
    if (text.startsWith("- ")) current.changes.push(text.slice(2));
    else if (text && !current.summary && !current.changes.length) current.summary = text;
  }
  return releases;
}
