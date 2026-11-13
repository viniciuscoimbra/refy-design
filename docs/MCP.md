# Servidor MCP do Refy

O pacote `@refy-design/web` traz um servidor MCP (`refy-mcp`) que expõe o catálogo, a API dos componentes, a validação de uso e a geração de tema para qualquer agente compatível com o Model Context Protocol. Ele lê só o que vem no pacote instalado e o que o agente manda na chamada: não escreve no projeto e não chama modelo de IA. Fora o `npx -y` quando o pacote não está instalado, só `refy_theme_extract` com `url` acessa a rede, e só o endereço público que a pessoa passou.

## Plugin para Claude e Codex

O plugin `refy` liga o servidor remoto `https://refy.design/mcp`, sem instalar nada, e dois atalhos: `refy-tela` (busca o componente, escreve a tela e roda `refy_validate` no fim) e `refy-tema-de-site` (pega os elementos claros de um site e vira tema, sem copiar a tela). O plugin `refy-local`, do mesmo marketplace, roda o `refy-mcp` na sua máquina com `npx` e traz os mesmos atalhos mais `refy-reproduzir-tela` (só quando a pessoa pede: reproduz a tela igual ao original com Refy e extensões, e compara com `refy_compare` até bater).

Claude Code, app do Claude e Cowork:

```bash
/plugin marketplace add viniciuscoimbra/refy-design
/plugin install refy@refy
```

Para o servidor na sua máquina, instale `refy-local@refy` no lugar de `refy@refy`.

Chat do Claude Desktop: baixe `refy.mcpb` do release e abra com dois cliques. O Claude Desktop já traz o Node.

Codex, no terminal e no app:

```bash
codex plugin marketplace add viniciuscoimbra/refy-design
```

e instale **Refy** (ou **Refy local**) na lista de plugins.

## Instalar só o servidor

Claude Code, com o pacote instalado no projeto:

```bash
claude mcp add refy -- npx --no-install refy-mcp
```

Sem o pacote no projeto, o npx baixa a versão indicada. Fixe a mesma versão que o projeto usa, para o catálogo e a validação baterem com ela:

```bash
claude mcp add refy -- npx -y -p @refy-design/web@1.8.0 refy-mcp
```

Codex, no terminal:

```bash
codex mcp add refy -- npx -y -p @refy-design/web@1.8.0 refy-mcp
```

Ou em `~/.codex/config.toml`:

```toml
[mcp_servers.refy]
command = "npx"
args = ["-y", "-p", "@refy-design/web@1.8.0", "refy-mcp"]
```

Kiro (`.kiro/settings/mcp.json` no projeto ou `~/.kiro/settings/mcp.json`), Cursor (`.cursor/mcp.json`), Windsurf e outros clientes que leem `mcpServers`:

```json
{
  "mcpServers": {
    "refy": { "command": "npx", "args": ["-y", "-p", "@refy-design/web@1.8.0", "refy-mcp"] }
  }
}
```

VS Code usa a chave `servers`, em `.vscode/mcp.json`:

```json
{
  "servers": {
    "refy": { "type": "stdio", "command": "npx", "args": ["-y", "-p", "@refy-design/web@1.8.0", "refy-mcp"] }
  }
}
```

O servidor fala por stdio. `REFY_MCP_PROJECT` muda a pasta que `refy_validate` lê com `files`; sem ela, vale a pasta onde o cliente abriu o servidor.

## Ferramentas

| Ferramenta | Entrada | O que devolve |
|---|---|---|
| `refy_search` | `query`, `limit`, `collection`, `version` | Famílias em ordem para a necessidade, com os termos que casaram, a razão (quando veio de "quando usar outro componente" ou da tabela de escolha de controles), como usar, alternativas e o import |
| `refy_component` | `name`, `version` | A ficha da família: props com tipo, padrão e obrigatoriedade, exemplos de código, uso, alternativas e teclado. Aceita membro documentado, como `CardHeader` |
| `refy_collections` | `query`, `version` | Coleções (core e especializadas) com os membros reais |
| `refy_validate` | `code` e `filename`, ou `files`; `version` | Achados de contrato e regras estáticas, com linha, regra, severidade e mensagem. `passed` é falso quando há erro |
| `refy_theme_generate` | `name`, `primary`, `label`, `radius`, `density`, `fontBody`, `fontHeading`, `fontMono` | Tema claro e escuro no formato do `ThemeProvider`, as cores que precisaram de ajuste e o relatório de contraste |
| `refy_theme_extract` | `url`, ou `html` e `css`, ou `observations`; `name`, `label`, `browser` | Tema claro e escuro tirado das cores, fontes e raios do site, com `decided` (o que foi escolhido), `evidence` (de onde veio cada escolha), `notes` (o que mudou para passar no contraste) e o relatório de contraste |
| `refy_compare` | `original`, `candidate`, `threshold` | Porcentagem de pixels diferentes entre duas capturas PNG do mesmo tamanho, as regiões que mais diferem e a imagem de diferença (gravada na pasta temporária) |
| `refy_theme_validate` | `theme` | O mesmo contrato dos temas do repositório: tokens reconhecidos, `label`, referências resolvíveis e contraste AA |

