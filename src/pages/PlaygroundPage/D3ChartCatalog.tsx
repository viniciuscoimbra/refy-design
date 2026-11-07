import { tr } from "../RefySitePage/i18n";
import { PackageInstall } from "../RefySitePage/PackageInstall";
import { Icons } from "../../_demo/icons";
import { useState } from "react";
import {
  Button,
  Card,
  CodeBlock,
  D3Chart,
  Select,
  Slider,
  Input,
  Switch,
  Segmented,
} from "../../index";
import type { ChartCurve, ChartDatum, D3ChartProps } from "../../index";
import { chartExamples } from "../../_demo/chartExamples";
import { ChartStreamingExample } from "./ChartStreamingExample";
import styles from "./D3ChartCatalog.module.css";
import catalog from "./ComponentDocumentation.module.css";
function ChartDocument({ type }: { type: D3ChartProps["type"] }) {
  const [xAxis, setXAxis] = useState(true),
    [yAxis, setYAxis] = useState(true),
    [grid, setGrid] = useState(true),
    [tooltip, setTooltip] = useState(true),
    [legend, setLegend] = useState(true);
  const [position, setPosition] = useState<"top" | "bottom" | "right">(
      "bottom",
    ),
    [curve, setCurve] = useState<ChartCurve>("monotone"),
    [height, setHeight] = useState(300);
  const [stack, setStack] = useState(type === "area" ? "stacked" : "none"),
    [horizontal, setHorizontal] = useState(false),
    [selection, setSelection] = useState<ChartDatum | null>(null),
    [tab, setTab] = useState("preview");
  const [zoomEnabled, setZoom] = useState(false),
    [brushEnabled, setBrush] = useState(false),
    [marker, setMarker] = useState("auto"),
    [interactiveLegend, setInteractiveLegend] = useState(true);
  const [dots, setDots] = useState(false),
    [strokeWidth, setStroke] = useState(2),
    [opacity, setOpacity] = useState(12),
    [hole, setHole] = useState<number>(),
    [gap, setGap] = useState<number>(),
    [corner, setCorner] = useState<number>(),
    [start, setStart] = useState<number>(),
    [end, setEnd] = useState<number>();
  const [maximum, setMaximum] = useState<number>(),
    [bins, setBins] = useState(8),
    [padding, setPadding] = useState(4),
    [separation, setSeparation] = useState(2),
    [iterations, setIterations] = useState(24),
    [projection, setProjection] = useState("mercator");
  const [scale, setScale] = useState("linear"),
    [tickCount, setTicks] = useState(4),
    [axisLine, setAxisLine] = useState(false),
    [minValue, setMin] = useState(""),
    [maxValue, setMax] = useState(""),
    [gridDirection, setGridDirection] = useState("y");
  const [format, setFormat] = useState("number");
  const formats = {
    number: undefined,
    compact: (value: unknown) =>
      typeof value === "number"
        ? new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(value)
        : String(value),
    percent: (value: unknown) =>
      typeof value === "number" ? `${Math.round(value * 100)}%` : String(value),
  };
  const formatSources = {
    number: "undefined",
    compact:
      "value => typeof value === 'number' ? new Intl.NumberFormat('pt-BR', {notation:'compact'}).format(value) : String(value)",
    percent:
      "value => typeof value === 'number' ? `${Math.round(value*100)}%` : String(value)",
  };
  const radial = ["pie", "donut", "radial-bar", "gauge"].includes(type);
  const seriesChart = [
    "line",
    "area",
    "bar",
    "scatter",
    "bubble",
    "candlestick",
  ].includes(type);
  const canBrush = seriesChart && !(type === "bar" && horizontal);
  const canZoom =
    canBrush ||
    [
      "geo",
      "network",
      "sankey",
      "chord",
      "tree",
      "cluster",
      "treemap",
      "pack",
      "partition",
      "sunburst",
    ].includes(type);
  const hasLegend = !["heatmap", "geo"].includes(type);
  const cartesian = [
    "line",
    "area",
    "bar",
    "scatter",
    "bubble",
    "histogram",
    "boxplot",
    "candlestick",
    "heatmap",
  ].includes(type);
  const sample = chartExamples.find((example) => example.id === type)!;
  const valueOptions = {
    scale,
    ...(format === "number"
      ? {}
      : { format: formats[format as keyof typeof formats] }),
    ...(minValue !== "" && maxValue !== ""
      ? { domain: [Number(minValue), Number(maxValue)] }
      : {}),
  };
  const config: D3ChartProps = {
    ...sample.props,
    showTitle: true,
    height,
    grid: cartesian && grid ? gridDirection : false,
    zoom: canZoom && zoomEnabled,
    brush: canBrush && brushEnabled,
    tooltip,
    legend: hasLegend
      ? {
          position,
          interactive: interactiveLegend,
          ...(marker === "auto" ? {} : { marker }),
        }
      : false,
    ...(cartesian
      ? {
          xAxis: {
            ...sample.props.xAxis,
            visible: xAxis,
            line: axisLine,
            tickCount,
            ...(type === "bar" && horizontal ? valueOptions : {}),
          },
          yAxis: {
            ...sample.props.yAxis,
            visible: yAxis,
            line: axisLine,
            tickCount,
            ...(type === "bar" && horizontal ? {} : valueOptions),
          },
        }
      : {}),
    ...(["line", "area"].includes(type)
      ? { curve, dots, strokeWidth, fillOpacity: opacity / 100 }
      : {}),
    ...(type === "radar"
      ? { fillOpacity: opacity / 100, max: maximum ?? 100 }
      : {}),
    ...(radial
      ? {
          innerRadius: hole ?? (type === "pie" ? 0 : 0.68),
          padAngle: gap ?? (type === "pie" ? 0 : 0.025),
          cornerRadius: corner ?? (type === "pie" ? 0 : 3),
          startAngle: ((start ?? (type === "gauge" ? -90 : 0)) * Math.PI) / 180,
          endAngle: ((end ?? (type === "gauge" ? 90 : 360)) * Math.PI) / 180,
          ...(["gauge", "radial-bar"].includes(type)
            ? { max: maximum ?? (type === "gauge" ? 100 : 420) }
            : {}),
        }
      : {}),
    ...(type === "histogram" ? { thresholds: bins } : {}),
    ...(["treemap", "pack", "partition", "sunburst"].includes(type)
      ? { padding }
      : {}),
    ...(["tree", "cluster"].includes(type) ? { separation } : {}),
    ...(["network", "sankey"].includes(type) ? { iterations } : {}),
    ...(type === "chord" ? { padAngle: gap ?? 0.05 } : {}),
    ...(type === "geo" ? { projection } : {}),
    ...(["area", "bar"].includes(type)
      ? { stacked: stack === "percent" ? "percent" : stack === "stacked" }
      : {}),
    ...(type === "bar"
      ? { orientation: horizontal ? "horizontal" : "vertical" }
      : {}),
  } as D3ChartProps;
  const code = `import { D3Chart } from '@refy-design/web';\nimport type { D3ChartProps } from '@refy-design/web';\n\nconst config: D3ChartProps = ${JSON.stringify(config, (_key, value) => (typeof value === "function" ? "__chartFormat__" : value), 2).replace('"__chartFormat__"', formatSources[format as keyof typeof formatSources])};\n\nexport function Example() {\n  return <D3Chart {...config} onSelect={datum => console.log(datum)} />;\n}`;
  return (
    <section className={styles.page} aria-label={tr("Catálogo D3")}>
      <section
        className={styles.example}
        aria-label={`Exemplo de ${sample.name}`}
      >
        <header className={styles.exampleHeader}>
          <div>
            <small>
              {sample.group}
            </small>
            <h1>{sample.name}</h1>
            <p>{sample.description}</p>
          </div>
          <Segmented
            iconOnly
            label={tr("Exibir exemplo")}
            value={tab}
            onChange={setTab}
            options={[
              { value: "preview", label: tr("Prévia"), icon: Icons.monitor },
              { value: "code", label: tr("Código"), icon: Icons.code },
            ]}
          />
        </header>
        {tab === "preview" ? (
          <div className={styles.preview}>
            <Card>
              <D3Chart key={type} {...config} onSelect={setSelection} />
            </Card>
            <p className={styles.selection} role="status">
              {selection
                ? `${tr("Selecionado:")} ${selection.label} · ${Object.entries(
                    selection.values,
                  )
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}`
                : tr("Explore com o mouse ou com setas; Enter seleciona. Toque também seleciona.")}
            </p>
          </div>
        ) : (
          <CodeBlock
            code={code}
            language="tsx"
            label={`${sample.name} · uso completo`}
          />
        )}
      </section>
      <section aria-label={tr("Opções do gráfico")} className={styles.options}>
        <div className={styles.switches}>
          {canZoom && (
            <Switch
              label={tr("Zoom e pan")}
              checked={zoomEnabled}
              onChange={(e) => setZoom(e.target.checked)}
            />
          )}
          {canBrush && (
            <Switch
              label={tr("Brush de intervalo")}
              checked={brushEnabled}
              onChange={(e) => setBrush(e.target.checked)}
            />
          )}

          {cartesian && (
            <>
              <Switch
                label={tr("Eixo X")}
                checked={xAxis}
                onChange={(e) => setXAxis(e.target.checked)}
              />
              <Switch
                label={tr("Eixo Y")}
                checked={yAxis}
                onChange={(e) => setYAxis(e.target.checked)}
              />
              <Switch
                label={tr("Grid")}
                disabled={type === "heatmap"}
                checked={type !== "heatmap" && grid}
                onChange={(e) => setGrid(e.target.checked)}
              />
            </>
          )}
          <Switch
            label={tr("Tooltip")}
            checked={tooltip}
            onChange={(e) => setTooltip(e.target.checked)}
          />
          <Switch
            label={tr("Legenda")}
            disabled={!hasLegend}
            checked={hasLegend && legend}
            onChange={(e) => setLegend(e.target.checked)}
          />
        </div>
        <div className={styles.fields}>
          <h3 className={styles.optionHeading}>{tr("Quadro e legenda")}</h3>
          <Slider
            label={tr("Altura do gráfico")}
            min={220}
            max={500}
            step={20}
            value={height}
            onChange={setHeight}
          />
          <Select
            label={tr("Posição da legenda")}
            value={position}
            disabled={!legend || !hasLegend}
            onChange={(e) => setPosition(e.target.value as typeof position)}
          >
            <option value="bottom">{tr("Abaixo")}</option>
            <option value="top">{tr("Acima")}</option>
            <option value="right">{tr("À direita")}</option>
          </Select>
          {hasLegend && (
            <>
              <Select
                label={tr("Marcador da legenda")}
                value={marker}
                onChange={(e) => setMarker(e.target.value)}
              >
                <option value="auto">{tr("Conforme o gráfico")}</option>
                <option value="square">{tr("Quadrado")}</option>
                <option value="circle">{tr("Círculo")}</option>
                <option value="line">{tr("Linha")}</option>
              </Select>
              <Switch
                label={tr("Legenda interativa")}
                checked={interactiveLegend}
                onChange={(e) => setInteractiveLegend(e.target.checked)}
              />
            </>
          )}
          {cartesian && type !== "heatmap" && (
            <>
              <h3 className={styles.optionHeading}>{tr("Eixos e escala")}</h3>
              <Select
                label={tr("Escala de valores")}
                value={scale}
                onChange={(e) => setScale(e.target.value)}
              >
                {["linear", "log", "symlog", "sqrt"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </Select>
              <Select
                label={tr("Formato dos valores")}
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="number">{tr("Número")}</option>
                <option value="compact">{tr("Compacto")}</option>
                <option value="percent">{tr("Percentual")}</option>
              </Select>
              <Slider
                label={tr("Quantidade de ticks")}
                min={2}
                max={8}
                value={tickCount}
                onChange={setTicks}
              />
              <Switch
                label={tr("Linha dos eixos")}
                checked={axisLine}
                onChange={(e) => setAxisLine(e.target.checked)}
              />
              <Input
                label={tr("Limite inferior")}
                type="number"
                placeholder={tr("Automático")}
                value={minValue}
                onChange={(e) => setMin(e.target.value)}
              />
              <Input
                label={tr("Limite superior")}
                type="number"
                placeholder={tr("Automático")}
                value={maxValue}
                onChange={(e) => setMax(e.target.value)}
              />
              <Select
                label={tr("Direção do grid")}
                disabled={!grid}
                value={gridDirection}
                onChange={(e) => setGridDirection(e.target.value)}
              >
                <option value="y">{tr("Horizontal")}</option>
                <option value="x">{tr("Vertical")}</option>
                <option value="both">{tr("Ambas")}</option>
              </Select>
            </>
          )}
          {["line", "area"].includes(type) && (
            <>
              <Switch
                label={tr("Mostrar pontos")}
                checked={dots}
                onChange={(e) => setDots(e.target.checked)}
              />
              <Slider
                label={tr("Espessura da linha")}
                min={1}
                max={5}
                step={0.5}
                value={strokeWidth}
                onChange={setStroke}
              />
            </>
          )}
          {["area", "radar"].includes(type) && (
            <Slider
              label={tr("Opacidade da área")}
              min={0}
              max={80}
              value={opacity}
              onChange={setOpacity}
              formatValue={(v) => `${v}%`}
            />
          )}
          {radial && (
            <>
              <h3 className={styles.optionHeading}>{tr("Geometria radial")}</h3>
              <Slider
                label={tr("Raio interno")}
                min={0}
                max={0.9}
                step={0.05}
                value={hole ?? (type === "pie" ? 0 : 0.68)}
                onChange={setHole}
              />
              <Slider
                label={tr("Espaço entre setores")}
                min={0}
                max={0.15}
                step={0.005}
                value={gap ?? (type === "pie" ? 0 : 0.025)}
                onChange={setGap}
              />
              <Slider
                label={tr("Arredondamento dos setores")}
                min={0}
                max={12}
                value={corner ?? (type === "pie" ? 0 : 3)}
                onChange={setCorner}
              />
              <Slider
                label={tr("Ângulo inicial")}
                min={-180}
                max={0}
                value={start ?? (type === "gauge" ? -90 : 0)}
                onChange={setStart}
              />
              <Slider
                label={tr("Ângulo final")}
                min={10}
                max={360}
                value={end ?? (type === "gauge" ? 90 : 360)}
                onChange={setEnd}
              />
            </>
          )}
          {["gauge", "radial-bar", "radar"].includes(type) && (
            <Slider
              label={tr("Valor máximo")}
              min={10}
              max={1000}
              step={10}
              value={maximum ?? (type === "radial-bar" ? 420 : 100)}
              onChange={setMaximum}
            />
          )}
          {type === "histogram" && (
            <Slider
              label={tr("Intervalos do histograma")}
              min={2}
              max={30}
              value={bins}
              onChange={setBins}
            />
          )}
          {["treemap", "pack", "partition", "sunburst"].includes(type) && (
            <Slider
              label={tr("Espaço da hierarquia")}
              min={0}
              max={12}
              value={padding}
              onChange={setPadding}
            />
          )}
          {["tree", "cluster"].includes(type) && (
            <Slider
              label={tr("Espaço entre ramos")}
              min={1}
              max={5}
              step={0.5}
              value={separation}
              onChange={setSeparation}
            />
          )}
          {["network", "sankey"].includes(type) && (
            <Slider
              label={tr("Iterações do layout")}
              min={1}
              max={type === "sankey" ? 64 : 200}
              value={iterations}
              onChange={setIterations}
            />
          )}
          {type === "chord" && (
            <Slider
              label={tr("Espaço entre grupos")}
              min={0}
              max={0.15}
              step={0.005}
              value={gap ?? 0.05}
              onChange={setGap}
            />
          )}
          {type === "geo" && (
            <Select
              label={tr("Projeção geográfica")}
              value={projection}
              onChange={(e) => setProjection(e.target.value)}
            >
              <option value="mercator">{tr("Mercator")}</option>
              <option value="equal-earth">{tr("Equal Earth")}</option>
              <option value="orthographic">{tr("Ortográfica")}</option>
            </Select>
          )}
          {["line", "area"].includes(type) && (
            <Select
              label={tr("Curva")}
              value={typeof curve === "string" ? curve : "natural"}
              onChange={(e) => setCurve(e.target.value as ChartCurve)}
            >
              {[
                "natural",
                "linear",
                "monotone",
                "step",
                "step-before",
                "step-after",
                "basis",
                "cardinal",
                "catmull-rom",
                "bump",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
          {["area", "bar"].includes(type) && (
            <Select
              label={tr("Composição das séries")}
              value={stack}
              onChange={(e) => setStack(e.target.value)}
            >
              <option value="none">{tr("Sobrepostas / agrupadas")}</option>
              <option value="stacked">{tr("Empilhadas")}</option>
              <option value="percent">{tr("Percentual")}</option>
            </Select>
          )}
          {type === "bar" && (
            <Switch
              label={tr("Barras horizontais")}
              checked={horizontal}
              onChange={(e) => setHorizontal(e.target.checked)}
            />
          )}
        </div>
      </section>
      <section className={styles.guide}>
        <h2>{tr("Instalação e composição")}</h2>
        <PackageInstall />
        <p>{tr("Importe os estilos uma vez:")}</p>
        <CodeBlock
          language="tsx"
          code={'import "@refy-design/web/tokens.css";\nimport "@refy-design/web/fonts.css";'}
          label={tr("Estilos")}
        />
        <h2>{tr("Configuração disponível")}</h2>
        <ul>
          <li>
            <strong>Eixos:</strong> {tr("visibilidade, linha, ticks explícitos ou contagem, domínio, escala linear/log/symlog/sqrt/tempo, formato e título.")}</li>
          <li>
            <strong>{tr("Traçado:")}</strong> {tr("dez curvas prontas ou qualquer CurveFactory do D3; pontos, espessura, opacidade, empilhamento absoluto/percentual e orientação das barras.")}</li>
          <li>
            <strong>{tr("Legenda e tooltip:")}</strong> {tr("posição, ocultar séries, conteúdo customizado; onHover e onSelect recebem o dado da marca.")}</li>
          <li>
            <strong>{tr("Radiais e hierarquias:")}</strong> {tr("ângulos, raio interno, espaçamento, cantos, máximo e padding conforme a família.")}</li>
          <li>
            <strong>{tr("Avançado:")}</strong> {tr("renderMark personaliza marcas; renderOverlay recebe dimensões e escalas calculadas. createScale e colorScale aceitam escalas customizadas do D3. Geo aceita uma fábrica de projeção D3. O tema fornece cores e fontes; colors ou a cor da série permitem identidade específica.")}</li>
        </ul>
        <h2>{tr("Limites claros")}</h2>
        <p>
          {tr("Este catálogo implementa os 24 tipos listados, não todas as composições imagináveis do D3. Zoom X e brush aplicam-se às séries cartesianas verticais; mapas, hierarquias e relações têm zoom espacial. Streaming recebe uma assinatura externa com buffer limitado. Não há benchmark para milhões de pontos ou arraste de nós. Mapas não buscam dados externos. GeometryCollection deve ser desmembrada em features. Sankey aceita fluxos sem ciclos; radar, pizza e hierarquias usam valores não negativos.")}</p>
        <a href="https://d3js.org/api" target="_blank" rel="noreferrer">
          {tr("Referência oficial do D3 ↗")}</a>
      </section>
    </section>
  );
}

export function D3ChartCatalog(_props: { onBack?: () => void } = {}) {
  const [selected, setSelected] = useState<D3ChartProps["type"] | "streaming">(
    "area",
  );
  const [query, setQuery] = useState("");
  const groups = [...new Set(chartExamples.map((item) => item.group))];
  const items = chartExamples.filter((item) =>
    `${item.name} ${item.group} ${item.id}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <main
      className={`${catalog.layout} ${catalog.catalogLayout}`}
      aria-label={tr("Documentação de charts")}
    >
      <aside className={catalog.sidebar}>
        <div className={catalog.navigationHead}>
          <strong>{tr("Charts")}</strong>
          <span>{chartExamples.length} {tr("famílias · D3")}</span>
        </div>
        <Input
          label={tr("Buscar gráfico")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={tr("Área, barras, relações…")}
        />
        <nav className={catalog.componentNav} aria-label={tr("Escolher gráfico")}>
          {groups.map((group) => {
            const entries = items.filter((item) => item.group === group);
            return (
              entries.length > 0 && (
                <section key={group}>
                  <h2>
                    {group}
                    <span>{entries.length}</span>
                  </h2>
                  {entries.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      block
                      size="sm"
                      aria-current={selected === item.id ? "page" : undefined}
                      onClick={() => setSelected(item.id)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </section>
              )
            );
          })}
          {(!query ||
            "dados ao vivo streaming".includes(query.toLocaleLowerCase())) && (
            <section>
              <h2>{tr("Dados ao vivo")}</h2>
              <Button
                block
                variant="ghost"
                size="sm"
                aria-current={selected === "streaming" ? "page" : undefined}
                onClick={() => setSelected("streaming")}
              >
                {tr("Streaming")}</Button>
            </section>
          )}
          {!items.length && query && (
            <p role="status">{tr("Nenhuma família encontrada.")}</p>
          )}
        </nav>
      </aside>
      <div className={catalog.mobileNavigation}>
        <Select
          label={tr("Tipo de gráfico")}
          value={selected}
          onChange={(event) =>
            setSelected(
              event.target.value as D3ChartProps["type"] | "streaming",
            )
          }
        >
          <option value="streaming">{tr("Dados ao vivo · Streaming")}</option>
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {chartExamples
                .filter((item) => item.group === group)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </Select>
      </div>
      <div className={catalog.document}>
        {selected === "streaming" ? (
          <ChartStreamingExample />
        ) : (
          <ChartDocument key={selected} type={selected} />
        )}
      </div>
    </main>
  );
}
