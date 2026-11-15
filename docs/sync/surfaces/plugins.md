---
id: plugins
title: Plugins para Claude e Codex
files: plugins/refy/**, .agents/plugins/marketplace.json, .claude-plugin/**
mcpTools: remote
---
Os plugins `refy` (servidor remoto) e `refy-local` (servidor na máquina), com os atalhos de cada um. Textos em português; descrições curtas em inglês nos `plugin.json`.

| Afirmação | Fonte |
|---|---|
| `version` de cada `plugin.json` | `package.json` (mesma versão do pacote web) |
| Ferramentas que cada plugin usa | `refy`: remoto (`toolsFor` em `mcp-server.mjs`); `refy-local`: todas |
| Atalhos (skills) | `plugins/*/skills/*/SKILL.md` |

Como atualizar: versão acompanha o pacote web a cada release; ferramenta que só existe no local não aparece no plugin remoto.
