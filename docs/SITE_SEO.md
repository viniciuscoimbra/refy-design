# SEO do refy.design

Como o site aparece em busca, o que o build garante e como medir.

## Endereços e idiomas

- Português fica na raiz (`/para-ias/mcp`), inglês em `/en/...` e espanhol em `/es/...`, cada um com o caminho na própria língua (`/en/for-ai/mcp`, `/es/para-ias/mcp`). Nome de componente e de template é nome de código, igual nos três (`/componentes/visit-schedule-picker`). A tradução dos caminhos mora em `src/pages/RefySitePage/i18n.tsx` (`localePath`, `canonicalPath`).
- Endereço que já existiu continua respondendo: o build grava `_redirects` com 301 para o atual, e `seo-check` reprova 301 sem destino.
- O endereço decide o idioma. Quem abre um endereço sem prefixo e não escolheu idioma vai para o idioma do navegador. Robô de busca não é redirecionado: fica no endereço que pediu.
- Cada página traz `canonical` para si mesma e `hreflang` para as três versões, com `x-default` na versão em português. O `sitemap.xml` repete as mesmas versões.
- `?lang=` continua valendo só para a prévia de template no iframe (`/block-preview.html`).

## O que o build grava

`npm run build:site` roda `scripts/site-seo.mjs` e, no fim, `scripts/seo-check.mjs`.

| Arquivo | Para quê |
|---|---|
| uma `.html` por rota e idioma | título, descrição, canonical, hreflang, Open Graph, JSON-LD e o texto da página para robô que não roda JS |
| `sitemap.xml` | todas as páginas, com as versões de idioma |
| `robots.txt` | libera tudo menos `/block-preview.html` e aponta o sitemap |
| `og.png` | imagem de compartilhamento (gerada por `scripts/site-og-image.mjs`) |
| `_headers` | cache de um ano para `/assets/*`, que muda de nome a cada build |
| `<chave>.txt` | prova de domínio do IndexNow |
| `llms.txt`, `llms-full.txt` | texto para assistentes de IA |

`seo-check` reprova o build quando uma página perde título, descrição, canonical, `hreflang` recíproco, `lang` certo no `<html>`, `og:image`, JSON-LD válido ou entrada no sitemap. Título com travessão também reprova. Descrição fora de 50 a 200 caracteres só gera aviso.

## Depois de publicar

- `npm run seo:indexnow` avisa Bing, Yandex e os outros buscadores do IndexNow que as páginas do sitemap mudaram. Com caminhos (`npm run seo:indexnow -- /para-ias/mcp /en/for-ai/mcp`), avisa só esses.
- Google não usa IndexNow: ele lê o `sitemap.xml` enviado no Search Console.

## Medir

| O quê | Onde | Custo |
|---|---|---|
| Posição, cliques e consultas no Google | Google Search Console, propriedade de domínio `refy.design` | grátis |
| O mesmo no Bing | Bing Webmaster Tools, importando do Search Console | grátis |
| Visitas, páginas e países, sem cookie | Cloudflare Web Analytics no projeto do Pages | grátis |
| Velocidade e SEO técnico por página | `npx lighthouse <url> --view` ou PageSpeed Insights | grátis |

Verificação por meta tag, se a de DNS não servir: `REFY_GOOGLE_VERIFICATION=<código>` e `REFY_BING_VERIFICATION=<código>` no ambiente do `build:site`.
