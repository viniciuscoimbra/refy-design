// Escreve docs/pt-BR/CHANGELOG.md e docs/es/CHANGELOG.md a partir do CHANGELOG.md, que é escrito em
// inglês, e das traduções de src/pages/RefySitePage/locales/changelog.json (as mesmas que a página
// Releases do site usa). Assim as três versões não divergem: quem muda o CHANGELOG roda este script.
// `--check` recusa versão traduzida desatualizada e frase de versão publicada sem tradução.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const source = readFileSync(join(root, "CHANGELOG.md"), "utf8");
const text = JSON.parse(readFileSync(join(root, "src/pages/RefySitePage/locales/changelog.json"), "utf8"));

const locales = {
  "pt-BR": {
    dict: text.pt,
    languages: "[English](../../CHANGELOG.md) · [Español](../es/CHANGELOG.md)",
    intro: "Todas as mudanças relevantes do refy ficam registradas aqui. O formato segue o [Keep a Changelog 1.1](https://keepachangelog.com/pt-BR/1.1.0/) e o refy segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/). Cada versão agrupa as mudanças em Adicionado, Alterado, Obsoleto, Removido, Corrigido e Segurança. O original em inglês é a referência.",
    unreleased: "Não publicado",
    kinds: { Added: "Adicionado", Changed: "Alterado", Deprecated: "Obsoleto", Removed: "Removido", Fixed: "Corrigido", Security: "Segurança" },
  },
  es: {
    dict: text.es,
    languages: "[English](../../CHANGELOG.md) · [Português](../pt-BR/CHANGELOG.md)",
    intro: "Todos los cambios relevantes de refy quedan registrados aquí. El formato sigue [Keep a Changelog 1.1](https://keepachangelog.com/es-ES/1.1.0/) y refy sigue el [Versionado Semántico](https://semver.org/lang/es/). Cada versión agrupa los cambios en Añadido, Cambiado, Obsoleto, Eliminado, Corregido y Seguridad. El original en inglés es la referencia.",
    unreleased: "No publicado",
    kinds: { Added: "Añadido", Changed: "Cambiado", Deprecated: "Obsoleto", Removed: "Eliminado", Fixed: "Corregido", Security: "Seguridad" },
  },
};

// Link relativo do CHANGELOG da raiz aponta para arquivo do repositório; a tradução mora duas pastas abaixo.
const relink = (line) => line.replace(/\]\((?!https?:|#|mailto:)([^)]+)\)/g, "](../../$1)");

function translate(locale) {
  const { dict, languages, intro, unreleased, kinds } = locales[locale];
  const missing = [];
  let published = false;
  let introDone = false;
  const out = source.split("\n").map((line) => {
    if (line.startsWith("[Português]") || line.startsWith("[Español]")) return languages;
    if (line.startsWith("## ")) {
      published = line.trim() !== "## [Unreleased]";
      return published ? line : `## [${unreleased}][Unreleased]`;
    }
    if (line.startsWith("### ")) return `### ${kinds[line.slice(4).trim()] ?? line.slice(4).trim()}`;
    if (/^\[[^\]]+\]: /.test(line) || line.startsWith("# ") || !line.trim()) return line;
    if (!introDone && !published) {
      introDone = true;
      return intro;
    }
    const item = line.startsWith("- ");
    const body = item ? line.slice(2) : line;
    const done = dict[body];
    if (!done && published) missing.push(body);
    return relink(`${item ? "- " : ""}${done ?? body}`);
  });
  return { content: out.join("\n"), missing };
}

let failed = false;
for (const locale of Object.keys(locales)) {
  const file = join(root, "docs", locale, "CHANGELOG.md");
  const { content, missing } = translate(locale);
  for (const line of missing) {
    console.error(`${locale}: sem tradução em changelog.json: ${line}`);
    failed = true;
  }
  if (check) {
    let current = "";
    try { current = readFileSync(file, "utf8"); } catch {}
    if (current !== content) {
      console.error(`docs/${locale}/CHANGELOG.md desatualizado: rode node scripts/changelog-i18n.mjs`);
      failed = true;
    }
  } else {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
  }
}
if (failed) process.exit(1);
console.log(check ? "OK: CHANGELOG em pt-BR e es igual ao inglês" : "CHANGELOG em pt-BR e es escrito");
