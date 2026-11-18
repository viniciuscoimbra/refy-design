// Testes do catálogo: definição em Node puro e renderizador no Chromium do Playwright
// (navegadores já instalados; nada é baixado).
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const result = spawnSync(
  process.execPath,
  ["--experimental-strip-types", "--no-warnings", "--import", path.join(here, "ts-resolve.mjs"), "--test", path.join(here, "definition.test.mjs"), path.join(here, "catalog.test.mjs")],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
