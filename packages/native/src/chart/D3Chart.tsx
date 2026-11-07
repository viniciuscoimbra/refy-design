import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { renderText } from "../primitives";
import { formatX } from "./scales";
import { lineScene } from "./scene";
import type { LineMark, LineScene } from "./scene";
import type { ChartLayout, D3ChartProps as Props } from "./types";
import { SceneChart } from "./SceneChart";
import type { SceneChartProps } from "./SceneChart";

export type * from "./types";
export interface LineAreaChartProps extends Props, Omit<ViewProps, "children"> {}
export type { SceneChartProps };
export type { ChartSlice, ChartNode, ChartNetwork } from "./d3/types";
/** line e area usam a cena nativa; as demais famílias, as cenas copiadas da web. */
export type D3ChartNativeProps = LineAreaChartProps | (SceneChartProps & Omit<ViewProps, "children">);

/** "var(--x, var(--y))" das cores de série e paleta resolvido no tema nativo. */
function resolveColor(t: RefyContext, value: string): string {
  const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(value.trim());
  if (!match) return value;
  const fallback = match[2] ? resolveColor(t, match[2]) : "#888888";
  return t.pick<string>(match[1], fallback);
}

/**
 * Gráfico line/area com a mesma geometria D3 da web. No toque, arrastar o dedo percorre os
 * pontos e mostra o tooltip; com leitor de tela, o gráfico é "ajustável" e deslizar para
 * cima ou para baixo anda ponto a ponto.
 */
const chartKeys = ["type", "title", "label", "locale", "showTitle", "series", "curve", "stacked", "dots", "strokeWidth", "fillOpacity", "height", "margin", "colors", "xAxis", "yAxis", "grid", "legend", "tooltip", "onSelect", "onHover"] as const satisfies readonly (keyof Props)[];
type MissingKey = Exclude<keyof Props, (typeof chartKeys)[number]>;
// Erro de tipo aqui = chave nova em Props sem entrar em chartKeys.
const allKeysListed: MissingKey extends never ? true : false = true;
void allKeysListed;

function split(input: LineAreaChartProps) {
  const chart: Record<string, unknown> = {};
  const view: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) ((chartKeys as readonly string[]).includes(key) ? chart : view)[key] = value;
  return [chart as unknown as Props, view as Omit<ViewProps, "children">] as const;
}

export function D3Chart(input: D3ChartNativeProps) {
  return input.type === "line" || input.type === "area" ? <LineAreaChart {...(input as LineAreaChartProps)} /> : <SceneChart {...(input as SceneChartProps & Omit<ViewProps, "children">)} />;
}

