import { d3Chart as enD3Chart } from "../../../lib/messages/en";
import type { RefyMessages } from "../../../lib/messages/en";
import { arc, pie, lineRadial, curveLinearClosed } from "d3-shape";
import { scaleLinear } from "d3-scale";
import type { ChartLayout, ChartMark, ChartScene, D3ChartProps } from "./types";
import { colorAt, finite, formatX, uniqueIds } from "./shared";
import styles from "../D3Chart.module.css";
export function radialScene(
  props: D3ChartProps,
  layout: ChartLayout,
  hidden: string[],
  text: RefyMessages["d3Chart"] = enD3Chart,
): ChartScene {
  const { width: w, height: h, top: t, bottom: b, left: l, right: r } = layout;
  const cx = (l + w - r) / 2,
    cy = (t + h - b) / 2,
    R = Math.max(8, Math.min(w - l - r, h - t - b) / 2 - 22);
  if (props.type === "radar") {
    uniqueIds(props.series);
    props.series.forEach((s) =>
      s.data.forEach((p) => {
        finite([p.y]);
        if (p.y < 0) throw Error("Radar requires non-negative values.");
      }),
    );
    const categories = [
      ...new Set(props.series.flatMap((s) => s.data.map((p) => formatX(p.x)))),
    ];
    if (categories.length && categories.length < 3)
      throw Error("Radar requires at least three dimensions.");
    const maximum =
      props.max ??
      Math.max(1, ...props.series.flatMap((s) => s.data.map((p) => p.y)));
    if (!Number.isFinite(maximum) || maximum <= 0)
      throw Error("The maximum must be positive.");
    const scale = scaleLinear().domain([0, maximum]).range([0, R]);
    const point = (index: number, value: number) => ({
      x:
        cx + Math.sin((index / categories.length) * 2 * Math.PI) * scale(value),
      y:
        cy - Math.cos((index / categories.length) * 2 * Math.PI) * scale(value),
    });
    const legend = props.series.map((s, i) => ({
      id: s.id,
      label: s.label,
      color: s.color ?? colorAt(i, props.colors),
    }));
    const marks: ChartMark[] = [];
    const polygons = props.series
      .filter((s) => !hidden.includes(s.id))
      .map((s) => {
        const color = legend.find((v) => v.id === s.id)!.color;
        const values = categories.map(
          (category) => s.data.find((p) => formatX(p.x) === category)?.y ?? 0,
        );
        values.forEach((v, i) =>
          marks.push({
            id: `${s.id}-${i}`,
            datum: {
              id: `${s.id}-${i}`,
              label: categories[i],
              seriesId: s.id,
              values: { [text.series]: s.label, [text.value]: v },
            },
            color,
            ...point(i, v),
            element: (
              <circle
                {...{ cx: point(i, v).x, cy: point(i, v).y }}
                r={3}
                fill="currentColor"
              />
            ),
          }),
        );
        return (
          <path
            key={s.id}
            transform={`translate(${cx},${cy})`}
            d={
              lineRadial<number>()
                .angle((_, i) => (i / categories.length) * 2 * Math.PI)
                .radius((v) => scale(v))
                .curve(curveLinearClosed)(values) ?? ""
            }
            fill={color}
            fillOpacity={props.fillOpacity ?? 0.12}
            stroke={color}
            strokeWidth={2}
          />
        );
      });
    return {
      marks,
      legend,
      decorations: (
        <>
          <g className={styles.axes}>
            {[0.25, 0.5, 0.75, 1].map((level) => (
              <path
                key={level}
                transform={`translate(${cx},${cy})`}
                d={
                  lineRadial<number>()
                    .angle((_, i) => (i / categories.length) * 2 * Math.PI)
                    .radius(() => R * level)
                    .curve(curveLinearClosed)(categories.map(() => 0)) ?? ""
                }
                fill="none"
                className={styles.grid}
              />
            ))}
            {categories.map((category, i) => {
              const p = point(i, maximum * 1.13);
              return (
                <g key={category}>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={point(i, maximum).x}
                    y2={point(i, maximum).y}
                    className={styles.grid}
                  />
                  <text x={p.x} y={p.y + 4} textAnchor="middle">
                    {category.length > 13
                      ? `${category.slice(0, 12)}…`
                      : category}
                  </text>
                </g>
              );
            })}
          </g>
          {polygons}
        </>
      ),
    };
  }
  if (!("items" in props)) return { marks: [] };
  uniqueIds(props.items);
  props.items.forEach((item) => {
    finite([item.value]);
    if (item.value < 0)
      throw Error("Radial charts require non-negative values.");
  });
  const legend = props.items.map((s, i) => ({
    id: s.id,
    label: s.label,
    color: s.color ?? colorAt(i, props.colors),
  }));
  const items = props.items.filter((s) => !hidden.includes(s.id));
  const start = props.startAngle ?? (props.type === "gauge" ? -Math.PI / 2 : 0),
    end =
      props.endAngle ?? (props.type === "gauge" ? Math.PI / 2 : Math.PI * 2);
  finite([
    start,
    end,
    props.innerRadius ?? 0,
    props.padAngle ?? (props.type === "pie" ? 0 : 0.025),
    props.cornerRadius ?? (props.type === "pie" ? 0 : 3),
  ]);
  if (end <= start || end - start > 2 * Math.PI + 0.001)
    throw Error("The angular range must be between 0 and 2π radians.");
  const inner = props.innerRadius ?? (props.type === "pie" ? 0 : 0.68);
  if (inner < 0 || inner >= 1)
    throw Error("innerRadius must be between 0 and 1 (exclusive).");
  const shape = arc()
    .cornerRadius(
      Math.max(0, props.cornerRadius ?? (props.type === "pie" ? 0 : 3)),
    )
    .padAngle(
      Math.max(0, props.padAngle ?? (props.type === "pie" ? 0 : 0.025)),
    );
  const decorations: React.ReactNode[] = [];
  let marks: ChartMark[];
  if (props.type === "radial-bar" || props.type === "gauge") {
    if (props.type === "gauge" && items.length > 1)
      throw Error("Gauge accepts a single indicator.");
    const maximum =
      props.max ?? Math.max(1, ...props.items.map((v) => v.value));
    if (!Number.isFinite(maximum) || maximum <= 0)
      throw Error("The maximum must be finite and greater than zero.");
    const band = R / Math.max(2, items.length + 1);
    marks = items.map((item, i) => {
      const outer = R - i * band,
        ir =
          props.type === "gauge" ? outer * inner : outer - band * (1 - inner),
        angle = start + Math.min(1, item.value / maximum) * (end - start);
      decorations.push(
        <path
          key={item.id}
          transform={`translate(${cx},${cy})`}
          d={
            shape({
              innerRadius: ir,
              outerRadius: outer,
              startAngle: start,
              endAngle: end,
            }) ?? ""
          }
          className={styles.track}
        />,
      );
      return {
        id: item.id,
        datum: {
          id: item.id,
          label: item.label,
          seriesId: item.id,
          values: { [text.value]: item.value, [text.maximum]: maximum },
        },
        color: legend.find((v) => v.id === item.id)!.color,
        x: cx + (Math.sin((start + angle) / 2) * (outer + ir)) / 2,
        y: cy - (Math.cos((start + angle) / 2) * (outer + ir)) / 2,
        element: (
          <path
            transform={`translate(${cx},${cy})`}
            d={
              shape({
                innerRadius: ir,
                outerRadius: outer,
                startAngle: start,
                endAngle: angle,
              }) ?? ""
            }
            fill="currentColor"
          />
        ),
      };
    });
    if (props.type === "gauge" && items[0])
      decorations.push(
        <text
          key="value"
          className={styles.centerValue}
          x={cx}
          y={cy + 10}
          textAnchor="middle"
        >
          {formatX(items[0].value)}
        </text>,
      );
  } else {
    const arcs = pie<(typeof items)[number]>()
      .value((d) => d.value)
      .sort(null)
      .startAngle(start)
      .endAngle(end)(items);
    marks = arcs.map((a) => {
      const radial = { ...a, innerRadius: R * inner, outerRadius: R };
      const centroid = shape.centroid(radial);
      return {
        id: a.data.id,
        datum: {
          id: a.data.id,
          label: a.data.label,
          seriesId: a.data.id,
          values: {
            [text.value]: a.value,
            [text.percent]: props.items.reduce((n, i) => n + i.value, 0)
              ? Math.round(
                  (a.value / props.items.reduce((n, i) => n + i.value, 0)) *
                    10000,
                ) / 100
              : 0,
          },
        },
        color: legend.find((v) => v.id === a.data.id)!.color,
        x: cx + centroid[0],
        y: cy + centroid[1],
        element: (
          <path
            transform={`translate(${cx},${cy})`}
            d={shape(radial) ?? ""}
            fill="currentColor"
          />
        ),
      };
    });
    if (props.type === "donut")
      decorations.push(
        <text
          key="total"
          x={cx}
          y={cy + 8}
          className={styles.centerValue}
          textAnchor="middle"
        >
          {formatX(items.reduce((s, i) => s + i.value, 0))}
        </text>,
      );
  }
  return {
    marks: items.every((i) => i.value === 0) ? [] : marks,
    legend,
    decorations,
  };
}
