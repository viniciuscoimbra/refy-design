import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { scaleLinear } from "d3-scale";
import { arc, area, curveLinear, curveMonotoneX, curveStep, line } from "d3-shape";
import type {
  AreaChartCoreProps, BarChartCoreProps, BarChartItem, ChartLegendCoreProps, ChartTone, DonutChartCoreProps,
  DonutSegment, LineChartCoreProps, LineSeries, SparklineCoreProps,
} from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { renderText } from "../primitives";
import { Collapsible } from "../components/Collapsible";
import { Table } from "../components/Table";

export type { BarChartItem, ChartTone, DonutSegment, LineSeries };
type Styled = { style?: StyleProp<ViewStyle> };
export interface LineChartProps extends LineChartCoreProps, Styled {}
export interface AreaChartProps extends AreaChartCoreProps, Styled {}
export interface BarChartProps extends BarChartCoreProps, Styled {}
export interface DonutChartProps extends DonutChartCoreProps, Styled {}
export interface SparklineProps extends SparklineCoreProps, Styled {}
export interface ChartLegendProps extends ChartLegendCoreProps, Styled {}

const H = 260;
const PAD = { left: 52, right: 16, top: 24, bottom: 44 };

/** Cor do tom com a mesma cadeia de tokens da web (--chart-* e o semântico de reserva). */
export function chartToneColor(t: RefyContext, tone: ChartTone | "muted" = "primary") {
  switch (tone) {
    case "muted": return t.pick<string>("--ink-4", "--ink-3");
    case "info": return t.pick<string>("--chart-secondary", "--info", "--primary");
    case "warn": return t.pick<string>("--chart-tertiary", "--weak", "--warn", "--primary");
    case "critical": return t.pick<string>("--chart-quaternary", "--critical", "--danger", "--primary");
    default: return t.pick<string>("--chart-primary", "--primary");
  }
}

const defaultFormat = (v: number) => Math.round(v).toLocaleString("pt-BR");

/** Geometria do LineChart, cópia da web: mesmas escalas `nice(4)`, curvas e empilhamento. */
export function lineChartGeometry(p: Pick<LineChartCoreProps, "data" | "series" | "label" | "max" | "stacked" | "curve" | "xLabels">, W: number, hidden: string[] = []) {
  const allSeries: LineSeries[] = (p.series ?? (p.data ? [{ name: p.label, data: p.data, tone: "primary" as const }] : [])).map((s) => ({ ...s, data: s.data.map((v) => (Number.isFinite(v) ? v : 0)) }));
  const series = allSeries.filter((s) => !hidden.includes(s.name));
  const pointCount = allSeries.reduce((m, s) => Math.max(m, s.data.length), 0);
  const plotData = series.map((s, index) => ({ ...s, data: s.data.map((value, point) => (p.stacked ? series.slice(0, index).reduce((sum, prev) => sum + (prev.data[point] ?? 0), value) : value)) }));
  const flat = plotData.flatMap((s) => s.data);
  const maxValue = Math.max(1, Number.isFinite(p.max) ? p.max! : flat.length ? Math.max(...flat) : 1);
  const minValue = Math.min(0, ...flat);
  const curve = p.curve === "linear" ? curveLinear : p.curve === "step" ? curveStep : curveMonotoneX;
  const x = scaleLinear().domain([0, Math.max(1, pointCount - 1)]).range([PAD.left, W - PAD.right]);
  const y = scaleLinear().domain([minValue, maxValue]).nice(4).range([H - PAD.bottom, PAD.top]);
  const lineGen = line<number>().x((_, i) => x(i)).y((v) => y(v)).curve(curve);
  const xTickAt = (i: number) => (p.xLabels && p.xLabels.length > 1 ? (i * (pointCount - 1)) / (p.xLabels.length - 1) : i);
  return {
    allSeries, series, plotData, pointCount, x, y,
    yTicks: y.ticks(4),
    xTicks: (p.xLabels ?? []).map((text, i) => ({ text, at: x(xTickAt(i)) })),
    lines: plotData.map((s) => lineGen(s.data) ?? ""),
    areas: plotData.map((s, index) => area<number>().x((_, i) => x(i)).y0((_, i) => y(p.stacked && index > 0 ? (plotData[index - 1].data[i] ?? 0) : 0)).y1((v) => y(v)).curve(curve)(s.data) ?? ""),
  };
}

