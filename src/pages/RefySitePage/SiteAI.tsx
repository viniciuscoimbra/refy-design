import type { ReactNode } from "react";
import { CodeBlock } from "../../index";
import styles from "./RefySitePage.module.css";
import type { Locale } from "./i18n";
import { useSiteLocale } from "./i18n";
import { packageName, packageVersion } from "./packageRelease";
import { GuidePage, docGroupLabel } from "./SiteDocs";
import type { DocPage, GuideLink } from "./SiteDocs";

// Para IAs: tudo que um agente de código usa para montar tela com o refy mora aqui (pedido de 09/11:
// o MCP estava escondido nas Docs). A visão geral é /para-ias; MCP, Plugin e CLI têm página própria.

export type AiTopic = "mcp" | "plugin" | "cli";
export const aiTopics: AiTopic[] = ["mcp", "plugin", "cli"];
export const aiHref = (topic?: AiTopic) => (topic ? `/para-ias/${topic}` : "/para-ias");

const mcpAdd = `claude mcp add refy -- npx --no-install refy-mcp`;
const mcpAddPinned = `claude mcp add refy -- npx -y -p ${packageName}@${packageVersion} refy-mcp`;
const mcpJson = `{
  "mcpServers": {
    "refy": {
      "command": "npx",
      "args": ["-y", "-p", "${packageName}@${packageVersion}", "refy-mcp"]
    }
  }
}`;
const mcpRemote = "https://refy.design/mcp";
const mcpArgs = `["-y", "-p", "${packageName}@${packageVersion}", "refy-mcp"]`;
const codexAdd = `codex mcp add refy -- npx -y -p ${packageName}@${packageVersion} refy-mcp`;
const codexToml = `[mcp_servers.refy]
command = "npx"
args = ${mcpArgs}`;
const vscodeJson = `{
  "servers": {
    "refy": {
      "type": "stdio",
      "command": "npx",
      "args": ${mcpArgs}
    }
  }
}`;