function LineAreaChart(input: LineAreaChartProps) {
  const [props, { style, ...viewProps }] = useMemo(() => split(input), [input]);
  const t = useRefy();
  const { title, label, showTitle = true, height = 300 } = props;
  const [width, setWidth] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const layout: ChartLayout = { width, height, top: 24, right: 20, bottom: 42, left: 52, ...props.margin };
  if (props.yAxis?.visible === false && props.margin?.left === undefined) layout.left = 16;
  if (props.xAxis?.visible === false && props.margin?.bottom === undefined) layout.bottom = 16;

  const scene: LineScene = useMemo(() => {
    const blank: LineScene = { marks: [], paths: [], legend: [], xTicks: [], yTicks: [] };
    if (!width) return blank;
    try {
      if (!Number.isFinite(height) || height < 120 || height > 2000) throw Error("A altura deve estar entre 120 e 2000 px.");
      if ([layout.top, layout.right, layout.bottom, layout.left].some((v) => !Number.isFinite(v) || v < 0) || layout.left + layout.right >= width || layout.top + layout.bottom >= height)
        throw Error("As margens devem deixar espaço para o gráfico.");
      return lineScene(props, layout, hidden);
    } catch (error) {
      return { ...blank, error: error instanceof Error ? error.message : "Não foi possível representar estes dados." };
    }
    // layout deriva de props e width.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, width, hidden]);

  const ordered = useMemo(() => [...scene.marks].sort((a, b) => a.x - b.x || a.y - b.y), [scene.marks]);
  const active = scene.marks.find((m) => m.id === activeId) ?? null;
  const setActive = (mark: LineMark | null) => {
    if ((mark?.id ?? null) === activeId) return;
    setActiveId(mark?.id ?? null);
    props.onHover?.(mark?.datum ?? null);
  };
  const nearest = (event: GestureResponderEvent) => {
    const { locationX: x, locationY: y } = event.nativeEvent;
    return scene.marks.reduce<LineMark | null>((best, m) => (!best || Math.hypot(m.x - x, m.y - y) < Math.hypot(best.x - x, best.y - y) ? m : best), null);
  };
  const step = (delta: number) => {
    if (!ordered.length) return;
    const at = active ? ordered.findIndex((m) => m.id === active.id) : -1;
    setActive(ordered[Math.max(0, Math.min(ordered.length - 1, at < 0 ? 0 : at + delta))]);
  };

  const ink3 = t.pick<string>("--ink-3");
  const line = t.pick<string>("--line");
  const xs = t.size("--text-xs", 12);
  const axisFont = t.font("--font-body", "--weight-regular");
  const grid = props.grid ?? "y";
  const legendOptions = typeof props.legend === "object" ? props.legend : {};
  const legendOn = props.legend ?? scene.legend.length > 1;
  const interactive = legendOptions.interactive !== false;
  const marker = legendOptions.marker ?? (props.type === "line" ? "line" : "square");
  const tooltipOn = props.tooltip !== false;
  const { width: w, height: h, top: tp, right: r, bottom: b, left: l } = layout;

  const legend = legendOn && scene.legend.length ? (
    <View accessibilityLabel={`Séries de ${title}`} style={{ flexDirection: legendOptions.position === "right" ? "column" : "row", flexWrap: "wrap", gap: t.size("--space-2", 8), alignItems: legendOptions.position === "right" ? "stretch" : "center" }}>
      {scene.legend.map((item) => {
        const off = hidden.includes(item.id);
        const color = resolveColor(t, item.color);
        const swatch = <View style={{ width: 10, height: marker === "line" ? 3 : 10, borderRadius: marker === "circle" ? 5 : marker === "line" ? 1 : t.pick<number>("--radius-xs", 2), borderWidth: 1, borderColor: off ? color : "transparent", backgroundColor: off ? "transparent" : color }} />;
        const text = renderText(legendOptions.render?.(item) ?? item.label, { color: off ? ink3 : t.pick<string>("--ink-2"), fontSize: xs, textDecorationLine: off ? "line-through" : "none", ...t.font("--font-body", "--weight-medium") });
        const box = { flexDirection: "row" as const, alignItems: "center" as const, gap: t.size("--space-2", 8), minHeight: 32, paddingVertical: t.size("--space-1", 4), paddingHorizontal: t.size("--space-2", 8), borderRadius: t.pick<number>("--control-radius", "--radius-sm", 4), backgroundColor: off ? t.pick<string>("--surface-2") : "transparent" };
        return interactive ? (
          <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: !off }} accessibilityLabel={item.label} hitSlop={6} onPress={() => setHidden((list) => (list.includes(item.id) ? list.filter((id) => id !== item.id) : [...list, item.id]))} style={box}>{swatch}{text}</Pressable>
        ) : (
          <View key={item.id} style={box}>{swatch}{text}</View>
        );
      })}
    </View>
  ) : null;

  const activeText = active ? `${active.datum.label}: ${Object.entries(active.datum.values).map(([k, v]) => `${k} ${typeof v === "number" ? formatX(v) : v}`).join(", ")}` : undefined;

  return (
    <View
      {...viewProps}
      style={[{ minWidth: 0, maxWidth: "100%", gap: t.size("--space-4", 16) }, style]}
    >
      {showTitle && <Text accessibilityRole="header" style={{ color: t.pick<string>("--ink-1"), fontSize: t.size("--text-lg", 18), lineHeight: Math.round(1.4 * t.size("--text-lg", 18)), ...t.font(["--font-heading", "--font-headline"], "--weight-semi") }}>{title}</Text>}
      {scene.error ? (
        <Text accessibilityRole="alert" style={{ paddingVertical: t.size("--space-6", 32), color: ink3, fontSize: t.size("--text-sm", 13) }}>{scene.error}</Text>
      ) : (
        <View style={{ flexDirection: legendOptions.position === "right" ? "row" : "column", alignItems: legendOptions.position === "right" ? "center" : "stretch", gap: t.size("--space-3", 12) }}>
          {legendOptions.position === "top" && legend}
          <View
            style={{ flex: legendOptions.position === "right" ? 1 : undefined, width: legendOptions.position === "right" ? undefined : "100%", minWidth: 0 }}
            onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
          >
            <View
              accessible
              accessibilityRole="adjustable"
              accessibilityLabel={label}
              accessibilityValue={activeText ? { text: activeText } : undefined}
              accessibilityHint="Deslize para cima ou para baixo para percorrer os pontos."
              accessibilityActions={[{ name: "increment" }, { name: "decrement" }, { name: "activate" }]}
              onAccessibilityAction={(e) => {
                if (e.nativeEvent.actionName === "increment") step(1);
                else if (e.nativeEvent.actionName === "decrement") step(-1);
                else if (active) props.onSelect?.(active.datum);
              }}
              onStartShouldSetResponder={() => scene.marks.length > 0}
              onMoveShouldSetResponder={() => scene.marks.length > 0}
              onResponderTerminationRequest={() => true}
              onResponderGrant={(e) => setActive(nearest(e))}
              onResponderMove={(e) => setActive(nearest(e))}
              onResponderRelease={(e) => {
                const mark = nearest(e);
                if (mark) props.onSelect?.(mark.datum);
              }}
              style={{ height, width: "100%" }}
            >
              {width > 0 && (
                <Svg width={width} height={height} pointerEvents="none">
                  <G>
                    {(grid === true || grid === "y" || grid === "both") && scene.yTicks.map((tick) => <Line key={`gy${tick.value}`} x1={l} x2={w - r} y1={tick.at} y2={tick.at} stroke={line} strokeWidth={1} opacity={0.4} />)}
                    {(grid === "x" || grid === "both") && scene.xTicks.map((tick, i) => <Line key={`gx${i}`} x1={tick.at} x2={tick.at} y1={tp} y2={h - b} stroke={line} strokeWidth={1} opacity={0.4} />)}
                    {props.xAxis?.visible !== false && (
                      <G>
                        {props.xAxis?.line && <Line x1={l} x2={w - r} y1={h - b} y2={h - b} stroke={t.pick<string>("--ink-4", ink3)} strokeWidth={1} />}
                        {props.xAxis?.ticks !== false && scene.xTicks.map((tick, i) => <SvgText key={i} x={tick.at} y={h - b + 20} textAnchor="middle" fill={ink3} fontSize={xs} fontFamily={axisFont.fontFamily}>{tick.text}</SvgText>)}
                        {props.xAxis?.title && <SvgText x={(l + w - r) / 2} y={h - 8} textAnchor="middle" fill={ink3} fontSize={xs} fontFamily={axisFont.fontFamily}>{props.xAxis.title}</SvgText>}
                      </G>
                    )}
                    {props.yAxis?.visible !== false && (
                      <G>
                        {props.yAxis?.line && <Line x1={l} x2={l} y1={tp} y2={h - b} stroke={t.pick<string>("--ink-4", ink3)} strokeWidth={1} />}
                        {props.yAxis?.ticks !== false && scene.yTicks.map((tick, i) => <SvgText key={i} x={l - 10} y={tick.at + 4} textAnchor="end" fill={ink3} fontSize={xs} fontFamily={axisFont.fontFamily}>{tick.text}</SvgText>)}
                        {props.yAxis?.title && <SvgText x={l} y={Math.max(12, tp - 10)} fill={ink3} fontSize={xs} fontFamily={axisFont.fontFamily}>{props.yAxis.title}</SvgText>}
                      </G>
                    )}
                  </G>
                  {scene.paths.map((path) => {
                    const color = resolveColor(t, path.color);
                    return path.kind === "area"
                      ? <Path key={path.id} d={path.d} fill={color} fillOpacity={props.fillOpacity ?? 0.18} />
                      : <Path key={path.id} d={path.d} fill="none" stroke={color} strokeWidth={props.strokeWidth ?? 2} strokeLinecap="round" strokeLinejoin="round" />;
                  })}
                  {scene.marks.map((mark) => (
                    <Circle key={mark.id} cx={mark.x} cy={mark.y} r={props.dots ? 4 : 3} fill={resolveColor(t, mark.color)} fillOpacity={props.dots ? 1 : 0} opacity={active && active.datum.seriesId !== mark.datum.seriesId ? 0.35 : 1} />
                  ))}
                  {active && <Circle cx={active.x} cy={active.y} r={8} fill="none" stroke={t.pick<string>("--ink-1")} strokeWidth={1.5} />}
                </Svg>
              )}
            </View>
            {tooltipOn && active && (
              <View
                pointerEvents="none"
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden
                style={{ position: "absolute", top: t.size("--space-3", 12), right: t.size("--space-3", 12), zIndex: 2, maxWidth: Math.min(260, width - 24), padding: t.size("--space-4", 16), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: line, borderRadius: t.pick<number>("--radius-md", 8), boxShadow: t.pick<string>("--elev-2", "") || undefined, backgroundColor: t.pick<string>("--surface") }}
              >
                {typeof props.tooltip === "object" && props.tooltip.render ? (
                  renderText(props.tooltip.render(active.datum), { color: t.pick<string>("--ink-1"), fontSize: t.size("--text-sm", 13), ...t.font("--font-body", "--weight-regular") })
                ) : (
                  <>
                    <Text style={{ color: t.pick<string>("--ink-1"), fontSize: t.size("--text-sm", 13), ...t.font("--font-body", "--weight-bold") }}>{active.datum.label}</Text>
                    <View style={{ marginTop: t.size("--space-2", 8), gap: t.size("--space-1", 4) }}>
                      {Object.entries(active.datum.values).map(([key, value]) => (
                        <View key={key} style={{ flexDirection: "row", gap: t.size("--space-3", 12), justifyContent: "space-between" }}>
                          <Text style={{ flexShrink: 1, color: t.pick<string>("--ink-1"), fontSize: t.size("--text-sm", 13) }}>{key}</Text>
                          <Text style={{ color: t.pick<string>("--ink-1"), fontSize: t.size("--text-sm", 13), fontVariant: ["tabular-nums"] }}>{typeof value === "number" ? formatX(value) : value}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}
          </View>
          {legendOptions.position !== "top" && legendOptions.position !== "right" && legend}
          {legendOptions.position === "right" && legend}
          {!scene.marks.length && width > 0 && (
            <Text accessibilityRole="text" style={{ paddingVertical: t.size("--space-6", 32), color: ink3, fontSize: t.size("--text-sm", 13) }}>
              {hidden.length ? "Reative uma série na legenda para ver seus dados." : "Sem dados para representar."}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
