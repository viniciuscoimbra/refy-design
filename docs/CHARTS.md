# Charts com D3

[De–para da revisão visual e controles](CHART_VISUAL_LANGUAGE.md).

O Refy usa D3 para calcular geometria e React para renderizar SVG. O catálogo ampliado está em Playground → Charts. A API anterior (LineChart, AreaChart, BarChart, DonutChart, Sparkline) continua disponível com os mesmos defaults. Para composições configuráveis, use D3Chart.

## Tipos implementados

| Família | type | Dados |
| --- | --- | --- |
| Tendência/comparação | line, area, bar, scatter, bubble | series: id, label, data com x/y; size em bubble |
| Distribuição | histogram | values e thresholds opcionais |
| Distribuição | boxplot | groups com id, label, values |
| Financeiro | candlestick | series com x, y, open, close, low, high |
| Intensidade | heatmap | cells com x/y categóricos e value |
| Radial | pie, donut, radial-bar, gauge | items com id, label, value |
| Perfil | radar | series com x categórico e y não negativo |
| Hierarquia | treemap, pack, tree, cluster, partition, sunburst | root com id, name, value nas folhas e children |
| Relações | network, chord, sankey | network com nodes e links por IDs |
| Geografia | geo | features: GeoJSON FeatureCollection |

Os 24 tipos não são uma lista completa de tudo que se pode criar com D3. Renderização SVG, sem benchmark para milhões de pontos. Zoom/brush e streaming estão disponíveis conforme a matriz abaixo. Arraste de nós não está implementado. Não há nova engine Recharts/ECharts/Plot.

## Uso

