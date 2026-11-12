# Plugin refy-local

Roda o servidor MCP do [Refy](https://refy.design) na sua máquina, com os atalhos **refy-tela** e **refy-tema-de-site** do plugin `refy` e mais **refy-reproduzir-tela**: só quando você pede, reproduz a tela igual ao original com componentes do Refy e extensões, e compara as duas capturas com `refy_compare` até bater.

Para telas e temas no dia a dia, o plugin **refy** (servidor remoto, sem instalar nada) basta. Use este no lugar dele quando quiser conferir os arquivos do projeto com o TypeScript instalado ou comparar capturas.

Precisa de Node.js 20 ou mais novo, sem conta e sem chave.

```
/plugin marketplace add viniciuscoimbra/refy-design
/plugin install refy-local@refy
```

No Codex: `codex plugin add refy-local@refy` depois de adicionar o mesmo marketplace.

## O que o plugin roda e o que envia

`npx` baixa `@refy-design/web` na versão exata do plugin (1.5.2) do registro do npm e roda o comando `refy-mcp` do pacote. Esse servidor:

- lê o catálogo e a fundação de tokens que vêm no pacote;
- não escreve no projeto e não chama IA; só grava a imagem de diferença do `refy_compare`, na pasta temporária do sistema;
- do projeto, lê o TypeScript instalado (em toda conferência), os arquivos que você passa em `refy_validate` com `refy-agent.config.json`, `theme.json` e o registro de pranchas, as imagens que você passa em `refy_compare` e o Playwright instalado, quando `refy_theme_extract` abre um site;
- só fala com a rede em `refy_theme_extract` com `url`: lê a página indicada e as folhas de estilo que ela carrega (até 12, inclusive de outros domínios). Endereço interno (localhost, rede privada) é recusado.

Privacidade: [PRIVACY.md](https://github.com/viniciuscoimbra/refy-design/blob/main/PRIVACY.md). Suporte: [issues do refy-design](https://github.com/viniciuscoimbra/refy-design/issues). Licença MIT.
