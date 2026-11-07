# Refy Site

Tipo: prototype-integration. Status: integrado ao Storybook local na porta 6006; revisão visual do mantenedor pendente.

Integração em 25/10/2026: patch aplicado sem conflitos e quatro checks exigidos aprovados na origem. Conferidos no navegador conectado: formulário, tema/modo com estado preservado, busca, teclado do Accordion, menu mobile em 390px sem transbordamento e reimportação do JSON exportado pelo editor. Playwright via terminal não alcançou o servidor e não iniciou os casos. Os registros de candidato abaixo são históricos; não indicam bloqueio atual.

O preset Refy Site apresenta o nome e o logo "refy" (refy.design é o domínio), Manrope nos títulos, Source Sans 3 no corpo, Source Code Pro no código, verde de ação e superfícies neutras. Desde a correção autorizada em 29/10/2026, componentes herdam densidade e geometria do Refy preservado: corpo14px, pequeno13px e fallbacks originais para controles, títulos, padding e espaçamentos. A escala display maior permanece no hero. Não existe uma segunda receita numérica de densidade no preset.

## Uso

~~~tsx
import { Button, ThemeProvider, refySiteTheme } from "@refy-design/web";
import "@refy-design/web/tokens.css";
import "@refy-design/web/fonts.css";

<ThemeProvider theme={refySiteTheme} mode="light">
  <Button variant="primary">Começar</Button>
</ThemeProvider>
~~~

O JSON em src/themes/refy-site.json é a fonte do preset exportado. Toolbar, Playground, editor e exemplos compartilham o mesmo objeto. Refy continua sendo o preset original; nenhum consumidor é migrado. O modo não altera fontes, raios ou dimensões.

## Storybook

Navegação: **Componentes → Páginas → Refy Site**. IDs e links refy-site-- preservados. A imagem mobile foi desdobrada em três stories, totalizando 14.

| Imagem | Story |
| --- | --- |
| 01 Início | refy-site--inicio |
| 02 Instalação | refy-site--instalacao |
| 03 Componentes | refy-site--componentes |
| 04 Accordion | refy-site--accordion |
| 05 Blocks | refy-site--blocks |
| 06 Charts | refy-site--charts |
| 07 Temas | refy-site--temas |
| 08 Para IAs | refy-site--para-i-as |
| 09 Escuro | refy-site--escuro |
| 10 Mobile | refy-site--mobile-inicio / mobile-menu / mobile-accordion |
| 11 Busca | refy-site--busca |
| 12 Tipografia | refy-site--tipografia |

Após a aplicação, iniciar com npm run storybook e abrir:
http://localhost:6006/?path=/story/refy-site--inicio

As composições são páginas, não novas famílias de organismos. Reutilizam o catálogo real, 117 famílias, editor de temas, gráficos D3, BlockViewport, documentação e fontes. Os elementos interativos usam as APIs reais: formulário local, calendário, tabs, Accordion, diálogo, busca por teclado e navegação mobile.

## Fluxo de criação

A navegação pública conecta Componentes, Templates e Playground. O nome Templates usa o mesmo catálogo de Blocks e preserva seu ID. O CTA **Personalizar no Playground** leva o componente ou a variação selecionada ao editor compartilhado, mantendo a configuração em andamento.

**Começar** na home e **Começar do tema padrão** usam `defaultConfig`, preservam o modo e pedem confirmação antes de descartar uma personalização. Abrir o Playground pela navegação retoma a sessão. Seleções de exemplo/template e tema são estados separados.

A story adicional `refy-site--playground` cobre o novo fluxo; as 14 stories referentes às imagens originais continuam com os mesmos IDs. [Guia de uso e limites](CREATION_PLAYGROUND.md). Esta entrega funcional não representa aprovação visual das novas composições ou encerramento do gate antigo.

## Hooks adicionados

Os hooks abaixo continuam disponíveis para personalização pública. A revisão de densidade removeu a maior parte dos overrides do preset para que seus fallbacks originais sejam herdados. As descrições de métricas ampliadas nas seções históricas não representam o preset atual.

Todos opcionais, com fallback para preservar os componentes originais.

- Accordion: --accordion-border-width, --accordion-gap, --accordion-item-border-width, --accordion-item-radius, --accordion-divider-width, --accordion-open-background.
- BrandLogo: --brand-logo-font, --brand-logo-gap, --brand-dot-background, --brand-dot-radius, --brand-dot-shadow. A assinatura do site usa o slot children existente.
- Calendar: --calendar-day-radius.

O editor reconhece o inventário gerado por scripts/check-tokens.mjs. Gap é validado como dimensão. Nenhuma prop pública foi removida.

## Correspondência e limites

As imagens são referências generativas. A estrutura de Blocks, Charts e Tipografia reutiliza as páginas funcionais atuais, com os dados, APIs, nomes e código reais da biblioteca. Não usa PNG como interface. Essas três composições ainda precisam da comparação visual final com as imagens; não são declaradas equivalentes pixel a pixel.