function pointName(index: number, count: number, pointLabels?: string[], xLabels?: string[]) {
  return pointLabels?.[index] ?? xLabels?.[Math.round((index / Math.max(1, count - 1)) * ((xLabels?.length ?? 1) - 1))] ?? `Ponto ${index + 1}`;
}

function useText(t: RefyContext) {
  return {
    title: { color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-base", "--text-md", 15), lineHeight: Math.round(t.pick<number>("--text-base", "--text-md", 15) * 1.35), ...t.font(["--font-headline", "--font-display", "--font-body"], "--weight-semi") },
    status: { color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-sm", 14), ...t.font("--font-body", "--weight-regular") },
    tick: { fill: t.pick<string>("--ink-3"), fontSize: 11, fontFamily: t.font("--font-body", "--weight-regular").fontFamily },
    axisTitle: { fill: t.pick<string>("--ink-3"), fontSize: 9.5, fontWeight: "600" as const, letterSpacing: 1.3, fontFamily: t.font(["--interface-detail-font", "--font-mono"], "--weight-semi").fontFamily },
  };
}

/** Tabela dos dados, aberta sob demanda: o equivalente nativo do `<details>` da web. */
function ChartData({ label, rows }: { label: string; rows: { index: number; label: string; values: string }[] }) {
  if (!rows.length) return null;
  return (
    <Collapsible title={`Ver dados de ${label}`}>
      <Table caption={`Dados: ${label}`} rows={rows} rowKey={(row) => String(row.index)} columns={[{ key: "label", header: "Referência", cell: (row) => row.label }, { key: "values", header: "Valores", cell: (row) => row.values }]} />
    </Collapsible>
  );
}

/** Legenda dos gráficos. Com `onToggle`, cada item liga e desliga a série. */
export function ChartLegend({ label, items, hidden = [], onToggle, marker = "square", render, style }: ChartLegendProps) {
  const t = useRefy();
  const xs = t.pick<number>("--text-xs", 12);
  return (
    <View accessibilityLabel={label} style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: t.size("--space-2", 8) }, style]}>
      {items.map((item) => {
        const off = hidden.includes(item.id);
        const swatch = <View style={{ width: 10, height: marker === "line" ? 3 : 10, borderRadius: marker === "circle" ? 5 : marker === "line" ? 1 : t.pick<number>("--radius-xs", 2), borderWidth: 1, borderColor: off ? item.color : "transparent", backgroundColor: off ? "transparent" : item.color }} />;
        const text = renderText(render?.(item) ?? item.label, { flexShrink: 1, color: off ? t.pick<string>("--ink-3") : t.pick<string>("--ink-2"), fontSize: xs, lineHeight: Math.round(xs * 1.4), textDecorationLine: off ? "line-through" : "none", ...t.font("--font-body", "--weight-medium") });
        const box: ViewStyle = { flexDirection: "row", alignItems: "center", gap: t.size("--space-2", 8), minHeight: 32, maxWidth: "100%", paddingVertical: t.size("--space-1", 4), paddingHorizontal: t.size("--space-2", 8), borderRadius: t.pick<number>("--control-radius", "--radius-sm", 4), backgroundColor: off ? t.pick<string>("--surface-2") : "transparent" };
        return onToggle ? (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected: !off }} hitSlop={6} onPress={() => onToggle(item.id)} style={box}>{swatch}{text}</Pressable>
        ) : (
          <View key={item.id} style={box}>{swatch}{text}</View>
        );
      })}
    </View>
  );
}

/**
 * Gráfico de linhas com eixos, grade, legenda e tooltip, na geometria da web. Arrastar o dedo
 * percorre os pontos; com leitor de tela o gráfico é ajustável, ponto a ponto.
 */
