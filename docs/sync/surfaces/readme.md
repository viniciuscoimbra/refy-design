---
id: readme
title: README do repositório
files: README.md, README.pt-BR.md, README.es.md
mcpTools: local
requires: mcp-tool-names, mobile-install, tool-count, family-levels
---
Primeira página do repositório público e do pacote no npm. Escrita em inglês, com `README.pt-BR.md` e `README.es.md`.

| Afirmação | Fonte no código |
|---|---|
| Número de famílias e quantas por nível ("122 famílias (33 átomos, ...)") | `ai/catalog.json`, campo `level` de cada família |
| Quantos trechos compilam contra a API pública | soma de `examples` em `src/pages/PlaygroundPage/documentation/*.json` (o mesmo total de `component-docs --compile`) |
| Quantas ferramentas o MCP tem, o nome de cada uma e quantas o remoto serve | `tools/refy-agent/mcp-server.mjs` (`tools/list` local e remoto) |
| Tipos do catálogo D3 | uniões de tipo em `src/components/Charts/d3/types.ts` |
| Instalação do mobile | `packages/native/package.json` (nome publicado) |

Como atualizar: troque o número ou o nome pelo fato calculado (`node scripts/docs-sync.mjs facts`). Ferramenta nova do MCP entra na frase "São N ferramentas" com uma linha do que ela faz. Nada de "em breve" para o que já existe.
