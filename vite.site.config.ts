import { defineConfig } from "vite";
import { demoText } from "./scripts/vite-demo-text.mjs";
import { nativePreview } from "./scripts/vite-native-preview.mjs";

// Build do SITE refy.design (não é a biblioteca nem o Storybook). Saída: dist-site/.
export default defineConfig({
  root: "site",
  base: "/",
  esbuild: { jsx: "automatic" },
  // Código dos exemplos em inglês; a tela do site segue o idioma escolhido.
  plugins: [demoText(), nativePreview()],
  publicDir: false,
  build: {
    outDir: "../dist-site",
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    // A prévia de cada template roda num iframe próprio; sem esta entrada o iframe recebia o
    // index.html (fallback de SPA) e mostrava o site inteiro dentro do template.
    rollupOptions: { input: { main: "site/index.html", blocks: "site/block-preview.html" } },
  },
});
