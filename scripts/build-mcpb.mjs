// Monta refy.mcpb, a extensão de um clique do chat do Claude Desktop. O pacote vai dentro como o
// npm o publicaria (npm pack), mais o TypeScript que refy_validate usa; o Claude Desktop traz o
// Node. A lista de ferramentas do manifesto sai do próprio servidor, para não divergir dele.
// Uso: npm run build && node scripts/build-mcpb.mjs [saída]   (padrão: release/refy.mcpb)
import { execFileSync, spawn } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(new URL(import.meta.url).pathname), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const output = resolve(process.argv[2] ?? join(root, "release", "refy.mcpb"));

export function listTools() {
  return new Promise((done, fail) => {
    const child = spawn(process.execPath, [join(root, "tools/refy-agent/mcp.mjs")], { stdio: ["pipe", "pipe", "inherit"] });
    let buffer = "";
    child.stdout.on("data", (d) => {
      buffer += d;
      const i = buffer.indexOf("\n");
      if (i < 0) return;
      child.stdin.end();
      done(JSON.parse(buffer.slice(0, i)).result.tools.map(({ name, description }) => ({ name, description })));
    });
    child.on("error", fail);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) + "\n");
  });
}

const entry = `server/node_modules/${pkg.name}/tools/refy-agent/mcp.mjs`;
export const manifest = (tools) => ({
  manifest_version: "0.2",
  name: "refy",
  display_name: "Refy",
  version: pkg.version,
  description: "Telas com o design system Refy: acha o componente pela necessidade, confere o código contra a API real e gera tema claro e escuro, inclusive a partir de um site.",
  long_description: "Servidor MCP do pacote @refy-design/web. Busca de componente em português, inglês e espanhol, leitura da API, conferência do código da tela, geração e conferência de tema com contraste AA, e tema a partir das cores, fontes e raios de um site. Não escreve no projeto e não chama IA; só refy_theme_extract com url fala com a rede.",
  author: { name: "Vinícius Coimbra", url: "https://github.com/viniciuscoimbra" },
  homepage: "https://refy.design",
  documentation: "https://refy.design/para-ias/mcp",
  repository: { type: "git", url: "https://github.com/viniciuscoimbra/refy-design" },
  license: pkg.license ?? "MIT",
  keywords: ["design-system", "react", "theme", "ui"],
  server: {
    type: "node",
    entry_point: entry,
    mcp_config: { command: "node", args: [`\${__dirname}/${entry}`], env: { REFY_MCP_PROJECT: "${user_config.project}" } },
  },
  user_config: {
    project: {
      type: "directory",
      title: "Pasta do projeto",
      description: "Projeto React que refy_validate e refy_compare podem ler. Sem ela, nenhum arquivo da máquina é lido: a conferência funciona com o código colado na conversa.",
      required: false,
    },
  },
  tools,
  compatibility: { platforms: ["darwin", "win32", "linux"], runtimes: { node: ">=20.0.0" } },
});

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  if (!existsSync(join(root, "dist", "index.d.ts"))) throw Error("Falta dist/: rode npm run build antes.");
  const stage = mkdtempSync(join(tmpdir(), "refy-mcpb-"));
  try {
    const tarball = execFileSync("npm", ["pack", "--ignore-scripts", "--silent", "--pack-destination", stage], { cwd: root, encoding: "utf8" }).trim().split("\n").pop();
    const target = join(stage, "bundle", "server", "node_modules", pkg.name);
    mkdirSync(target, { recursive: true });
    execFileSync("tar", ["xzf", join(stage, tarball), "-C", target, "--strip-components=1"]);
    cpSync(join(root, "node_modules", "typescript"), join(stage, "bundle", "server", "node_modules", "typescript"), { recursive: true });
    writeFileSync(join(stage, "bundle", "manifest.json"), JSON.stringify(manifest(await listTools()), null, 2) + "\n");
    cpSync(join(root, "plugins", "refy", "README.md"), join(stage, "bundle", "README.md"));
    mkdirSync(dirname(output), { recursive: true });
    rmSync(output, { force: true });
    execFileSync("zip", ["-qrD", "-X", output, "."], { cwd: join(stage, "bundle") });
    console.log(output);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}
