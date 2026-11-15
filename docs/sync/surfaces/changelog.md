---
id: changelog
title: Histórico de versões
files: CHANGELOG.md, src/pages/RefySitePage/locales/changelog.json
historical: sim
---
Registro histórico: conta o que era verdade em cada versão. Números antigos ficam como estão.

| Afirmação | Fonte |
|---|---|
| Seção da versão atual (`## X.Y.Z (dd/mm/aaaa)`) | `package.json`, campo `version`; `promote.mjs` exige a seção antes da tag |
| Tradução en/es de cada item | `changelog.json` traduz o texto pt do CHANGELOG |

Como atualizar: versão nova ganha seção nas categorias do Keep a Changelog em pt; cada item novo ganha tradução en e es em `changelog.json`. Nunca reescreva seção de versão já publicada.
