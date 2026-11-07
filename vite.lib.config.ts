import { defineConfig } from "vite";
import { selectiveCss } from "./scripts/selective-css.mjs";
import { clientDirective, isClientModule } from "./scripts/client-directive.mjs";

// Build da BIBLIOTECA (não confundir com o Storybook, que usa a config dele).
// Uso: npm run build  →  dist/index.js + dist/style.css + dist/*.d.ts
export default defineConfig({
  plugins: [clientDirective(), selectiveCss()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "style",
      // O plugin gera style.css legado além dos assets CSS seletivos.
    },
    outDir: "dist",
    emptyOutDir: true,
    cssCodeSplit: true,
    copyPublicDir: false,
    sourcemap: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) return;
        // O Rollup tenta localizar a diretiva descartada (linha 1, coluna 0) no sourcemap e falha.
        if (warning.code === "SOURCEMAP_ERROR" && warning.loc?.line === 1 && warning.loc.column === 0 && isClientModule(warning.id ?? warning.loc.file)) return;
        warn(warning);
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: "styles/[name]-[hash][extname]",
      },
      // peer deps e deps ficam de fora do bundle — o consumidor resolve
      external: [
        /^prismjs(?:\/|$)/,
        "react",
        "react-dom",
        "react/jsx-runtime",
        "d3-array",
        "d3-scale",
        "d3-shape",
        "d3-hierarchy",
        "d3-force",
        "d3-chord",
        "d3-geo",
        "d3-sankey",
        "d3-zoom",
        "d3-brush",
        "d3-selection",
      ],
    },
  },
});
