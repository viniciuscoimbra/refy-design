# Plugin do Refy

Liga o servidor MCP do [Refy](https://refy.design) e três atalhos ao Claude e ao Codex:

- **refy-tela**: acha o componente pela necessidade, escreve a tela com a API documentada e roda a conferência do Refy no fim.
- **refy-tema-de-site**: pega os elementos claros de um site (cores, fontes, raios e o jeito de botão, cartão, campo e selo) e gera um tema claro e escuro conferido em contraste AA, com a razão de cada escolha. Não copia a tela.
- **refy-reproduzir-tela**: só quando você pede; reproduz a tela igual ao original com componentes do Refy e extensões, e compara as duas capturas até bater.

Precisa de Node.js 20 ou mais novo. O servidor roda na sua máquina com `npx`, sem conta e sem chave.

## Claude Code, app do Claude e Cowork

```
/plugin marketplace add viniciuscoimbra/refy-design
/plugin install refy@refy
```

No app do Claude, adicione o mesmo repositório como marketplace na tela de plugins.

## Chat do Claude Desktop

Baixe `refy.mcpb` do release mais recente e abra com dois cliques. O Claude Desktop já traz o Node.

## Codex (terminal e app)

```
codex plugin marketplace add viniciuscoimbra/refy-design
```

No terminal, instale com `codex plugin add refy@refy`. No app, instale **Refy** na lista de plugins. Só o servidor, sem os atalhos:

```
codex mcp add refy -- npx -y --package=@refy-design/web@^1.4.0 refy-mcp
```

## O que o servidor faz e o que não faz

Lê o catálogo e a fundação de tokens que vêm no pacote. Não escreve no projeto e não chama IA. Só `refy_theme_extract` com `url` fala com a rede, e só com o endereço público que você passou.
