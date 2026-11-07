"use client";
import { useEffect, useId, useRef, useState } from "react";
import { max } from "d3-array";
import { scaleLinear } from "d3-scale";
import {
  arc,
  area,
  curveMonotoneX,
  curveLinear,
  curveStep,
  line,
} from "d3-shape";
import { cn } from "../../lib/cn";
import styles from "./Charts.module.css";
import { ChartLegend } from "./ChartLegend";
const toneColors = {
  muted: "var(--ink-4)",
  primary: "var(--chart-primary)",
  info: "var(--chart-secondary, var(--info))",
  warn: "var(--chart-tertiary, var(--weak))",
  critical: "var(--chart-quaternary, var(--critical))",
};
import { Table } from "../Table";
import { useChartWidth } from "./useChartWidth";

import { useLocale, useMessages } from "../../lib/locale";
/* =========================================================
 * Charts — line/bar/donut/sparkline com D3 por trás
 * (d3-scale para escalas/ticks, d3-shape para curvas/arcos)
 * e render 100% React/SVG. Eixos com réguas e títulos,
 * legenda, tooltip e animações de entrada (CSS,
 * respeitando prefers-reduced-motion). Cores via tokens.
 * ========================================================= */

export type ChartTone = "primary" | "info" | "warn" | "critical";

const H = 260;
const PAD = { left: 52, right: 16, top: 24, bottom: 44 };

/** Uma série do LineChart. */
export interface LineSeries {
  name: string;
  data: number[];
  tone?: ChartTone;
}

/** Props for the line chart. */
export interface LineChartProps {
  /** Visible chart title. */
  title: string;
  /** Shows the title inside the figure. Turn it off when the container already shows it. */
  showTitle?: boolean;
  /** Single series (shortcut)… */
  data?: number[];
  /** …or multiple series with a legend. */
  series?: LineSeries[];
  /** X axis labels, spread across the points (e.g. ["Aug", "Sep", "Oct", "Today"]). */
  xLabels?: string[];
  /** Label for each point in the tooltip (default: nearest X label or index). */
  pointLabels?: string[];
  /** Y axis title (unit, e.g. "Visits/month"). */
  yTitle?: string;
  /** X axis title (e.g. "Last 90 days"). */
  xTitle?: string;
  /** Formats values (Y axis and tooltip). */
  formatY?: (value: number) => string;
  /** Maximum axis value. Default: D3 `nice()` scale. */
  max?: number;
  /** Gradient area under the line (only with 1 series). Default true. */
  area?: boolean;
  /** Legend with each series' name + color. Default: automatic with 2+ series. */
  showLegend?: boolean;
  stacked?: boolean;
  curve?: "smooth" | "linear" | "step";
  /** Accessible chart description. */
  label: string;
  className?: string;
}

/**
 * LineChart — gráfico de linhas completo: eixos X/Y com réguas (ticks),
 * títulos de eixo, grid, legenda multi-série e tooltip interativo.
 *
 * D3 por trás: `scaleLinear().nice()` para os ticks e `curveMonotoneX`
 * para a suavização. A linha desenha-se na entrada; o hover mostra guia
 * vertical e o valor de cada série no ponto mais próximo.
 */
