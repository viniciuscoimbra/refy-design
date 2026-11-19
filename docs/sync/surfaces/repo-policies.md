---
id: repo-policies
title: Regras do repositório
files: CONTRIBUTING.md, GOVERNANCE.md, SECURITY.md, PRIVACY.md, DESIGN.md, MAINTAINERS.md, CODE_OF_CONDUCT.md, SUPPORT.md, TRADEMARKS.md, RELEASES.md, ROADMAP.md, ADOPTERS.md, NOTICE, THIRD_PARTY_NOTICES.md, .github/CODEOWNERS, .github/pull_request_template.md, .github/ISSUE_TEMPLATE/**, docs/pt-BR/**, docs/es/**
---
Como contribuir, como uma versão chega ao público, segurança, privacidade, marcas e créditos. Escritos em inglês, com versões em português (`docs/pt-BR/`) e espanhol (`docs/es/`); o CHANGELOG traduzido é da superfície `changelog`.

| Afirmação | Fonte |
|---|---|
| Passos da promoção (GOVERNANCE.md, passo 3) | `PROMOTION_CHECKS` em `scripts/promote.mjs`; `tests/governance-gate.test.mjs` confere as duas pontas |
| Comandos de conferência citados no CONTRIBUTING | `scripts` do `package.json` |
| Quem mantém | `MAINTAINERS.md` e site (Quem mantém); contribuidores só pela lista do GitHub |
| Licença Apache 2.0 e NOTICE | `LICENSE`, `NOTICE` e campo `license` dos `package.json` (`scripts/check.mjs` confere) |
| O que o MCP remoto guarda ou não (PRIVACY) | `tools/refy-agent/remote.mjs` e `workers/mcp` |

Como atualizar: mudou um gate, um comando ou o que o servidor remoto faz, a frase correspondente muda junto, nos três idiomas e no mesmo pull request.
