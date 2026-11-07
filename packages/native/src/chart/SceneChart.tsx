import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import type { GestureResponderEvent, ViewProps } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Rect } from "react-native-svg";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Collapsible } from "../components/Collapsible";
import { Table } from "../components/Table";
import { ChartLegend } from "./Charts";
import { cartesianScene } from "./d3/cartesian";
import { radialScene } from "./d3/radial";
import { hierarchyScene } from "./d3/hierarchy";
import { relationScene } from "./d3/relations";
import { formatX } from "./d3/shared";
import { resolveColor, toNativeSvg } from "./d3/svg";
import type { ChartDatum, ChartLayout, ChartMark, ChartScene, D3ChartProps as WebProps } from "./d3/types";

type WebOnly = "zoom" | "brush" | "stream" | "renderMark" | "renderOverlay" | "className" | "style";
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** Famílias além de line e area, com o contrato de dados da web. */
type WithoutLineArea<T> = T extends { type: infer K } ? ([Exclude<K, "line" | "area">] extends [never] ? never : Omit<T, "type"> & { type: Exclude<K, "line" | "area"> }) : never;
export type SceneChartProps = WithoutLineArea<DistributiveOmit<WebProps, WebOnly>>;

const cartesianTypes = ["bar", "scatter", "bubble", "histogram", "boxplot", "candlestick", "heatmap"];
const radialTypes = ["pie", "donut", "radial-bar", "gauge", "radar"];

/** Cena da web para as famílias não line/area, com as mesmas regras de erro da web. */
export function sceneFor(props: SceneChartProps, layout: ChartLayout, suppressed: string[]): ChartScene {
  try {
    const height = layout.height;
    if (!Number.isFinite(height) || height < 120 || height > 2000) throw Error("A altura deve estar entre 120 e 2000 px.");
    if ([layout.top, layout.right, layout.bottom, layout.left].some((v) => !Number.isFinite(v) || v < 0) || layout.left + layout.right >= layout.width || layout.top + layout.bottom >= height)
      throw Error("As margens devem deixar espaço para o gráfico.");
    const p = props as WebProps;
    if (cartesianTypes.includes(props.type)) return cartesianScene(p, layout, suppressed);
    if (radialTypes.includes(props.type)) return radialScene(p, layout, suppressed);
    if ("root" in props) return hierarchyScene(p, layout, suppressed);
    return relationScene(p, layout, suppressed);
  } catch (error) {
    return { marks: [], error: error instanceof Error ? (error.message === "circular link" ? "Sankey não aceita ciclos nos vínculos." : error.message) : "Não foi possível representar estes dados." };
  }
}

/**
 * As famílias de barra, dispersão, radiais, hierarquias, relações e mapa, com a geometria das
 * cenas da web (cópia fiel em ./d3). Tocar ou arrastar escolhe a marca mais próxima.
 */
