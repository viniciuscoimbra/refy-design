---
id: mobile-readme
title: README e divergências do pacote mobile
files: packages/native/README.md, packages/native/DIVERGENCIAS.md
---
Página do `@refy-design/mobile` no npm e a lista do que difere da web. Só em português; o site mostra a paridade em pt, en e es.

| Afirmação | Fonte |
|---|---|
| Nome e versão do pacote | `packages/native/package.json` |
| Componentes que existem no mobile | `src/pages/RefySitePage/nativeComponents.json` e `src/catalog/native-parity.json` |
| Diferenças da web | `packages/native/DIVERGENCIAS.md` (lido por `scripts/native-parity.mjs`) |

Como atualizar: componente novo no mobile entra na lista; recurso que a versão publicada não tem não aparece como disponível.
