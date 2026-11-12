import assert from "node:assert/strict";
import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import ts from "typescript";
import { parseCollectionRegistry, collectionIdsFor } from "./collection-registry.mjs";
import { parseMaturityRegistry, maturityFor } from "./maturity-registry.mjs";
import { source as tokenSource, declarations } from "./tokens.mjs";
const root = fileURLToPath(new URL("..", import.meta.url));
const read = (file) => readFileSync(resolve(root, file), "utf8");
const source = ts.createSourceFile(
  "catalog.ts",
  read("src/pages/PlaygroundPage/catalog.ts"),
  ts.ScriptTarget.Latest,
  true,
);
const declaration = source.statements
  .flatMap((s) =>
    ts.isVariableStatement(s) ? [...s.declarationList.declarations] : [],
  )
  .find((d) => d.name.getText(source) === "componentCatalog");
assert(
  declaration && ts.isArrayLiteralExpression(declaration.initializer),
  "componentCatalog array required",
);
const text = (node, key) =>
  node.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === key,
  )?.initializer.text;
const entries = declaration.initializer.elements.map((node) =>
  Object.fromEntries(
    ["id", "label", "level", "area", "storyId", "note"]
      .map((key) => [key, text(node, key)])
      .filter(([, value]) => value !== undefined),
  ),
);
const registry = parseCollectionRegistry(read("src/catalog/collections.json"), entries.map(entry => entry.id));
const maturity = parseMaturityRegistry(read("src/catalog/maturity.json"), entries.map(entry => entry.id));
const pkg = JSON.parse(read("package.json"));
const docs = entries.map((entry) => ({
  entry,
  file: `src/pages/PlaygroundPage/documentation/${entry.id}.json`,
}));
// AI-08: tokens que o CSS de cada família lê, para o check sugerir o hook no lugar de override por classe.
const familyCss = (id) => {
  const dir = resolve(root, "src/components", id);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(".css")).sort().map((name) => `src/components/${id}/${name}`);
};
const hash = createHash("sha256");
for (const file of [
  "package.json",
  "src/pages/PlaygroundPage/catalog.ts",
  "src/catalog/collections.json",
  "src/catalog/maturity.json",
  "docs/CONTROL_CHOICES.md",
  "src/tokens/foundations.tokens.json",
  "src/tokens/component-hooks.json",
  ...docs.map((d) => d.file),
  ...entries.flatMap((entry) => familyCss(entry.id)),
])
  hash.update(file + "\0" + read(file) + "\0");
const choices = read("docs/CONTROL_CHOICES.md")
  .split("\n")
  .filter((line) => line.startsWith("|"))
  .slice(2)
  .map((line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );
const tokenNames = new Set([
  ...JSON.parse(read("src/tokens/component-hooks.json")),
  ...["base", "light", "dark", "editorial"].flatMap((mode) =>
    Object.keys(declarations(tokenSource[mode])),
  ),
]);
const catalog = {
  schemaVersion: 1,
  package: pkg.name,
  packageVersion: pkg.version,
  sourceSha256: hash.digest("hex"),
  collections: registry.collections.map(collection => ({
    ...collection,
    count: entries.filter(entry => collectionIdsFor(registry, entry.id).includes(collection.id)).length,
  })),
  maturity: maturity.states,
  themeTokens: [...tokenNames].sort(),
  // AI-02: valor literal de cada token simples do tema padrão (fundação + claro), para o check
  // sugerir o token que já tem aquele valor. Referências var(...) e expressões ficam de fora.
  tokenValues: Object.fromEntries(
    Object.entries({ ...declarations(tokenSource.base), ...declarations(tokenSource.light) })
      .filter(([, value]) => typeof value === "string" && !/var\(|calc\(|color-mix\(|,/.test(value))
      .sort(([a], [b]) => a.localeCompare(b)),
  ),
  publicImports: Object.keys(pkg.exports).map((key) =>
    key === "." ? pkg.name : pkg.name + key.slice(1),
  ),
  // AI-05/AI-06: prop deprecada → substituta, por nome exportado, para o check avisar sem abrir a ficha.
  deprecatedProps: Object.fromEntries(
    docs.flatMap(({ file }) =>
      (JSON.parse(read(file)).api ?? []).flatMap((member) => {
        const props = (member.props ?? []).filter((p) => p.deprecated);
        return props.length ? [[member.name, Object.fromEntries(props.map((p) => [p.name, p.deprecated.replacement ?? null]))]] : [];
      }),
    ),
  ),
  instructions: "instructions.md",
  choices: "control-choices.md",
  limits: [
    "Static checks cover selected files and known syntax only.",
    "Typecheck, browser interactions, visual comparison and human review remain necessary.",
    "Pages compose components; business behavior and services stay in the consumer.",
  ],
  components: docs.map(({ entry, file }) => {
    const doc = JSON.parse(read(file));
    assert.equal(doc.id, entry.id);
    assert.deepEqual(doc.collections, collectionIdsFor(registry, entry.id), `Collection drift: ${entry.id}`);
    return {
      ...entry,
      collections: doc.collections,
      maturity: maturityFor(maturity, entry.id),
      publicName: doc.publicName,
      description: doc.description,
      usage: choices
        .filter((row) => row[1]?.split(/\W+/).includes(doc.publicName))
        .map((row) => ({ need: row[0], reason: row[2] })),
      // Escolha da família sem abrir cada ficha: como usar e qual outra família serve melhor em cada caso.
      howToUse: doc.usage.howToUse,
      alternatives: doc.usage.alternatives,
      composition: doc.composition,
      hooks: [...new Set(familyCss(entry.id).flatMap((file) => [...read(file).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1])))]
        .filter((name) => tokenNames.has(name))
        .sort(),
      document: `components/${entry.id}.json`,
    };
  }),
};
const output = new Map([
  ["ai/catalog.json", JSON.stringify(catalog, null, 2) + "\n"],
  // Links relativos de docs/ não resolvem em ai/ nem no pacote; viram endereço do repositório público.
  ["ai/control-choices.md", read("docs/CONTROL_CHOICES.md").replace(/\]\((?![a-z][\w+.-]*:|#|\/)([^)\s]+)\)/gi, "](https://github.com/viniciuscoimbra/refy-design/blob/main/docs/$1)")],
]);
for (const name of ["Before.tsx", "After.tsx", "de-para.md"])
  output.set(`ai/pilot/${name}`, read(`tests/agent-kit/pilot/${name}`));
for (const { entry, file } of docs)
  output.set(`ai/components/${entry.id}.json`, read(file));
if (process.argv.includes("--check")) {
  for (const [file, value] of output)
    assert(
      existsSync(resolve(root, file)) && read(file) === value,
      `${file} is stale; run npm run agent:build`,
    );
  const actual = readdirSync(resolve(root, "ai/components"))
    .filter((f) => f.endsWith(".json"))
    .sort();
  assert.deepEqual(
    actual,
    entries.map((e) => e.id + ".json").sort(),
    "Remove obsolete generated component documents",
  );
} else
  for (const [file, value] of output) {
    mkdirSync(dirname(resolve(root, file)), { recursive: true });
    writeFileSync(resolve(root, file), value);
  }
console.log(
  `Agent catalog: ${entries.length} families, generated from public documentation; ${process.argv.includes("--check") ? "current" : "written"}.`,
);
