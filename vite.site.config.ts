import { defineConfig } from "vite";
import { demoText } from "./scripts/vite-demo-text.mjs";
import { nativePreview } from "./scripts/vite-native-preview.mjs";
import { localeSplit } from "./scripts/vite-locale-split.mjs";

// Build do SITE refy.design (não é a biblioteca nem o Storybook). Saída: dist-site/.
export default defineConfig({
  root: "site",
  base: "/",
  esbuild: { jsx: "automatic" },
  // Código dos exemplos em inglês; a tela do site segue o idioma escolhido.
  // Dicionários divididos por página e família (scripts/vite-locale-split.mjs).
  plugins: [demoText(), nativePreview(), localeSplit()],
  publicDir: false,
  build: {
    outDir: "../dist-site",
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    // A prévia de cada template roda num iframe próprio; sem esta entrada o iframe recebia o
    // index.html (fallback de SPA) e mostrava o site inteiro dentro do template.
    rollupOptions: {
      input: { main: "site/index.html", blocks: "site/block-preview.html" },
      // Pedaços de dicionário com nome que diz o que são (locale-reference-pt, locale-family-pt-Button).
      output: {
        chunkFileNames: (chunk) => {
          const id = chunk.facadeModuleId ?? "";
          const locale = id.match(/^\0virtual:refy-locale\/(site|reference|family)\/(.+)$/);
          return locale ? `assets/locale-${locale[1]}-${locale[2].replace(/\//g, "-")}-[hash].js` : "assets/[name]-[hash].js";
        },
      },
    },
  },
});
