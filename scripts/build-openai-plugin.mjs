// Monta refy-openai-plugin.zip, o pacote que vai ao diretório de plugins do OpenAI (ChatGPT e Codex).
// O diretório só aceita servidor MCP remoto de quem não é parceiro, como o plugin refy: o pacote liga
// https://refy.design/mcp e leva os atalhos do plugin. Listagem e casos de teste da revisão vão no plugin.json.
// Uso: node scripts/build-openai-plugin.mjs [saída]   (padrão: release/refy-openai-plugin.zip)
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const plugin = join(root, "plugins/refy");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const local = JSON.parse(readFileSync(join(plugin, ".codex-plugin/plugin.json"), "utf8"));

export const REMOTE_URL = "https://refy.design/mcp";
export const REMOTE_SKILLS = ["refy-tela", "refy-tema-de-site"];

const REMOTE_README = `# Refy

Liga o servidor MCP remoto do [Refy](https://refy.design) (\`${REMOTE_URL}\`) e dois atalhos:

- **refy-tela**: acha o componente pela necessidade, escreve a tela com a API documentada e confere o código com \`refy_validate\` no fim.
- **refy-tema-de-site**: pega cores, fontes, raios e o jeito de botão, cartão, campo e selo de um site público e gera um tema claro e escuro conferido em contraste AA, com a razão de cada escolha. Não copia a tela.

Sem conta, sem chave e sem instalar nada.

## O que o servidor faz e o que envia

Responde com o catálogo, a API e os tokens do pacote \`@refy-design/web\`. Não lê arquivo da sua máquina: \`refy_validate\` recebe o código no pedido. Só busca na rede em \`refy_theme_extract\`: a página indicada e as folhas de estilo que ela carrega (até 12, inclusive de outros domínios), e recusa endereço interno. Consulta o registro do npm para saber a versão mais nova do pacote. Não guarda pedido nem resposta.

## Privacidade e suporte

[Política de privacidade](https://github.com/viniciuscoimbra/refy-design/blob/main/PRIVACY.md). Dúvida ou defeito: [issues do refy-design](https://github.com/viniciuscoimbra/refy-design/issues). Licença MIT.
`;

export function openaiFiles() {
  const ui = local.interface;
  const manifest = {
    name: local.name,
    version: pkg.version,
    description: "Build screens with the Refy design system: find the component by need, check the code against the real API, and generate light and dark themes, including from a website.",
    author: local.author,
    homepage: local.homepage,
    repository: local.repository,
    license: local.license,
    keywords: local.keywords,
    skills: "./skills/",
    mcpServers: "./.mcp.json",
    // O portal exige interface no nível de cima do manifesto; revisão e publicação ficam em extensions.
    interface: {
      displayName: "Refy",
      shortDescription: "Design system for UI screens",
      longDescription: "Refy finds the right component for each part of a screen, writes the code with the documented API and checks it against the real API before you ship. It also builds light and dark themes with AA contrast from one color or from a public website, with the reason behind each choice. No account, no key, nothing stored.",
      developerName: ui.developerName,
      // O portal recusa "Design"; "Productivity" é a categoria do exemplo do próprio OpenAI.
      category: "Productivity",
      capabilities: ui.capabilities,
      websiteURL: ui.websiteURL,
      supportURL: ui.supportURL,
      privacyPolicyURL: ui.privacyPolicyURL,
      termsOfServiceURL: ui.termsOfServiceURL,
      defaultPrompt: ["Build a login screen with Refy", "Create a Refy theme from a website", "Check this screen against Refy"],
      brandColor: ui.brandColor,
      logo: "./assets/refy.png",
      composerIcon: "./assets/refy.png",
    },
    extensions: {
      "com.openai": {
        review: {
          test_cases: {
            positive: [
              { description: "Find components by need", prompt: "Which Refy components should I use for a list with search and a delete confirmation?", tools_triggered: "refy_search, refy_component", expected_behavior: "Names the Refy families for the list, the search field and the confirmation, with the props each one documents." },
              { description: "Build a screen", prompt: "Build a login screen with email and password using Refy.", tools_triggered: "refy_search, refy_component, refy_validate", expected_behavior: "Writes React code that imports from @refy-design/web, uses only documented props and passes refy_validate." },
              { description: "Check code", prompt: "Check this code with Refy: <Button variant=\"big\">Save</Button>", tools_triggered: "refy_validate", expected_behavior: "Reports that variant=\"big\" is not accepted by Button and lists the accepted values." },
              { description: "Theme from a color", prompt: "Create a Refy theme with primary color #2163ad and round corners.", tools_triggered: "refy_theme_generate, refy_theme_validate", expected_behavior: "Returns a light and dark theme JSON that passes AA contrast, with the reason for each token." },
              { description: "Theme from a website", prompt: "Create a Refy theme from https://refy.design", tools_triggered: "refy_theme_extract, refy_theme_validate", expected_behavior: "Reads the public site, returns a theme with its colors, fonts and radii and the contrast check, without copying the page." },
            ],
            negative: [
              { description: "Not a design question", prompt: "What is the weather in São Paulo today?" },
              { description: "Database query", prompt: "Write a SQL query that counts orders per month." },
              { description: "Translation", prompt: "Translate this paragraph into French: The meeting moved to Friday." },
            ],
          },
          commerce: false,
          commerce_description: "Refy is free and open source. It does not sell products or process payments.",
        },
        publication: {
          release_notes: `Refy ${pkg.version}: component search by need, code check against the real API, and themes from a color or a website.`,
        },
      },
    },
  };
  const files = {
    // O portal procura o manifesto em .agent-plugin/plugin.json; plugin.json na raiz é recusado.
    ".agent-plugin/plugin.json": JSON.stringify(manifest, null, 2) + "\n",
    ".mcp.json": JSON.stringify({ mcpServers: { refy: { type: "streamable-http", url: REMOTE_URL } } }, null, 2) + "\n",
    "README.md": REMOTE_README,
    "assets/refy.png": readFileSync(join(plugin, "assets/refy.png")),
  };
  for (const skill of REMOTE_SKILLS) files[`skills/${skill}/SKILL.md`] = readFileSync(join(plugin, "skills", skill, "SKILL.md"), "utf8");
  return files;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = resolve(process.argv[2] ?? join(root, "release", "refy-openai-plugin.zip"));
  const dir = mkdtempSync(join(tmpdir(), "refy-openai-"));
  try {
    for (const [path, body] of Object.entries(openaiFiles())) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), body);
    }
    mkdirSync(dirname(output), { recursive: true });
    rmSync(output, { force: true });
    // -D: sem entrada de diretório no zip (validadores de pacote recusam).
    execFileSync("zip", ["-r", "-D", "-X", output, "."], { cwd: dir, stdio: "ignore" });
    console.log(`${output}: refy ${pkg.version}, MCP ${REMOTE_URL}, atalhos ${REMOTE_SKILLS.join(", ")}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