export function LineChart({
  title,
  showTitle = true,
  data,
  series: seriesProp,
  xLabels,
  pointLabels,
  yTitle,
  xTitle,
  formatY,
  max: maxProp,
  area: showArea = true,
  showLegend,
  stacked = false,
  curve = "smooth",
  label,
  className,
}: LineChartProps) {
  const m = useMessages("charts");
  const locale = useLocale();
  const gradId = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const W = useChartWidth(svgRef);
  const helpId = useId();

  const allSeries: LineSeries[] = (
    seriesProp ?? (data ? [{ name: label, data, tone: "primary" }] : [])
  ).map((series) => ({
    ...series,
    data: series.data.map((value) => (Number.isFinite(value) ? value : 0)),
  }));
  const series = allSeries.filter((item) => !hidden.includes(item.name));
  const pointCount = max(allSeries, (item) => item.data.length) ?? 0;
  const plotData = series.map((item, index) => ({
    ...item,
    data: item.data.map((value, point) =>
      stacked
        ? series
            .slice(0, index)
            .reduce((sum, previous) => sum + (previous.data[point] ?? 0), value)
        : value,
    ),
  }));
  const maxValue = Math.max(
    1,
    Number.isFinite(maxProp)
      ? maxProp!
      : (max(plotData.flatMap((item) => item.data)) ?? 1),
  );
  const minValue = Math.min(0, ...plotData.flatMap((item) => item.data));
  const curveFactory =
    curve === "linear"
      ? curveLinear
      : curve === "step"
        ? curveStep
        : curveMonotoneX;

  const xScale = scaleLinear()
    .domain([0, Math.max(1, pointCount - 1)])
    .range([PAD.left, W - PAD.right]);
  const yScale = scaleLinear()
    .domain([minValue, maxValue])
    .nice(4)
    .range([H - PAD.bottom, PAD.top]);

  const lineGen = line<number>()
    .x((_, i) => xScale(i))
    .y((v) => yScale(v))
    .curve(curveFactory);

  const yTicks = yScale.ticks(4);
  const fmt = formatY ?? ((v: number) => Math.round(v).toLocaleString(locale));
  // posição real dos rótulos X: distribuídos pelos índices dos dados
  const xTickAt = (i: number) =>
    xLabels && xLabels.length > 1
      ? (i * (pointCount - 1)) / (xLabels.length - 1)
      : i;

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const index = Math.round(xScale.invert(px));
    setHover(Math.max(0, Math.min(pointCount - 1, index)));
  }

  const legendOn = showLegend ?? allSeries.length > 1;

  return (
    <figure className={cn(styles.frame, className)}>
      <h3 className={showTitle ? styles.title : styles.srOnly}>{title}</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        className={cn(styles.chart, styles.stretch, styles.lineChart)}
        tabIndex={pointCount ? 0 : undefined}
        aria-describedby={helpId}
        onFocus={() => {
          if (pointCount) setHover(0);
        }}
        onBlur={() => setHover(null)}
        onKeyDown={(event) => {
          if (
            !pointCount ||
            !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
          )
            return;
          event.preventDefault();
          setHover((current) =>
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? pointCount - 1
                : Math.max(
                    0,
                    Math.min(
                      pointCount - 1,
                      (current ?? 0) + (event.key === "ArrowLeft" ? -1 : 1),
                    ),
                  ),
          );
        }}
        onPointerMove={(event) => {
          if (pointCount) onPointerMove(event);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={styles.gradTop} />
            <stop offset="100%" className={styles.gradBottom} />
          </linearGradient>
        </defs>

        {/* eixo Y: linha + réguas + labels + título */}
        <line
          className={styles.axis}
          x1={PAD.left}
          y1={PAD.top - 6}
          x2={PAD.left}
          y2={H - PAD.bottom}
        />
        {yTicks.map((v) => (
          <g key={v}>
            {v > 0 && (
              <line
                className={styles.grid}
                x1={PAD.left}
                y1={yScale(v)}
                x2={W - PAD.right}
                y2={yScale(v)}
              />
            )}
            <line
              className={styles.tick}
              x1={PAD.left - 4}
              y1={yScale(v)}
              x2={PAD.left}
              y2={yScale(v)}
            />
            <text
              className={styles.tickLabel}
              x={PAD.left - 8}
              y={yScale(v) + 3.5}
              textAnchor="end"
            >
              {fmt(v)}
            </text>
          </g>
        ))}
        {yTitle && (
          <text className={styles.axisTitle} x={6} y={PAD.top - 10}>
            {yTitle}
          </text>
        )}

        {/* eixo X: linha + réguas + labels + título */}
        <line
          className={styles.axis}
          x1={PAD.left}
          y1={H - PAD.bottom}
          x2={W - PAD.right}
          y2={H - PAD.bottom}
        />
        {xLabels?.map((t, i) => {
          const x = xScale(xTickAt(i));
          return (
            <g key={`${t}-${i}`}>
              <line
                className={styles.tick}
                x1={x}
                y1={H - PAD.bottom}
                x2={x}
                y2={H - PAD.bottom + 4}
              />
              <text
                className={styles.tickLabel}
                x={x}
                y={H - PAD.bottom + 16}
                textAnchor="middle"
              >
                {t}
              </text>
            </g>
          );
        })}
        {xTitle && (
          <text
            className={styles.axisTitle}
            x={(PAD.left + W - PAD.right) / 2}
            y={H - 6}
            textAnchor="middle"
          >
            {xTitle}
          </text>
        )}

        {/* séries */}
        {showArea &&
          plotData.map((item, index) => {
            const areaPath = area<number>()
              .x((_, point) => xScale(point))
              .y0((_, point) =>
                yScale(
                  stacked && index > 0
                    ? (plotData[index - 1].data[point] ?? 0)
                    : 0,
                ),
              )
              .y1((value) => yScale(value))
              .curve(curveFactory);
            return (
              <path
                key={item.name}
                className={cn(
                  styles.areaIn,
                  plotData.length > 1 && styles.multiArea,
                  plotData.length > 1 &&
                    styles[`fill_${item.tone ?? "primary"}`],
                )}
                d={areaPath(item.data) ?? ""}
                fill={plotData.length === 1 ? `url(#${gradId})` : undefined}
              />
            );
          })}
        {plotData.map((s) => (
          <g key={s.name}>
            <path
              className={cn(
                styles.line,
                styles[`stroke_${s.tone ?? "primary"}`],
                styles.drawIn,
              )}
              pathLength={1}
              d={lineGen(s.data) ?? ""}
            />
            {s.data.length > 0 && (
              <circle
                className={cn(
                  styles.endpoint,
                  styles[`fill_${s.tone ?? "primary"}`],
                  styles.fadeIn,
                )}
                cx={xScale(s.data.length - 1)}
                cy={yScale(s.data[s.data.length - 1])}
                r="4.5"
              />
            )}
          </g>
        ))}

        {/* tooltip */}
        {hover !== null && (
          <g className={styles.tooltipLayer}>
            <line
              className={styles.guide}
              x1={xScale(hover)}
              y1={PAD.top}
              x2={xScale(hover)}
              y2={H - PAD.bottom}
            />
            {plotData.map((s) => (
              <circle
                key={s.name}
                className={cn(
                  styles.hoverDot,
                  styles[`fill_${s.tone ?? "primary"}`],
                )}
                cx={xScale(hover)}
                cy={yScale(s.data[hover] ?? 0)}
                r="4.5"
              />
            ))}
          </g>
        )}
      </svg>

      <span id={helpId} className={styles.srOnly}>
        {m.keyboardHelp}
      </span>
      {hover !== null && pointCount > 0 && (
        <div className={styles.htmlTooltip} role="status" aria-live="polite">
          <strong>
            {pointLabels?.[hover] ??
              xLabels?.[
                Math.round(
                  (hover / Math.max(1, pointCount - 1)) *
                    ((xLabels?.length ?? 1) - 1),
                )
              ] ??
              `Ponto ${hover + 1}`}
          </strong>
          {series.map((item) => (
            <span key={item.name}>
              <i
                className={cn(
                  styles.swatch,
                  styles[`bg_${item.tone ?? "primary"}`],
                )}
              />
              {item.name}
              <b>
                {item.data[hover] === undefined ? "—" : fmt(item.data[hover])}
              </b>
            </span>
          ))}
        </div>
      )}
      {!pointCount && <p role="status">{m.noData}</p>}
      {pointCount > 0 && !series.length && (
        <p role="status">{m.selectSeries}</p>
      )}
      {legendOn && (
        <ChartLegend
          label={m.legend(String(title))}
          marker="square"
          items={allSeries.map((item) => ({
            id: item.name,
            label: item.name,
            color: toneColors[item.tone ?? "primary"],
          }))}
          hidden={hidden}
          onToggle={(id) =>
            setHidden((current) =>
              current.includes(id)
                ? current.filter((name) => name !== id)
                : [...current, id],
            )
          }
        />
      )}
      <ChartDataTable
        label={title}
        rows={Array.from({ length: pointCount }, (_, index) => ({
          index,
          label:
            pointLabels?.[index] ??
            xLabels?.[
              Math.round(
                (index / Math.max(1, pointCount - 1)) *
                  ((xLabels?.length ?? 1) - 1),
              )
            ] ??
            `Ponto ${index + 1}`,
          values: allSeries
            .map(
              (item) =>
                `${item.name}: ${item.data[index] === undefined ? "—" : fmt(item.data[index])}`,
            )
            .join(" · "),
        }))}
      />
    </figure>
  );
}

export interface BarChartItem {
  label: string;
  value: number;
  /** Tom da barra. Padrão `primary`. */
  tone?: ChartTone;
}

export interface BarChartProps {
  /** Visible chart title. */
  title: string;
  /** Shows the title inside the figure. Turn it off when the container already shows it. */
  showTitle?: boolean;
  items: BarChartItem[];
  /** Formats the values (ruler and bar end). */
  formatValue?: (value: number) => string;
  /** Value axis title (unit). */
  valueTitle?: string;
  label: string;
  className?: string;
}

/**
 * BarChart — compara uma medida quantitativa entre categorias. Estados,
 * falhas e ausência de dados devem ficar fora da série. Inclui gridlines,
 * réguas com medidas embaixo (escala `nice()` do D3) e título de unidade.
 * Rótulo mono à esquerda, valor no fim da barra; entrada em stagger.
 */
export function BarChart({
  title,
  showTitle = true,
  items,
  formatValue = (v) => String(v),
  valueTitle,
  label,
  className,
}: BarChartProps) {
  const m = useMessages("charts");
  const svgRef = useRef<SVGSVGElement>(null);
  const W = useChartWidth(svgRef);
  const barX = Math.min(118, W * 0.29);
  const axisY = H - PAD.bottom;
  const plotTop = PAD.top;
  const rowH = (axisY - plotTop) / Math.max(1, items.length);
  const barHeight = Math.min(20, Math.max(10, rowH - 10));
  const maxValue = Math.max(1, max(items, (d) => d.value) ?? 0);
  const widthScale = scaleLinear()
    .domain([0, maxValue])
    .nice(4)
    .range([0, W - barX - 24]);
  const ticks = widthScale.ticks(4);

  return (
    <figure className={cn(styles.frame, className)}>
      <h3 className={showTitle ? styles.title : styles.srOnly}>{title}</h3>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        className={cn(styles.chart, styles.stretch)}
      >
        {/* gridlines verticais + réguas de medida */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              className={styles.grid}
              x1={barX + widthScale(t)}
              y1={plotTop}
              x2={barX + widthScale(t)}
              y2={axisY}
            />
            <line
              className={styles.tick}
              x1={barX + widthScale(t)}
              y1={axisY}
              x2={barX + widthScale(t)}
              y2={axisY + 4}
            />
            <text
              className={styles.tickLabel}
              x={barX + widthScale(t)}
              y={axisY + 16}
              textAnchor="middle"
            >
              {formatValue(t)}
            </text>
          </g>
        ))}
        <line
          className={styles.axis}
          x1={barX}
          y1={plotTop}
          x2={barX}
          y2={axisY}
        />
        <line
          className={styles.axis}
          x1={barX}
          y1={axisY}
          x2={
            W - 24 + barX > W
              ? W - 16
              : barX + widthScale(ticks[ticks.length - 1] ?? 0)
          }
          y2={axisY}
        />

        {items.map((item, i) => {
          const width = widthScale(item.value);
          const visibleWidth = item.value === 0 ? 4 : width;
          const y = plotTop + i * rowH + (rowH - barHeight) / 2;
          const tone = item.tone ?? "primary";
          return (
            <g key={item.label} className={styles.barRow}>
              <text
                className={styles.tickLabel}
                x={barX - 8}
                y={y + barHeight / 2 + 3.5}
                textAnchor="end"
              >
                {item.label}
              </text>
              <rect
                className={cn(styles[`fill_${tone}`], styles.bar)}
                x={barX}
                y={y}
                width={visibleWidth}
                height={barHeight}
                rx="3"
              >
                <title>{`${item.label}: ${formatValue(item.value)}`}</title>
              </rect>
              <text
                className={cn(styles.value, styles.fadeIn)}
                x={barX + visibleWidth + 8}
                y={y + barHeight / 2 + 3.5}
              >
                {formatValue(item.value)}
              </text>
            </g>
          );
        })}

        {valueTitle && (
          <text
            className={styles.axisTitle}
            x={barX + (W - barX - 24) / 2}
            y={H - 6}
            textAnchor="middle"
          >
            {valueTitle}
          </text>
        )}
      </svg>
      {!items.length && <p role="status">{m.noData}</p>}
      <ChartDataTable
        label={title}
        rows={items.map((item, index) => ({
          index,
          label: item.label,
          values: formatValue(item.value),
        }))}
      />
    </figure>
  );
}

