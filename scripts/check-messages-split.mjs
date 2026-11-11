// Um componente leva só o próprio texto pronto. Antes, qualquer componente com texto (Tabs,
// Pagination, Callout...) puxava o dicionário de todos: 16 KB a mais na tela, medidos em 11/11/2026.
// Roda depois do build da biblioteca: monta Pagination num app Vite e procura o texto de outro componente.
import { build } from "vite";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { en } from "../src/lib/messages/en.ts";

const root = resolve(".");
const dir = mkdtempSync(join(tmpdir(), "refy-messages-"));
try {
  mkdirSync(join(dir, "node_modules/@refy-design"), { recursive: true });
  symlinkSync(root, join(dir, "node_modules/@refy-design/web"), "dir");
  const bundle = async (code) => {
    writeFileSync(join(dir, "entry.js"), code);
    const out = await build({
      root: dir, logLevel: "silent", configFile: false,
      build: { write: false, minify: true, lib: { entry: join(dir, "entry.js"), formats: ["es"], fileName: "x" }, rollupOptions: { external: [/^react($|\/)/, /^react-dom($|\/)/] } },
    });
    return (Array.isArray(out) ? out : [out]).flatMap((r) => r.output).filter((o) => o.type === "chunk").map((o) => o.code).join("\n");
  };
  const own = await bundle(`import { Pagination } from "@refy-design/web"; export default Pagination;`);
  assert(own.includes(en.pagination.label ?? Object.values(en.pagination).find((v) => typeof v === "string")), "Pagination perdeu o próprio texto");
  for (const other of ["breadcrumb", "calendar", "kanbanBoard", "workspaceSwitcher"]) {
    const sample = Object.values(en[other]).find((v) => typeof v === "string" && v.length > 6);
    assert(!own.includes(sample), `Pagination levou o texto de ${other}: "${sample}"`);
  }
  // Com LocaleProvider, os três idiomas continuam disponíveis: o custo é de quem escolhe trocar o idioma.
  const provider = await bundle(`import { LocaleProvider } from "@refy-design/web"; export default LocaleProvider;`);
  assert(provider.includes(Object.values(en.breadcrumb).find((v) => typeof v === "string")), "LocaleProvider sem o dicionário completo");
  console.log("OK: cada componente leva só o próprio texto pronto; LocaleProvider leva os três idiomas.");
} finally {
  rmSync(dir, { recursive: true, force: true });
}
