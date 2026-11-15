// Empacota o harness do teste para o navegador, com o CSS do refy e do catálogo.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

export async function bundleHarness() {
  const result = await build({
    entryPoints: [path.join(here, "harness.tsx")],
    bundle: true,
    write: false,
    outdir: "out",
    format: "esm",
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    loader: { ".woff2": "empty", ".woff": "empty", ".ttf": "empty" },
    logLevel: "warning",
  });
  const pick = (ext) => result.outputFiles.filter((f) => f.path.endsWith(ext)).map((f) => f.text).join("\n");
  return { js: pick(".js"), css: pick(".css") };
}
