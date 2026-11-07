import { en } from "../../messages/en";
import type { RefyMessages } from "../../messages/en";
import { bin, quantileSorted } from "d3-array";
import { scaleBand, scaleSqrt } from "d3-scale";
import {
  line,
  area,
  curveLinear,
  curveNatural,
  curveMonotoneX,
  curveStep,
  curveStepBefore,
  curveStepAfter,
  curveBasis,
  curveCardinal,
  curveCatmullRom,
  curveBumpX,
  stack,
  stackOffsetDiverging,
  stackOffsetExpand,
} from "d3-shape";
import type {
  ChartCurve,
  ChartDatum,
  ChartLayout,
  ChartMark,
  ChartScene,
  ChartSeries,
  ChartX,
  ChartViewport,
  D3ChartProps,
} from "./types";
import {
  axes,
  colorAt,
  finite,
  formatX,
  keyX,
  numericScale,
  uniqueIds,
  xCoordinates,
} from "./shared";
import styles from "./styles";
const curves = {
  linear: curveLinear,
  natural: curveNatural,
  monotone: curveMonotoneX,
  step: curveStep,
  "step-before": curveStepBefore,
  "step-after": curveStepAfter,
  basis: curveBasis,
  cardinal: curveCardinal,
  "catmull-rom": curveCatmullRom,
  bump: curveBumpX,
};
export const resolveCurve = (curve: ChartCurve = "natural") =>
  typeof curve === "function" ? curve : curves[curve];
