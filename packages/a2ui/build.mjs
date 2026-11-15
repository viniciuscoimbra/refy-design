// Builds the published package: dist/*.js (ESM), dist/*.d.ts and dist/catalog.css.
// Dependencies stay external; the consumer installs them.
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "dist");
const pkg = JSON.parse(readFileSync(join(here, "package.json"), "utf8"));
const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
].flatMap((name) => [name, `${name}/*`]);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
await build({
  entryPoints: { index: join(here, "src/index.ts"), definition: join(here, "src/definition.ts") },
  outdir: dist,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "neutral",
  target: "es2020",
  jsx: "automatic",
  external: [...external, "react/jsx-runtime"],
  logLevel: "warning",
});
copyFileSync(join(here, "src/catalog.css"), join(dist, "catalog.css"));
execFileSync(join(here, "node_modules/.bin/tsc"), ["-p", join(here, "tsconfig.build.json")], { stdio: "inherit", cwd: here });
