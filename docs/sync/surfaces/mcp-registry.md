---
id: mcp-registry
title: Registro do servidor MCP (server.json)
files: server.json
---
Ficha do servidor no registro de MCP: nome, descrição em inglês, versão, endereço remoto.

| Afirmação | Fonte |
|---|---|
| `version` | `package.json` |
| `remotes[].url` | rota do worker em `workers/mcp/wrangler.jsonc` |

Como atualizar: versão acompanha o pacote web.