interface McpText {
  description: string;
  sections: Record<"web" | "requisitos" | "claude-code" | "codex" | "kiro" | "outros" | "ferramentas" | "testar" | "terminal" | "limites", string>;
  web: ReactNode; webClaude: ReactNode; webChatgpt: ReactNode; webGemini: ReactNode; webLimit: ReactNode;
  requires: ReactNode; withPackage: ReactNode; pinned: ReactNode; others: ReactNode; envNote: ReactNode;
  codex: ReactNode; codexFile: ReactNode; kiro: ReactNode; vscode: ReactNode;
  head: [string, string]; tools: Array<[string, string]>; resources: ReactNode;
  tryIt: ReactNode; prompt: string; terminal: ReactNode; limits: ReactNode[];
}
const mcpText: Record<Locale, McpText> = {
  pt: {
    description: "O pacote web traz um servidor MCP. Com ele, o agente acha o componente pela necessidade, lê a API, confere o código e gera tema sem sair da conversa.",
    sections: { web: "Claude, ChatGPT e Gemini na web", requisitos: "Requisitos", "claude-code": "Claude Code", codex: "Codex", kiro: "Kiro", outros: "Cursor, Windsurf e VS Code", ferramentas: "Ferramentas", testar: "Testar", terminal: "Sem MCP", limites: "Limites" },
    web: <>No chat do navegador ou do celular, conecte o servidor remoto. Não precisa instalar nada nem fazer login:</>,
    webClaude: <><strong>Claude.</strong> Em Configurações, Conectores, adicione um conector personalizado com o endereço acima e sem autenticação. Vale em todos os planos; no gratuito, cabe um conector personalizado.</>,
    webChatgpt: <><strong>ChatGPT.</strong> Ative o modo de desenvolvedor nas configurações (planos Plus, Pro, Business, Enterprise e Edu, no site), crie um app com o endereço acima e autenticação nenhuma. Na conversa, ligue o refy pelo botão +.</>,
    webGemini: <><strong>Gemini.</strong> Em gemini.google.com, Configurações, Apps conectados, adicione um app personalizado com o endereço acima. Por enquanto o Google libera isso só para conta pessoal nos Estados Unidos, em inglês.</>,
    webLimit: <>O servidor remoto não lê arquivos da sua máquina: <code>refy_validate</code> recebe o código na conversa, e <code>refy_compare</code> só existe no servidor local.</>,
    requires: <>Node e <code>{packageName}</code> {packageVersion} ou mais. A validação usa o TypeScript do projeto (<code>npm install --save-dev typescript</code>).</>,
    withPackage: <>Com o pacote instalado no projeto, na pasta dele:</>,
    pinned: <>Sem o pacote no projeto, o npx baixa a versão indicada. Use a mesma versão do projeto, para o catálogo e a validação baterem:</>,
    others: <>Cursor (<code>.cursor/mcp.json</code>), Windsurf e outros clientes que leem <code>mcpServers</code>:</>,
    codex: <>No terminal, com o Codex instalado:</>,
    codexFile: <>Ou direto no arquivo de configuração do Codex, <code>~/.codex/config.toml</code>:</>,
    kiro: <>O Kiro lê <code>mcpServers</code> em <code>.kiro/settings/mcp.json</code>, na pasta do projeto, ou em <code>~/.kiro/settings/mcp.json</code>, para todos os projetos:</>,
    vscode: <>O VS Code usa a chave <code>servers</code>, em <code>.vscode/mcp.json</code>:</>,
    envNote: <>O servidor fala por stdio. <code>REFY_MCP_PROJECT</code> muda a pasta que <code>refy_validate</code> lê; sem ela, vale a pasta onde o cliente abriu o servidor.</>,
    head: ["Ferramenta", "O que faz"],
    tools: [
      ["refy_search", "Acha a família pela necessidade escrita em português, inglês ou espanhol, com o motivo e o import."],
      ["refy_component", "Lê a ficha: props com tipo e padrão, exemplos, como usar, alternativas e teclado."],
      ["refy_collections", "Lista as coleções (core e especializadas) com os membros."],
      ["refy_validate", "Confere o código: prop obrigatória ausente, valor fora da união, controle HTML cru, cor ou fonte literal, import interno."],
      ["refy_theme_generate", "Gera tema claro e escuro a partir de uma cor, com contraste AA."],
      ["refy_theme_validate", "Confere um tema: tokens, referências e contraste AA."],
      ["refy_theme_extract", "Tira tema claro e escuro das cores, fontes e raios de um site, com a razão de cada escolha e contraste AA conferido."],
      ["refy_compare", "Compara a captura do original com a da tela do refy e mostra onde diferem."],
    ],
    resources: <>Recursos: <code>refy://instructions</code>, <code>refy://control-choices</code>, <code>refy://catalog</code> e <code>refy://component/{"{name}"}</code>.</>,
    tryIt: <>Abra o agente na pasta do projeto e peça uma tela. Ele chama <code>refy_search</code> e <code>refy_component</code> antes de escrever e <code>refy_validate</code> depois.</>,
    prompt: "Use o refy para montar uma tela de login com e-mail e senha. Confira o código com refy_validate.",
    terminal: <>As mesmas consultas rodam no terminal, para agentes sem MCP e para a CI: veja <a href="/para-ias/cli">CLI</a>.</>,
    limits: [
      <>Lê só o que vem no pacote instalado e o que o agente manda. Não escreve no projeto, não acessa a rede e não chama modelo de IA.</>,
      <>A validação não confere valor vindo de variável, spread ou expressão. Teste de fluxo e revisão visual continuam com você.</>,
    ],
  },
  en: {
    description: "The web package ships an MCP server. With it, your agent finds the component by need, reads the API, checks the code and generates themes without leaving the chat.",
    sections: { web: "Claude, ChatGPT and Gemini on the web", requisitos: "Requirements", "claude-code": "Claude Code", codex: "Codex", kiro: "Kiro", outros: "Cursor, Windsurf and VS Code", ferramentas: "Tools", testar: "Try it", terminal: "Without MCP", limites: "Limits" },
    web: <>In the browser or phone chat, connect the remote server. Nothing to install and no login:</>,
    webClaude: <><strong>Claude.</strong> In Settings, Connectors, add a custom connector with the address above and no authentication. Every plan has it; the free plan fits one custom connector.</>,
    webChatgpt: <><strong>ChatGPT.</strong> Turn on developer mode in settings (Plus, Pro, Business, Enterprise and Edu plans, on the website), create an app with the address above and no authentication. In the chat, turn refy on from the + button.</>,
    webGemini: <><strong>Gemini.</strong> On gemini.google.com, Settings, Connected apps, add a custom app with the address above. For now Google offers it only to personal accounts in the United States, in English.</>,
    webLimit: <>The remote server does not read files on your machine: <code>refy_validate</code> takes the code from the chat, and <code>refy_compare</code> exists only in the local server.</>,
    requires: <>Node and <code>{packageName}</code> {packageVersion} or later. Validation uses the project's TypeScript (<code>npm install --save-dev typescript</code>).</>,
    withPackage: <>With the package installed in the project, from its folder:</>,
    pinned: <>Without the package in the project, npx downloads the given version. Use the project's version, so the catalog and the validation match it:</>,
    others: <>Cursor (<code>.cursor/mcp.json</code>), Windsurf and other clients that read <code>mcpServers</code>:</>,
    codex: <>In the terminal, with Codex installed:</>,
    codexFile: <>Or straight in the Codex config file, <code>~/.codex/config.toml</code>:</>,
    kiro: <>Kiro reads <code>mcpServers</code> from <code>.kiro/settings/mcp.json</code>, in the project folder, or from <code>~/.kiro/settings/mcp.json</code>, for every project:</>,
    vscode: <>VS Code uses the <code>servers</code> key, in <code>.vscode/mcp.json</code>:</>,
    envNote: <>The server talks over stdio. <code>REFY_MCP_PROJECT</code> changes the folder <code>refy_validate</code> reads; without it, the folder where the client started the server is used.</>,
    head: ["Tool", "What it does"],
    tools: [
      ["refy_search", "Finds the family from a need written in English, Portuguese or Spanish, with the reason and the import."],
      ["refy_component", "Reads the component page: props with type and default, examples, usage, alternatives and keyboard."],
      ["refy_collections", "Lists the collections (core and specialized) with their members."],
      ["refy_validate", "Checks the code: missing required prop, value outside the union, raw HTML control, literal color or font, internal import."],
      ["refy_theme_generate", "Generates light and dark themes from one color, with AA contrast."],
      ["refy_theme_validate", "Checks a theme: tokens, references and AA contrast."],
      ["refy_theme_extract", "Builds light and dark themes from a site's colors, fonts and radii, with the reason for each choice and AA contrast checked."],
      ["refy_compare", "Compares a capture of the original with the refy screen and shows where they differ."],
    ],
    resources: <>Resources: <code>refy://instructions</code>, <code>refy://control-choices</code>, <code>refy://catalog</code> and <code>refy://component/{"{name}"}</code>.</>,
    tryIt: <>Open the agent in the project folder and ask for a screen. It calls <code>refy_search</code> and <code>refy_component</code> before writing and <code>refy_validate</code> after.</>,
    prompt: "Use refy to build a login screen with email and password. Check the code with refy_validate.",
    terminal: <>The same lookups run in the terminal, for agents without MCP and for CI: see <a href="/para-ias/cli">CLI</a>.</>,
    limits: [
      <>It reads only what ships in the installed package and what the agent sends. It does not write to the project, does not use the network and does not call an AI model.</>,
      <>Validation does not check values coming from a variable, spread or expression. Flow tests and visual review are still on you.</>,
    ],
  },
  es: {
    description: "El paquete web trae un servidor MCP. Con él, tu agente encuentra el componente por necesidad, lee la API, revisa el código y genera temas sin salir de la conversación.",
    sections: { web: "Claude, ChatGPT y Gemini en la web", requisitos: "Requisitos", "claude-code": "Claude Code", codex: "Codex", kiro: "Kiro", outros: "Cursor, Windsurf y VS Code", ferramentas: "Herramientas", testar: "Probar", terminal: "Sin MCP", limites: "Límites" },
    web: <>En el chat del navegador o del celular, conecta el servidor remoto. No hay que instalar nada ni iniciar sesión:</>,
    webClaude: <><strong>Claude.</strong> En Configuración, Conectores, agrega un conector personalizado con la dirección de arriba y sin autenticación. Está en todos los planes; en el gratuito cabe un conector personalizado.</>,
    webChatgpt: <><strong>ChatGPT.</strong> Activa el modo de desarrollador en la configuración (planes Plus, Pro, Business, Enterprise y Edu, en el sitio web), crea una app con la dirección de arriba y sin autenticación. En la conversación, activa refy con el botón +.</>,
    webGemini: <><strong>Gemini.</strong> En gemini.google.com, Configuración, Apps conectadas, agrega una app personalizada con la dirección de arriba. Por ahora Google la ofrece solo a cuentas personales en Estados Unidos, en inglés.</>,
    webLimit: <>El servidor remoto no lee archivos de tu máquina: <code>refy_validate</code> recibe el código desde la conversación, y <code>refy_compare</code> existe solo en el servidor local.</>,
    requires: <>Node y <code>{packageName}</code> {packageVersion} o superior. La validación usa el TypeScript del proyecto (<code>npm install --save-dev typescript</code>).</>,
    withPackage: <>Con el paquete instalado en el proyecto, desde su carpeta:</>,
    pinned: <>Sin el paquete en el proyecto, npx descarga la versión indicada. Usa la misma versión del proyecto, para que el catálogo y la validación coincidan:</>,
    others: <>Cursor (<code>.cursor/mcp.json</code>), Windsurf y otros clientes que leen <code>mcpServers</code>:</>,
    codex: <>En la terminal, con Codex instalado:</>,
    codexFile: <>O directo en el archivo de configuración de Codex, <code>~/.codex/config.toml</code>:</>,
    kiro: <>Kiro lee <code>mcpServers</code> en <code>.kiro/settings/mcp.json</code>, en la carpeta del proyecto, o en <code>~/.kiro/settings/mcp.json</code>, para todos los proyectos:</>,
    vscode: <>VS Code usa la clave <code>servers</code>, en <code>.vscode/mcp.json</code>:</>,
    envNote: <>El servidor habla por stdio. <code>REFY_MCP_PROJECT</code> cambia la carpeta que lee <code>refy_validate</code>; sin ella, vale la carpeta donde el cliente abrió el servidor.</>,
    head: ["Herramienta", "Qué hace"],
    tools: [
      ["refy_search", "Encuentra la familia por la necesidad escrita en español, inglés o portugués, con el motivo y el import."],
      ["refy_component", "Lee la ficha: props con tipo y valor por defecto, ejemplos, uso, alternativas y teclado."],
      ["refy_collections", "Lista las colecciones (core y especializadas) con sus miembros."],
      ["refy_validate", "Revisa el código: prop obligatoria ausente, valor fuera de la unión, control HTML crudo, color o fuente literal, import interno."],
      ["refy_theme_generate", "Genera tema claro y oscuro a partir de un color, con contraste AA."],
      ["refy_theme_validate", "Revisa un tema: tokens, referencias y contraste AA."],
      ["refy_theme_extract", "Saca tema claro y oscuro de los colores, fuentes y radios de un sitio, con el motivo de cada elección y contraste AA revisado."],
      ["refy_compare", "Compara la captura del original con la pantalla de refy y muestra dónde difieren."],
    ],
    resources: <>Recursos: <code>refy://instructions</code>, <code>refy://control-choices</code>, <code>refy://catalog</code> y <code>refy://component/{"{name}"}</code>.</>,
    tryIt: <>Abre el agente en la carpeta del proyecto y pide una pantalla. Llama a <code>refy_search</code> y <code>refy_component</code> antes de escribir y a <code>refy_validate</code> después.</>,
    prompt: "Usa refy para armar una pantalla de inicio de sesión con correo y contraseña. Revisa el código con refy_validate.",
    terminal: <>Las mismas consultas funcionan en la terminal, para agentes sin MCP y para la CI: mira <a href="/para-ias/cli">CLI</a>.</>,
    limits: [
      <>Lee solo lo que viene en el paquete instalado y lo que manda el agente. No escribe en el proyecto, no usa la red y no llama a un modelo de IA.</>,
      <>La validación no revisa valores que vienen de una variable, spread o expresión. Las pruebas de flujo y la revisión visual siguen a tu cargo.</>,
    ],
  },
};

