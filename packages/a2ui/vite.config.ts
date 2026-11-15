import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL("./demo", import.meta.url)),
  // Tema e foto vêm do próprio repo (src/themes, src/blocks/photos).
  server: { fs: { allow: [repo] }, host: "127.0.0.1" },
  esbuild: { jsx: "automatic" },
});