export function LineChart({ title, showTitle = true, data, series: seriesProp, xLabels, pointLabels, yTitle, xTitle, formatY, max, area: showArea = true, showLegend, stacked = false, curve = "smooth", label, style }: LineChartProps) {
  const t = useRefy();
  const text = useText(t);
  const [W, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const g = lineChartGeometry({ data, series: seriesProp, label, max, stacked, curve, xLabels }, W || 320, hidden);
  const fmt = formatY ?? defaultFormat;
  const axis = t.pick<string>("--line");
  const tickStroke = t.pick<string>("--ink-4", "--ink-3");
  const surface = t.pick<string>("--surface");
  const primary = chartToneColor(t, "primary");
  const at = (px: number) => Math.max(0, Math.min(g.pointCount - 1, Math.round(g.x.invert(px))));
  const name = (i: number) => pointName(i, g.pointCount, pointLabels, xLabels);
  const valueText = hover === null ? undefined : `${name(hover)}: ${g.series.map((s) => `${s.name} ${s.data[hover] === undefined ? "sem valor" : fmt(s.data[hover])}`).join(", ")}`;
  const legendOn = showLegend ?? g.allSeries.length > 1;
  return (
    <View style={[{ gap: t.size("--space-2", 8), width: "100%" }, style]}>
      {showTitle && <Text accessibilityRole="header" style={text.title}>{title}</Text>}
      <View onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={valueText ? { text: valueText } : undefined}
          accessibilityHint="Deslize para cima ou para baixo para percorrer os pontos. Os dados também estão em tabela."
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => {
            if (!g.pointCount) return;
            const d = e.nativeEvent.actionName === "increment" ? 1 : -1;
            setHover((c) => Math.max(0, Math.min(g.pointCount - 1, c === null ? 0 : c + d)));
          }}
          onStartShouldSetResponder={() => g.pointCount > 0}
          onMoveShouldSetResponder={() => g.pointCount > 0}
          onResponderTerminationRequest={() => true}
          onResponderGrant={(e) => setHover(at(e.nativeEvent.locationX))}
          onResponderMove={(e) => setHover(at(e.nativeEvent.locationX))}
          onResponderRelease={() => setHover(null)}
          onResponderTerminate={() => setHover(null)}
          style={{ height: H, width: "100%" }}
        >
          {W > 0 && (
            <Svg width={W} height={H} pointerEvents="none">
              <Defs>
                <LinearGradient id="refyLineArea" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={primary} stopOpacity={0.28} />
                  <Stop offset="100%" stopColor={primary} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Line x1={PAD.left} y1={PAD.top - 6} x2={PAD.left} y2={H - PAD.bottom} stroke={axis} strokeWidth={1} />
              {g.yTicks.map((v) => (
                <G key={v}>
                  {v > 0 && <Line x1={PAD.left} y1={g.y(v)} x2={W - PAD.right} y2={g.y(v)} stroke={axis} strokeWidth={1} opacity={0.55} />}
                  <Line x1={PAD.left - 4} y1={g.y(v)} x2={PAD.left} y2={g.y(v)} stroke={tickStroke} strokeWidth={1} />
                  <SvgText {...text.tick} x={PAD.left - 8} y={g.y(v) + 3.5} textAnchor="end">{fmt(v)}</SvgText>
                </G>
              ))}
              {yTitle ? <SvgText {...text.axisTitle} x={6} y={PAD.top - 10}>{yTitle.toUpperCase()}</SvgText> : null}
              <Line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke={axis} strokeWidth={1} />
              {g.xTicks.map((tick, i) => (
                <G key={`${tick.text}-${i}`}>
                  <Line x1={tick.at} y1={H - PAD.bottom} x2={tick.at} y2={H - PAD.bottom + 4} stroke={tickStroke} strokeWidth={1} />
                  <SvgText {...text.tick} x={tick.at} y={H - PAD.bottom + 16} textAnchor="middle">{tick.text}</SvgText>
                </G>
              ))}
              {xTitle ? <SvgText {...text.axisTitle} x={(PAD.left + W - PAD.right) / 2} y={H - 6} textAnchor="middle">{xTitle.toUpperCase()}</SvgText> : null}
              {showArea && g.areas.map((d, i) => (
                <Path key={`a${g.plotData[i].name}`} d={d} fill={g.plotData.length === 1 ? "url(#refyLineArea)" : chartToneColor(t, g.plotData[i].tone)} fillOpacity={g.plotData.length === 1 ? 1 : 0.13} />
              ))}
              {g.plotData.map((s, i) => (
                <G key={s.name}>
                  <Path d={g.lines[i]} fill="none" stroke={chartToneColor(t, s.tone)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  {s.data.length > 0 && <Circle cx={g.x(s.data.length - 1)} cy={g.y(s.data[s.data.length - 1])} r={4.5} fill={chartToneColor(t, s.tone)} stroke={surface} strokeWidth={2} />}
                </G>
              ))}
              {hover !== null && (
                <G>
                  <Line x1={g.x(hover)} y1={PAD.top} x2={g.x(hover)} y2={H - PAD.bottom} stroke={tickStroke} strokeWidth={1} strokeDasharray="3 3" />
                  {g.plotData.map((s) => <Circle key={s.name} cx={g.x(hover)} cy={g.y(s.data[hover] ?? 0)} r={4.5} fill={chartToneColor(t, s.tone)} stroke={surface} strokeWidth={2} />)}
                </G>
              )}
            </Svg>
          )}
        </View>
        {hover !== null && g.pointCount > 0 && (
          <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ position: "absolute", top: 44, right: 16, maxWidth: Math.max(160, W - 32), gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: axis, borderRadius: t.pick<number>("--radius-md", 8), backgroundColor: surface, boxShadow: t.pick<string>("--elev-2", "") || undefined }}>
            <Text style={{ color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-sm", 14), ...t.font("--font-body", "--weight-bold") }}>{name(hover)}</Text>
            {g.series.map((s) => (
              <View key={s.name} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ width: 10, height: 10, borderRadius: t.pick<number>("--radius-xs", 2), backgroundColor: chartToneColor(t, s.tone) }} />
                <Text style={{ flexShrink: 1, color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-sm", 14), ...t.font("--font-body", "--weight-regular") }}>{s.name}</Text>
                <Text style={{ marginLeft: "auto", color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-sm", 14), ...t.font("--font-mono", "--weight-bold") }}>{s.data[hover] === undefined ? "—" : fmt(s.data[hover])}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {!g.pointCount && <Text accessibilityLiveRegion="polite" style={text.status}>Sem dados para este período.</Text>}
      {g.pointCount > 0 && !g.series.length && <Text accessibilityLiveRegion="polite" style={text.status}>Selecione uma série na legenda.</Text>}
      {legendOn && (
        <ChartLegend label={`Legenda de ${title}`} items={g.allSeries.map((s) => ({ id: s.name, label: s.name, color: chartToneColor(t, s.tone) }))} hidden={hidden} onToggle={(id) => setHidden((c) => (c.includes(id) ? c.filter((n) => n !== id) : [...c, id]))} />
      )}
      <ChartData label={title} rows={Array.from({ length: g.pointCount }, (_, index) => ({ index, label: name(index), values: g.allSeries.map((s) => `${s.name}: ${s.data[index] === undefined ? "—" : fmt(s.data[index])}`).join(" · ") }))} />
    </View>
  );
}

export function AreaChart(props: AreaChartProps) {
  return <LineChart {...props} area />;
}

/** Geometria do BarChart, cópia da web: rótulos à esquerda, régua `nice(4)` embaixo. */
export function barChartGeometry(items: BarChartItem[], W: number) {
  const barX = Math.min(118, W * 0.29);
  const axisY = H - PAD.bottom;
  const rowH = (axisY - PAD.top) / Math.max(1, items.length);
  const barHeight = Math.min(20, Math.max(10, rowH - 10));
  const maxValue = Math.max(1, items.reduce((m, d) => Math.max(m, d.value), 0));
  const scale = scaleLinear().domain([0, maxValue]).nice(4).range([0, W - barX - 24]);
  return {
    barX, axisY, scale, ticks: scale.ticks(4),
    bars: items.map((item, i) => {
      const width = item.value === 0 ? 4 : scale(item.value);
      return { item, y: PAD.top + i * rowH + (rowH - barHeight) / 2, width, height: barHeight };
    }),
  };
}

/** Compara uma medida entre categorias: grade, régua de valores e valor no fim da barra. */
export function BarChart({ title, showTitle = true, items, formatValue = (v) => String(v), valueTitle, label, style }: BarChartProps) {
  const t = useRefy();
  const text = useText(t);
  const [W, setW] = useState(0);
  const g = barChartGeometry(items, W || 320);
  const axis = t.pick<string>("--line");
  const tickStroke = t.pick<string>("--ink-4", "--ink-3");
  const summary = items.map((item) => `${item.label} ${formatValue(item.value)}`).join(", ");
  return (
    <View style={[{ gap: t.size("--space-2", 8), width: "100%" }, style]}>
      {showTitle && <Text accessibilityRole="header" style={text.title}>{title}</Text>}
      <View accessible accessibilityRole="image" accessibilityLabel={summary ? `${label}: ${summary}` : label} onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))} style={{ height: H, width: "100%" }}>
        {W > 0 && (
          <Svg width={W} height={H}>
            {g.ticks.map((v) => (
              <G key={v}>
                <Line x1={g.barX + g.scale(v)} y1={PAD.top} x2={g.barX + g.scale(v)} y2={g.axisY} stroke={axis} strokeWidth={1} opacity={0.55} />
                <Line x1={g.barX + g.scale(v)} y1={g.axisY} x2={g.barX + g.scale(v)} y2={g.axisY + 4} stroke={tickStroke} strokeWidth={1} />
                <SvgText {...text.tick} x={g.barX + g.scale(v)} y={g.axisY + 16} textAnchor="middle">{formatValue(v)}</SvgText>
              </G>
            ))}
            <Line x1={g.barX} y1={PAD.top} x2={g.barX} y2={g.axisY} stroke={axis} strokeWidth={1} />
            <Line x1={g.barX} y1={g.axisY} x2={g.barX + g.scale(g.ticks[g.ticks.length - 1] ?? 0)} y2={g.axisY} stroke={axis} strokeWidth={1} />
            {g.bars.map((bar) => (
              <G key={bar.item.label}>
                <SvgText {...text.tick} x={g.barX - 8} y={bar.y + bar.height / 2 + 3.5} textAnchor="end">{bar.item.label}</SvgText>
                <Rect x={g.barX} y={bar.y} width={bar.width} height={bar.height} rx={3} fill={chartToneColor(t, bar.item.tone)} />
                <SvgText x={g.barX + bar.width + 8} y={bar.y + bar.height / 2 + 3.5} fill={t.pick<string>("--ink-1")} fontSize={11} fontWeight="600" fontFamily={t.font(["--interface-detail-font", "--font-mono"], "--weight-semi").fontFamily}>{formatValue(bar.item.value)}</SvgText>
              </G>
            ))}
            {valueTitle ? <SvgText {...text.axisTitle} x={g.barX + (W - g.barX - 24) / 2} y={H - 6} textAnchor="middle">{valueTitle.toUpperCase()}</SvgText> : null}
          </Svg>
        )}
      </View>
      {!items.length && <Text accessibilityLiveRegion="polite" style={text.status}>Sem dados para este período.</Text>}
      <ChartData label={title} rows={items.map((item, index) => ({ index, label: item.label, values: formatValue(item.value) }))} />
    </View>
  );
}

const R_OUTER = 89;
const R_INNER = 67;
const TAU = 2 * Math.PI;

/** Arcos do DonutChart, cópia da web: cantos arredondados e fresta de 0,03 rad entre segmentos. */
export function donutArcs(value: number | undefined, segments?: DonutSegment[]) {
  const gen = arc<{ start: number; end: number }>().innerRadius(R_INNER).outerRadius(R_OUTER).cornerRadius(6).startAngle((d) => d.start).endAngle((d) => d.end);
  const filled = Math.max(0, Math.min(100, value ?? 0));
  const track = gen({ start: 0, end: TAU }) ?? "";
  if (!segments) return { filled, track, paths: [{ d: gen({ start: 0, end: (filled / 100) * TAU }) ?? "", tone: "primary" as ChartTone | "muted" }] };
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let acc = 0;
  return {
    filled, track,
    paths: segments.map((s) => {
      const start = (acc / total) * TAU;
      acc += s.value;
      const end = (acc / total) * TAU - 0.03;
      return { d: gen({ start, end: Math.max(start, end) }) ?? "", tone: s.tone ?? "primary" };
    }),
  };
}

/** Anel de progresso ou de distribuição, com valor no centro e legenda ao lado. */
export function DonutChart({ value, segments, centerLabel, caption, showLegend, formatValue = (v) => String(v), size = 220, label, style }: DonutChartProps) {
  const t = useRefy();
  const { filled, track, paths } = donutArcs(value, segments);
  const center = centerLabel ?? (segments ? "" : `${filled}%`);
  const legendOn = showLegend ?? Boolean(segments);
  const summary = segments ? segments.map((s, i) => `${s.label ?? `Série ${i + 1}`} ${formatValue(s.value)}`).join(", ") : `${filled}%`;
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: t.size("--space-6", 24) }, style]}>
      <View accessible accessibilityRole="image" accessibilityLabel={`${label}: ${summary}`}>
        <Svg width={size} height={size} viewBox="0 0 220 220">
          <G transform="translate(110 110)">
            <Path d={track} fill={t.pick<string>("--line-soft", "--line")} />
            {paths.map((p, i) => <Path key={i} d={p.d} fill={chartToneColor(t, p.tone)} />)}
          </G>
          {center ? <SvgText x={110} y={108} textAnchor="middle" fill={t.pick<string>("--ink-1")} fontSize={34} fontWeight="700" letterSpacing={-0.7} fontFamily={t.font(["--font-headline", "--font-display", "--font-body"], "--weight-bold").fontFamily}>{center}</SvgText> : null}
          {caption ? <SvgText x={110} y={132} textAnchor="middle" fill={t.pick<string>("--ink-3")} fontSize={10} letterSpacing={1.4} fontFamily={t.font(["--interface-detail-font", "--font-mono"], "--weight-regular").fontFamily}>{caption.toUpperCase()}</SvgText> : null}
        </Svg>
      </View>
      {legendOn && segments && (
        <ChartLegend label={`Legenda de ${label}`} style={{ flexDirection: "column", alignItems: "flex-start", minWidth: 150 }} items={segments.map((s, i) => ({ id: String(i), label: `${s.label ?? `Série ${i + 1}`} · ${formatValue(s.value)}`, color: chartToneColor(t, s.tone) }))} />
      )}
    </View>
  );
}

/** Mini-linha de tendência sem eixos (100 × 28 por padrão). */
export function Sparkline({ data, tone = "good", width = 100, height = 28, label, style }: SparklineProps) {
  const t = useRefy();
  const x = scaleLinear().domain([0, data.length - 1]).range([1, width - 1]);
  const lo = Math.min(...data), hi = Math.max(...data);
  const y = scaleLinear().domain([lo, hi === lo ? lo + 1 : hi]).range([height - 4, 4]);
  const d = line<number>().x((_, i) => x(i)).y((v) => y(v)).curve(curveMonotoneX)(data) ?? "";
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={style}>
      <Svg width={width} height={height}>
        <Path d={d} fill="none" stroke={chartToneColor(t, tone === "bad" ? "critical" : "primary")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}