Em 01/11/2026 o mantenedor corrigiu a marca: o nome e o logo são "refy", sem ".design" e sem selo Beta; refy.design é só o domínio. A tinta verde de seleção clara foi ajustada de #087f5b para #067453 sobre menta para manter contraste textual mínimo de 4,5:1 nos pares verificados. A cor da ação primária permanece #087f5b.

As páginas estão no Storybook. Não constituem implementação das 207 rotas propostas no sitemap nem um site público já publicado. Os exemplos de IA são conteúdo de orientação; não prometem MCP ou serviço de IA em produção.

## Validação

- npm run check: tokens, contraste original, motion, tipos, build, CSS seletivo, SSR, blocks e documentação.
- npm run check:site-theme: export público igual ao JSON, tokens reconhecidos, referências sem ciclos, pares de contraste, geometria independente do modo e SSR.
- npm run check:specs: validação dos contratos OpenSpec.
- npm run build-storybook: geração das 14 stories.
- graft build: análise da fonte.
- tests/refy-site.spec.ts: regressões de formulário/tema/modo, busca/Accordion e mobile. Preparadas, mas não executadas nesta sessão por falta de uma prévia servida do candidato.

A validação visual, teclado/foco real, exportação/reimportação no navegador e aprovação do mantenedor permanecem pendentes. Testes estruturais não substituem essas verificações.

## Publicação em refy.design

A hospedagem pode usar Cloudflare Pages ou Workers. O registro do domínio pode continuar na GoDaddy.

Para Pages diretamente no domínio raiz refy.design, a documentação exige a zona na mesma conta Cloudflare e nameservers apontados para a Cloudflare. Para um subdomínio, como www.refy.design, existe o caminho de CNAME no provedor DNS atual, após associar o hostname ao projeto Pages.

Antes de qualquer mudança: identificar a conta/projeto de destino e conferir os registros atuais, especialmente MX/TXT, para preservá-los. O painel fornecido abriu em login; os registros atuais não foram acessados. Nenhum deployment ou DNS foi alterado.

Fonte oficial consultada em 25/10/2026:
https://developers.cloudflare.com/pages/configuration/custom-domains/


## Ajuste visual por referência, 25/10/2026

O aceite anterior foi reaberto pelo mantenedor. A revisão usa as imagens locais como referência, com capturas a 1536×1024 e 390×844, e mantém os componentes reais.

| Família | Personalização pelo tema |
| --- | --- |
| Accordion | Fonte, tamanho, altura de linha e padding de gatilho/conteúdo, além de bordas, separação e fundo aberto |
| Calendar | Largura, padding, dias, tipografia dos dias da semana e posição/alinhamento do título |
| Tabs | Padding, tamanho, cor/peso selecionado, espaço até o painel e preenchimento das pills |
| Card | Tamanho e altura de linha do título, peso e distância do cabeçalho |
| CodeBlock | Padding do cabeçalho/corpo, superfície do cabeçalho e altura de linha |

Todos esses hooks estão inventariados em TOKEN_INVENTORY.md e são reconhecidos na exportação/importação. Os fallbacks originais continuam válidos. Calendar oferece fixedWeeks=false para composição de altura natural; o default permanece seis semanas.

O editor aceita códigos hexadecimais nos campos de cores, aplicados com Enter ou ao sair do campo. Valores incompletos preservam a prévia. Alterar a cor principal preserva fundos que a referenciam por var(--primary), inclusive o degradê deste preset. Selecionar novamente o preset descarta a personalização, inclusive quando ele já é a identidade de base.

Corrigido vazamento dos títulos da página nos títulos internos dos componentes. Espaçamento da página, colunas, cabeçalho e ordem mobile pertencem à composição; a aparência dos componentes permanece no tema JSON.

A conferência do agente não representa aprovação visual humana, equivalência integral de pixels ou certificação assistiva.

## Consistência entre Site, Playground e stories

A correção seguinte removeu os overrides de tokens que existiam no CSS da página. A aparência dos componentes é definida pelo preset público; a composição continua definindo apenas seu layout e conteúdo. Não há uma versão compacta silenciosa do tema na home, no catálogo ou no mobile.

O exemplo principal de Accordion usa a mesma variante padrão, itens e estado inicial nos três destinos. A variante plain permanece explicitamente documentada. As páginas respeitam o tema/modo da toolbar e da URL; somente a story dedicada de modo escuro fornece initialMode explicitamente.

Conferência em Chrome: fonte, tamanho, peso, linha, padding, cores, bordas, raios e gap do Accordion coincidiram em Site/Playground/story, nos modos claro e escuro. A navegação real Playground → Páginas → Refy Site → Accordion também foi exercitada, preservando o tema. Isso não substitui a revisão visual das demais composições.
