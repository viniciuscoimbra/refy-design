import assert from "node:assert/strict";
import { parseComponentUsage } from "./component-usage.mjs";
import { parseCollectionRegistry, collectionIdsFor } from "./collection-registry.mjs";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  renameSync,
  mkdtempSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { resolve, join, relative } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { format } from "prettier";

const root = process.cwd();
const guides = JSON.parse(
  readFileSync("src/pages/PlaygroundPage/componentGuides.json", "utf8"),
);
const check = process.argv.includes("--check");
const dir = "src/pages/PlaygroundPage/documentation";
const files = readdirSync("src/components").flatMap((name) => {
  const path = `src/components/${name}/${name}.stories.tsx`;
  return existsSync(path) ? [resolve(path)] : [];
});
const program = ts.createProgram(
  [
    ...files,
    resolve("src/index.ts"),
    resolve("src/pages/PlaygroundPage/catalog.ts"),
  ],
  {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    resolveJsonModule: true,
  },
);
const checker = program.getTypeChecker();
const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});
const unwrap = (node) => {
  while (
    node &&
    (ts.isSatisfiesExpression(node) ||
      ts.isAsExpression(node) ||
      ts.isParenthesizedExpression(node))
  )
    node = node.expression;
  return node;
};
const aliased = (symbol) =>
  symbol?.flags & ts.SymbolFlags.Alias
    ? checker.getAliasedSymbol(symbol)
    : symbol;
