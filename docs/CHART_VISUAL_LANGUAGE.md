# Charts e controles — revisão local de 24/10/2026

A estrutura do Playground foi preservada. Esta revisão muda a linguagem visual compartilhada dos gráficos e o acabamento dos seletores; não constitui aprovação visual do mantenedor nem publicação.

| Antes | Agora | Motivo |
| --- | --- | --- |
| Verde de ação e cinza de texto usados como séries | Oito tokens próprios de dados, com valores claro/escuro | Distinguir séries sem confundir estado de interface com informação |
| Quatro cores repetidas | Oito entradas distintas na origem compartilhada D3 | Aumentar a diferenciação; acima de oito, fornecer uma paleta adequada ao conjunto |
| colorScale seguido por transparência implícita em heatmap/mapa | Cor explícita renderizada com opacidade 1 | Respeitar a escala definida pelo consumidor |
| Áreas sobrepostas e curva natural no exemplo | Áreas empilhadas, curva monotone e preenchimento 12% | Evitar sobreposição acinzentada e suavização que ultrapassa os dados; demais composições continuam selecionáveis |
| Cabeçalho genérico repetido | Nome da família e título dos dados no exemplo | Priorizar a leitura do gráfico |
| Legenda com caixas em repouso | Marcadores, texto e estados de interação | Reduzir ruído mantendo seleção, foco e hover |
| dashboard-01 na apresentação | Painel de projetos | Nome humano; IDs, arquivos e URLs continuam estáveis |
| Texto nos seletores de dispositivo e prévia/código | Ícones com Tooltip, nome acessível e teclado | Compactar os controles sem remover a identificação |

## Cores e personalização

Os tokens `--chart-primary`, `--chart-secondary`, `--chart-tertiary`, `--chart-quaternary`, `--chart-quinary`, `--chart-senary`, `--chart-septenary` e `--chart-octonary` aparecem no editor como **Dados · série 1…8**. A fonte canônica permanece `src/tokens/foundations.tokens.json`; valores gerados ficam no CSS de tokens. `colors`, cor por série e `colorScale` continuam tendo precedência conforme a API. Nenhuma biblioteca de runtime foi adicionada.

Os oito traços sólidos foram medidos contra a superfície padrão nos dois modos, com razão mínima 3:1. Isso não certifica preenchimentos translúcidos, todas as combinações customizadas ou percepção por pessoas com deficiência de visão de cores. Legendas textuais, exploração por teclado e tabela de dados continuam necessários; não usar somente cor para informação essencial. Intensidade padrão em mapas/heatmaps continua sendo codificada por opacidade; uma escala explícita pode substituir essa escolha.

Os defaults de curva/composição/opacidade citados acima são do exemplo do Playground. A API de composição do pacote não foi silenciosamente redefinida. O controle compartilhado Segmented ganhou `iconOnly`, opt-in, com fallback textual para opções sem ícone ou rótulo textual; os usos existentes continuam válidos.

## Referências consultadas

- [A Cor dos Dados — Kate Strachnyi, Novatec](https://novatec.com.br/livros/a-cor-dos-dados/): descrição e sumário públicos, usados como orientação sobre intenção da cor, contexto e legibilidade. Não houve leitura integral do livro.
- [Good Charts, edição atualizada — Scott Berinato, HBR Press](https://store.hbr.org/product/good-charts-updated-and-expanded-the-hbr-guide-to-making-smarter-more-persuasive-data-visualizations/10637): apresentação pública, usada como orientação sobre clareza e propósito visual. Não houve leitura integral do livro.
- [Good Charts Workbook — HBR Press](https://store.hbr.org/product/good-charts-workbook-tips-tools-and-exercises-for-making-better-data-visualizations/10209): apresentação pública sobre controle da cor e construção de clareza.

Essas referências orientam decisões; não comprovam que o resultado atingiu a qualidade esperada. Essa avaliação pertence à revisão visual do mantenedor. Os casos end-to-end de adoção serão a próxima etapa após essa revisão. Artefatos de pacote de rodadas anteriores não representam automaticamente este estado de fonte.