Toda ferramenta é só de leitura e diz isso em `annotations` (`readOnlyHint: true`, `destructiveHint: false`); só `refy_theme_extract` sai para a rede (`openWorldHint: true`). Se o cliente ainda pedir aprovação, a regra é dele.

Toda resposta traz `packageVersion`, a versão do catálogo que respondeu. No servidor local ela é a versão instalada. No remoto (`https://refy.design/mcp`), a resposta traz também `publishedVersion`, o `latest` do npm, e `warnings` quando o catálogo ainda não está publicado. O remoto carrega a versão atual e a anterior: passe `version` (ex.: `"1.2.0"`) para ler a API que o projeto instala. Versão que o servidor não tem volta como erro com a lista das disponíveis.

Recursos: `refy://instructions`, `refy://control-choices`, `refy://theme-probe`, `refy://catalog` e `refy://component/{name}`.

## Como a busca decide

A consulta passa por um glossário fechado de português e espanhol para os termos do catálogo ("lista suspensa" vira `select` e `dropdown`, "apagar" vira `delete` e `danger`) e é pontuada por BM25 sobre nome, descrição, coleção, área, "como usar" e API da família. Quando a consulta descreve a situação de uma alternativa ("confirmar o que apaga ou não tem volta: AlertDialog") ou de uma linha de `control-choices.md`, a família indicada sobe e a frase volta em `reasons`. A mesma consulta devolve sempre a mesma ordem. Palavra fora do glossário só casa pelo texto literal.

## O que a validação confere

- Prop obrigatória ausente (`Modal` sem `open`).
- Valor literal fora da união aceita (`variant="big"` no `Button`). As uniões vêm dos `.d.ts` publicados em `dist/`, os mesmos do TypeScript do projeto.
- Prop fora da API documentada, como aviso. Atributos HTML, `aria-*`, `data-*` e handlers `on*` passam.
- As regras de `refy-agent check`: controle HTML cru, cor ou fonte literal, import interno ou absoluto. Cada achado de aparência literal traz `suggestion` com a troca indicada.
- Prop deprecada (`price` no `ContentCard`), como aviso com a substituta. Na ficha que `refy_component` devolve, a prop vem com `deprecated.replacement`.

Não confere valor vindo de variável, spread ou expressão, nem roda o TypeScript ou o navegador do projeto. Teste de fluxo e revisão visual continuam necessários.

## O que a geração de tema garante

As cores de superfície, texto, linha e primária saem da matiz da cor informada, em OKLCH, para o claro e o escuro. Cada par de texto é ajustado em luminosidade até passar no contraste mínimo (4,5:1 para texto, inclusive o texto do botão sobre a cor de hover, e 3:1 para marca). Se a primária informada não atinge 4,5:1 nem com texto branco nem com escuro, ela é escurecida e a nota diz para qual valor. Sucesso, erro e informação continuam os da fundação. Pares com `color-mix()` ou gradiente ficam marcados para conferir no navegador. Cor em outro formato (`rgb()`, nome, `#rrggbbaa`) reprova, porque não dá para medir; `#rgb` é expandido.

## Tema a partir de um site

`refy_theme_extract` lê o site de três jeitos, do mais fiel ao mais pobre:

1. `observations`: o agente abre o site no navegador dele, roda o script de `refy://theme-probe` na página e passa o resultado. É o único jeito que enxerga site montado por JavaScript.
2. `url` com Playwright instalado no projeto: o servidor abre o site num Chromium sem janela e roda o mesmo script.
3. `url` sem Playwright, ou `html` e `css`: lê o HTML e as folhas de estilo servidas, classes arbitrárias do Tailwind (`bg-[#0b0b0f]`), `tailwind.config` embutido e fontes do Google Fonts.

A escolha segue esta ordem. Fundo: o do `body`, depois variável de fundo (`--background`, `--bg`), depois a cor que mais ocupa a tela. Texto: o do `body`. Superfície: variável de cartão ou fundo de cartão próximo do fundo da página. Primária: variável de marca (`--primary`, `--accent`, `--brand`), depois fundo de botão, depois a cor com croma mais frequente. Fontes: variável, depois `body`, títulos e código. Raio: mediana dos botões e cartões.

Com a sonda, o jeito de cada elemento também vira token, em `elements`: botão (altura, espaço lateral, peso da letra, sombra, formato pílula e cores do secundário), cartão (sombra, borda e espaço interno), campo (altura, raio, borda e sombra), selo (raio, caixa alta e espaço entre letras) e espaço entre letras de títulos e sobretítulos. O que o Refy não tem token para receber, como caixa alta no botão, volta em `elements.gaps` com a rota: extensão em `refy-extensions/<Nome>` ou contribuição com `npx -p @refy-design/web refy contribute <Nome>`.

O fundo, a superfície e o texto medidos entram no modo do site (claro ou escuro); o outro modo sai do gerador com a mesma primária. Se os neutros do site derrubarem algum par de contraste, o modo volta para os neutros gerados e `notes` diz qual par caiu.

Endereço local ou de rede interna é recusado. As cores, as fontes e a marca do site pertencem a quem o fez: o tema é ponto de partida no seu projeto, não tema do Refy nem marca de terceiro.
