---
id: llms
title: llms.txt, llms-full.txt e páginas estáticas do site
files: scripts/site-seo.mjs
---
`scripts/site-seo.mjs` gera `llms.txt`, `llms-full.txt`, o HTML estático de cada rota em pt, en e es, o sitemap e os redirecionamentos. Os números vêm do catálogo e do blockRegistry na hora do build; o texto fixo fica nas funções `homeFacts`, `templatesDesc` e afins.

| Afirmação | Fonte |
|---|---|
| Famílias, templates, mobile | calculados no build a partir do catálogo e do blockRegistry |
| Texto fixo em pt, en e es | objetos `pt`, `en` e `es` do próprio script |

Como atualizar: texto fixo muda nas três línguas juntas; número nunca entra escrito, sempre calculado.
