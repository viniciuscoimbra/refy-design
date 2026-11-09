// Lê de @refy-design/mobile o que o site mostra na página Mobile e na aba Mobile das fichas:
// a lista de componentes exportados (nativeComponents.json) e, por componente, as props do tipo
// público, o trecho da galeria nativa que o usa e a seção da galeria onde ele aparece
// (nativeDocs.json). Tudo sai do próprio pacote; nada é escrito à mão.
//   node scripts/native-components.mjs          grava os dois arquivos
//   node scripts/native-components.mjs --check  falha se algum estiver desatualizado
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nativeRoot = join(root, "packages/native");
const src = join(nativeRoot, "src");
const site = join(root, "src/pages/RefySitePage");

const read = (path) => {
  for (const ext of [".tsx", ".ts", "/index.tsx", "/index.ts"]) {
    try { return readFileSync(path + ext, "utf8"); } catch { /* tenta a próxima extensão */ }
  }
  throw Error(`não achei ${path}`);
};

// Só nomes em maiúscula que são função ou constante exportada: componentes, não tipos.
function exportsOf(path, seen = new Set()) {
  if (seen.has(path)) return [];
  seen.add(path);
  const source = read(path);
  const names = [...source.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)].map((m) => m[1]);
  for (const m of source.matchAll(/export\s*\{([^}]+)\}\s*from\s*"([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (/^[A-Z]\w+$/.test(name)) names.push(name);
    }
  }
  for (const m of source.matchAll(/export\s+\*\s+from\s+"([^"]+)"/g)) names.push(...exportsOf(join(dirname(path), m[1]), seen));
  return names;
}

// Provider e peças de montagem: exportados, mas não são componentes de tela.
const internal = new Set(["RefyProvider", "RefyScope", "MIN_TOUCH", "AnchoredLayer", "IconSlot", "Label"]);
const list = [...new Set(exportsOf(join(src, "index")))].filter((name) => !internal.has(name) && /[a-z]/.test(name)).sort();

// Props públicas de cada componente, como o TypeScript as vê. Só as declaradas pelo refy:
// as herdadas de View, Text ou Pressable ficam fora, como as do DOM ficam fora na web.
function publicProps(base, entry) {
  const config = ts.readConfigFile(join(base, "tsconfig.json"), ts.sys.readFile).config;
  const parsed = ts.parseJsonConfigFileContent(config, ts.sys, base);
  const program = ts.createProgram([entry], { ...parsed.options, noEmit: true });
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(program.getSourceFile(entry));
  const own = (symbol) => (symbol.declarations ?? []).some((d) => !d.getSourceFile().fileName.includes("node_modules"));
  const result = {};
  for (const exported of checker.getExportsOfModule(module)) {
    const name = exported.getName();
    if (!list.includes(name)) continue;
    const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
    const signature = declaration && checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures()[0];
    if (!signature?.parameters[0]) { result[name] = { props: [], byType: false }; continue; }
    const type = checker.getTypeOfSymbolAtLocation(signature.parameters[0], declaration);
    // Uma união (D3Chart) abre por variante: cada prop entra uma vez, com o tipo da primeira variante que a declara.
    const parts = type.isUnion() ? type.types : [type];
    const props = new Map();
    for (const part of parts) {
      for (const prop of part.getProperties()) {
        if (!own(prop) || props.has(prop.getName())) continue;
        const propType = checker.getTypeOfSymbolAtLocation(prop, declaration);
        props.set(prop.getName(), {
          name: prop.getName(),
          type: checker.typeToString(propType, undefined, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope).replace(/ \| undefined$/, ""),
          required: !(prop.flags & ts.SymbolFlags.Optional),
        });
      }
    }
    result[name] = { props: [...props.values()].sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name)), byType: type.isUnion() };
  }
  return result;
}

// Primeiro uso de <Name na galeria nativa, recortado do código real, e a seção que o contém.
const gallery = readFileSync(join(nativeRoot, "example/Gallery.tsx"), "utf8");
function snippet(name) {
  const start = gallery.search(new RegExp(`<${name}[\\s/>]`));
  if (start < 0) return null;
  let depth = 0, i = start, end = -1;
  // Fim da tag de abertura: o primeiro > fora de chaves e de string.
  let quote = null;
  for (; i < gallery.length; i++) {
    const c = gallery[i];
    if (quote) { if (c === quote && gallery[i - 1] !== "\\") quote = null; continue; }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0 && gallery[i - 1] !== "=") { break; }
  }
  if (gallery[i - 1] === "/") end = i + 1;
  else {
    const close = `</${name}>`;
    let nested = 0;
    for (let j = i + 1; j < gallery.length; j++) {
      if (gallery.startsWith(close, j)) { if (nested === 0) { end = j + close.length; break; } nested--; }
      else if (new RegExp(`^<${name}[\\s>]`).test(gallery.slice(j, j + name.length + 2))) {
        const tagEnd = gallery.indexOf(">", j);
        if (gallery[tagEnd - 1] !== "/") nested++;
      }
    }
  }
  if (end < 0) return null;
  const lineStart = gallery.lastIndexOf("\n", start) + 1;
  const indent = gallery.slice(lineStart, start).match(/^\s*/)[0].length;
  const code = (" ".repeat(indent) + gallery.slice(start, end)).split("\n").map((line) => line.slice(Math.min(indent, line.match(/^\s*/)[0].length))).join("\n");
  const before = gallery.slice(0, start);
  const section = [...before.matchAll(/<Section title="([^"]+)">/g)].pop()?.[1] ?? null;
  return { code, section };
}

// className (web) e style (nativo) fazem o mesmo papel; children é de ambos.
const equivalent = { className: "style", style: "className" };
// Web e nativo medidos do mesmo jeito: props que o refy declara, sem as herdadas do DOM ou do React Native.
const props = publicProps(nativeRoot, join(src, "index.ts"));
const webAll = publicProps(root, join(root, "src/index.ts"));
const webProps = (name) => webAll[name] ? webAll[name].props.map((prop) => prop.name) : null;
const docs = {};
for (const name of list) {
  const native = props[name] ?? { props: [], byType: false };
  const web = webProps(name);
  const names = new Set(native.props.map((prop) => prop.name));
  // Toda a biblioteca aceita className na web e style no nativo: não marcam diferença.
  const has = (set, prop) => set.has(prop) || prop in equivalent || prop === "children";
  const webSet = new Set(web ?? []);
  const example = snippet(name);
  docs[name] = {
    byType: native.byType,
    props: native.props.map((prop) => ({ ...prop, onlyMobile: web ? !has(webSet, prop.name) : false })),
    onlyWeb: web ? web.filter((prop) => !has(names, prop)) : [],
    example: example?.code ?? null,
    section: example?.section ?? null,
  };
}

const outputs = {
  [join(site, "nativeComponents.json")]: JSON.stringify(list, null, 2) + "\n",
  [join(site, "nativeDocs.json")]: JSON.stringify(docs, null, 2) + "\n",
};
if (process.argv.includes("--check")) {
  for (const [path, json] of Object.entries(outputs)) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== json) {
      console.error(`${path.slice(root.length + 1)} desatualizado: rode node scripts/native-components.mjs`);
      process.exit(1);
    }
  }
  console.log(`OK: ${list.length} componentes do mobile.`);
} else {
  for (const [path, json] of Object.entries(outputs)) writeFileSync(path, json);
  console.log(`OK: ${list.length} componentes do mobile em src/pages/RefySitePage/nativeComponents.json e nativeDocs.json.`);
}