function mcpPage(locale: Locale): DocPage {
  const text = mcpText[locale];
  return {
    label: "MCP", group: "ai", description: text.description,
    sections: Object.entries(text.sections),
    body: (<>
      <section id="web">
        <h2>{text.sections.web}</h2>
        <p>{text.web}</p>
        <CodeBlock label="URL" code={mcpRemote} wrap />
        <p>{text.webClaude}</p>
        <p>{text.webChatgpt}</p>
        <p>{text.webGemini}</p>
        <p>{text.webLimit}</p>
      </section>
      <section id="requisitos">
        <h2>{text.sections.requisitos}</h2>
        <p>{text.requires}</p>
      </section>
      <section id="claude-code">
        <h2>{text.sections["claude-code"]}</h2>
        <p>{text.withPackage}</p>
        <CodeBlock label="Terminal" language="bash" code={mcpAdd} wrap />
        <p>{text.pinned}</p>
        <CodeBlock label="Terminal" language="bash" code={mcpAddPinned} wrap />
      </section>
      <section id="codex">
        <h2>{text.sections.codex}</h2>
        <p>{text.codex}</p>
        <CodeBlock label="Terminal" language="bash" code={codexAdd} wrap />
        <p>{text.codexFile}</p>
        <CodeBlock label="~/.codex/config.toml" language="toml" code={codexToml} wrap />
      </section>
      <section id="kiro">
        <h2>{text.sections.kiro}</h2>
        <p>{text.kiro}</p>
        <CodeBlock label=".kiro/settings/mcp.json" language="json" code={mcpJson} wrap />
      </section>
      <section id="outros">
        <h2>{text.sections.outros}</h2>
        <p>{text.others}</p>
        <CodeBlock label="mcp.json" language="json" code={mcpJson} wrap />
        <p>{text.vscode}</p>
        <CodeBlock label=".vscode/mcp.json" language="json" code={vscodeJson} wrap />
        <p>{text.envNote}</p>
      </section>
      <section id="ferramentas">
        <h2>{text.sections.ferramentas}</h2>
        <table>
          <thead><tr><th>{text.head[0]}</th><th>{text.head[1]}</th></tr></thead>
          <tbody>{text.tools.map(([name, what]) => <tr key={name}><td className={styles.toolName}><code>{name}</code></td><td>{what}</td></tr>)}</tbody>
        </table>
        <p>{text.resources}</p>
      </section>
      <section id="testar">
        <h2>{text.sections.testar}</h2>
        <p>{text.tryIt}</p>
        <blockquote><p>{text.prompt}</p></blockquote>
      </section>
      <section id="terminal">
        <h2>{text.sections.terminal}</h2>
        <p>{text.terminal}</p>
      </section>
      <section id="limites">
        <h2>{text.sections.limites}</h2>
        {text.limits.map((item, index) => <p key={index}>{item}</p>)}
      </section>
    </>),
  };
}


