// Publica em <build>/demo as fotos e a mídia de demonstração dos exemplos da documentação.
// O código de exemplo aponta para https://refy.design/demo/<arquivo>, que precisa existir.
// Uso: node scripts/site-demo-assets.mjs <pasta-do-build>   (ex.: dist-site)
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const out = resolve(process.argv[2] ?? "dist-site");
if (!existsSync(out)) throw Error(`${out} não existe; rode o build do site antes.`);
const target = join(out, "demo");
mkdirSync(target, { recursive: true });
let count = 0;
for (const dir of ["src/blocks/photos", "src/blocks/media"]) {
  for (const name of readdirSync(dir)) {
    if (!/\.(webp|jpg|png|mp3|webm)$/.test(name)) continue;
    copyFileSync(join(dir, name), join(target, name));
    count++;
  }
}
console.log(`OK: ${count} arquivos de demonstração em ${target}.`);
