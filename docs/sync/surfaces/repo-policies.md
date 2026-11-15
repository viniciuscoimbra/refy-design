---
id: repo-policies
title: Regras do repositório
files: CONTRIBUTING.md, GOVERNANCE.md, SECURITY.md, PRIVACY.md, DESIGN.md, MAINTAINERS.md, CODE_OF_CONDUCT.md, THIRD_PARTY_NOTICES.md, .github/pull_request_template.md, .github/ISSUE_TEMPLATE/**
---
Como contribuir, como uma versão chega ao público, segurança, privacidade e créditos. Só em português.

| Afirmação | Fonte |
|---|---|
| Passos da promoção (GOVERNANCE.md, passo 3) | `PROMOTION_CHECKS` em `scripts/promote.mjs`; `tests/governance-gate.test.mjs` confere as duas pontas |
| Comandos de conferência citados no CONTRIBUTING | `scripts` do `package.json` |
| Quem mantém | `MAINTAINERS.md` e site (Quem mantém) |
| O que o MCP remoto guarda ou não (PRIVACY) | `tools/refy-agent/remote.mjs` e `workers/mcp` |

Como atualizar: mudou um gate, um comando ou o que o servidor remoto faz, a frase correspondente muda junto.
