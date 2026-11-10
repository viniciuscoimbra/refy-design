import { readFileSync, realpathSync, existsSync, lstatSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, extname, sep, isAbsolute, join } from "node:path";
import { createRequire } from "node:module";

const controls = {
  button: "Button ou IconButton",
  input: "Input/Checkbox/RadioGroup/Switch conforme a intenção",
  select: "Select ou Combobox",
  textarea: "Textarea",
  dialog: "Modal ou Drawer",
};
const appearance =
  /^(?:color|background(?:Color|Image)?|font(?:Family|Size|Weight)?|lineHeight|letterSpacing|border(?:Radius|Color|Width|Style|TopLeftRadius|TopRightRadius|BottomLeftRadius|BottomRightRadius|(?:Top|Right|Bottom|Left)(?:Color|Width|Style)?)?|boxShadow|textShadow|outline(?:Color|Width|Style)?)$/;
const cssAppearance =
  /^(?:color|background(?:-color|-image)?|font(?:-family|-size|-weight)?|line-height|letter-spacing|border(?:-(?:radius|color|width|style|top-left-radius|top-right-radius|bottom-left-radius|bottom-right-radius|(?:top|right|bottom|left)(?:-(?:color|width|style))?))?|box-shadow|text-shadow|outline(?:-(?:color|width|style))?)$/;
const safeValue = (value) =>
  /^var\(\s*--[\w-]+\s*\)$/.test(value.trim()) ||
  /^(?:inherit|initial|unset|revert|revert-layer|transparent|currentColor|none|0(?:px)?|normal)$/.test(
    value.trim(),
  );
