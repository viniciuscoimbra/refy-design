import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { preview } from "vite";
import type { PreviewServer } from "vite";

/**
 * Serve o site já construído (`npm run build:site`), como sai para o ar. REFY_SITE_DIST aponta
 * outra pasta de build, para medir uma versão anterior com o mesmo teste.
 */
export const siteDist = resolve(process.env.REFY_SITE_DIST ?? "dist-site");

export async function serveBuiltSite(): Promise<{ url: string; close: () => Promise<void> }> {
  if (!existsSync(resolve(siteDist, "index.html"))) throw new Error(`Falta ${siteDist}/index.html: rode npm run build:site antes.`);
  const server: PreviewServer = await preview({
    configFile: false,
    root: siteDist,
    logLevel: "silent",
    appType: "spa",
    build: { outDir: siteDist },
    preview: { host: "127.0.0.1", port: 0 },
  });
  const url = server.resolvedUrls?.local[0];
  if (!url) throw new Error("O servidor do site não informou o endereço.");
  return { url, close: () => server.close() };
}