export interface DonutSegment {
  /** Fração do anel, na mesma unidade dos demais segmentos. */
  value: number;
  tone?: ChartTone | "muted";
  label?: string;
}

/** Props for the donut chart. */
export interface DonutChartProps {
  /** Filled fraction, 0–100 (progress mode)… */
  value?: number;
  /** …or multiple segments (distribution mode). */
  segments?: DonutSegment[];
  /** Large central text (default: the value). */
  centerLabel?: string;
  /** Smaller line under the central text. */
  caption?: string;
  /** Side legend with a value per segment. Default: automatic with `segments`. */
  showLegend?: boolean;
  /** Formats the legend values. */
  formatValue?: (value: number) => string;
  /** Diameter in px. Default 220. */
  size?: number;
  label: string;
  className?: string;
}

const R_OUTER = 89;
const R_INNER = 67;

/**
 * DonutChart — anel de progresso (ou distribuição) com valor central e
 * legenda lateral (swatch + rótulo + valor por segmento).
 *
 * D3 por trás: `arc()` com cantos arredondados. No modo progresso o arco
 * varre do zero até o valor na entrada.
 */
export function DonutChart({
  value,
  segments,
  centerLabel,
  caption,
  showLegend,
  formatValue = (v) => String(v),
  size = 220,
  label,
  className,
}: DonutChartProps) {
  const m = useMessages("charts");
  const filled = Math.max(0, Math.min(100, value ?? 0));
  const [sweep, setSweep] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSweep(filled));
    return () => cancelAnimationFrame(raf);
  }, [filled]);

  const arcGen = arc<{ start: number; end: number }>()
    .innerRadius(R_INNER)
    .outerRadius(R_OUTER)
    .cornerRadius(6)
    .startAngle((d) => d.start)
    .endAngle((d) => d.end);

  const TAU = 2 * Math.PI;
  const track = arcGen({ start: 0, end: TAU }) ?? "";

  let paths: Array<{ d: string; tone: string }> = [];
  if (segments) {
    const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
    let acc = 0;
    paths = segments.map((s) => {
      const start = (acc / total) * TAU;
      acc += s.value;
      const end = (acc / total) * TAU - 0.03; // gap fino entre segmentos
      return {
        d: arcGen({ start, end: Math.max(start, end) }) ?? "",
        tone: s.tone ?? "primary",
      };
    });
  } else {
    paths = [
      {
        d: arcGen({ start: 0, end: (sweep / 100) * TAU }) ?? "",
        tone: "primary",
      },
    ];
  }

  const center = centerLabel ?? (segments ? "" : `${filled}%`);
  const legendOn = showLegend ?? Boolean(segments);

  return (
    <figure className={cn(styles.frame, styles.donutFrame, className)}>
      <svg
        viewBox="0 0 220 220"
        width={size}
        height={size}
        role="img"
        aria-label={segments ? label : `${label}: ${filled}%`}
        className={cn(styles.chart, styles.donutSvg)}
      >
        <g transform="translate(110 110)">
          <path className={styles.donutTrackArc} d={track} />
          {paths.map((p, i) => (
            <path
              key={i}
              className={cn(
                styles.donutSeg,
                styles[`fill_${p.tone}` as keyof typeof styles],
              )}
              d={p.d}
            />
          ))}
        </g>
        {center && (
          <text
            className={styles.donutValue}
            x="110"
            y="108"
            textAnchor="middle"
          >
            {center}
          </text>
        )}
        {caption && (
          <text
            className={styles.donutCaption}
            x="110"
            y="132"
            textAnchor="middle"
          >
            {caption}
          </text>
        )}
      </svg>
      {legendOn && segments && (
        <ChartLegend
          label={m.legend(String(label))}
          className={styles.legendColumn}
          items={segments.map((item, index) => ({
            id: String(index),
            label: `${item.label ?? m.series(index + 1)} · ${formatValue(item.value)}`,
            color: toneColors[item.tone ?? "primary"],
          }))}
        />
      )}
      <ChartDataTable
        label={label}
        rows={
          segments
            ? segments.map((segment, index) => ({
                index,
                label: segment.label ?? m.series(index + 1),
                values: formatValue(segment.value),
              }))
            : [{ index: 0, label, values: `${filled}%` }]
        }
      />
    </figure>
  );
}

