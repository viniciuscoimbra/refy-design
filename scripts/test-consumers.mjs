// Jornada de instalação: o pacote sai do npm pack, é instalado como tarball em
// consumidores isolados (React 18 e 19) e os testes consumer-* rodam contra o build
// deles. Sem isso, esses testes pulam: eles exigem um consumidor de verdade, e um
// Storybook renomeado não conta. Rodar depois de build e build-storybook.
// Uso: node scripts/test-consumers.mjs [-- argumentos extras do playwright]
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:net";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const extra = process.argv.slice(2).filter((arg) => arg !== "--");
const root = mkdtempSync(join(tmpdir(), "refy-consumidores-"));
const env = {
  ...process.env,
  REFY_THEME_EXPORT_PATH: join(root, "theme.json"),
  REFY_SITE_THEME_EXPORT_PATH: join(root, "site-theme.json"),
  REFY_BLOCK_EXPORT_DIR: join(root, "block"),
};
const run = (cmd, args, options = {}) => {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", env, ...options });
};
const playwright = (files, url, variable) =>
  run("npx", ["playwright", "test", ...files, "--reporter=list", ...extra], { env: { ...env, [variable]: url } });

// Porta livre dada pelo sistema: numa máquina de uso pessoal (o runner do Mac) qualquer porta fixa
// pode estar ocupada, inclusive por outro preparo rodando ao mesmo tempo.
const freePort = () => new Promise((resolve, reject) => {
  const probe = createServer().once("error", reject).listen(0, "127.0.0.1", () => {
    const { port } = probe.address();
    probe.close(() => resolve(port));
  });
});

async function serve(dir, work) {
  const port = await freePort();
  const url = `http://127.0.0.1:${port}`;
  // A server left over from an earlier run answers on the same port with an old build.
  if (await fetch(url).then(() => true, () => false)) throw new Error(`port ${port} is already in use; stop that server first`);
  // Detached: npx starts vite as a child, and killing only npx leaves vite holding the port.
  const server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: dir, stdio: "ignore", env, detached: true });
  try {
    for (let i = 0; i < 60; i++) {
      try { if ((await fetch(url)).ok) break; } catch { /* ainda subindo */ }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    work(url);
  } finally {
    process.kill(-server.pid);
  }
}

// O tema e o template exportados pelo editor viajam até o consumidor.
run("npx", ["playwright", "test", "tests/consumer-export.spec.ts", "--project=chromium", "--workers=1", "--reporter=list", ...extra.filter((arg) => !arg.startsWith("--project"))]);
run("npm", ["pack", "--pack-destination", root, "--silent"]);
const tarball = join(root, readdirSync(root).find((file) => file.endsWith(".tgz")));
run("node", ["scripts/verify-local-package.mjs", tarball, join(root, "consumers")]);
run("node", ["scripts/prepare-css-catalog.mjs", tarball, join(root, "catalog")]);

const consumerSpecs = ["install", "overlays", "package-features", "adoption", "site-theme"].map((name) => `tests/consumer-${name}.spec.ts`);
for (const major of ["18", "19"]) await serve(join(root, "consumers", major), (url) => playwright(consumerSpecs, url, "REFY_CONSUMER_URL"));
await serve(join(root, "catalog"), (url) => playwright(["tests/consumer-css-catalog.spec.ts"], url, "REFY_CSS_CATALOG_URL"));
console.log(`\nOK: consumidores React 18 e 19 instalados do tarball e testados (${root}).`);
