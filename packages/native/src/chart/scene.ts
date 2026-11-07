// Cena line/area: o mesmo cálculo de cartesianScene na web, sem JSX, para o renderizador
// nativo desenhar com react-native-svg.
import { area, line, stack, stackOffsetDiverging, stackOffsetExpand } from "d3-shape";
import type { ChartAxis, ChartDatum, ChartLayout, ChartLegendItem, ChartViewport, ChartX, D3ChartProps } from "./types";
import { colorAt, finite, formatX, keyX, numericScale, resolveCurve, uniqueIds, xCoordinates } from "./scales";

export interface LineMark {
  id: string;
  datum: ChartDatum;
  color: string;
  x: number;
  y: number;
}
export interface LineScene {
  marks: LineMark[];
  paths: { id: string; kind: "line" | "area"; d: string; color: string }[];
  legend: ChartLegendItem[];
  xTicks: { value: ChartX; at: number; text: string }[];
  yTicks: { value: number; at: number; text: string }[];
  error?: string;
  xScale?: (value: ChartX) => number;
  yScale?: (value: number) => number;
}

const row = (id: string, label: string, values: ChartDatum["values"], seriesId?: string): ChartDatum => ({ id, label, values, seriesId });

export function lineScene(props: D3ChartProps, layout: ChartLayout, hidden: string[], viewport?: ChartViewport): LineScene {
  const { width: w, height: h, top: t, right: r, bottom: b, left: l } = layout;
  const series = props.series;
  uniqueIds(series);
  series.forEach((s) =>
    s.data.forEach((p) => {
      finite([p.y]);
      if (typeof p.x === "number") finite([p.x]);
    }),
  );
  const legend = series.map((s, i) => ({ id: s.id, label: s.label, color: s.color ?? colorAt(i, props.colors) }));
  const visible = series.filter((s) => !hidden.includes(s.id));
  if (series.some((s) => new Set(s.data.map((p) => keyX(p.x))).size !== s.data.length)) throw Error("Cada série deve ter coordenadas X únicas.");
  const allX = [...new Map(series.flatMap((s) => s.data.map((p) => [keyX(p.x), p.x] as const))).values()];
  const empty: LineScene = { marks: [], paths: [], legend, xTicks: [], yTicks: [] };
  if (!allX.length || !visible.length) return empty;
  const stacked = props.stacked;
  if (stacked === "percent" && visible.some((s) => s.data.some((p) => p.y < 0))) throw Error("Empilhamento percentual exige valores não negativos.");
  const dataByX = allX.map((x) => Object.fromEntries(visible.map((s) => [s.id, s.data.find((p) => keyX(p.x) === keyX(x))?.y ?? 0])));
  const stacks = stack<Record<string, number>>()
    .keys(visible.map((s) => s.id))
    .offset(stacked === "percent" ? stackOffsetExpand : stackOffsetDiverging)(dataByX);
  const bounds = visible.flatMap((s) => s.data.flatMap((p) => [p.y, p.low ?? p.y, p.high ?? p.y, p.open ?? p.y, p.close ?? p.y]));
  const extent = stacked ? stacks.flatMap((s) => s.flatMap((v) => [v[0], v[1]])) : bounds;
  const yAxis: ChartAxis | undefined = stacked === "percent" ? { format: (value) => `${Math.round(Number(value) * 100)}%`, ...props.yAxis } : props.yAxis;
  if (yAxis?.scale === "log" && bounds.some((v) => v <= 0)) throw Error("A escala logarítmica exige valores maiores que zero.");
  const min = yAxis?.scale === "log" ? Math.min(...extent) : Math.min(0, ...extent),
    max = Math.max(...extent);
  const y = numericScale([min, max <= min ? min + 1 : max], [h - b, t], yAxis);
  const x = xCoordinates(allX, [l, w - r], props.xAxis, viewport);
  const curve = resolveCurve(props.curve);
  const baseline = yAxis?.scale === "log" ? y.domain()[0] : 0;
  const marks: LineMark[] = [];
  const paths: LineScene["paths"] = [];
  visible.forEach((s) => {
    const si = visible.findIndex((v) => v.id === s.id),
      color = legend.find((v) => v.id === s.id)!.color;
    const points = s.data.map((p, i) => {
      const xi = allX.findIndex((v) => keyX(v) === keyX(p.x));
      const level = stacked ? stacks[si][xi] : [baseline, p.y];
      return { p, i, lo: level[0], hi: level[1] };
    });
    if (props.type === "area")
      paths.push({ id: `${s.id}-area`, kind: "area", color, d: area<(typeof points)[number]>().x((v) => x.at(v.p.x)).y0((v) => y(v.lo)).y1((v) => y(v.hi)).curve(curve)(points) ?? "" });
    paths.push({ id: `${s.id}-line`, kind: "line", color, d: line<(typeof points)[number]>().x((v) => x.at(v.p.x)).y((v) => y(v.hi)).curve(curve)(points) ?? "" });
    points.forEach(({ p, i, hi }) => {
      const datum = row(`${s.id}-${i}`, formatX(p.x), { Série: s.label, Valor: p.y, ...(p.size === undefined ? {} : { Tamanho: p.size }) }, s.id);
      marks.push({ id: datum.id, datum, color, x: x.at(p.x), y: y(hi) });
    });
  });
  const yValues = (yAxis?.tickValues ?? y.ticks(yAxis?.tickCount ?? 4)).map(Number);
  return {
    marks,
    paths,
    legend,
    xTicks: x.ticks.map((value) => ({ value, at: x.at(value), text: props.xAxis?.format?.(value) ?? String(formatX(value)) })),
    yTicks: yValues.map((value) => ({ value, at: y(value), text: yAxis?.format?.(value) ?? String(formatX(value)) })),
    xScale: x.at,
    yScale: y,
  };
}