export function SceneChart(input: SceneChartProps & Omit<ViewProps, "children">) {
  const t = useRefy();
  const { title, label, showTitle = true, height = 300 } = input;
  const props = input as SceneChartProps;
  const [width, setWidth] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const cartesian = cartesianTypes.includes(props.type);
  const layout: ChartLayout = { width, height, top: 24, right: 20, bottom: cartesian ? 42 : 16, left: cartesian ? 52 : 16, ...props.margin };
  if (cartesian && "yAxis" in props && props.yAxis?.visible === false && props.margin?.left === undefined) layout.left = 16;
  if (cartesian && props.xAxis?.visible === false && props.margin?.bottom === undefined) layout.bottom = 16;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const full = useMemo(() => (width ? sceneFor(props, layout, []) : { marks: [] } as ChartScene), [props, width]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scene = useMemo(() => (hidden.length && width ? sceneFor(props, layout, hidden) : full), [full, hidden]);
  const located = useMemo(() => scene.marks.filter((m) => Number.isFinite(m.x) && Number.isFinite(m.y)), [scene.marks]);
  const active = scene.marks.find((m) => m.id === activeId) ?? null;
  const setActive = (mark: ChartMark | null) => {
    if ((mark?.id ?? null) === activeId) return;
    setActiveId(mark?.id ?? null);
    props.onHover?.(mark?.datum ?? null);
  };
  const nearest = (e: GestureResponderEvent) => {
    const { locationX: x, locationY: y } = e.nativeEvent;
    return located.reduce<ChartMark | null>((best, m) => (!best || Math.hypot(m.x! - x, m.y! - y) < Math.hypot(best.x! - x, best.y! - y) ? m : best), null);
  };
  const step = (delta: number) => {
    if (!scene.marks.length) return;
    const at = active ? scene.marks.findIndex((m) => m.id === active.id) : -1;
    setActive(scene.marks[Math.max(0, Math.min(scene.marks.length - 1, at < 0 ? 0 : at + delta))]);
  };
  const describe = (d: ChartDatum) => `${d.label}: ${Object.entries(d.values).map(([k, v]) => `${k} ${typeof v === "number" ? formatX(v) : v}`).join(", ")}`;

  const ink1 = t.pick<string>("--ink-1"), ink3 = t.pick<string>("--ink-3");
  const sm = t.size("--text-sm", 13);
  const legendOptions = typeof props.legend === "object" ? props.legend : {};
  const position = legendOptions.position ?? "bottom";
  const legendOn = props.legend ?? (full.legend?.length ?? 0) > 1;
  const legend = legendOn && full.legend?.length ? (
    <ChartLegend
      label={`Legenda de ${title}`}
      items={full.legend.map((item) => ({ ...item, color: resolveColor(t, item.color) }))}
      hidden={hidden}
      marker={legendOptions.marker ?? (["scatter", "bubble"].includes(props.type) ? "circle" : "square")}
      render={legendOptions.render}
      style={position === "right" ? { flexDirection: "column", alignItems: "flex-start" } : undefined}
      onToggle={legendOptions.interactive === false ? undefined : (id) => { setActiveId(null); setHidden((c) => (c.includes(id) ? c.filter((v) => v !== id) : [...c, id])); }}
    />
  ) : null;

  const { style, ...viewProps } = input as Omit<ViewProps, "children"> & SceneChartProps;
  const rest: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(viewProps)) if (k.startsWith("accessib") || k === "testID" || k === "nativeID") rest[k] = v;

  return (
    <View {...rest} style={[{ minWidth: 0, maxWidth: "100%", gap: t.size("--space-4", 16) }, style]}>
      {showTitle && <Text accessibilityRole="header" style={{ color: ink1, fontSize: t.size("--text-lg", 18), lineHeight: Math.round(1.4 * t.size("--text-lg", 18)), ...t.font(["--font-heading", "--font-headline"], "--weight-semi") }}>{title}</Text>}
      <View onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))} style={{ width: "100%" }}>
        {full.error ? (
          <Text accessibilityRole="alert" style={{ paddingVertical: t.size("--space-6", 32), color: ink3, fontSize: sm }}>{full.error}</Text>
        ) : (
          <View style={{ flexDirection: position === "right" ? "row" : "column", alignItems: position === "right" ? "center" : "stretch", gap: t.size("--space-3", 12) }}>
            {position === "top" && legend}
            <View style={{ flex: position === "right" ? 1 : undefined, minWidth: 0 }}>
              <View
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={label}
                accessibilityValue={active ? { text: describe(active.datum) } : undefined}
                accessibilityHint="Deslize para cima ou para baixo para percorrer os itens."
                accessibilityActions={[{ name: "increment" }, { name: "decrement" }, { name: "activate" }]}
                onAccessibilityAction={(e) => {
                  if (e.nativeEvent.actionName === "increment") step(1);
                  else if (e.nativeEvent.actionName === "decrement") step(-1);
                  else if (active) props.onSelect?.(active.datum);
                }}
                onStartShouldSetResponder={() => located.length > 0}
                onMoveShouldSetResponder={() => located.length > 0}
                onResponderTerminationRequest={() => true}
                onResponderGrant={(e) => setActive(nearest(e))}
                onResponderMove={(e) => setActive(nearest(e))}
                onResponderRelease={(e) => { const m = nearest(e); if (m) props.onSelect?.(m.datum); }}
                style={{ height, width: "100%" }}
              >
                {width > 0 && (
                  <Svg width={width} height={height} pointerEvents="none">
                    <Defs>
                      <ClipPath id="refyScenePlot"><Rect x={layout.left} y={layout.top} width={width - layout.left - layout.right} height={height - layout.top - layout.bottom} /></ClipPath>
                    </Defs>
                    {toNativeSvg(scene.decorations, t, ink3)}
                    <G clipPath={cartesian ? "url(#refyScenePlot)" : undefined}>
                      {toNativeSvg(scene.plot, t, ink3)}
                      {scene.marks.map((mark) => {
                        const color = resolveColor(t, mark.color);
                        const muted = active?.datum.seriesId && mark.datum.seriesId !== active.datum.seriesId;
                        return <G key={mark.id} opacity={muted ? 0.35 : 1}>{toNativeSvg(mark.element, t, color)}</G>;
                      })}
                      {active && Number.isFinite(active.x) && Number.isFinite(active.y) && <Circle cx={active.x} cy={active.y} r={8} fill="none" stroke={ink1} strokeWidth={1.5} />}
                    </G>
                  </Svg>
                )}
              </View>
              {props.tooltip !== false && active && (
                <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ position: "absolute", top: t.size("--space-3", 12), right: t.size("--space-3", 12), maxWidth: Math.min(260, width - 24), padding: t.size("--space-4", 16), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line"), borderRadius: t.pick<number>("--radius-md", 8), boxShadow: t.pick<string>("--elev-2", "") || undefined, backgroundColor: t.pick<string>("--surface") }}>
                  {typeof props.tooltip === "object" && props.tooltip.render ? renderText(props.tooltip.render(active.datum), { color: ink1, fontSize: sm }) : (
                    <>
                      <Text style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-bold") }}>{active.datum.label}</Text>
                      <View style={{ marginTop: t.size("--space-2", 8), gap: t.size("--space-1", 4) }}>
                        {Object.entries(active.datum.values).map(([k, v]) => (
                          <View key={k} style={{ flexDirection: "row", gap: t.size("--space-3", 12), justifyContent: "space-between" }}>
                            <Text style={{ flexShrink: 1, color: ink1, fontSize: sm }}>{k}</Text>
                            <Text style={{ color: ink1, fontSize: sm, fontVariant: ["tabular-nums"] }}>{typeof v === "number" ? formatX(v) : v}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
            {position !== "top" && legend}
          </View>
        )}
      </View>
      {!full.error && width > 0 && !scene.marks.length && (
        <Text style={{ color: ink3, fontSize: sm }}>{hidden.length ? "Reative uma série na legenda para ver seus dados." : "Sem dados para representar."}</Text>
      )}
      {!full.error && props.dataTable !== "screen-reader" && full.marks.length > 0 && (
        <Collapsible title={`Ver dados de ${title}`}>
          <Table rowKey={(row) => row.id} rows={full.marks.map((m) => ({ id: m.id, label: m.datum.label, values: Object.entries(m.datum.values).map(([k, v]) => `${k}: ${typeof v === "number" ? formatX(v) : v}`).join(" · ") }))}
            columns={[{ key: "label", header: "Item", cell: (row) => row.label }, { key: "values", header: "Dados", cell: (row) => row.values }]} />
        </Collapsible>
      )}
    </View>
  );
}