const pluginClaude = `/plugin marketplace add viniciuscoimbra/refy-design
/plugin install refy@refy`;
const pluginCodex = `codex plugin marketplace add viniciuscoimbra/refy-design
codex plugin add refy@refy`;

interface PluginText {
  description: string;
  sections: Record<"o-que-traz" | "claude" | "desktop" | "codex" | "requisitos" | "limites", string>;
  intro: ReactNode; skills: Array<[string, string]>; head: [string, string];
  claude: ReactNode; claudeApp: ReactNode; desktop: ReactNode; codex: ReactNode; codexApp: ReactNode; requires: ReactNode; limits: ReactNode;
}
const pluginText: Record<Locale, PluginText> = {
  pt: {
    description: "Liga o servidor MCP do refy e três atalhos ao Claude e ao Codex, instalado pelo repositório público.",
    sections: { "o-que-traz": "O que traz", claude: "Claude Code e app do Claude", desktop: "Claude Desktop", codex: "Codex", requisitos: "Requisitos", limites: "Limites" },
    intro: <>O plugin instala o <a href="/para-ias/mcp">servidor MCP</a> e estes atalhos:</>,
    head: ["Atalho", "O que faz"],
    skills: [
      ["refy-tela", "Acha o componente pela necessidade, escreve a tela com a API documentada e roda a conferência do refy no fim."],
      ["refy-tema-de-site", "Pega as cores, fontes, raios e o jeito de botão, cartão, campo e selo de um site e gera tema claro e escuro com contraste AA, com a razão de cada escolha. Não copia a tela."],
      ["refy-reproduzir-tela", "Só quando você pede: reproduz a tela igual ao original com componentes do refy e extensões, e compara as duas capturas até bater."],
    ],
    claude: <>No Claude Code e no Cowork:</>,
    claudeApp: <>No app do Claude, adicione o mesmo repositório como marketplace na tela de plugins.</>,
    desktop: <>No chat do Claude Desktop, baixe <code>refy.mcpb</code> do release mais recente e abra com dois cliques. O Claude Desktop já traz o Node.</>,
    codex: <>No terminal do Codex:</>,
    codexApp: <>No app do Codex, instale <strong>Refy</strong> na lista de plugins depois de adicionar o marketplace.</>,
    requires: <>Node 20 ou mais. O servidor roda na sua máquina com <code>npx</code>, sem conta e sem chave. Chega com o <code>{packageName}</code> {packageVersion}.</>,
    limits: <>O servidor lê o catálogo e os tokens que vêm no pacote. Não escreve no projeto e não chama modelo de IA. Só <code>refy_theme_extract</code> com <code>url</code> acessa a rede, e só o endereço público que você passou.</>,
  },
  en: {
    description: "Connects the refy MCP server and three shortcuts to Claude and Codex, installed from the public repository.",
    sections: { "o-que-traz": "What it adds", claude: "Claude Code and the Claude app", desktop: "Claude Desktop", codex: "Codex", requisitos: "Requirements", limites: "Limits" },
    intro: <>The plugin installs the <a href="/para-ias/mcp">MCP server</a> and these shortcuts:</>,
    head: ["Shortcut", "What it does"],
    skills: [
      ["refy-tela", "Finds the component by need, writes the screen with the documented API and runs the refy check at the end."],
      ["refy-tema-de-site", "Takes a site's colors, fonts, radii and the shape of its buttons, cards, fields and badges, and builds light and dark themes with AA contrast and the reason for each choice. It does not copy the screen."],
      ["refy-reproduzir-tela", "Only when you ask: rebuilds a screen exactly like the original with refy components and extensions, and compares both captures until they match."],
    ],
    claude: <>In Claude Code and Cowork:</>,
    claudeApp: <>In the Claude app, add the same repository as a marketplace on the plugins screen.</>,
    desktop: <>In Claude Desktop chat, download <code>refy.mcpb</code> from the latest release and double-click it. Claude Desktop already ships Node.</>,
    codex: <>In the Codex terminal:</>,
    codexApp: <>In the Codex app, install <strong>Refy</strong> from the plugin list after adding the marketplace.</>,
    requires: <>Node 20 or later. The server runs on your machine with <code>npx</code>, no account and no key. Ships with <code>{packageName}</code> {packageVersion}.</>,
    limits: <>The server reads the catalog and tokens that ship in the package. It does not write to the project and does not call an AI model. Only <code>refy_theme_extract</code> with <code>url</code> uses the network, and only for the public address you gave it.</>,
  },
  es: {
    description: "Conecta el servidor MCP de refy y tres atajos a Claude y a Codex, instalado desde el repositorio público.",
    sections: { "o-que-traz": "Qué trae", claude: "Claude Code y la app de Claude", desktop: "Claude Desktop", codex: "Codex", requisitos: "Requisitos", limites: "Límites" },
    intro: <>El plugin instala el <a href="/para-ias/mcp">servidor MCP</a> y estos atajos:</>,
    head: ["Atajo", "Qué hace"],
    skills: [
      ["refy-tela", "Encuentra el componente por necesidad, escribe la pantalla con la API documentada y ejecuta la revisión de refy al final."],
      ["refy-tema-de-site", "Toma los colores, fuentes, radios y la forma de botones, tarjetas, campos y etiquetas de un sitio, y genera tema claro y oscuro con contraste AA y el motivo de cada elección. No copia la pantalla."],
      ["refy-reproduzir-tela", "Solo cuando lo pides: reproduce la pantalla igual al original con componentes de refy y extensiones, y compara las dos capturas hasta que coincidan."],
    ],
    claude: <>En Claude Code y Cowork:</>,
    claudeApp: <>En la app de Claude, agrega el mismo repositorio como marketplace en la pantalla de plugins.</>,
    desktop: <>En el chat de Claude Desktop, descarga <code>refy.mcpb</code> del release más reciente y ábrelo con doble clic. Claude Desktop ya trae Node.</>,
    codex: <>En la terminal de Codex:</>,
    codexApp: <>En la app de Codex, instala <strong>Refy</strong> en la lista de plugins después de agregar el marketplace.</>,
    requires: <>Node 20 o superior. El servidor corre en tu máquina con <code>npx</code>, sin cuenta y sin clave. Llega con <code>{packageName}</code> {packageVersion}.</>,
    limits: <>El servidor lee el catálogo y los tokens que vienen en el paquete. No escribe en el proyecto y no llama a un modelo de IA. Solo <code>refy_theme_extract</code> con <code>url</code> usa la red, y solo con la dirección pública que le diste.</>,
  },
};

