---
id: site-docs
title: Site: Docs (guias e versões da API)
files: src/pages/RefySitePage/SiteDocs.tsx, src/pages/RefySitePage/docsVersion.tsx, src/pages/RefySitePage/locales/docs.pt.json, src/pages/RefySitePage/locales/docs.es.json, src/pages/RefySitePage/nativeDocs.json
---
/docs: primeiros passos, instalação (web e mobile), temas, versões. O texto-fonte dos guias longos está em inglês no TSX; `docs.pt.json` e `docs.es.json` traduzem.

| Afirmação | Fonte |
|---|---|
| Comandos e nomes de pacote | `package.json`, `packages/native/package.json` |
| Versões da API | `src/catalog/versions.json` |
| Fichas do mobile | `nativeDocs.json`, gerado do pacote nativo |

Como atualizar: o guia muda em en no TSX e a tradução em pt e es junto.