const sourceExtensions = [".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".css"];
const skippedDirectories = new Set(["node_modules", "dist", "build", "coverage", "storybook-static"]);
const colorLiteral = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
// Wildcard exports cover one segment; "@refy-design/web/*" only resolves to documented component families.
function isPublicImport(name, catalog) {
  if (catalog.publicImports.includes(name)) return true;
  const families = new Set(catalog.components.flatMap((c) => [c.id, c.publicName]));
  return catalog.publicImports.some((pattern) => {
    if (!pattern.endsWith("/*")) return false;
    const prefix = pattern.slice(0, -1);
    if (!name.startsWith(prefix)) return false;
    const rest = name.slice(prefix.length);
    if (pattern === catalog.package + "/*") return families.has(rest);
    return rest.length > 0 && !rest.split("/").some((part) => part === ".." || part === "" || part === ".");
  });
}
const absoluteSpecifier = (name) => /^(?:\/|file:|[A-Za-z]:[\\/])/.test(name);
const refyInternals = /(?:^|\/)(?:refy-design|@refy-design\/web)\/(?:dist|src)\//;
// Lexical safety check only; full CSS grammar/semantic validation belongs to the consumer build.
function validateCssSyntax(code, file) {
  const stack = [];
  let quote = null;
  let comment = false;
  for (let i = 0; i < code.length; i++) {
    const c = code[i], next = code[i + 1];
    if (comment) {
      if (c === "*" && next === "/") { comment = false; i++; }
      continue;
    }
    if (quote) {
      if (c === "\\") { i++; continue; }
      if (c === quote) quote = null;
      else if (c === "\n" || c === "\r") throw Error(`Cannot parse ${file}: unterminated CSS string`);
      continue;
    }
    if (c === "/" && next === "*") { comment = true; i++; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if ("{[(".includes(c)) stack.push(c);
    if ("}])".includes(c) && stack.pop() !== ({ "}": "{", "]": "[", ")": "(" })[c])
      throw Error(`Cannot parse ${file}: unbalanced CSS delimiter`);
  }
  if (comment || quote || stack.length) throw Error(`Cannot parse ${file}: incomplete CSS comment, string or delimiter`);
  const clean = code.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '"value"');
  if (/(?:^|[;{])\s*[\w-]+\s*:\s*(?:;|})/.test(clean))
    throw Error(`Cannot parse ${file}: empty CSS declaration`);
}
const SURFACE = /^(?:border(?:-(?:top|right|bottom|left|color|width|style))*|background(?:-color|-image)?|border-radius|border-(?:top|bottom)-(?:left|right)-radius|box-shadow)$/;
const kebab = (name) => name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
// AI-02: o que fazer com cada achado de aparência literal. Ordem: fallback literal em token
// conhecido, token do tema definido na tela, caixa com borda/fundo/sombra, valor que já existe
// num token, e por fim literal sem token.
export function literalSuggestion(property, value, catalog) {
  const prop = kebab(property);
  const known = new Set(catalog.themeTokens ?? []);
  const fallbacks = [...String(value).matchAll(/var\(\s*(--[\w-]+)\s*,\s*([^()]+?)\s*\)/g)].filter(([, token]) => known.has(token));
  if (fallbacks.length)
    return `Remova o fallback: ${fallbacks.map(([, token]) => `${token} é token do tema e sempre tem valor; escreva var(${token})`).join("; ")}.`;
  if (known.has(prop)) return `${prop} é token do tema: defina no arquivo de tema (ThemeProvider), não no CSS da tela.`;
  if (SURFACE.test(prop))
    return "Caixa com borda, fundo, raio ou sombra é um Card: use <Card> do @refy-design/web e deixe a aparência com o tema (--card-border-width, --card-radius, --card-background). Mantenha no CSS da tela só o layout (display, gap, grid, padding).";
  const literal = String(value).trim();
  const same = Object.entries(catalog.tokenValues ?? {}).filter(([, v]) => v === literal).map(([token]) => token);
  if (same.length) return `Use ${same.slice(0, 3).map((t) => `var(${t})`).join(" ou ")}, que já vale ${literal} no tema padrão.`;
  return `Não há token com o valor ${literal} no tema padrão. Use um token próximo (refy_component lista os da família) ou, se a marca pede esse valor, ponha no tema ou no hook do componente (--<família>-*), não no CSS da tela.`;
}
export function localFile(root, input) {
  const absolute = realpathSync(resolve(root, input)),
    rel = relative(root, absolute);
  if (rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel))
    throw Error(`Path outside project: ${input}`);
  if (!sourceExtensions.includes(extname(absolute)))
    throw Error(`Unsupported source file: ${input}`);
  return { absolute, file: rel.split(sep).join("/") };
}
function expandDirectory(root, absolute, out) {
  for (const entry of readdirSync(absolute, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith(".") || skippedDirectories.has(entry.name)) continue;
    const path = join(absolute, entry.name);
    if (entry.isDirectory()) expandDirectory(root, path, out);
    else if (entry.isFile() && sourceExtensions.includes(extname(entry.name)) && !entry.name.endsWith(".d.ts"))
      out.push(relative(root, path).split(sep).join("/"));
  }
}
export async function inspectFiles(root, files, catalog) {
  root = realpathSync(root);
  let ts;
  try {
    ts = createRequire(resolve(root, "package.json"))("typescript");
  } catch {
    throw Error(
      "inspect/check require TypeScript in the consumer: npm install --save-dev typescript@^5",
    );
  }
  if (typeof ts.createSourceFile !== "function")
    throw Error(`TypeScript ${ts.version ?? ""} has no JavaScript API (TypeScript 7+); install typescript@^5 as a dev dependency for refy check.`);
  const staticText = (node) =>
    node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      ? node.text
      : undefined;
  const configPath = resolve(root, "refy-agent.config.json");
  if (existsSync(configPath) && !lstatSync(configPath).isFile())
    throw Error(
      "Configuration must be a regular project file, not a symlink or directory.",
    );
  const config = existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, "utf8"))
    : { version: 1, exceptions: [] };
  const lists = ["include", "exclude", "themeFiles"];
  const boards = config.boards;
  if (
    config.version !== 1 ||
    !Array.isArray(config.exceptions) ||
    Object.keys(config).some((k) => !["version", "exceptions", "boards", ...lists].includes(k)) ||
    (boards !== undefined && (!boards || !Array.isArray(boards.dirs) || typeof boards.registry !== "string" || Object.keys(boards).some((k) => !["dirs", "registry"].includes(k)))) ||
    lists.some((k) => k in config && !Array.isArray(config[k]))
  )
    throw Error("Invalid refy-agent.config.json");
  const include = config.include ?? [], exclude = config.exclude ?? [], themeFiles = config.themeFiles ?? [];
  if (include.some((p) => typeof p !== "string" || p.includes("*")) || themeFiles.some((p) => typeof p !== "string" || p.includes("*")))
    throw Error("include and themeFiles entries must be exact project paths, without wildcards.");
  for (const item of exclude)
    if (!item || Object.keys(item).some((k) => !["path", "reason"].includes(k)) || typeof item.path !== "string" || item.path.includes("*") || typeof item.reason !== "string" || item.reason.trim().length < 12)
      throw Error("Each exclude requires exact path and concrete reason (12+ characters).");
  if (!files.length) files = include;
  if (!files.length && !boards)
    throw Error(
      "Provide explicit .tsx/.jsx/.ts/.js/.mjs/.cjs/.css files or directories inside this project, or list them in refy-agent.config.json include.",
    );
  const rules = ["raw-control", "appearance-literal", "color-literal", "internal-import", "absolute-import", "board-source"];
  for (const item of config.exceptions) {
    if (
      !item ||
      Object.keys(item).some((k) => !["file", "rule", "reason", "count"].includes(k)) ||
      ("count" in item && (!Number.isInteger(item.count) || item.count < 1)) ||
      typeof item.file !== "string" ||
      item.file.includes("*") ||
      !rules.includes(item.rule) ||
      typeof item.reason !== "string" ||
      item.reason.trim().length < 12
    )
      throw Error(
        "Each exception requires exact file, known rule and concrete reason (12+ characters).",
      );
    if (localFile(root, item.file).file !== item.file)
      throw Error("Exception file must use canonical project-relative path.");
  }
  const canonical = (p) => {
    const absolute = resolve(root, p);
    if (!existsSync(absolute)) throw Error(`Configured path does not exist: ${p}`);
    const rel = relative(root, realpathSync(absolute));
    if (rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)) throw Error(`Path outside project: ${p}`);
    return rel.split(sep).join("/");
  };
  const boardFindings = [];
  const excluded = exclude.map((item) => ({ path: canonical(item.path), reason: item.reason }));
  const isExcluded = (file) => excluded.some(({ path }) => file === path || file.startsWith(path + "/"));
  const themes = new Set(themeFiles.map(canonical));
  const expanded = [];
  for (const input of files) {
    const absolute = resolve(root, input);
    if (existsSync(absolute) && statSync(absolute).isDirectory()) {
      const rel = canonical(input);
      expandDirectory(root, realpathSync(absolute), expanded);
      if (rel === "") continue;
    } else expanded.push(input);
  }
  files = expanded;
  // Boards (pranchas) in delivery folders must be captures of registered source code.
  const boardFiles = [];
  if (boards) {
    const registryPath = canonical(boards.registry);
    const registry = JSON.parse(readFileSync(resolve(root, registryPath), "utf8"));
    const entries = Array.isArray(registry) ? registry : registry.pranchas ?? [];
    const sourceOf = new Map();
    for (const entry of entries)
      for (const capture of [].concat(entry.capturas ?? entry.captures ?? entry.capture ?? []))
        sourceOf.set(capture, [].concat(entry.origem ?? entry.source ?? []));
    for (const dir of boards.dirs) {
      const rel = canonical(dir), found = [];
      const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(?:png|jpe?g|webp|gif)$/i.test(e.name)) found.push(relative(root, p).split(sep).join("/")); } };
      walk(resolve(root, rel));
      for (const image of found.sort()) {
        boardFiles.push(image);
        const sources = sourceOf.get(image) ?? [];
        const missing = sources.filter((s) => !existsSync(resolve(root, s)));
        if (!sources.length || missing.length)
          boardFindings.push({ image, message: !sources.length
            ? `Board ${image} has no source code registered in ${registryPath}; a board must be a capture of code that composes Refy components.`
            : `Board ${image} registers missing source ${missing.join(", ")}.` });
      }
    }
  }
  const themeTokens = new Set(catalog.themeTokens);
  const used = new Map();
  const findings = [],
    components = new Set(),
    scanned = [];
  const add = (file, source, pos, rule, message, severity = "error", extra = {}) => {
    const before = source.slice(0, pos),
      line = before.split("\n").length,
      column = pos - (before.lastIndexOf("\n") + 1) + 1;
    const exception = config.exceptions.find((e) => {
      if (e.file !== file || e.rule !== rule) return false;
      if (!e.count) return true;
      const key = config.exceptions.indexOf(e);
      if ((used.get(key) ?? 0) >= e.count) return false;
      used.set(key, (used.get(key) ?? 0) + 1);
      return true;
    });
    findings.push({
      file,
      line,
      column,
      rule,
      severity,
      message,
      ...extra,
      ...(exception ? { exception: exception.reason } : {}),
    });
  };
  // Nome exportado → { prop deprecada: substituta }. PropertyCard é o nome de origem de ContentCard.
  const deprecatedProps = new Map(Object.entries(catalog.deprecatedProps ?? {}));
  const sourceNames = { PropertyCard: "ContentCard", PropertyActionGroup: "DecisionActions", PropertyMedia: "MediaGallery", SwipeDeck: "DecisionDeck", VisitSchedulePicker: "SchedulePicker", EventTimeline: "ActivityTimeline" };
  for (const [from, to] of Object.entries(sourceNames)) if (deprecatedProps.has(to) && !deprecatedProps.has(from)) deprecatedProps.set(from, deprecatedProps.get(to));
  const warnUnknown = (file, source, pos, value) => {
    const token = value.trim().match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1];
    if (token && !themeTokens.has(token))
      add(
        file,
        source,
        pos,
        "unverified-token",
        `${token} is not in the Refy catalog. Verify that this project defines and scopes it; no computed-style validation was performed.`,
        "warning",
      );
  };
  for (const input of files) {
    const { absolute, file } = localFile(root, input);
    if (scanned.includes(file) || isExcluded(file)) continue;
    scanned.push(file);
    const code = readFileSync(absolute, "utf8");
    if (extname(file) === ".css") {
      validateCssSyntax(code, file);
      const clean = code.replace(/\/\*[\s\S]*?\*\//g, (m) =>
        m.replace(/[^\n]/g, " "),
      );
      for (const match of clean.matchAll(
        /([\w-]+)\s*:\s*([^;{}]+)(?:;|(?=\}))/g,
      )) {
        if (themes.has(file)) continue;
        if (colorLiteral.test(match[2])) {
          add(file, code, match.index, "color-literal", `${match[1]} uses a literal color; colors belong to the theme (ThemeProvider/theme file) as tokens.`);
          continue;
        }
        if (cssAppearance.test(match[1]))
          warnUnknown(file, code, match.index, match[2]);
        if (
          (cssAppearance.test(match[1]) && !safeValue(match[2])) ||
          themeTokens.has(match[1])
        )
          add(
            file,
            code,
            match.index,
            "appearance-literal",
            `${match[1]} should use a public theme token; keep structural layout local.`,
            "error",
            { suggestion: literalSuggestion(match[1], match[2], catalog) },
          );
      }
      continue;
    }
    const sf = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true,
      [".tsx", ".jsx", ".js", ".mjs", ".cjs"].includes(extname(file))
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS,
    );
    if (sf.parseDiagnostics.length)
      throw Error(
        `Cannot parse ${file}: ${ts.flattenDiagnosticMessageText(sf.parseDiagnostics[0].messageText, " ")}`,
      );
    const localRefy = new Map(); // nome local → nome exportado pelo Refy
    const checkSpecifier = (name, node) => {
      if (absoluteSpecifier(name))
        add(file, code, node.getStart(sf), refyInternals.test(name) ? "internal-import" : "absolute-import",
          refyInternals.test(name)
            ? `Import Refy from the public entry "@refy-design/web" instead of the checkout path ${name}.`
            : `Absolute path ${name} only works on one machine; use a package or a relative path.`);
      else if (refyInternals.test(name) || (name.startsWith("@refy-design/web/") && !isPublicImport(name, catalog)))
        add(file, code, node.getStart(sf), "internal-import", `Use documented public exports instead of ${name}.`);
    };
    const visit = (node) => {
      if ((ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) && ts.isExportDeclaration(node))
        checkSpecifier(node.moduleSpecifier.text, node);
      if (ts.isCallExpression(node) && node.arguments.length && ts.isStringLiteral(node.arguments[0]) &&
        (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require")))
        checkSpecifier(node.arguments[0].text, node);
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const name = node.moduleSpecifier.text;
        checkSpecifier(name, node);
        if ((name === "@refy-design/web" || name.startsWith("@refy-design/web/")) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings))
          for (const item of node.importClause.namedBindings.elements)
            localRefy.set(item.name.text, (item.propertyName ?? item.name).text);
        if (
          name === "@refy-design/web" &&
          node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings)
        )
          for (const item of node.importClause.namedBindings.elements)
            components.add((item.propertyName ?? item.name).text);
      }
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tag = node.tagName.getText(sf),
          props = node.attributes.properties;
        const deprecated = deprecatedProps.get(localRefy.get(tag));
        if (deprecated)
          for (const p of props) {
            if (!ts.isJsxAttribute(p)) continue;
            const prop = p.name.getText(sf);
            if (!Object.hasOwn(deprecated, prop)) continue;
            const replacement = deprecated[prop];
            add(file, code, p.getStart(sf), "deprecated-prop",
              `${localRefy.get(tag)} ${prop} is deprecated${replacement ? `; use ${replacement}` : ""}.`, "warning",
              { suggestion: replacement ? `Troque ${prop} por ${replacement}: a prop antiga continua funcionando, mas sai numa versão futura.` : `Veja a ficha de ${localRefy.get(tag)} para a substituta.` });
          }
        if (controls[tag])
          add(
            file,
            code,
            node.getStart(sf),
            "raw-control",
            `Use ${controls[tag]}; justify intrinsic/external widgets explicitly.`,
          );
        if (tag === "div" || tag === "span") {
          const role = props.find(
            (p) => ts.isJsxAttribute(p) && p.name.getText(sf) === "role",
          );
          const roleValue = role?.initializer;
          const roleText = staticText(
            roleValue && ts.isJsxExpression(roleValue)
              ? roleValue.expression
              : roleValue,
          );
          if (
            ["button", "checkbox", "combobox", "switch", "radio"].includes(roleText)
          )
            add(
              file,
              code,
              node.getStart(sf),
              "raw-control",
              `Interactive role ${roleText} should use a public control or an explicit widget exception.`,
            );
        }
        const style = props.find(
          (p) => ts.isJsxAttribute(p) && p.name.getText(sf) === "style",
        );
        if (
          style?.initializer &&
          ts.isJsxExpression(style.initializer) &&
          style.initializer.expression &&
          ts.isObjectLiteralExpression(style.initializer.expression)
        )
          for (const prop of style.initializer.expression.properties) {
            if (!ts.isPropertyAssignment(prop)) continue;
            const key = prop.name.getText(sf).replace(/^['"]|['"]$/g, "");
            if (themeTokens.has(key)) {
              add(
                file,
                code,
                prop.getStart(sf),
                "appearance-literal",
                `${key} belongs in the public ThemeProvider configuration, not a page style.`,
                "error",
                { suggestion: literalSuggestion(key, "", catalog) },
              );
              continue;
            }
            if (!appearance.test(key)) continue;
            const value = prop.initializer;
            const text = staticText(value);
            if (text !== undefined)
              warnUnknown(file, code, prop.getStart(sf), text);
            if (
              (text !== undefined || ts.isNumericLiteral(value)) &&
              !safeValue(text ?? value.text)
            )
              add(
                file,
                code,
                prop.getStart(sf),
                "appearance-literal",
                `${key} should use a public theme token.`,
                "error",
                { suggestion: literalSuggestion(key, text ?? String(value.text), catalog) },
              );
          }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  for (const { image, message } of boardFindings) add(image, "", 0, "board-source", message);
  return {
    schemaVersion: 1,
    scanned,
    boards: boardFiles,
    excluded,
    themeFiles: [...themes],
    components: [...components].sort(),
    findings,
    passed: !findings.some((f) => f.severity === "error" && !f.exception),
    limits: catalog.limits,
  };
}