const index = program.getSourceFile(resolve("src/index.ts"));
const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(index));
const preferred = new Map();
for (const symbol of exports) preferred.set(aliased(symbol), symbol.name);
const property = (node, name) => {
  node = unwrap(node);
  if (!node) return undefined;
  if (ts.isIdentifier(node))
    return property(
      checker.getSymbolAtLocation(node)?.valueDeclaration?.initializer,
      name,
    );
  if (!node || !ts.isObjectLiteralExpression(node)) return undefined;
  let found;
  for (const prop of node.properties) {
    if (ts.isSpreadAssignment(prop))
      found = property(prop.expression, name) ?? found;
    else if (
      prop.name?.getText().replaceAll(/['"]/g, "") === name &&
      ts.isPropertyAssignment(prop)
    )
      found = prop.initializer;
  }
  return found;
};
const catalogFile = program.getSourceFile(
  resolve("src/pages/PlaygroundPage/catalog.ts"),
);
const catalogNode = catalogFile.statements
  .flatMap((s) =>
    ts.isVariableStatement(s) ? [...s.declarationList.declarations] : [],
  )
  .find((d) => d.name.getText() === "componentCatalog").initializer;
const catalog = catalogNode.elements.map((node) =>
  Object.fromEntries(
    ["id", "label", "level", "story", "note"].map((key) => [
      key,
      property(node, key)?.text,
    ]),
  ),
);
const usageGuide = parseComponentUsage(
  readFileSync("docs/COMPONENT_USAGE.md", "utf8"),
  catalog.map((entry) => entry.id),
);
const canonical = (code) =>
  code.replace(
    /\b(PropertyActionGroup|PropertyCard|PropertyMedia|SwipeDeck|VisitSchedulePicker|EventTimeline)(Props|Item|Action|Mode)?\b/g,
    (_, name, suffix = "") =>
      ({
        PropertyActionGroup: "DecisionActions",
        PropertyCard: "ContentCard",
        PropertyMedia: "MediaGallery",
        SwipeDeck: "DecisionDeck",
        VisitSchedulePicker: "SchedulePicker",
        EventTimeline: "ActivityTimeline",
      })[name] + suffix,
  );
const title = (name) =>
  name.replace(/([a-zá-ú])([A-ZÁ-Ú])/g, "$1 $2").replaceAll("_", " ");

async function exampleSource(sf, meta, story) {
  const imports = new Map();
  const declarations = new Map();
  const visited = new Set();
  function addImport(module, imported, local, typeOnly = false) {
    const key = `${module}:${local}`;
    imports.set(key, { module, imported, local, typeOnly });
  }
  function gather(node) {
    if (!node) return;
    function identifier(item) {
      const symbol =
        ts.isShorthandPropertyAssignment(item.parent) &&
        item.parent.name === item
          ? checker.getShorthandAssignmentValueSymbol(item.parent)
          : checker.getSymbolAtLocation(item);
      if (!symbol || visited.has(symbol)) return;
      visited.add(symbol);
      const declaration = symbol.declarations?.[0];
      if (!declaration) return;
      if (
        ts.isImportSpecifier(declaration) ||
        ts.isImportClause(declaration) ||
        ts.isNamespaceImport(declaration)
      ) {
        let statement = declaration;
        while (statement && !ts.isImportDeclaration(statement))
          statement = statement.parent;
        const module = statement.moduleSpecifier.text;
        const local = declaration.name.text;
        const imported = ts.isImportSpecifier(declaration)
          ? (declaration.propertyName?.text ?? local)
          : ts.isNamespaceImport(declaration)
            ? "*"
            : "default";
        if (module === "react")
          return addImport(
            module,
            imported,
            local,
            statement.importClause?.isTypeOnly || declaration.isTypeOnly,
          );
        if (module.startsWith("@storybook/")) return;
        const target = aliased(symbol);
        if (preferred.has(target))
          return addImport(
            "@refy-design/web",
            preferred.get(target),
            local,
            statement.importClause?.isTypeOnly || declaration.isTypeOnly,
          );
        if (!module.startsWith("."))
          return addImport(
            module,
            imported,
            local,
            statement.importClause?.isTypeOnly || declaration.isTypeOnly,
          );
        const original = target?.valueDeclaration ?? target?.declarations?.[0];
        if (!original)
          throw new Error(
            `Dependência não resolvida: ${local} em ${sf.fileName}`,
          );
        collect(original);
        if (original.name && original.name.getText() !== local)
          declarations.set(
            `${local}:alias`,
            `const ${local} = ${original.name.getText()};`,
          );
        return;
      }
      if (declaration.getSourceFile().fileName.includes("/node_modules/"))
        return;
      collect(declaration);
    }
    function walk(item) {
      if (ts.isIdentifier(item)) identifier(item);
      ts.forEachChild(item, walk);
    }
    walk(node);
  }
  function collect(declaration) {
    let top;
    if (
      ts.isVariableDeclaration(declaration) &&
      ts.isVariableDeclarationList(declaration.parent) &&
      ts.isVariableStatement(declaration.parent.parent) &&
      ts.isSourceFile(declaration.parent.parent.parent)
    )
      top = declaration.parent.parent;
    else if (
      (ts.isFunctionDeclaration(declaration) ||
        ts.isInterfaceDeclaration(declaration) ||
        ts.isTypeAliasDeclaration(declaration) ||
        ts.isEnumDeclaration(declaration) ||
        ts.isModuleDeclaration(declaration)) &&
      ts.isSourceFile(declaration.parent)
    )
      top = declaration;
    else return;
    const key = `${top.getSourceFile().fileName}:${top.pos}`;
    if (declarations.has(key)) return;
    const source = top.getText().replace(/^export\s+(default\s+)?/, "");
    declarations.set(key, "");
    for (const ambient of top
      .getSourceFile()
      .statements.filter(
        (node) =>
          ts.isModuleDeclaration(node) &&
          node.flags & ts.NodeFlags.GlobalAugmentation,
      ))
      if (ambient !== top) collect(ambient);
    gather(top);
    declarations.delete(key);
    declarations.set(key, source);
  }
  const component = property(meta, "component");
  assert(component, `Componente de meta ausente: ${sf.fileName}`);
  const render = property(story, "render") ?? property(meta, "render");
  const baseArgs = property(meta, "args");
  const storyArgs = property(story, "args");
  function argProperties(node) {
    node = unwrap(node);
    if (!node) return [];
    if (ts.isIdentifier(node))
      return argProperties(
        aliased(checker.getSymbolAtLocation(node))?.valueDeclaration
          ?.initializer,
      );
    if (ts.isPropertyAccessExpression(node) && node.name.text === "args")
      return argProperties(property(node.expression, "args"));
    if (!ts.isObjectLiteralExpression(node))
      throw new Error(`Args não suportados: ${node.getText()}`);
    return node.properties.flatMap((prop) =>
      ts.isSpreadAssignment(prop) ? argProperties(prop.expression) : [prop],
    );
  }
  const args = [
    ...new Map(
      [baseArgs, storyArgs]
        .flatMap(argProperties)
        .map((prop) => [prop.name.getText(), prop]),
    ).values(),
  ];
  let body = "";
  let needsArgs = !render;
  if (render) {
    gather(render);
    let fn = unwrap(render);
    if (ts.isIdentifier(fn))
      fn =
        checker.getSymbolAtLocation(fn)?.valueDeclaration?.initializer ??
        checker.getSymbolAtLocation(fn)?.valueDeclaration;
    assert(
      ts.isArrowFunction(fn) ||
        ts.isFunctionExpression(fn) ||
        ts.isFunctionDeclaration(fn),
      `Render não suportado: ${render.getText()}`,
    );
    needsArgs = false;
    if (fn.parameters.length) {
      const parameterSymbol = checker.getSymbolAtLocation(
        fn.parameters[0].name,
      );
      function referencesParameter(node) {
        if (
          ts.isIdentifier(node) &&
          checker.getSymbolAtLocation(node) === parameterSymbol
        )
          needsArgs = true;
        ts.forEachChild(node, referencesParameter);
      }
      referencesParameter(fn.body);
    }
    if (needsArgs)
      assert(
        fn.parameters.length === 1 && ts.isIdentifier(fn.parameters[0].name),
        `Parâmetros inesperados: ${fn.getText()}`,
      );
    body = ts.isBlock(fn.body)
      ? fn.body.statements.map((node) => node.getText()).join("\n")
      : `return (${fn.body.getText()});`;
    if (needsArgs && fn.parameters[0].name.text !== "args")
      body = `const ${fn.parameters[0].name.text} = args;\n${body}`;
  } else {
    gather(component);
    body = `return <${component.getText()} {...args} />;`;
  }
  let argsDeclaration = "";
  if (needsArgs) {
    args.forEach(gather);
    gather(component);
    if (args.length) {
      addImport("react", "ComponentProps", "ComponentProps", true);
      const keys = [
        ...new Set(
          args.map((arg) => arg.name.getText().replaceAll(/['"]/g, "")),
        ),
      ]
        .map((key) => JSON.stringify(key))
        .join(" | ");
      argsDeclaration = `const args: Pick<ComponentProps<typeof ${component.getText()}>, ${keys}> = { ${args.map((arg) => arg.getText()).join(", ")} };\n`;
    } else argsDeclaration = "const args = {};\n";
  }
  const importCode = [...imports.values()]
    .sort(
      (a, b) =>
        a.module.localeCompare(b.module) || a.local.localeCompare(b.local),
    )
    .map(
      ({ module, imported, local, typeOnly }) =>
        `import ${typeOnly ? "type " : ""}${imported === "default" ? local : imported === "*" ? `* as ${local}` : `{ ${imported}${imported !== local ? ` as ${local}` : ""} }`} from '${module}';`,
    )
    .join("\n");
  const code = `${importCode}\n\n${[...declarations.values()].filter(Boolean).join("\n\n")}\n\nexport function Example() {\n${argsDeclaration}${body}\n}\n`;
  const clean = canonical(code).replace(/\b(\w+) as \1\b/g, "$1");
  const parsed = ts.createSourceFile(
    "example.tsx",
    clean,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  return (
    await format(printer.printFile(parsed), {
      parser: "typescript",
      singleQuote: true,
      printWidth: 88,
      tabWidth: 2,
      trailingComma: "all",
    })
  ).trim();
}

function propsFor(symbol) {
  const target = aliased(symbol);
  const declaration = target?.valueDeclaration ?? target?.declarations?.[0];
  if (
    !declaration ||
    !declaration.getSourceFile().fileName.includes("/src/components/")
  )
    return null;
  let type = checker.getTypeOfSymbolAtLocation(target, declaration);
  const call = type.getCallSignatures()[0];
  const param = call?.parameters[0];
  if (!param) return null;
  const props = checker.getTypeOfSymbolAtLocation(param, declaration);
  const own = props
    .getProperties()
    .filter((prop) =>
      prop.declarations?.some((d) =>
        d.getSourceFile().fileName.includes("/src/components/"),
      ),
    );
  const inherited = props
    .getProperties()
    .filter((prop) =>
      [
        "dir",
        "htmlFor",
        "children",
        "className",
        "style",
        "id",
        "type",
        "value",
        "defaultValue",
        "placeholder",
        "disabled",
        "onChange",
        "onClick",
        "onFocus",
        "onBlur",
        "onKeyDown",
        "aria-label",
      ].includes(prop.name),
    );
  const chosen = [
    ...new Map(
      [...own, ...inherited].map((prop) => [prop.name, prop]),
    ).values(),
  ];
  const defaults = {};
  function findDefaults(node) {
    if (ts.isParameter(node) && ts.isObjectBindingPattern(node.name))
      for (const binding of node.name.elements)
        if (binding.initializer)
          defaults[binding.propertyName?.getText() ?? binding.name.getText()] =
            binding.initializer.getText();
    ts.forEachChild(node, findDefaults);
  }
  findDefaults(declaration);
  const rows = chosen.map((prop) => ({
    name: prop.name,
    ...deprecation(prop),
    ...(defaults[prop.name] ? { defaultValue: defaults[prop.name] } : {}),
    type: checker
      .typeToString(
        checker.getTypeOfSymbolAtLocation(
          prop,
          prop.valueDeclaration ?? declaration,
        ),
        undefined,
        ts.TypeFormatFlags.NoTruncation,
      )
      .replace(/import\("[^"]+"\)\./g, ""),
    required: !(prop.flags & ts.SymbolFlags.Optional),
    description:
      ts.displayPartsToString(prop.getDocumentationComment(checker)) ||
      ({
        children: "Content shown by the component.",
        value: "Value in controlled state.",
        defaultValue: "Initial value in uncontrolled state.",
        onChange: "Callback called when the value changes.",
        onClick: "Activation callback.",
        disabled: "Disables interaction.",
        loading: "Shows the loading state.",
        label: "Label that identifies the control.",
        title: "Content title.",
        description: "Supporting text.",
        items: "Items shown by the component.",
        className: "Extra CSS class.",
        style: "The component's inline styles.",
        variant: "Visual variant.",
        size: "Size variant.",
      }[prop.name] ??
        ""),
  }));
  return rows.length ? { name: symbol.name, props: rows } : null;
}
// AI-05: `@deprecated Use value.` vira { replacement: "value" } na ficha e no catálogo de agentes.
function deprecation(prop) {
  const tag = prop.getJsDocTags(checker).find((t) => t.name === "deprecated");
  if (!tag) return {};
  const note = ts.displayPartsToString(tag.text ?? []).trim();
  const replacement = note.match(/\bUse\s+`?([A-Za-z_$][\w$]*)`?/)?.[1];
  return { deprecated: { ...(replacement ? { replacement } : {}), ...(note ? { note } : {}) } };
}
// AI-05: exemplo publicado não ensina prop deprecada. Lê o JSX do exemplo e recusa atributo
// deprecado em qualquer membro da API (pelo nome público ou pelo nome de origem).
function deprecatedUses(code, api) {
  const deprecated = new Map();
  for (const member of api)
    for (const prop of member.props)
      if (prop.deprecated) {
        if (!deprecated.has(member.name)) deprecated.set(member.name, new Map());
        deprecated.get(member.name).set(prop.name, prop.deprecated.replacement);
      }
  if (!deprecated.size) return [];
  const sf = ts.createSourceFile("example.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const visit = (node) => {
    if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ts.isIdentifier(node.tagName)) {
      const props = deprecated.get(canonical(node.tagName.text)) ?? deprecated.get(node.tagName.text);
      for (const attribute of node.attributes.properties)
        if (props && ts.isJsxAttribute(attribute) && props.has(attribute.name.getText(sf)))
          found.push(`${node.tagName.text} ${attribute.name.getText(sf)} (use ${props.get(attribute.name.getText(sf)) ?? "a substituta da ficha"})`);
    }
    // Exemplo derivado de args: `const args: Pick<ComponentProps<typeof ContentCard>, …> = { price: … }`.
    if (ts.isVariableDeclaration(node) && node.type && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      const owner = node.type.getText(sf).match(/typeof\s+([A-Z]\w*)/)?.[1];
      const props = owner && (deprecated.get(canonical(owner)) ?? deprecated.get(owner));
      for (const item of props ? node.initializer.properties : [])
        if (item.name && props.has(item.name.getText(sf).replace(/^['"]|['"]$/g, "")))
          found.push(`${owner} ${item.name.getText(sf)} (use ${props.get(item.name.getText(sf).replace(/^['"]|['"]$/g, "")) ?? "a substituta da ficha"})`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
}
const collections = parseCollectionRegistry(readFileSync("src/catalog/collections.json", "utf8"), catalog.map(entry => entry.id));
const allProps = exports.map(propsFor).filter(Boolean);
let total = 0;
mkdirSync(dir, { recursive: true });
const generated = [];
for (const entry of catalog) {
  const file = files.find((file) => file.endsWith(`/${entry.id}.stories.tsx`));
  const sf = program.getSourceFile(file);
  const assignment = sf.statements.find(ts.isExportAssignment);
  assert(assignment, entry.id);
  const meta = assignment.expression;
  const stories = sf.statements.flatMap((statement) =>
    ts.isVariableStatement(statement) &&
    statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ? [...statement.declarationList.declarations].filter((d) =>
          ts.isObjectLiteralExpression(unwrap(d.initializer)),
        )
      : [],
  );
  const examples = [];
  for (const story of stories) {
    let code;
    try {
      code = await exampleSource(sf, meta, story.initializer);
    } catch (error) {
      throw new Error(`${entry.id}/${story.name.getText()}: ${error.message}`, {
        cause: error,
      });
    }
    examples.push({
      id: story.name.getText(),
      label:
        property(story.initializer, "name")?.text ??
        title(story.name.getText()),
      description: ts
        .displayPartsToString(
          checker
            .getSymbolAtLocation(story.name)
            ?.getDocumentationComment(checker),
        )
        .replace(/\s+/g, " ")
        .trim(),
      code,
    });
  }
  assert(
    examples.some((example) => example.id === entry.story),
    `Story principal não documentada: ${entry.id}/${entry.story}`,
  );
  const componentSymbol = aliased(
    checker.getSymbolAtLocation(property(meta, "component")),
  );
  const publicName = preferred.get(componentSymbol);
  assert(publicName, `Export público ausente: ${entry.id}`);
  const related = exports.filter((symbol) =>
    aliased(symbol)?.declarations?.some((d) =>
      relative(root, d.getSourceFile().fileName).startsWith(
        `src/components/${entry.id}/`,
      ),
    ),
  );
  const api = allProps.filter((item) =>
    related.some((symbol) => symbol.name === item.name),
  );
  for (const example of examples) {
    const uses = deprecatedUses(example.code, api);
    assert(!uses.length, `${entry.id}/${example.id} usa prop deprecada: ${uses.join(", ")}`);
  }
  const imports = new Set();
  for (const source of program
    .getSourceFiles()
    .filter(
      (f) =>
        relative(root, f.fileName).startsWith(`src/components/${entry.id}/`) &&
        !f.fileName.includes(".stories."),
    )) {
    for (const statement of source.statements)
      if (
        ts.isImportDeclaration(statement) &&
        statement.importClause?.namedBindings &&
        ts.isNamedImports(statement.importClause.namedBindings)
      )
        for (const item of statement.importClause.namedBindings.elements) {
          if (item.isTypeOnly || statement.importClause.isTypeOnly) continue;
          const target = aliased(checker.getSymbolAtLocation(item.name));
          if (preferred.has(target) && /^[A-Z]/.test(preferred.get(target)))
            imports.add(preferred.get(target));
        }
  }
  assert(guides[entry.id], `Descrição ausente: ${entry.id}`);
  const doc = {
    id: entry.id,
    description: guides[entry.id],
    usage: usageGuide.families.get(entry.id),
    collections: collectionIdsFor(collections, entry.id),
    publicName: canonical(publicName),
    selected: entry.story,
    import: `import { ${canonical(publicName)} } from '@refy-design/web';`,
    composition: [...imports].map(canonical).sort(),
    api: api
      .filter(
        (item, index, all) =>
          all.findIndex(
            (other) => canonical(other.name) === canonical(item.name),
          ) === index,
      )
      .map((item) => ({ ...item, name: canonical(item.name) })),
    examples,
  };
  assert(doc.api.length, `API vazia: ${entry.id}`);
  const path = `${dir}/${entry.id}.json`,
    content = JSON.stringify(doc, null, 2) + "\n";
  if (check)
    assert.equal(
      readFileSync(path, "utf8"),
      content,
      `Documentação desatualizada: ${entry.id}. Execute npm run docs:build.`,
    );
  else if (!existsSync(path) || readFileSync(path, "utf8") !== content) {
    writeFileSync(`${path}.tmp`, content);
    renameSync(`${path}.tmp`, path);
  }
  generated.push(doc);
  total += examples.length;
}
console.log(
  `Documentação: ${generated.length} famílias / ${total} exemplos derivados das fontes reais.`,
);
if (process.argv.includes("--compile")) {
  const temp = mkdtempSync(join(tmpdir(), "refy-doc-examples-"));
  try {
    symlinkSync(resolve("node_modules"), join(temp, "node_modules"), "dir");
    for (const doc of generated)
      for (const example of doc.examples)
        writeFileSync(join(temp, `${doc.id}.${example.id}.tsx`), example.code);
    writeFileSync(
      join(temp, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          skipLibCheck: true,
          noEmit: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          paths: { "@refy-design/web": [resolve("dist/index.d.ts")] },
        },
        include: ["*.tsx"],
      }),
    );
    execFileSync(
      process.execPath,
      [
        resolve("node_modules/typescript/bin/tsc"),
        "-p",
        join(temp, "tsconfig.json"),
      ],
      { stdio: "inherit" },
    );
    console.log(
      `OK: ${total} exemplos compilam contra a API pública, sem imports internos ou Storybook.`,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}