/** Props for the compact sparkline chart. */
export interface SparklineProps {
  data: number[];
  /** `good` (emerald, default) or `bad` (critical). */
  tone?: "good" | "bad";
  width?: number;
  height?: number;
  label: string;
  className?: string;
}

/** Sparkline — mini-linha de tendência (100×28), sem eixos por definição. */
export function Sparkline({
  data,
  tone = "good",
  width = 100,
  height = 28,
  label,
  className,
}: SparklineProps) {
  const xScale = scaleLinear()
    .domain([0, data.length - 1])
    .range([1, width - 1]);
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const yScale = scaleLinear()
    .domain([lo, hi === lo ? lo + 1 : hi])
    .range([height - 4, 4]);
  const path =
    line<number>()
      .x((_, i) => xScale(i))
      .y((v) => yScale(v))
      .curve(curveMonotoneX)(data) ?? "";

  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className={cn(styles.chart, className)}
    >
      <path
        className={cn(
          styles.line,
          styles[tone === "bad" ? "stroke_critical" : "stroke_primary"],
          styles.drawIn,
        )}
        pathLength={1}
        d={path}
      />
    </svg>
  );
}

export type AreaChartProps = Omit<LineChartProps, "area">;
export function AreaChart(props: AreaChartProps) {
  return <LineChart {...props} area />;
}
function ChartDataTable({
  label,
  rows,
}: {
  label: string;
  rows: { index: number; label: string; values: string }[];
}) {
  const m = useMessages("charts");
  return (
    <details className={styles.data}>
      <summary>{m.viewData(String(label))}</summary>
      <Table
        caption={`Dados: ${label}`}
        rows={rows}
        rowKey={(row) => String(row.index)}
        columns={[
          { key: "label", header: m.reference, cell: (row) => row.label },
          { key: "values", header: m.values, cell: (row) => row.values },
        ]}
      />
    </details>
  );
}
