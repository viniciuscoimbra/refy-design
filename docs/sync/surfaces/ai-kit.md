---
id: ai-kit
title: Kit de IA do pacote (catálogo e instruções)
files: ai/**
mcpTools: local
---
O que o agente lê dentro do pacote instalado. `catalog.json` e `components/*.json` são gerados por `npm run agent:build`; `instructions.md` e `control-choices.md` são escritos.

| Afirmação | Fonte |
|---|---|
| `packageVersion` do catálogo | `package.json` |
| Famílias, API e exemplos | fontes dos componentes, via `scripts/agent-kit.mjs` |
| Fluxo do agente nas instruções | ferramentas do MCP e comandos do `refy-agent` |

Como atualizar: o que é gerado se regenera (`npm run agent:build`); o texto escrito acompanha ferramenta ou comando novo.
