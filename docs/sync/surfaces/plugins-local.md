---
id: plugins-local
title: Plugin refy-local (servidor na máquina)
files: plugins/refy-local/**
mcpTools: local
---
O plugin `refy-local` roda o `refy-mcp` com `npx` na versão exata do plugin e traz os atalhos do `refy` mais `refy-reproduzir-tela`.

| Afirmação | Fonte |
|---|---|
| `version` dos `plugin.json` e o pino `@refy-design/web@X` no `.mcp.json` e no README | `package.json` |
| Ferramentas | todas as do servidor local (`tools/list` em `mcp-server.mjs`) |
| Atalhos | `plugins/refy-local/skills/*/SKILL.md` |

Como atualizar: a cada release, versão e pino acompanham o pacote web.
