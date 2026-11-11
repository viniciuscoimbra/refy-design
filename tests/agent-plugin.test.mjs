// Plugin do Refy para Claude e Codex e extensão do Claude Desktop: manifestos coerentes com o
// pacote e com o servidor, e atalhos que só citam ferramentas que existem.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { listTools, manifest } from "../scripts/build-mcpb.mjs";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const pkg = json("package.json");
const plugin = "plugins/refy";

test("manifestos do Claude e do Codex têm o nome e a versão do pacote", () => {
  for (const file of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json"]) {
    const m = json(join(plugin, file));
    assert.equal(m.name, "refy", file);
    assert.equal(m.version, pkg.version, file);
    assert.equal(m.license, pkg.license ?? "MIT", file);
  }
  const codex = json(join(plugin, ".codex-plugin/plugin.json"));
  assert.ok(existsSync(join(plugin, codex.mcpServers)), "mcpServers aponta para arquivo que existe");
  assert.ok(existsSync(join(plugin, codex.skills)), "skills aponta para pasta que existe");
  for (const prompt of codex.interface.defaultPrompt) assert.ok(prompt.length <= 128, prompt);
});

// Os diretórios de plugins do Claude e do OpenAI recusam npx com faixa de versão: o plugin fixa a
// versão exata do pacote, e cada release sobe as duas juntas.
test("o servidor do plugin é o bin refy-mcp do pacote, na versão exata deste plugin", () => {
  const server = json(join(plugin, ".mcp.json")).mcpServers.refy;
  assert.equal(server.command, "npx");
  assert.equal(server.type, "stdio");
  assert.ok(server.args.includes(`--package=${pkg.name}@${pkg.version}`), server.args.join(" "));
  const readme = readFileSync(join(plugin, "README.md"), "utf8");
  for (const [spec] of readme.matchAll(/@refy-design\/web@[^\s`]+/g)) assert.equal(spec, `${pkg.name}@${pkg.version}`, "README cita outra versão");
  assert.equal(server.args.at(-1), "refy-mcp");
  assert.equal(pkg.bin["refy-mcp"], "./tools/refy-agent/mcp.mjs");
});

test("marketplaces do Claude e do Codex apontam para a pasta do plugin", () => {
  const claude = json(".claude-plugin/marketplace.json");
  assert.deepEqual(claude.plugins.map((p) => [p.name, p.source]), [["refy", `./${plugin}`]]);
  const codex = json(".agents/plugins/marketplace.json");
  assert.deepEqual(codex.plugins.map((p) => [p.name, p.source.path, p.policy.installation]), [["refy", `./${plugin}`, "AVAILABLE"]]);
});

test("atalhos têm nome igual à pasta e só citam ferramentas e recursos do servidor", async () => {
  const tools = new Set((await listTools()).map((t) => t.name));
  const mcp = readFileSync("tools/refy-agent/mcp-server.mjs", "utf8");
  const skills = readdirSync(join(plugin, "skills"));
  assert.deepEqual(skills.sort(), ["refy-reproduzir-tela", "refy-tela", "refy-tema-de-site"]);
  for (const skill of skills) {
    const text = readFileSync(join(plugin, "skills", skill, "SKILL.md"), "utf8");
    const front = /^---\nname: ([\w-]+)\ndescription: (.+)\n---\n/.exec(text);
    assert.ok(front, `${skill}: frontmatter com name e description`);
    assert.equal(front[1], skill);
    for (const [name] of text.matchAll(/refy_[a-z_]+/g)) assert.ok(tools.has(name), `${skill} cita ${name}, que o servidor não tem`);
    for (const [uri] of text.matchAll(/refy:\/\/[\w-]+/g)) assert.ok(mcp.includes(`"${uri}"`), `${skill} cita ${uri}, que o servidor não tem`);
  }
});

test("manifesto da extensão do Claude Desktop lista as mesmas ferramentas do servidor", async () => {
  const tools = await listTools();
  const m = manifest(tools);
  assert.equal(m.version, pkg.version);
  assert.deepEqual(m.tools.map((t) => t.name), tools.map((t) => t.name));
  assert.ok(m.server.entry_point.endsWith("tools/refy-agent/mcp.mjs"));
  assert.equal(m.server.mcp_config.args[0], `\${__dirname}/${m.server.entry_point}`);
});

test("listagem nos diretórios: ícone quadrado, privacidade, termos e suporte em https", () => {
  const ui = json(join(plugin, ".codex-plugin/plugin.json")).interface;
  for (const key of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) assert.match(ui[key], /^https:\/\//, key);
  assert.ok(existsSync("PRIVACY.md"), "PRIVACY.md na raiz, para onde privacyPolicyURL aponta");
  for (const key of ["logo", "composerIcon"]) {
    const png = readFileSync(join(plugin, ui[key]));
    const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.ok(w === h && w >= 48, `${key}: ${w}x${h}`);
  }
  const readme = readFileSync(join(plugin, "README.md"), "utf8").replace(/```[\s\S]*?```/g, "");
  assert.ok(readme.split(/\s+/).length >= 40, "README com 40 palavras ou mais fora dos blocos de código");
});

test("pacote do diretório do OpenAI: MCP remoto e atalhos que só citam o que o remoto tem", async () => {
  const { openaiFiles, REMOTE_URL } = await import("../scripts/build-openai-plugin.mjs");
  const files = openaiFiles();
  assert.deepEqual(JSON.parse(files["mcp.json"]).mcpServers.refy, { type: "streamable-http", url: REMOTE_URL });
  const m = JSON.parse(files["plugin.json"]);
  assert.equal(m.version, pkg.version);
  const ui = m.extensions["com.openai"].interface;
  assert.ok(ui.displayName.length <= 30 && ui.shortDescription.length <= 30, "nome e descrição curta até 30");
  assert.ok(ui.longDescription.length <= 4000);
  const cases = m.extensions["com.openai"].review.test_cases;
  assert.equal(cases.positive.length, 5);
  assert.equal(cases.negative.length, 3);
  const remote = new Set((await listTools()).map((t) => t.name).filter((n) => n !== "refy_compare"));
  for (const c of cases.positive) for (const name of c.tools_triggered.split(", ")) assert.ok(remote.has(name), name);
  for (const [path, body] of Object.entries(files)) {
    if (!path.startsWith("skills/")) continue;
    for (const [name] of String(body).matchAll(/refy_[a-z_]+/g)) assert.ok(remote.has(name), `${path} cita ${name}, que o remoto não tem`);
    assert.ok(!String(body).includes("`files`"), `${path} manda passar arquivo, que o remoto não lê`);
    assert.ok(!/Playwright do projeto|`browser`/.test(String(body)), `${path} promete navegador, que o remoto não tem`);
  }
  assert.ok(files["README.md"].includes(REMOTE_URL) && !/npx|refy_compare/.test(files["README.md"]), "README do pacote descreve o remoto");
});
