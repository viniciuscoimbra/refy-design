// Plugin do build do site: divide os dicionários de tradução para cada página baixar só o que mostra.
// Os arquivos em src/pages/RefySitePage/locales/ continuam a fonte única (docs-sync, Storybook e
// testes os leem inteiros); a divisão só existe no bundle do site.
//
// - virtual:refy-locale/site/<en|es>: frases do site que aparecem escritas no código. Baixa antes
//   da página, como antes baixava o en.json/es.json inteiro.
// - virtual:refy-locale/reference/<pt|en|es>: o resto, que vem de dados (nomes de exemplo, fichas):
//   o que sobra do en.json/es.json, a parte comum da ficha dos componentes (docs.*.json) e os nomes
//   de exemplo dos textos de demonstração. Baixa com a primeira página que não é a home, ou com o
//   navegador ocioso, como antes o docs.*.json e o demo.*.json.
// - virtual:refy-locale/family/<pt|es>/<Família>: frases da ficha que só a ficha daquela família
//   mostra. Baixa com a ficha.
// - virtual:refy-locale/demo/<arquivo>: os textos de um exemplo ou template em pt e es. Entra no
//   mesmo pedaço do arquivo (scripts/vite-demo-text.mjs o importa), em vez do demo.*.json inteiro.
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const locales = resolve(root, "src/pages/RefySitePage/locales");
const documentation = resolve(root, "src/pages/PlaygroundPage/documentation");
const i18n = resolve(root, "src/pages/RefySitePage/i18n.tsx").split("\\").join("/");
const prefix = "virtual:refy-locale/";
const read = (path) => JSON.parse(readFileSync(path, "utf8"));
// Fichas que outro módulo importa direto (página do Accordion): as frases delas ficam na parte comum.
const staticDocs = new Set(["Accordion"]);

function strings(value, out = new Set()) {
  if (typeof value === "string") out.add(value);
  else if (Array.isArray(value)) value.forEach((item) => strings(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => strings(item, out));
  return out;
}

/**
 * Os arquivos de código em `dirs`, lidos das pastas (sem node_modules nem pastas ocultas). Não usa o
 * git: o build do site e o check também rodam fora de um repositório (clone de promoção, `git
 * archive` da tag). Num checkout limpo é a mesma lista do `git ls-files` (tests/locale-split.test.mjs).
 */
export function sourceFiles(dirs) {
  const walk = (dir, out) => {
    let entries;
    try {
      entries = readdirSync(resolve(root, dir), { withFileTypes: true });
    } catch {
      return out;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path, out);
      else out.push(path);
    }
    return out;
  };
  return dirs
    .flatMap((dir) => walk(dir, []))
    .filter((file) => /\.(ts|tsx|js|mjs|json|md|css)$/.test(file))
    .sort();
}

/** Todo o texto que o código do site pode mostrar escrito literalmente. */
function sourceCorpus() {
  const files = sourceFiles(["src", "site", "tools", "ai", "packages/a2ui/src"])
    .filter((file) => !file.startsWith("src/pages/RefySitePage/locales/") && !file.startsWith("src/pages/PlaygroundPage/documentation/") && file !== "src/pages/PlaygroundPage/componentGuides.json");
  return files.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");
}

