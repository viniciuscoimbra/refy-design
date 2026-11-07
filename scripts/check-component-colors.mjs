// Gate: componente não traz cor fixa. Todo valor de cor vem de token; valor de reserva literal em var() também reprova.
// Exceções só por arquivo, com motivo e contagem exata (scripts/component-color-exceptions.json).
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/;
const VAR = /var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\((?:[^()]|\([^()]*\))*\))*))?\)/g;

export function scanComponentColors(root) {
  const findings = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) { walk(path); continue; }
      const file = relative(root, path).split(sep).join("/");
      if (/\.stories\.|\.test\./.test(name)) continue;
      const text = readFileSync(path, "utf8");
      if (name.endsWith(".css")) {
        const css = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
        for (const m of css.matchAll(/([\w-]+)\s*:\s*([^;{}]+)/g)) {
          const line = css.slice(0, m.index).split("\n").length;
          for (const v of m[2].matchAll(VAR)) if (v[2] && COLOR.test(v[2])) findings.push({ file, line, kind: "fallback-literal", text: m[0].trim().slice(0, 90) });
          if (COLOR.test(m[2].replace(VAR, ""))) findings.push({ file, line, kind: "literal", text: m[0].trim().slice(0, 90) });
        }
      } else if (/\.(tsx|ts)$/.test(name)) {
        text.split("\n").forEach((l, i) => {
          if (/^\s*(\/\/|\*)/.test(l)) return;
          for (const m of l.matchAll(/["'`]([^"'`]*)["'`]/g)) {
            const s = m[1];
            if (COLOR.test(s.replace(VAR, ""))) findings.push({ file, line: i + 1, kind: "literal", text: s.slice(0, 90) });
            for (const v of s.matchAll(VAR)) if (v[2] && COLOR.test(v[2])) findings.push({ file, line: i + 1, kind: "fallback-literal", text: s.slice(0, 90) });
          }
        });
      }
    }
  };
  walk(join(root, "src/components"));
  return findings;
}

export function applyExceptions(findings, exceptions) {
  const used = new Map();
  return findings.map((f) => {
    const e = exceptions.find((x) => x.file === f.file && x.kind === f.kind && (used.get(x) ?? 0) < x.count);
    if (e) used.set(e, (used.get(e) ?? 0) + 1);
    return e ? { ...f, exception: e.reason } : f;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2] ?? ".";
  const exFile = join(root, "scripts/component-color-exceptions.json");
  const exceptions = existsSync(exFile) ? JSON.parse(readFileSync(exFile, "utf8")) : [];
  for (const e of exceptions) if (!e.file || !e.kind || !Number.isInteger(e.count) || !e.reason || e.reason.trim().length < 20) throw Error("Exceção de cor precisa de arquivo, tipo, contagem e motivo concreto.");
  const results = applyExceptions(scanComponentColors(root), exceptions);
  const errors = results.filter((r) => !r.exception);
  for (const r of results) console.log(`${r.exception ? "exceção" : "ERRO   "} ${r.file}:${r.line} ${r.kind} ${r.text}${r.exception ? " — " + r.exception : ""}`);
  console.log(errors.length ? `FALHA: ${errors.length} cor(es) fixa(s) em componente.` : `OK: nenhuma cor fixa em componente (${results.length} exceção(ões) declarada(s)).`);
  if (errors.length) process.exitCode = 1;
}