function pluginPage(locale: Locale): DocPage {
  const text = pluginText[locale];
  return {
    label: "Plugin", group: "ai", description: text.description,
    sections: Object.entries(text.sections),
    body: (<>
      <section id="o-que-traz">
        <h2>{text.sections["o-que-traz"]}</h2>
        <p>{text.intro}</p>
        <table>
          <thead><tr><th>{text.head[0]}</th><th>{text.head[1]}</th></tr></thead>
          <tbody>{text.skills.map(([name, what]) => <tr key={name}><td className={styles.toolName}><code>{name}</code></td><td>{what}</td></tr>)}</tbody>
        </table>
      </section>
      <section id="claude">
        <h2>{text.sections.claude}</h2>
        <p>{text.claude}</p>
        <CodeBlock label="Claude Code" language="bash" code={pluginClaude} wrap />
        <p>{text.claudeApp}</p>
      </section>
      <section id="desktop">
        <h2>{text.sections.desktop}</h2>
        <p>{text.desktop}</p>
      </section>
      <section id="codex">
        <h2>{text.sections.codex}</h2>
        <p>{text.codex}</p>
        <CodeBlock label="Terminal" language="bash" code={pluginCodex} wrap />
        <p>{text.codexApp}</p>
      </section>
      <section id="requisitos">
        <h2>{text.sections.requisitos}</h2>
        <p>{text.requires}</p>
      </section>
      <section id="limites">
        <h2>{text.sections.limites}</h2>
        <p>{text.limits}</p>
      </section>
    </>),
  };
}

