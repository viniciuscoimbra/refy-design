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
codex mcp add refy -- npx -y --package=@refy-design/web@1.5.1 refy-mcp
```

## O que o plugin roda e o que envia

O plugin liga um servidor MCP local: `npx` baixa `@refy-design/web` na versão exata do plugin (1.5.1) do registro do npm e roda o comando `refy-mcp` do pacote. Esse servidor:

- lê o catálogo e a fundação de tokens que vêm no pacote;
- não escreve no projeto e não chama IA; só grava a imagem de diferença do `refy_compare`, na pasta temporária do sistema;
- do projeto, lê o TypeScript instalado (em toda conferência), os arquivos que você passa em `refy_validate` com `refy-agent.config.json`, `theme.json` e o registro de pranchas, as imagens que você passa em `refy_compare` e o Playwright instalado, quando `refy_theme_extract` abre um site;
- só fala com a rede em `refy_theme_extract` com `url`: lê a página indicada e as folhas de estilo que ela carrega (até 12, inclusive de outros domínios). Endereço interno (localhost, rede privada) é recusado.

Os atalhos são texto em Markdown. Não há hook, script nem binário no plugin.

## Privacidade

O refy não tem conta, não coleta dado pessoal e não guarda o que você pede ao agente. A política completa está em [PRIVACY.md](https://github.com/viniciuscoimbra/refy-design/blob/main/PRIVACY.md).

## Suporte

Dúvida ou defeito: [issues do refy-design](https://github.com/viniciuscoimbra/refy-design/issues). Licença MIT.
