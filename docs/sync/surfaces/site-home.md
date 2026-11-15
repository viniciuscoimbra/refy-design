---
id: site-home
title: Site: casca, home e instalação
files: src/pages/RefySitePage/RefySitePage.tsx, src/pages/RefySitePage/SiteHome.tsx, src/pages/RefySitePage/PackageInstall.tsx, src/pages/RefySitePage/i18n.tsx, src/pages/RefySitePage/RefySitePage.stories.tsx, src/pages/RefySitePage/THIRD_PARTY_NOTICES.md, src/pages/RefySitePage/assets/**/*.md
---
Home do refy.design, menu, rodapé, rotas e o bloco de instalação. Texto pt no TSX (`t({ pt, en, es })` ou `tr("pt")`); en e es em `locales/en.json` e `locales/es.json` (superfície site-translations).

| Afirmação | Fonte |
|---|---|
| Versão mostrada | `packageRelease.ts` lê `package.json` |
| Contagens da home | calculadas do catálogo em tempo de build |
| Rotas | `pagePaths` e `legacyPaths` em `RefySitePage.tsx` |

Como atualizar: frase nova ou alterada sai nas três línguas; com `tr()`, a chave pt muda em `en.json` e `es.json` junto.