Instale o pacote como descrito no [README](../README.md#usar-em-um-projeto-novo).

```tsx

import '@refy-design/web/tokens.css';
import '@refy-design/web/fonts.css';
import { D3Chart, ThemeProvider } from '@refy-design/web';

export function Relatorio() {
  return <ThemeProvider mode="light">
    <D3Chart type="area" title="Leituras" label="Leituras mensais por origem"
      series={[
        { id: 'busca', label: 'Busca', data: [{ x: 'Jan', y: 120 }, { x: 'Fev', y: 180 }] },
        { id: 'direto', label: 'Direto', data: [{ x: 'Jan', y: 80 }, { x: 'Fev', y: 110 }] },
      ]}
      curve="natural" stacked legend={{ position: 'bottom' }}
      xAxis={{ line: false }} yAxis={{ tickCount: 4, format: v => `${v} leituras` }}
      onSelect={datum => console.log(datum)} />
  </ThemeProvider>;
}
```

## Opções comuns

- height: 120–2000px; margin: top/right/bottom/left em pixels. O SVG acompanha a largura do contêiner sem reduzir a fonte.
- xAxis/yAxis: visible, line, ticks, tickCount, tickValues, domain, scale, nice, title, format. Escalas numéricas: linear, log, symlog, sqrt. Datas no eixo X usam tempo. Texto usa categorias; propriedades de domínio/escala numérica não se aplicam às categorias. Barras horizontais usam xAxis como eixo de valores e yAxis como categorias.
- createScale em um eixo numérico: fábrica de escala contínua D3, por exemplo `() => scalePow().exponent(2)`. O Refy configura domínio e range; o consumidor configura os parâmetros próprios da escala.
- grid: false, true, x, y ou both nas famílias com eixos quantitativos. Heatmap usa células, não grid quantitativo. Eixos de categorias de heatmap mostram os nomes e seu formatador.
- `legend`: boolean ou objeto com `position` (top/bottom/right), `interactive`, `marker` e `render(item)`. A interação oculta séries, itens ou ramos conforme a família. A tabela continua com os dados completos. Heatmap e geo usam escala de intensidade, sem legenda categórica automática.
- `tooltip`: boolean ou objeto `{ render: datum => ... }`; a função não é passada diretamente. `onHover` recebe ChartDatum/null; `onSelect` recebe ChartDatum por clique, toque ou Enter/Espaço.
- colors: paleta por instância. Séries/itens também aceitam color. O padrão usa os oito tokens `--chart-primary` até `--chart-octonary` descritos no [guia de cores](CHART_VISUAL_LANGUAGE.md). O terceiro e o quarto preservam fallbacks semânticos de compatibilidade. colorScale(value) personaliza a cor de heatmap e geo, permitindo escalas sequenciais/divergentes do D3.
- renderMark(mark, layout) personaliza uma marca preservando o dado e a interação. renderOverlay recebe dimensões e scene (marcas, legenda e escalas, quando aplicáveis) para camadas SVG adicionais. O consumidor responde pela acessibilidade de conteúdo próprio.

## Opções de família

- line/area: curve natural, linear, monotone, step, step-before, step-after, basis, cardinal, catmull-rom, bump ou qualquer CurveFactory D3; dots, strokeWidth, fillOpacity.
- area/bar: stacked true ou percent; percent exige não negativos e trata total zero. Bar aceita orientation horizontal/vertical.
- histogram: thresholds (contagem ou limites explícitos). Contagens produzidas pelo bin do D3.
- boxplot: quartis e mediana do D3, limites de 1,5 IQR, extremos desenhados e informados no tooltip/tabela.
- pie/donut/radial-bar/gauge: innerRadius proporcional, padAngle, cornerRadius e startAngle/endAngle em radianos; max no indicador/barras radiais. Gauge aceita um item.
- radar: max comum às séries e fillOpacity. Pelo menos três dimensões.
- hierarquias: padding; área/proporção usa valores das folhas. IDs devem ser únicos em toda a árvore.
- network: iterations 1–300, simulação determinística interrompida após o cálculo. Sem timer permanente ou mutação dos objetos do consumidor.
- sankey: iterations 1–64, fluxos não negativos, sem ciclos. Chord usa vínculos direcionados.
- geo: projection mercator/equal-earth/orthographic ou fábrica que devolve uma projeção D3. Mapas recebem GeoJSON local, sem fetch; GeometryCollection deve ser desmembrada em features individuais. Projeção é ajustada à janela. A amostra é demonstrativa, não um mapa oficial.

## Interação e limites

Setas percorrem marcas; Home/End vão aos extremos, Enter/Espaço selecionam e Escape limpa o destaque. Tooltip tem conteúdo equivalente por teclado e toque. Dados alternativos estão em Table. Sem dados e entradas inválidas exibem estado explícito, sem SVG NaN/Infinity. Cor não é a única informação: nomes/valores estão no tooltip, legenda e tabela. Fontes/modos são herdados de ThemeProvider.

A validação automatizada não equivale a certificação de leitor de tela ou homologação dos produtos consumidores. Esses testes manuais permanecem pendentes. Nenhum consumidor foi migrado.

Referências: [D3 API](https://d3js.org/api), [curvas](https://d3js.org/d3-shape/curve), [hierarquias](https://d3js.org/d3-hierarchy), [escalas](https://d3js.org/d3-scale).

## Zoom, brush e dados ao vivo

| Família | Zoom | Brush | Assinatura stream |
| --- | --- | --- | --- |
| line/area/scatter/bubble/candlestick/bar vertical | Eixo X recalculado | Intervalo X | Sim |
| bar horizontal | Não | Não | Sim |
| hierarquias, network/chord/sankey, geo | Espacial | Não | Dados controlados por props |
| histogram/boxplot/heatmap e radiais | Não | Não | Dados controlados por props |

Ative `zoom` e/ou `brush` em D3Chart. A navegação usa d3-zoom/d3-brush; React controla o SVG principal. Somente o grupo do brush é controlado pelo D3. Botões ampliam/reduzem/deslocam/restauram. Ctrl + scroll amplia; o scroll comum continua rolando a página. Em touch, há controles explícitos e pinch; um dedo permanece disponível para rolagem. A faixa de contexto aceita arraste e handles; Range oferece ajuste por teclado. Brush atualiza a janela ao concluir o gesto.

`zoom={{maxScale:16,wheel:false,onChange:viewport=>...}}` limita o fator de 1 a 100 (padrão 16). Viewport tem k/x/y em coordenadas do SVG. wheel:true habilita zoom sem modificador, por escolha explícita do consumidor. Resize preserva frações visíveis no zoom X.

`brush={{onChange:selection=>...}}` recebe null na visão completa ou `{range:[início,fim],items:[...]}` com valores originais de X e dados da base no intervalo, inclusive séries ocultadas na legenda. O intervalo acompanha a janela; callback é emitido nas ações de navegação. Eixos e clipping são recalculados, em vez de ampliar textos junto da linha. No zoom espacial, os elementos da cena são ampliados e os tooltips consultam coordenadas inversas.

### Assinatura de streaming

```tsx
import { useCallback } from 'react';
import { D3Chart } from '@refy-design/web';
import type { ChartStreamOptions } from '@refy-design/web';

export function Monitor() {
  const subscribe = useCallback<ChartStreamOptions['subscribe']>(push => {
    const onMessage = (event: Event) => {
      const data = (event as CustomEvent<{x:number;y:number}>).detail;
      push([{seriesId:'events',points:[data]}]);
    };
    window.addEventListener('meu-produto:chart-point', onMessage);
    return () => window.removeEventListener('meu-produto:chart-point', onMessage);
  }, []);
  return <D3Chart type="line" title="Eventos" label="Eventos recebidos"
    series={initialSeries} zoom brush stream={{subscribe,maxPoints:120,paused:false}} />;
}
const initialSeries = [{id:'events',label:'Eventos',data:[{x:0,y:0}]}];
```

O Refy não abre WebSocket/SSE nem busca dados. O consumidor adapta sua origem à função push e retorna seu cleanup. O Playground usa um timer local simulado, com código copiável, pausa/retomada e limite ajustável. Estabilize subscribe com useCallback/useMemo; trocar a função troca a assinatura. Não recrie a origem a cada render.

Cada lote contém `{seriesId,points}`. X repetido atualiza o ponto; valores numéricos/datas são ordenados. maxPoints limita cada série (2–10000, padrão 120). Pausa remove a assinatura e preserva os dados; retomada reassina. A origem decide se fornece backlog. Mudança da referência de series é uma nova base; reduzir maxPoints corta o buffer atual, sem resetar sua origem. Lotes com série desconhecida ou valores não finitos são rejeitados por inteiro, preservando o último estado válido. onError(message) informa falhas; snapshots protegem a fila React de mutações posteriores do lote. Cleanup impede atualizações de origens já removidas.

Pause para examinar uma janela fixa: com stream ativo, o domínio acompanha o buffer recebido. SVG não foi certificado para milhões de pontos.

## Acabamento e opções visuais

A legenda compartilhada é usada também pelas APIs anteriores. Marcador e texto pertencem ao mesmo alvo; marcador square/circle/line pode ser configurado em legend.marker. legend.interactive:false produz informação estática, sem botão desabilitado. IDs/estado de séries permanecem independentes da aparência.

Pizza usa padAngle 0/cornerRadius 0 por padrão. Rosca mantém separação discreta; o Playground permite configurar a separação, arredondamento, raio interno e ângulos. No gauge, innerRadius é proporcional ao raio externo; nas barras radiais, determina o vazio relativo de cada faixa. Outros controles incluem escala/limites/formato/ticks, pontos/espessura/opacidade, bins do histograma, separação entre ramos, padding hierárquico, iterações e projeção. Callbacks, fábricas de escala/projeção e renderização customizada seguem como opções avançadas no código.

## Navegação do catálogo
Lista lateral agrupada e pesquisável, no padrão de Componentes. Uma família por documento, com prévia, código e controles próprios; Streaming tem entrada dedicada. A comparação experimental não aparece na navegação pública. URLs antigas permanecem como fixtures ocultas para regressão.