export function computeLocaleSplit() {
  const corpus = sourceCorpus();
  const inCode = (text) => corpus.includes(text) || corpus.includes(JSON.stringify(text).slice(1, -1));
  // Ficha: frase de uma família só, fora da descrição (que o catálogo mostra) e de qualquer código.
  // ai/ e componentGuides.json alimentam a geração das fichas e não são mostrados pelo site.
  const docCorpusFree = (() => {
    const files = sourceFiles(["src", "site", "tools", "packages/a2ui/src"])
      .filter((file) => !file.startsWith("src/pages/RefySitePage/locales/") && !file.startsWith("src/pages/PlaygroundPage/documentation/") && file !== "src/pages/PlaygroundPage/componentGuides.json");
    const text = files.map((file) => readFileSync(resolve(root, file), "utf8")).join("\n");
    return (phrase) => !text.includes(phrase) && !text.includes(JSON.stringify(phrase).slice(1, -1));
  })();
  const families = {};
  const descriptions = new Set();
  const exampleNames = new Set();
  for (const file of readdirSync(documentation).filter((name) => name.endsWith(".json"))) {
    const id = file.replace(/\.json$/, "");
    const doc = read(resolve(documentation, file));
    descriptions.add(doc.description);
    for (const example of doc.examples ?? []) strings([example.name, example.title, example.label].filter(Boolean), exampleNames);
    families[id] = strings({ ...doc, description: undefined });
  }
  const owner = (phrase) => {
    if (descriptions.has(phrase)) return null;
    const ids = Object.keys(families).filter((id) => families[id].has(phrase));
    if (ids.length !== 1 || staticDocs.has(ids[0])) return null;
    return docCorpusFree(phrase) ? ids[0] : null;
  };
  const split = { site: {}, reference: {}, family: {}, demo: {} };
  for (const locale of ["pt", "es"]) {
    const docs = read(resolve(locales, `docs.${locale}.json`));
    const common = {};
    const byFamily = {};
    for (const [phrase, value] of Object.entries(docs)) {
      const id = owner(phrase);
      if (id) (byFamily[id] ??= {})[phrase] = value;
      else common[phrase] = value;
    }
    split.family[locale] = byFamily;
    split.reference[locale] = { docs: common };
  }
  for (const locale of ["en", "es"]) {
    const site = read(resolve(locales, `${locale}.json`));
    const literal = {};
    const rest = {};
    for (const [phrase, value] of Object.entries(site)) (inCode(phrase) ? literal : rest)[phrase] = value;
    split.site[locale] = literal;
    (split.reference[locale] ??= {}).site = rest;
  }
  // Textos de exemplo e template, por arquivo, nos dois idiomas; os nomes de exemplo que a ficha
  // procura em todos os arquivos (demoLabel) vão para a parte comum.
  const demo = { pt: read(resolve(locales, "demo.pt.json")), es: read(resolve(locales, "demo.es.json")) };
  for (const locale of ["pt", "es"]) {
    const labels = {};
    for (const [file, entries] of Object.entries(demo[locale])) {
      (split.demo[file] ??= {})[locale] = entries;
      for (const [phrase, value] of Object.entries(entries)) if (typeof value === "string" && exampleNames.has(phrase) && !(phrase in labels)) labels[phrase] = value;
    }
    split.reference[locale].demoLabels = labels;
  }
  return split;
}

const json = (value) => JSON.stringify(value);

export function localeSplit() {
  let split;
  const get = () => (split ??= computeLocaleSplit());
  return {
    name: "refy-locale-split",
    resolveId(id) {
      return id.startsWith(prefix) ? `\0${id}` : null;
    },
    load(id) {
      if (!id.startsWith(`\0${prefix}`)) return null;
      const [kind, ...rest] = id.slice(prefix.length + 1).split("/");
      const data = get();
      if (kind === "site") return `export default ${json(data.site[rest[0]] ?? {})};`;
      if (kind === "reference") {
        const locale = rest[0];
        const reference = data.reference[locale] ?? {};
        const families = Object.keys(data.family[locale] ?? {}).sort();
        const loaders = families.map((family) => `${json(family)}: () => import(${json(`${prefix}family/${locale}/${family}`)})`).join(",\n");
        return `export default ${json(reference)};\nexport const families = {\n${loaders}\n};`;
      }
      if (kind === "family") return `export default ${json(data.family[rest[0]]?.[rest[1]] ?? {})};`;
      if (kind === "demo") {
        const file = rest.join("/");
        return `import { registerDemoText } from ${json(i18n)};\nregisterDemoText(${json(file)}, ${json(data.demo[file] ?? {})});`;
      }
      throw new Error(`refy-locale-split: módulo desconhecido ${id}`);
    },
  };
}

/** O import que scripts/vite-demo-text.mjs põe no topo de cada arquivo de exemplo. */
export const demoTextImport = (file) => `import ${json(`${prefix}demo/${file}`)};\n`;