const cliCode: Record<Locale, string> = {
  pt: "npm exec --offline -- refy-agent catalog formulário\nnpm exec --offline -- refy-agent component Input\nnpm exec --offline -- refy-agent inspect src/Tela.tsx\nnpm exec --offline -- refy-agent check src/Tela.tsx src/tela.css",
  en: "npm exec --offline -- refy-agent catalog form\nnpm exec --offline -- refy-agent component Input\nnpm exec --offline -- refy-agent inspect src/Screen.tsx\nnpm exec --offline -- refy-agent check src/Screen.tsx src/screen.css",
  es: "npm exec --offline -- refy-agent catalog formulario\nnpm exec --offline -- refy-agent component Input\nnpm exec --offline -- refy-agent inspect src/Pantalla.tsx\nnpm exec --offline -- refy-agent check src/Pantalla.tsx src/pantalla.css",
};
interface CliText {
  description: string;
  sections: Record<"comandos" | "exemplo" | "ci" | "limites", string>;
  intro: ReactNode; head: [string, string]; commands: Array<[string, string]>; ci: ReactNode; limits: ReactNode;
}
const cliText: Record<Locale, CliText> = {
  pt: {
    description: "refy-agent vem junto com o pacote web e faz no terminal as mesmas consultas do MCP, para agente sem MCP e para a CI.",
    sections: { comandos: "Comandos", exemplo: "Exemplo", ci: "Na CI", limites: "Limites" },
    intro: <>Com <code>{packageName}</code> instalado, rode na pasta do projeto. <code>catalog</code> e <code>component</code> só precisam do Node; <code>inspect</code> e <code>check</code> usam o TypeScript do projeto.</>,
    head: ["Comando", "O que faz"],
    commands: [
      ["catalog [busca]", "Lista as famílias que atendem a necessidade escrita em português, inglês ou espanhol."],
      ["collections [id]", "Lista as coleções e os componentes de cada uma."],
      ["component <Nome>", "Mostra a API da família: props, valores aceitos, exemplos e alternativas."],
      ["inspect [arquivos]", "Lê a tela e aponta controle HTML cru, cor e fonte literais e o componente do refy que serve no lugar."],
      ["check [arquivos]", "Confere o uso do refy e sai com erro quando acha problema."],
      ["init", "Instala o pacote e liga tokens e tema na entrada do app, mostrando a diferença de cada arquivo que muda."],
    ],
    ci: <><code>check</code> sem argumento lê os arquivos de <code>include</code> em <code>refy-agent.config.json</code>. Rode no CI como qualquer outro teste: código de saída diferente de zero reprova.</>,
    limits: <>Só <code>init</code> escreve no projeto e acessa a rede (pelo <code>npm install</code>; <code>--offline</code> proíbe). Os outros comandos leem o pacote instalado e os arquivos que você passa.</>,
  },
  en: {
    description: "refy-agent ships with the web package and runs the same lookups as the MCP server in the terminal, for agents without MCP and for CI.",
    sections: { comandos: "Commands", exemplo: "Example", ci: "In CI", limites: "Limits" },
    intro: <>With <code>{packageName}</code> installed, run it from the project folder. <code>catalog</code> and <code>component</code> need only Node; <code>inspect</code> and <code>check</code> use the project's TypeScript.</>,
    head: ["Command", "What it does"],
    commands: [
      ["catalog [query]", "Lists the families that fit a need written in English, Portuguese or Spanish."],
      ["collections [id]", "Lists the collections and the components in each one."],
      ["component <Name>", "Shows the family API: props, accepted values, examples and alternatives."],
      ["inspect [files]", "Reads the screen and points out raw HTML controls, literal colors and fonts, and the refy component to use instead."],
      ["check [files]", "Checks how refy is used and exits with an error when it finds a problem."],
      ["init", "Installs the package and wires tokens and theme into the app entry, showing the diff of every file it changes."],
    ],
    ci: <><code>check</code> with no argument reads the files in <code>include</code> from <code>refy-agent.config.json</code>. Run it in CI like any other test: a non-zero exit code fails the build.</>,
    limits: <>Only <code>init</code> writes to the project and uses the network (through <code>npm install</code>; <code>--offline</code> forbids it). The other commands read the installed package and the files you pass.</>,
  },
  es: {
    description: "refy-agent viene con el paquete web y hace en la terminal las mismas consultas que el MCP, para agentes sin MCP y para la CI.",
    sections: { comandos: "Comandos", exemplo: "Ejemplo", ci: "En la CI", limites: "Límites" },
    intro: <>Con <code>{packageName}</code> instalado, ejecútalo en la carpeta del proyecto. <code>catalog</code> y <code>component</code> solo necesitan Node; <code>inspect</code> y <code>check</code> usan el TypeScript del proyecto.</>,
    head: ["Comando", "Qué hace"],
    commands: [
      ["catalog [búsqueda]", "Lista las familias que sirven para la necesidad escrita en español, inglés o portugués."],
      ["collections [id]", "Lista las colecciones y los componentes de cada una."],
      ["component <Nombre>", "Muestra la API de la familia: props, valores aceptados, ejemplos y alternativas."],
      ["inspect [archivos]", "Lee la pantalla y señala controles HTML crudos, colores y fuentes literales y el componente de refy que va en su lugar."],
      ["check [archivos]", "Revisa el uso de refy y sale con error cuando encuentra un problema."],
      ["init", "Instala el paquete y conecta tokens y tema en la entrada de la app, mostrando la diferencia de cada archivo que cambia."],
    ],
    ci: <><code>check</code> sin argumento lee los archivos de <code>include</code> en <code>refy-agent.config.json</code>. Ejecútalo en la CI como cualquier otra prueba: un código de salida distinto de cero reprueba.</>,
    limits: <>Solo <code>init</code> escribe en el proyecto y usa la red (con <code>npm install</code>; <code>--offline</code> lo prohíbe). Los demás comandos leen el paquete instalado y los archivos que pasas.</>,
  },
};

