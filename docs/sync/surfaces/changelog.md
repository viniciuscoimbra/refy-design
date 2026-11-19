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
| Linha `Mobile:` no resumo de cada versão desde a 1.1.0 (acompanha ou não, e o que ficou só na web) | `src/catalog/versions.json` (props novas por versão) e `src/catalog/native-parity.json`; `tests/site-releases.test.mjs` recusa versão sem a linha (NATP-03) |
| Tradução pt e es de cada item | `changelog.json` traduz o texto em inglês do CHANGELOG |
| `docs/pt-BR/CHANGELOG.md` e `docs/es/CHANGELOG.md` | `node scripts/changelog-i18n.mjs` (o `docs:check` recusa versão desatualizada) |

Como atualizar: versão nova ganha seção em inglês nas categorias do Keep a Changelog e link de comparação no rodapé; cada item novo ganha tradução pt e es em `changelog.json`; depois rode `npm run changelog:build`. Nunca reescreva seção de versão já publicada; a exceção registrada é a linha `Mobile:` acrescentada em 18/11/2026 às versões 1.1.0 a 1.9.4 (track-native-parity 3.1).
