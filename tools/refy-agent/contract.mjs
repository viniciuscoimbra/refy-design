// Confere o uso dos componentes contra a API documentada que acompanha o pacote (ai/components):
// prop obrigatória ausente, valor literal fora da união aceita e prop fora do contrato.
// Os aliases (ButtonVariant, BadgeTone...) vêm dos .d.ts publicados em dist/, os mesmos que o
// TypeScript do consumidor usa; sem dist/, o valor fica como "não verificado", nunca como aprovado.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const PACKAGE = "@refy-design/web";
const HTML_PASSTHROUGH = new Set(
  (
    "key ref className style id title role tabIndex name form autoComplete autoFocus placeholder " +
    "readOnly required min max step pattern inputMode lang hidden draggable spellCheck htmlFor " +
    "type value defaultValue checked defaultChecked disabled href target rel src alt width height " +
    "maxLength minLength rows cols accept multiple size"
  ).split(" "),
);

export function loadTypeScript(roots) {
  for (const root of roots) {
    try {
      const ts = createRequire(join(root, "package.json"))("typescript");
      if (typeof ts.createSourceFile === "function") return ts;
    } catch {}
  }
  return null;
}

// Nomes exportados pelo pacote: `export { A, B as C }` e `export type { ... }` da entrada pública e,
// para cobrir `export * from`, toda declaração exportada nos .d.ts de dist/.
export function readRuntimeExports(distDir) {
  const names = new Set();
  if (!existsSync(join(distDir, "index.d.ts"))) return names;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".d.ts")) {
        const text = readFileSync(path, "utf8");
        for (const [, list] of text.matchAll(/^export (?:type )?\{([^}]+)\}/gm))
          for (const part of list.split(",")) {
            const name = part.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop();
            if (name) names.add(name);
          }
        for (const [, name] of text.matchAll(/^export (?:declare )?(?:function|const|let|class|interface|type|enum|namespace) (\w+)/gm)) names.add(name);
      }
    }
  };
  walk(distDir);
  return names;
}

export function readTypeAliases(distDir) {
  const aliases = new Map();
  if (!existsSync(distDir)) return aliases;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".d.ts"))
        for (const [, name, body] of readFileSync(path, "utf8").matchAll(/type (\w+) = ([^;=]+);/g))
          {
            const value = body.replace(/\s+/g, " ").trim();
            // Mesmo nome em dois .d.ts (componente e contrato): vale a união de literais, que dá para conferir.
            if (!aliases.has(name) || (!/^"/.test(aliases.get(name)) && /^"[^"]*"(?: \| "[^"]*")*$/.test(value))) aliases.set(name, value);
          }
    }
  };
  walk(distDir);
  return aliases;
}

// Devolve os literais aceitos ou null quando o tipo não é uma união fechada de strings.
export function literalUnion(type, aliases, seen = new Set()) {
  const values = [];
  for (const raw of type.split("|").map((part) => part.trim()).filter(Boolean)) {
    if (raw === "undefined" || raw === "null") continue;
    const literal = raw.match(/^"([^"]*)"$/);
    if (literal) values.push(literal[1]);
    else if (/^\w+$/.test(raw) && aliases.has(raw) && !seen.has(raw)) {
      const nested = literalUnion(aliases.get(raw), aliases, new Set([...seen, raw]));
      if (!nested) return null;
      values.push(...nested);
    } else return null;
  }
  return values.length ? values : null;
}

export function apiMembers(catalog, documentFor) {
  const members = new Map();
  for (const component of catalog.components)
    for (const member of documentFor(component).api ?? [])
      if (!members.has(member.name)) members.set(member.name, { family: component.id, props: member.props ?? [] });
  return members;
}

export function checkContract(ts, code, file, { catalog, documentFor, aliases, exports = new Set() }) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".jsx") ? ts.ScriptKind.JSX : ts.ScriptKind.TSX;
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, kind);
  const members = apiMembers(catalog, documentFor);
  const findings = [];
  const where = (node) => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
    return { file, line: line + 1, column: character + 1 };
  };
  const add = (node, rule, severity, message, extra = {}) => findings.push({ ...where(node), rule, severity, message, ...extra });
  const local = new Map(); // nome local → nome exportado
  const used = new Set();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const from = statement.moduleSpecifier.text;
    if (from !== PACKAGE && !from.startsWith(PACKAGE + "/")) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings) || statement.importClause.isTypeOnly) continue;
    for (const element of bindings.elements) {
      if (element.isTypeOnly) continue;
      const exported = (element.propertyName ?? element.name).text;
      local.set(element.name.text, exported);
      if (from !== PACKAGE || members.has(exported)) continue;
      if (exports.size && !exports.has(exported))
        add(element, "unknown-export", "error", `${PACKAGE} não exporta ${exported}. Procure a família certa com refy_search.`);
      else if (!exports.size && /^[A-Z]/.test(exported))
        add(element, "undocumented-export", "warning", `${exported} não está na API documentada do catálogo e não há dist/ para conferir o export.`);
    }
  }
  const visit = (node) => {
    const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
    if (opening && ts.isIdentifier(opening.tagName) && local.has(opening.tagName.text)) {
      const name = local.get(opening.tagName.text);
      const member = members.get(name);
      if (member) {
        used.add(name);
        const props = new Map(member.props.map((p) => [p.name, p]));
        const given = new Set();
        let spread = false;
        for (const attribute of opening.attributes.properties) {
          if (ts.isJsxSpreadAttribute(attribute)) { spread = true; continue; }
          const prop = attribute.name.getText(source);
          given.add(prop);
          const contract = props.get(prop);
          if (!contract) {
            if (!HTML_PASSTHROUGH.has(prop) && !/^(?:aria|data)-/.test(prop) && !/^on[A-Z]/.test(prop))
              add(attribute, "undocumented-prop", "warning", `${name} não documenta a prop ${prop}. Props documentadas: ${member.props.map((p) => p.name).join(", ")}.`);
            continue;
          }
          let literal;
          const init = attribute.initializer;
          if (init && ts.isStringLiteral(init)) literal = init.text;
          else if (init && ts.isJsxExpression(init) && init.expression && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression))) literal = init.expression.text;
          if (literal === undefined) continue;
          const allowed = literalUnion(contract.type, aliases);
          if (allowed && !allowed.includes(literal))
            add(attribute, "invalid-prop-value", "error", `${name} ${prop}="${literal}" não existe. Valores aceitos: ${allowed.map((v) => JSON.stringify(v)).join(", ")}.`, { allowed });
          else if (/^boolean(?: \| undefined)?$/.test(contract.type))
            add(attribute, "invalid-prop-value", "error", `${name} ${prop} é boolean; use ${prop} ou ${prop}={false}, não uma string.`);
        }
        const hasChildren = ts.isJsxElement(node) && node.children.some((child) => !ts.isJsxText(child) || child.text.trim());
        if (!spread)
          for (const contract of member.props)
            if (contract.required && !given.has(contract.name) && !(contract.name === "children" && hasChildren))
              add(opening, "missing-required-prop", "error", `${name} exige a prop ${contract.name} (${contract.type}).`);
        if (spread)
          add(opening, "spread-not-verified", "info", `${name} recebe spread; props obrigatórias e valores vindos do spread não foram conferidos.`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { findings, components: [...used].sort(), aliasesVerified: aliases.size > 0 };
}
