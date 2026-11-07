// Preserva "use client" por módulo no build da biblioteca.
// O Rollup descarta diretivas de módulo ao empacotar; sem elas, um Server Component
// do Next que importa um componente com hook quebra no build (createContext/useState
// is not a function). Com preserveModules cada chunk é um módulo, então basta
// devolver a diretiva ao chunk cujo módulo de origem a declara. O aviso
// MODULE_LEVEL_DIRECTIVE de "use client" é esperado e sai do log em vite.lib.config.ts.
import { readFileSync } from "node:fs";

const DIRECTIVE = /^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/\s*)*["']use client["'];?/;

const cache = new Map();
export function isClientModule(id) {
  if (!id || !/\.[cm]?[jt]sx?$/.test(id)) return false;
  if (!cache.has(id)) cache.set(id, DIRECTIVE.test(readFileSync(id, "utf8")));
  return cache.get(id);
}

export function clientDirective() {
  return {
    name: "refy-client-directive",
    // banner, e não renderChunk, porque o Rollup desloca o sourcemap do banner sozinho.
    banner(chunk) {
      return isClientModule(chunk.facadeModuleId) ? '"use client";' : "";
    },
  };
}
