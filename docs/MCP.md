# Servidor MCP do Refy

O pacote `@refy-design/web` traz um servidor MCP (`refy-mcp`) que expõe o catálogo, a API dos componentes, a validação de uso e a geração de tema para qualquer agente compatível com o Model Context Protocol. Ele lê só o que vem no pacote instalado e o que o agente manda na chamada: não escreve no projeto, não acessa a rede e não chama modelo de IA. A única rede é a do `npx -y` quando o pacote não está instalado.

## Instalar no cliente

Claude Code, com o pacote instalado no projeto:

```bash
claude mcp add refy -- npx --no-install refy-mcp
```

Sem o pacote no projeto, o npx baixa a versão indicada. Fixe a mesma versão que o projeto usa, para o catálogo e a validação baterem com ela:

```bash
claude mcp add refy -- npx -y -p @refy-design/web@1.2.0 refy-mcp
```

Cursor, Windsurf, VS Code e outros clientes que leem `mcpServers`:

```json
{
  "mcpServers": {
    "refy": { "command": "npx", "args": ["-y", "-p", "@refy-design/web@1.2.0", "refy-mcp"] }
  }
}
```

O servidor fala por stdio. `REFY_MCP_PROJECT` muda a pasta que `refy_validate` lê com `files`; sem ela, vale a pasta onde o cliente abriu o servidor.

## Ferramentas

| Ferramenta | Entrada | O que devolve |
|---|---|---|
| `refy_search` | `query`, `limit`, `collection` | Famílias em ordem para a necessidade, com os termos que casaram, a razão (quando veio de "quando usar outro componente" ou da tabela de escolha de controles), como usar, alternativas e o import |
| `refy_component` | `name` | A ficha da família: props com tipo, padrão e obrigatoriedade, exemplos de código, uso, alternativas e teclado. Aceita membro documentado, como `CardHeader` |
| `refy_collections` | `query` | Coleções (core e especializadas) com os membros reais |
| `refy_validate` | `code` e `filename`, ou `files` | Achados de contrato e regras estáticas, com linha, regra, severidade e mensagem. `passed` é falso quando há erro |
| `refy_theme_generate` | `name`, `primary`, `label`, `radius`, `density`, `fontBody`, `fontHeading`, `fontMono` | Tema claro e escuro no formato do `ThemeProvider`, as cores que precisaram de ajuste e o relatório de contraste |
| `refy_theme_validate` | `theme` | O mesmo contrato dos temas do repositório: tokens reconhecidos, `label`, referências resolvíveis e contraste AA |

Recursos: `refy://instructions`, `refy://control-choices`, `refy://catalog` e `refy://component/{name}`.

## Como a busca decide

A consulta passa por um glossário fechado de português e espanhol para os termos do catálogo ("lista suspensa" vira `select` e `dropdown`, "apagar" vira `delete` e `danger`) e é pontuada por BM25 sobre nome, descrição, coleção, área, "como usar" e API da família. Quando a consulta descreve a situação de uma alternativa ("confirmar o que apaga ou não tem volta: AlertDialog") ou de uma linha de `control-choices.md`, a família indicada sobe e a frase volta em `reasons`. A mesma consulta devolve sempre a mesma ordem. Palavra fora do glossário só casa pelo texto literal.

## O que a validação confere

- Prop obrigatória ausente (`Modal` sem `open`).
- Valor literal fora da união aceita (`variant="big"` no `Button`). As uniões vêm dos `.d.ts` publicados em `dist/`, os mesmos do TypeScript do projeto.
- Prop fora da API documentada, como aviso. Atributos HTML, `aria-*`, `data-*` e handlers `on*` passam.
- As regras de `refy-agent check`: controle HTML cru, cor ou fonte literal, import interno ou absoluto.

Não confere valor vindo de variável, spread ou expressão, nem roda o TypeScript ou o navegador do projeto. Teste de fluxo e revisão visual continuam necessários.

## O que a geração de tema garante

As cores de superfície, texto, linha e primária saem da matiz da cor informada, em OKLCH, para o claro e o escuro. Cada par de texto é ajustado em luminosidade até passar no contraste mínimo (4,5:1 para texto, inclusive o texto do botão sobre a cor de hover, e 3:1 para marca). Se a primária informada não atinge 4,5:1 nem com texto branco nem com escuro, ela é escurecida e a nota diz para qual valor. Sucesso, erro e informação continuam os da fundação. Pares com `color-mix()` ou gradiente ficam marcados para conferir no navegador. Cor em outro formato (`rgb()`, nome, `#rrggbbaa`) reprova, porque não dá para medir; `#rgb` é expandido.
