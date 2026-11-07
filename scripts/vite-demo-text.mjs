// Plugin do build do site: o código dos exemplos e templates é escrito em inglês e aparece assim na
// aba Código; a tela renderizada ao lado segue o idioma do site. Este plugin troca, só no bundle do
// site, cada texto que tem tradução por uma consulta ao dicionário (src/pages/RefySitePage/locales/
// demo.*.json). O `?raw` que alimenta a aba Código não passa por aqui, e a biblioteca publicada não
// conhece nada disto.
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const scope = /^src\/(components\/[^/]+\/[^/]+\.stories\.tsx|blocks\/[^/]+\.tsx?|_demo\/[^/]+\.tsx?|stories\/(BlockFrame|TypographySample)\.tsx|stories\/(skins|useThemeConfiguration)\.ts)$/;
const runtime = resolve(root, "src/pages/RefySitePage/demoText.ts").split("\\").join("/");
// Textos que também servem de identificador não são trocados: o valor traduzido deixaria de casar.
const idProps = /^(id|key|value|href|src|className|type|variant|tone|mode|side|align|area|kind|status|state|layout|orientation|icon|size|color|format|htmlFor|data-.*|aria-controls|aria-describedby|aria-labelledby)$/;

export function demoText() {
  const dict = JSON.parse(readFileSync(resolve(root, "src/pages/RefySitePage/locales/demo.pt.json"), "utf8"));
  return {
    name: "refy-demo-text",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("?")) return null;
      const file = relative(root, id).split("\\").join("/");
      if (!scope.test(file) || !dict[file]) return null;
      const known = dict[file];
      const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const keyNames = new Set();
      const collect = (n) => {
        if ((ts.isPropertyAssignment(n) || ts.isPropertySignature(n) || ts.isShorthandPropertyAssignment(n)) && n.name && (ts.isStringLiteral(n.name) || (ts.isIdentifier(n.name) && /^[A-Z]/.test(n.name.text)))) keyNames.add(n.name.text);
        ts.forEachChild(n, collect);
      };
      collect(sf);
      const F = JSON.stringify(file);
      const skip = (n) => {
        const p = n.parent;
        if (!p) return true;
        if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || ts.isExternalModuleReference(p)) return true;
        if (ts.isPropertyAssignment(p) && p.name === n) return true;
        // `value` ao lado de `label` com espaço no texto é dado mostrado (ficha de um card), não id.
        if (ts.isPropertyAssignment(p) && p.name.getText(sf) === "value" && /\s/.test(n.text) && ts.isObjectLiteralExpression(p.parent) && p.parent.properties.some((q) => q.name?.getText(sf) === "label")) return false;
        if (ts.isPropertyAssignment(p) && idProps.test(p.name.getText(sf))) return true;
        // `name` e `role` são identificadores em elemento HTML (campo de formulário, papel ARIA); num
        // componente, `name` é o nome mostrado (ConnectorCard, Avatar) e segue o idioma.
        if (ts.isJsxAttribute(p) && (idProps.test(p.name.getText(sf)) || p.name.getText(sf) === "role" || (p.name.getText(sf) === "name" && /^[a-z]/.test(p.parent.parent.tagName.getText(sf))))) return true;
        if (ts.isCaseClause(p) || ts.isElementAccessExpression(p)) return true;
        if (ts.isBinaryExpression(p) && /^(===|!==|==|!=|in)$/.test(p.operatorToken.getText(sf))) return true;
        if (ts.isCallExpression(p) && /\b(includes|indexOf|startsWith|endsWith|get|has|set|getItem|setItem|querySelector|getElementById)$/.test(p.expression.getText(sf))) return true;
        return keyNames.has(n.text);
      };
      // Edições sem sobreposição dentro de um nó; o template traduzido leva as expressões já trocadas.
      const plain = (e) => ts.isPropertyAccessExpression(e) && !ts.isCallExpression(e.parent) && /^[a-z]\w*$/.test(e.name.text) && !idProps.test(e.name.text) || ts.isPropertyAccessExpression(e) && /^(state|status|kind|type|role)$/.test(e.name.text);
      const editsOf = (root) => {
        const list = [];
        const visit = (n) => {
          if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && typeof known[n.text] !== "undefined" && !skip(n)) {
            const call = `__refyText(${F}, ${JSON.stringify(n.text)})`;
            list.push([n.getStart(sf), n.getEnd(), ts.isJsxAttribute(n.parent) ? `{${call}}` : call]);
            return;
          }
          if (ts.isJsxText(n)) {
            const t = n.text.trim().replace(/\s+/g, " ");
            if (t && typeof known[t] !== "undefined") {
              const lead = n.text.match(/^\s*/)[0], trail = n.text.match(/\s*$/)[0];
              list.push([n.pos, n.end, `${lead}{__refyText(${F}, ${JSON.stringify(t)})}${trail}`]);
            }
            return;
          }
          // Valor guardado em inglês (estado, tipo, cargo) e mostrado como filho de JSX: traduz na hora de exibir.
          if (ts.isJsxExpression(n) && n.expression && (ts.isJsxElement(n.parent) || ts.isJsxFragment(n.parent)) && plain(n.expression)) {
            list.push([n.getStart(sf), n.getEnd(), `{__refyValue(${F}, ${n.expression.getText(sf)})}`]);
            return;
          }
          if (ts.isTemplateExpression(n)) {
            const key = "`" + [n.head.text, ...n.templateSpans.map((x) => x.literal.text)].join("\u0001");
            if (typeof known[key] !== "undefined") {
              const args = n.templateSpans.map((x) => (plain(x.expression) ? `__refyValue(${F}, ${x.expression.getText(sf)})` : apply(x.expression)));
              list.push([n.getStart(sf), n.getEnd(), `__refyTemplate(${F}, ${JSON.stringify(key)}, [${args.join(", ")}])`]);
              return;
            }
          }
          ts.forEachChild(n, visit);
        };
        visit(root);
        return list;
      };
      const apply = (node) => {
        const start = node === sf ? 0 : node.getStart(sf), end = node.getEnd();
        let text = code.slice(start, end);
        for (const [a, b, r] of editsOf(node).sort((x, y) => y[0] - x[0])) text = text.slice(0, a - start) + r + text.slice(b - start);
        return text;
      };
      const out = apply(sf);
      if (out === code) return null;
      const directive = out.match(/^\s*["']use client["'];?\s*/);
      const at = directive ? directive[0].length : 0;
      return { code: out.slice(0, at) + `import { __refyText, __refyTemplate, __refyValue } from ${JSON.stringify(runtime)};\n` + out.slice(at), map: null };
    },
  };
}
