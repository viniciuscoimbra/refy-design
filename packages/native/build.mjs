// Gera o pacote publicado: dist/index.js (ESM) e dist/types (.d.ts).
// Quem instala só @refy-design/mobile não precisa de nada do repositório: os tokens resolvidos
// e os contratos de props da web vão dentro do pacote, numa cópia de trabalho em .build/.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const stage = join(here, ".build");
const dist = join(here, "dist");

execFileSync("node", [join(root, "packages/tokens/build.mjs")], { stdio: "inherit" });
rmSync(stage, { recursive: true, force: true });
rmSync(dist, { recursive: true, force: true });
cpSync(join(here, "src"), join(stage, "src"), { recursive: true });
// conformance.ts confere a web contra os contratos; não é contrato e não vai no pacote.
cpSync(join(root, "src/contracts"), join(stage, "src/_contracts"), { recursive: true, filter: (from) => !from.endsWith("conformance.ts") });
mkdirSync(join(stage, "src/_tokens"), { recursive: true });
for (const file of ["index.js", "index.d.ts", "resolve.js"]) cpSync(join(root, "packages/tokens/dist", file), join(stage, "src/_tokens", file));

// Troca os nomes de pacote pelos caminhos da cópia embutida.
const walk = (dir) => readdirSync(dir).flatMap((name) => (statSync(join(dir, name)).isDirectory() ? walk(join(dir, name)) : [join(dir, name)]));
for (const file of walk(join(stage, "src"))) {
  if (!/\.(ts|tsx)$/.test(file) || file.includes("/_tokens/")) continue;
  const to = (target) => {
    const path = relative(dirname(file), join(stage, "src", target));
    return path.startsWith(".") ? path : `./${path}`;
  };
  const source = readFileSync(file, "utf8");
  const next = source
    .replaceAll('"@refy-design/web/contracts"', `"${to("_contracts/index")}"`)
    .replaceAll('"@refy/tokens"', `"${to("_tokens/index")}"`);
  if (next !== source) writeFileSync(file, next);
}

await build({
  entryPoints: [join(stage, "src/index.ts")],
  outfile: join(dist, "index.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2020",
  jsx: "automatic",
  sourcemap: false,
  external: ["react", "react/*", "react-native", "react-native/*", "react-native-svg", "d3-*"],
  logLevel: "warning",
});

writeFileSync(join(stage, "tsconfig.json"), JSON.stringify({
  compilerOptions: {
    target: "ES2022", module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: true,
    skipLibCheck: true, declaration: true, emitDeclarationOnly: true, allowJs: false,
    rootDir: "src", outDir: join(dist, "types"), types: ["react"], typeRoots: [join(here, "node_modules/@types")],
  },
  include: ["src"],
}, null, 2));
execFileSync(join(here, "node_modules/.bin/tsc"), ["-p", join(stage, "tsconfig.json")], { stdio: "inherit", cwd: here });
// O tsc não copia .d.ts escritos à mão: os tipos dos tokens entram aqui.
mkdirSync(join(dist, "types/_tokens"), { recursive: true });
cpSync(join(root, "packages/tokens/dist/index.d.ts"), join(dist, "types/_tokens/index.d.ts"));
rmSync(stage, { recursive: true, force: true });
if (!existsSync(join(dist, "types/index.d.ts"))) throw Error("dist/types/index.d.ts não foi gerado");
console.log("OK: dist/index.js e dist/types gerados.");