function cliPage(locale: Locale): DocPage {
  const text = cliText[locale];
  return {
    label: "CLI", group: "ai", description: text.description,
    sections: Object.entries(text.sections),
    body: (<>
      <section id="comandos">
        <h2>{text.sections.comandos}</h2>
        <p>{text.intro}</p>
        <table>
          <thead><tr><th>{text.head[0]}</th><th>{text.head[1]}</th></tr></thead>
          <tbody>{text.commands.map(([name, what]) => <tr key={name}><td className={styles.toolName}><code>{name}</code></td><td>{what}</td></tr>)}</tbody>
        </table>
      </section>
      <section id="exemplo">
        <h2>{text.sections.exemplo}</h2>
        <CodeBlock label="Terminal" language="bash" code={cliCode[locale]} />
      </section>
      <section id="ci">
        <h2>{text.sections.ci}</h2>
        <p>{text.ci}</p>
      </section>
      <section id="limites">
        <h2>{text.sections.limites}</h2>
        <p>{text.limits}</p>
      </section>
    </>),
  };
}

export const localizedAiPages: Record<Locale, Record<AiTopic, DocPage>> = Object.fromEntries(
  (["pt", "en", "es"] as const).map((locale) => [locale, { mcp: mcpPage(locale), plugin: pluginPage(locale), cli: cliPage(locale) }]),
) as Record<Locale, Record<AiTopic, DocPage>>;

