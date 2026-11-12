# Privacidade

Vale para o pacote `@refy-design/web`, os plugins `refy` e `refy-local` para Claude e Codex, o servidor MCP local (`refy-mcp`) e o servidor MCP remoto em `https://refy.design/mcp`. Atualizado em 12/11/2026.

## O que o refy coleta

Nada. O refy não tem conta, login, cookie de rastreio nem banco de dados. Não pede nome, e-mail ou chave.

## Servidor local (`refy-mcp` e o plugin `refy-local`)

Roda na sua máquina e não envia nada ao refy. Lê o catálogo e os tokens que vêm no pacote. Do seu projeto, lê:

- o TypeScript instalado, em toda conferência de `refy_validate`;
- os arquivos que você passa em `refy_validate` (`files`) e, junto, `refy-agent.config.json`, o `theme.json` da raiz e o registro de pranchas, quando existem;
- as duas imagens que você passa em `refy_compare`;
- o Playwright instalado, quando `refy_theme_extract` abre um site.

Não guarda nada, exceto a imagem de diferença do `refy_compare`, gravada na pasta temporária do sistema. O `npx` baixa o pacote do registro do npm, que segue a política do próprio npm.

## Servidor remoto (`https://refy.design/mcp` e o plugin `refy`)

Roda num Worker da Cloudflare sem armazenamento e com registro de pedidos desligado. Cada pedido é respondido e descartado: o código ou a URL que o agente manda não fica guardado. A Cloudflare trata o endereço IP e os dados técnicos da conexão para entregar a resposta, conforme a [política da Cloudflare](https://www.cloudflare.com/privacypolicy/).

## Rede

`refy_theme_extract` com `url` lê a página que você indicou e as folhas de estilo que ela carrega (até 12, inclusive de outros domínios, como uma CDN). Com o Playwright do projeto, a página carrega como num navegador comum. Cada endereço passa pela recusa de endereço interno (localhost e rede privada). O servidor remoto também consulta o registro do npm para saber a versão mais nova do pacote. Nenhum dado é vendido ou repassado a terceiros.

## Crianças

O refy é ferramenta de desenvolvimento e não é feito para menores de 18 anos.

## Contato

Dúvidas: abra uma [issue](https://github.com/viniciuscoimbra/refy-design/issues). Mudança nesta política entra neste arquivo, com a data.

---

# Privacy (English)

Applies to the `@refy-design/web` package, the `refy` and `refy-local` plugins for Claude and Codex, the local MCP server (`refy-mcp`) and the remote MCP server at `https://refy.design/mcp`. Updated November 12, 2026.

- **Collected data:** none. No account, login, tracking cookie or database. refy never asks for a name, email or key.
- **Local server and the `refy-local` plugin:** run on your machine and send nothing to refy. From your project they read the installed TypeScript (every `refy_validate` check), the files you pass to `refy_validate` plus `refy-agent.config.json`, the root `theme.json` and the board registry when present, the two images you pass to `refy_compare`, and the installed Playwright when `refy_theme_extract` opens a site. Nothing is stored except the `refy_compare` diff image, written to the system temp folder. `npx` downloads the package from the npm registry, under npm's own policy.
- **Remote server and the `refy` plugin:** a Cloudflare Worker with no storage and request logging turned off. Each request is answered and discarded; the code or URL your agent sends is not kept. Cloudflare processes the IP address and connection data to deliver the response, under the [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/).
- **Network:** `refy_theme_extract` with `url` reads the page you named and the stylesheets it loads (up to 12, including other domains such as a CDN); with the project's Playwright the page loads as in a normal browser. Every address goes through the internal-address refusal. The remote server also asks the npm registry for the latest package version. No data is sold or shared.
- **Children:** refy is a developer tool, not meant for people under 18.
- **Contact:** open an [issue](https://github.com/viniciuscoimbra/refy-design/issues). Changes to this policy land in this file, with the date.
