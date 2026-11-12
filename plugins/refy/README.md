# Plugin do Refy

Liga o servidor MCP remoto do [Refy](https://refy.design) (`https://refy.design/mcp`) e dois atalhos ao Claude e ao Codex:

- **refy-tela**: acha o componente pela necessidade, escreve a tela com a API documentada e roda a conferência do Refy no fim.
- **refy-tema-de-site**: pega os elementos claros de um site (cores, fontes, raios e o jeito de botão, cartão, campo e selo) e gera um tema claro e escuro conferido em contraste AA, com a razão de cada escolha. Não copia a tela.

Sem conta, sem chave e sem instalar nada: o plugin não roda programa na sua máquina.

## Claude Code, app do Claude e Cowork

```
/plugin marketplace add viniciuscoimbra/refy-design
/plugin install refy@refy
```

No app do Claude, adicione o mesmo repositório como marketplace na tela de plugins.

## Codex (terminal e app)

```
codex plugin marketplace add viniciuscoimbra/refy-design
```

No terminal, instale com `codex plugin add refy@refy`. No app, instale **Refy** na lista de plugins.

## Servidor na sua máquina

Para conferir arquivos do projeto com o TypeScript instalado e comparar capturas (`refy_compare`), instale no lugar dele o plugin **refy-local** do mesmo marketplace (`/plugin install refy-local@refy` ou `codex plugin add refy-local@refy`). Ele roda o servidor na sua máquina (veja o README do refy-local) e traz os mesmos atalhos mais `refy-reproduzir-tela`. No chat do Claude Desktop, use `refy.mcpb` do release mais recente.

## O que o servidor remoto faz e o que envia

Responde com o catálogo, a API e os tokens do pacote `@refy-design/web`. Não lê arquivo da sua máquina: `refy_validate` recebe o código no pedido. Só busca na rede em `refy_theme_extract` com `url`: a página indicada e as folhas de estilo que ela carrega (até 12, inclusive de outros domínios), e recusa endereço interno (localhost, rede privada). Consulta o registro do npm para saber a versão mais nova do pacote. Não guarda pedido nem resposta.

Os atalhos são texto em Markdown. Não há hook, script nem binário no plugin.

## Privacidade

O refy não tem conta, não coleta dado pessoal e não guarda o que você pede ao agente. A política completa está em [PRIVACY.md](https://github.com/viniciuscoimbra/refy-design/blob/main/PRIVACY.md).

## Suporte

Dúvida ou defeito: [issues do refy-design](https://github.com/viniciuscoimbra/refy-design/issues). Licença MIT.
