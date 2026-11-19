---
id: changelog
title: Histórico de versões
files: CHANGELOG.md, docs/pt-BR/CHANGELOG.md, docs/es/CHANGELOG.md, src/pages/RefySitePage/locales/changelog.json
historical: sim
---
Registro histórico: conta o que era verdade em cada versão. Números antigos ficam como estão. O CHANGELOG.md é escrito em inglês; as versões em português e espanhol saem dele.

| Afirmação | Fonte |
|---|---|
| Seção da versão atual (`## [X.Y.Z] - AAAA-MM-DD`) | `package.json`, campo `version`; `promote.mjs` exige a seção antes da tag |
| Link de comparação de cada versão (rodapé do CHANGELOG) | tags `vX.Y.Z` do repositório público |
| Tradução pt e es de cada item | `changelog.json` traduz o texto em inglês do CHANGELOG |
| `docs/pt-BR/CHANGELOG.md` e `docs/es/CHANGELOG.md` | `node scripts/changelog-i18n.mjs` (o `docs:check` recusa versão desatualizada) |

Como atualizar: versão nova ganha seção em inglês nas categorias do Keep a Changelog e link de comparação no rodapé; cada item novo ganha tradução pt e es em `changelog.json`; depois rode `npm run changelog:build`. Nunca reescreva seção de versão já publicada.