const aiText = {
  pt: { overview: "Visão geral", pages: "Páginas para IAs" },
  en: { overview: "Overview", pages: "Pages for AI" },
  es: { overview: "Visión general", pages: "Páginas para IAs" },
};
/** Menu das páginas de Para IAs, o mesmo na visão geral e nas páginas próprias. */
export const aiNavLinks = (locale: Locale): GuideLink[] => [
  { href: aiHref(), label: aiText[locale].overview },
  ...aiTopics.map((topic) => ({ href: aiHref(topic), label: localizedAiPages[locale][topic].label })),
];
export const aiPagesLabel = (locale: Locale) => aiText[locale].pages;

export function AiGuidePage({ topic, onLink }: { topic: AiTopic; onLink: (href: string) => void }) {
  const { locale } = useSiteLocale();
  const page = localizedAiPages[locale][topic];
  const links = aiNavLinks(locale);
  const index = links.findIndex((item) => item.href === aiHref(topic));
  const title = docGroupLabel(locale, "ai");
  return (
    <GuidePage
      title={title}
      navLabel={aiPagesLabel(locale)}
      activeHref={aiHref(topic)}
      groups={[{ title, items: links }]}
      page={page}
      eyebrow={`${title} / ${page.label}`}
      previous={links[index - 1]}
      next={links[index + 1]}
      onLink={onLink}
    />
  );
}