const row = (
  id: string,
  label: string,
  values: ChartDatum["values"],
  seriesId?: string,
): ChartDatum => ({ id, label, values, seriesId });
export function cartesianScene(
  props: D3ChartProps,
  layout: ChartLayout,
  hidden: string[],
  viewport?: ChartViewport,
  text: RefyMessages["d3Chart"] = en.d3Chart,
): ChartScene {
  const { width: w, height: h, top: t, right: r, bottom: b } = layout;
  let l = layout.left;
  if (props.type === "heatmap") {
    props.cells.forEach((c) => finite([c.value]));
    const xs = [...new Set(props.cells.map((c) => c.x))],
      ys = [...new Set(props.cells.map((c) => c.y))];
    // Category names on the y axis vary in length (and by language): reserve room for the longest
    // one unless the consumer set the margin. Estimate at 7px per character of the axis font.
    if (props.yAxis?.visible !== false && props.margin?.left === undefined)
      l = Math.max(l, 16 + 7 * Math.max(0, ...ys.map((v) => String(props.yAxis?.format?.(v) ?? v).length)));
    const x = scaleBand()
        .domain(xs)
        .range([l, w - r])
        .padding(0.08),
      y = scaleBand()
        .domain(ys)
        .range([t, h - b])
        .padding(0.08);
    const max = Math.max(1, ...props.cells.map((c) => Math.abs(c.value)));
    return {
      marks: props.cells.map((c, i) => ({
        id: `cell-${i}`,
        datum: row(`cell-${i}`, `${c.x} · ${c.y}`, { [text.value]: c.value }),
        color:
          props.colorScale?.(c.value) ??
          colorAt(c.value < 0 ? 3 : 0, props.colors),
        x: (x(c.x) ?? l) + x.bandwidth() / 2,
        y: (y(c.y) ?? t) + y.bandwidth() / 2,
        element: (
          <rect
            x={x(c.x)}
            y={y(c.y)}
            width={x.bandwidth()}
            height={y.bandwidth()}
            rx={2}
            fill="currentColor"
            fillOpacity={props.colorScale ? 1 : 0.12 + (0.88 * Math.abs(c.value)) / max}
          />
        ),
      })),
      decorations: (
        <g className={styles.axes}>
          {props.xAxis?.visible !== false &&
            xs.map((v) => (
              <text
                key={v}
                x={(x(v) ?? l) + x.bandwidth() / 2}
                y={h - b + 20}
                textAnchor="middle"
              >
                {props.xAxis?.format?.(v) ?? v}
              </text>
            ))}
          {props.yAxis?.visible !== false &&
            ys.map((v) => (
              <text
                key={v}
                x={l - 8}
                y={(y(v) ?? t) + y.bandwidth() / 2 + 4}
                textAnchor="end"
              >
                {props.yAxis?.format?.(v) ?? v}
              </text>
            ))}
        </g>
      ),
    };
  }
  if (props.type === "boxplot") {
    uniqueIds(props.groups);
    props.groups.forEach((g) => finite(g.values));
    const values = props.groups.flatMap((g) => g.values);
    if (!values.length) return { marks: [] };
    const y = numericScale(
      [Math.min(0, ...values), Math.max(1, ...values)],
      [h - b, t],
      props.yAxis,
    );
    const x = scaleBand()
      .domain(props.groups.map((g) => g.id))
      .range([l, w - r])
      .padding(0.5);
    const legend = props.groups.map((g, i) => ({
      id: g.id,
      label: g.label,
      color: colorAt(i, props.colors),
    }));
    const marks: ChartMark[] = props.groups
      .filter((g) => g.values.length && !hidden.includes(g.id))
      .map((g) => {
        const v = [...g.values].sort((a, b) => a - b),
          q1 = quantileSorted(v, 0.25)!,
          q2 = quantileSorted(v, 0.5)!,
          q3 = quantileSorted(v, 0.75)!;
        const lo = v.find((n) => n >= q1 - 1.5 * (q3 - q1))!,
          hi = [...v].reverse().find((n) => n <= q3 + 1.5 * (q3 - q1))!;
        const cx = (x(g.id) ?? l) + x.bandwidth() / 2,
          bw = x.bandwidth();
        return {
          id: g.id,
          datum: row(
            g.id,
            g.label,
            {
              [text.minimum]: lo,
              Q1: q1,
              [text.median]: q2,
              Q3: q3,
              [text.maximum]: hi,
              [text.outliers]:
                v.filter((n) => n < lo || n > hi).join(", ") || text.none,
            },
            g.id,
          ),
          color: legend.find((item) => item.id === g.id)!.color,
          x: cx,
          y: y(q2),
          element: (
            <g fill="currentColor" stroke="currentColor">
              <line x1={cx} x2={cx} y1={y(lo)} y2={y(hi)} />
              <rect
                x={cx - bw / 2}
                y={y(q3)}
                width={bw}
                height={Math.max(1, y(q1) - y(q3))}
                fillOpacity={0.18}
              />
              <line
                x1={cx - bw / 2}
                x2={cx + bw / 2}
                y1={y(q2)}
                y2={y(q2)}
                strokeWidth={2}
              />
              {[lo, hi].map((n, j) => (
                <line
                  key={j}
                  x1={cx - bw / 3}
                  x2={cx + bw / 3}
                  y1={y(n)}
                  y2={y(n)}
                />
              ))}
              {v
                .filter((n) => n < lo || n > hi)
                .map((n, j) => (
                  <circle key={j} cx={cx} cy={y(n)} r={3} />
                ))}
            </g>
          ),
        };
      });
    return {
      marks,
      legend,
      decorations: axes(
        layout,
        {
          at: (v) => (x(String(v)) ?? l) + x.bandwidth() / 2,
          ticks: props.groups.map((g) => g.id),
        },
        y,
        {
          ...props,
          xAxis: {
            ...props.xAxis,
            format: (v) =>
              props.xAxis?.format?.(v) ??
              props.groups.find((g) => g.id === v)?.label ??
              String(v),
          },
        },
      ),
    };
  }
  let series: ChartSeries[];
  if (props.type === "histogram") {
    finite(props.values);
    if (!props.values.length) return { marks: [] };
    const histogram = bin();
    if (Array.isArray(props.thresholds)) {
      finite(props.thresholds);
      histogram.thresholds(props.thresholds);
    } else {
      if (
        props.thresholds !== undefined &&
        (!Number.isInteger(props.thresholds) ||
          props.thresholds < 1 ||
          props.thresholds > 500)
      )
        throw Error("Use between 1 and 500 bins.");
      histogram.thresholds(props.thresholds ?? 10);
    }
    const bins = histogram(props.values);
    series = [
      {
        id: "frequency",
        label: text.frequency,
        data: bins.map((v) => ({
          x: `${formatX(v.x0!, props.locale)}–${formatX(v.x1!, props.locale)}`,
          y: v.length,
        })),
      },
    ];
  } else if ("series" in props) series = props.series;
  else return { marks: [] };
  uniqueIds(series);
  series.forEach((s) =>
    s.data.forEach((p) => {
      finite([
        p.y,
        ...[p.size, p.low, p.high, p.open, p.close].filter(
          (n): n is number => n !== undefined,
        ),
      ]);
      if (p.x instanceof Date && !Number.isFinite(+p.x))
        throw Error("Invalid date on the X axis.");
      if (typeof p.x === "number") finite([p.x]);
    }),
  );
  const legend = series.map((s, i) => ({
    id: s.id,
    label: s.label,
    color: s.color ?? colorAt(i, props.colors),
  }));
  const visible = series.filter((s) => !hidden.includes(s.id));
  if (
    series.some(
      (s) => new Set(s.data.map((p) => keyX(p.x))).size !== s.data.length,
    )
  )
    throw Error("Each series must have unique X coordinates.");
  const allX = [
    ...new Map(
      series.flatMap((s) => s.data.map((p) => [keyX(p.x), p.x] as const)),
    ).values(),
  ];
  if (!allX.length || !visible.length) return { marks: [], legend };
  const horizontal = props.type === "bar" && props.orientation === "horizontal";
  const valueAxis = horizontal ? props.xAxis : props.yAxis;
  const stacked = "stacked" in props && props.stacked;
  if (stacked === "percent" && visible.some((s) => s.data.some((p) => p.y < 0)))
    throw Error("Percent stacking requires non-negative values.");
  const dataByX = allX.map((x) =>
    Object.fromEntries(
      visible.map((s) => [
        s.id,
        s.data.find((p) => keyX(p.x) === keyX(x))?.y ?? 0,
      ]),
    ),
  );
  const stacks = stack<Record<string, number>>()
    .keys(visible.map((s) => s.id))
    .offset(stacked === "percent" ? stackOffsetExpand : stackOffsetDiverging)(
    dataByX,
  );
  const bounds = visible.flatMap((s) =>
    s.data.flatMap((p) => [
      p.y,
      p.low ?? p.y,
      p.high ?? p.y,
      p.open ?? p.y,
      p.close ?? p.y,
    ]),
  );
  const extent = stacked
    ? stacks.flatMap((s) => s.flatMap((v) => [v[0], v[1]]))
    : bounds;
  if (valueAxis?.scale === "log" && bounds.some((v) => v <= 0))
    throw Error("A logarithmic scale requires values greater than zero.");
  const min =
      valueAxis?.scale === "log" ? Math.min(...extent) : Math.min(0, ...extent),
    max = Math.max(...extent);
  const y = numericScale(
    [min, max <= min ? min + 1 : max],
    horizontal ? [l, w - r] : [h - b, t],
    valueAxis,
  );
  const isBar = props.type === "bar" || props.type === "histogram";
  const band = scaleBand()
    .domain(allX.map(keyX))
    .range(
      horizontal
        ? [t, h - b]
        : [
            l * (viewport?.k ?? 1) + (viewport?.x ?? 0),
            (w - r) * (viewport?.k ?? 1) + (viewport?.x ?? 0),
          ],
    )
    .padding(props.type === "histogram" ? 0.04 : 0.22);
  const x = isBar
    ? {
        at: (v: ChartX) => (band(keyX(v)) ?? l) + band.bandwidth() / 2,
        ticks: allX.filter((v) => {
          const px = (band(keyX(v)) ?? l) + band.bandwidth() / 2;
          return px >= l && px <= w - r;
        }),
        invert: (pixel: number) =>
          allX.reduce(
            (best, v) =>
              Math.abs((band(keyX(v)) ?? l) + band.bandwidth() / 2 - pixel) <
              Math.abs((band(keyX(best)) ?? l) + band.bandwidth() / 2 - pixel)
                ? v
                : best,
            allX[0],
          ),
        bandwidth: band.bandwidth(),
      }
    : xCoordinates(allX, [l, w - r], props.xAxis, viewport);
  const curve = resolveCurve("curve" in props ? props.curve : undefined);
  const marks: ChartMark[] = [];
  const paths: React.ReactNode[] = [];
  const baseline = valueAxis?.scale === "log" ? y.domain()[0] : 0;
  visible.forEach((s) => {
    const si = visible.findIndex((v) => v.id === s.id),
      color = legend.find((v) => v.id === s.id)!.color;
    const points = s.data.map((p, i) => {
      const xi = allX.findIndex((v) => keyX(v) === keyX(p.x));
      const level = stacked ? stacks[si][xi] : [baseline, p.y];
      return { p, i, lo: level[0], hi: level[1] };
    });
    if (props.type === "line" || props.type === "area") {
      if (props.type === "area")
        paths.push(
          <path
            key={`${s.id}-area`}
            d={
              area<(typeof points)[number]>()
                .x((v) => x.at(v.p.x))
                .y0((v) => y(v.lo))
                .y1((v) => y(v.hi))
                .curve(curve)(points) ?? ""
            }
            fill={props.areaFill === "gradient" ? `url(#refy-area-${s.id}-${String(color).replace(/[^a-z0-9]/gi, "")})` : color}
            fillOpacity={props.areaFill === "gradient" ? 1 : props.fillOpacity ?? 0.18}
          />,
        );
      if (props.type === "area" && props.areaFill === "gradient")
        // Vertical fade of the series colour (top = 2× fillOpacity, bottom = transparent).
        paths.push(
          <defs key={`${s.id}-area-gradient`}>
            <linearGradient id={`refy-area-${s.id}-${String(color).replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={Math.min(1, (props.fillOpacity ?? 0.18) * 2)} />
              <stop offset="1" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>,
        );
      paths.push(
        <path
          key={`${s.id}-line`}
          d={
            line<(typeof points)[number]>()
              .x((v) => x.at(v.p.x))
              .y((v) => y(v.hi))
              .curve(curve)(points) ?? ""
          }
          fill="none"
          stroke={color}
          strokeWidth={props.strokeWidth ?? 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />,
      );
    }
    const sizes = s.data.map((p) => p.size ?? 1);
    const radius = scaleSqrt()
      .domain([0, Math.max(1, ...sizes)])
      .range([0, 20]);
    points.forEach(({ p, i, lo, hi }) => {
      const datum = row(
        `${s.id}-${i}`,
        formatX(p.x, props.locale),
        {
          [text.series]: s.label,
          [text.value]: p.y,
          ...(p.size === undefined ? {} : { [text.size]: p.size }),
        },
        s.id,
      );
      const px = x.at(p.x),
        py = y(hi);
      let element: React.ReactNode;
      if (isBar) {
        const bw = x.bandwidth / (stacked ? 1 : visible.length),
          offset = stacked ? 0 : si * bw,
          base = (horizontal ? band(keyX(p.x)) : band(keyX(p.x))) ?? l;
        element = horizontal ? (
          <rect
            x={Math.min(y(lo), y(hi))}
            y={base + offset}
            width={Math.abs(y(hi) - y(lo))}
            height={bw}
            rx={2}
            fill="currentColor"
          />
        ) : (
          <rect
            x={base + offset}
            y={Math.min(y(lo), y(hi))}
            width={bw}
            height={Math.abs(y(hi) - y(lo))}
            rx={2}
            fill="currentColor"
          />
        );
        marks.push({
          id: datum.id,
          datum,
          // colorScale also tints bars by value (heatmap-like ramps); series color otherwise.
          color: props.colorScale?.(p.y) ?? color,
          x: horizontal ? (y(lo) + y(hi)) / 2 : base + offset + bw / 2,
          y: horizontal ? base + offset + bw / 2 : (y(lo) + y(hi)) / 2,
          element,
        });
        return;
      }
      if (props.type === "candlestick") {
        if (
          [p.open, p.close, p.low, p.high].some((v) => v === undefined) ||
          p.low! > Math.min(p.open!, p.close!) ||
          p.high! < Math.max(p.open!, p.close!)
        )
          throw Error(
            "Candlestick requires low ≤ open/close ≤ high at every point.",
          );
        const bw = Math.min(26, x.bandwidth * 0.7);
        Object.assign(datum.values, {
          [text.open]: p.open!,
          [text.close]: p.close!,
          [text.low]: p.low!,
          [text.high]: p.high!,
        });
        element = (
          <g stroke="currentColor">
            <line x1={px} x2={px} y1={y(p.low!)} y2={y(p.high!)} />
            <rect
              x={px - bw / 2}
              y={y(Math.max(p.open!, p.close!))}
              width={bw}
              height={Math.max(1, Math.abs(y(p.open!) - y(p.close!)))}
              fill={p.close! >= p.open! ? "currentColor" : "var(--surface)"}
              strokeWidth={1.5}
            />
          </g>
        );
      } else {
        if ((p.size ?? 1) < 0)
          throw Error("A bubble size cannot be negative.");
        const show =
          props.type === "scatter" ||
          props.type === "bubble" ||
          ("dots" in props && props.dots);
        element = (
          <circle
            cx={px}
            cy={py}
            r={props.type === "bubble" ? radius(p.size ?? 1) : show ? 4 : 3}
            fill="currentColor"
            fillOpacity={props.type === "bubble" ? 0.45 : show ? 1 : 0}
            stroke={props.type === "bubble" ? "currentColor" : undefined}
          />
        );
      }
      marks.push({ id: datum.id, datum, color, x: px, y: py, element });
    });
  });
  const decorations = horizontal ? (
    <g className={styles.axes}>
      {props.xAxis?.visible !== false &&
        y.ticks(props.xAxis?.tickCount ?? 4).map((v) => (
          <g key={v}>
            {props.grid !== false && (
              <line
                className={styles.grid}
                x1={y(v)}
                x2={y(v)}
                y1={t}
                y2={h - b}
              />
            )}
            <text x={y(v)} y={h - b + 20} textAnchor="middle">
              {props.xAxis?.format?.(v) ?? formatX(v, props.locale)}
            </text>
          </g>
        ))}
      {props.yAxis?.visible !== false &&
        allX.map((v) => (
          <text
            key={keyX(v)}
            x={l - 8}
            y={(band(keyX(v)) ?? t) + band.bandwidth() / 2 + 4}
            textAnchor="end"
          >
            {props.yAxis?.format?.(v) ?? formatX(v, props.locale)}
          </text>
        ))}
    </g>
  ) : (
    axes(
      layout,
      x,
      y,
      stacked === "percent"
        ? {
            ...props,
            yAxis: {
              format: (value) => `${Math.round(Number(value) * 100)}%`,
              ...props.yAxis,
            },
          }
        : props,
    )
  );
  return {
    marks,
    legend,
    decorations,
    plot: paths,
    xScale: horizontal ? (value) => y(Number(value)) : x.at,
    yScale: horizontal ? undefined : y,
    xInvert: horizontal ? undefined : x.invert,
  };
}
