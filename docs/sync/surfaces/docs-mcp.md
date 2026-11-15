---
id: docs-mcp
title: Guias do MCP e da adoção por agentes
files: docs/MCP.md, docs/AGENT_ADOPTION.md
mcpTools: local
requires: mcp-tool-names, mcp-resources
---
Como ligar o servidor MCP e o kit `refy-agent`. Só em português; o site traz a versão traduzida em Para IAs.

| Afirmação | Fonte |
|---|---|
| Tabela de ferramentas, entradas e saídas | `TOOLS` em `tools/refy-agent/mcp-server.mjs` |
| O que o remoto não tem | `toolsFor()` em `mcp-server.mjs` |
| Exemplo de `version` (a anterior que o remoto carrega) | `src/catalog/versions.json`: a release publicada antes da atual; `workers/mcp/build.mjs` embute a atual e essa |
| Recursos `refy://` | `RESOURCES` em `mcp-server.mjs` |
| Comandos do kit | `tools/refy-agent/cli.mjs` |

Como atualizar: ferramenta nova ganha linha na tabela; o exemplo `(ex.: "X.Y.Z")` acompanha a versão anterior a cada release.
