"use client";
import { Fragment, useId, useMemo, useRef, useState, useEffect } from "react";

import { Button } from "../Button";
import { Range } from "../Range";
import { ChartLegend } from "./ChartLegend";
import { useChartStream, seriesTypes } from "./d3/useChartStream";
import { useChartNavigation } from "./d3/useChartNavigation";
import { Table } from "../Table";
import { useChartWidth } from "./useChartWidth";
import type {
  ChartDatum,
  ChartLayout,
  ChartScene,
  D3ChartProps,
  ChartViewport,
} from "./d3/types";
import { cartesianScene } from "./d3/cartesian";
import { radialScene } from "./d3/radial";
import { hierarchyScene } from "./d3/hierarchy";
import { relationScene } from "./d3/relations";
import { formatX } from "./d3/shared";
import styles from "./D3Chart.module.css";

import { useLocale, useMessages } from "../../lib/locale";
/** Geometria D3, DOM React, tokens Refy. Cada família conserva seu contrato de dados. */
export function D3Chart(input: D3ChartProps) {
  const m = useMessages("d3Chart");
  const charts = useMessages("charts");
  const streaming = useChartStream(input);
  const contextLocale = useLocale();
  const props = { ...streaming.props, locale: streaming.props.locale ?? contextLocale };
  const { title, label, showTitle = true, height = 300 } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const width = useChartWidth(svgRef);
  const helpId = useId();
  const clipId = useId().replace(/:/g, "");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
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
  ].includes(props.type);
  const layout: ChartLayout = {
    width,
    height,
    top: 24,
    right: 20,
    bottom: cartesian ? 42 : 16,
    left: cartesian ? 52 : 16,
    ...props.margin,
  };
  if (
    cartesian &&
    props.yAxis?.visible === false &&
    props.margin?.left === undefined
  )
    layout.left = 16;
  if (
    cartesian &&
    props.xAxis?.visible === false &&
    props.margin?.bottom === undefined
  )
    layout.bottom = 16;
  const compute = (
    suppressed: string[],
    viewport?: ChartViewport,
  ): ChartScene => {
    try {
      if (!Number.isFinite(height) || height < 120 || height > 2000)
        throw Error("Height must be between 120 and 2000 px.");
      if (
        [layout.top, layout.right, layout.bottom, layout.left].some(
          (v) => !Number.isFinite(v) || v < 0,
        ) ||
        layout.left + layout.right >= width ||
        layout.top + layout.bottom >= height
      )
        throw Error("Margins must leave room for the chart.");
      if (cartesian) return cartesianScene(props, layout, suppressed, viewport, m);
      if (["pie", "donut", "radial-bar", "gauge", "radar"].includes(props.type))
        return radialScene(props, layout, suppressed, m);
      if ("root" in props) return hierarchyScene(props, layout, suppressed, m);
      return relationScene(props, layout, suppressed, m);
    } catch (error) {
      return {
        marks: [],
        error:
          error instanceof Error
            ? error.message === "circular link"
              ? m.cyclicSankey
              : error.message
            : m.cannotRender,
      };
    }
  };
  // A tabela usa todos os dados mesmo quando uma série está oculta.
  const full = useMemo(() => compute([]), [props, width]);
  const xNavigation =
    seriesTypes.includes(props.type) &&
    !(props.type === "bar" && props.orientation === "horizontal");
  const spatial = [
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
  ].includes(props.type);
  const kind = full.error
    ? false
    : xNavigation
      ? "x"
      : spatial
        ? "spatial"
        : false;
  const navigation = useChartNavigation(
    svgRef,
    layout,
    kind,
    { zoom: props.zoom, brush: kind === "x" ? props.brush : false },
    (range) => {
      setActiveId(null);
      if (typeof props.brush === "object") {
        const W = width - layout.left - layout.right;
        props.brush.onChange?.(
          range && full.xInvert
            ? {
                range: [
                  full.xInvert(layout.left + range[0] * W),
                  full.xInvert(layout.left + range[1] * W),
                ],
                items: full.marks
                  .filter(
                    (m) =>
                      m.x !== undefined &&
                      m.x >= layout.left + range[0] * W &&
                      m.x <= layout.left + range[1] * W,
                  )
                  .map((m) => m.datum),
              }
            : null,
        );
      }
    },
  );
  const scene =
    hidden.length || (kind === "x" && navigation.viewport.k !== 1)
      ? compute(hidden, kind === "x" ? navigation.viewport : undefined)
      : full;
  useEffect(() => setActiveId(null), [navigation.viewport]);
  const transform =
    kind === "spatial"
      ? `translate(${navigation.viewport.x},${navigation.viewport.y}) scale(${navigation.viewport.k})`
      : undefined;
  const active = scene.marks.find((mark) => mark.id === activeId);
  const tooltip = props.tooltip !== false;
  const legendOptions = typeof props.legend === "object" ? props.legend : {};
  const position = legendOptions.position ?? "bottom";
  const legendOn = props.legend ?? (full.legend?.length ?? 0) > 1;
  const hover = (datum: ChartDatum | null) => {
    setActiveId(datum?.id ?? null);
    props.onHover?.(datum);
  };
  const nearestDatum = (event: {
    currentTarget: SVGSVGElement;
    clientX: number;
    clientY: number;
  }) => {
    const rect = event.currentTarget.getBoundingClientRect();
    let x = ((event.clientX - rect.left) * width) / rect.width;
    let y = ((event.clientY - rect.top) * height) / rect.height;
    if (kind === "spatial") {
      x = (x - navigation.viewport.x) / navigation.viewport.k;
      y = (y - navigation.viewport.y) / navigation.viewport.k;
    }
    return (
      scene.marks
        .filter((m) => Number.isFinite(m.x) && Number.isFinite(m.y))
        .reduce<(typeof scene.marks)[number] | undefined>(
          (best, m) =>
            !best ||
            Math.hypot(m.x! - x, m.y! - y) <
              Math.hypot(best.x! - x, best.y! - y)
              ? m
              : best,
          undefined,
        )?.datum ?? null
    );
  };
  const legend =
    legendOn && full.legend?.length ? (
      <ChartLegend
        label={charts.legend(String(title))}
        className={styles.legend}
        items={full.legend}
        hidden={hidden}
        marker={
          legendOptions.marker ??
          (["line", "area"].includes(props.type)
            ? "line"
            : ["scatter", "bubble"].includes(props.type)
              ? "circle"
              : "square")
        }
        render={legendOptions.render}
        onToggle={
          legendOptions.interactive === false
            ? undefined
            : (id) => {
                setActiveId(null);
                setHidden((current) =>
                  current.includes(id)
                    ? current.filter((v) => v !== id)
                    : [...current, id],
                );
              }
        }
      />
    ) : null;
  return (
    <figure
      className={[styles.frame, props.className].filter(Boolean).join(" ")}
      style={props.style}
      data-chart-type={props.type}
      data-selectable={Boolean(props.onSelect)}
    >
      <h3 className={showTitle ? styles.title : styles.srOnly}>{title}</h3>
      {streaming.error && <p role="alert">{streaming.error}</p>}
      {props.zoom && kind && (
        <div
          className={styles.navigation}
          role="group"
          aria-label={m.navigate(String(title))}
        >
          <Button
            variant="secondary"
            size="sm"
            aria-label={m.zoomIn}
            disabled={navigation.viewport.k >= navigation.limit}
            onClick={() => navigation.zoomBy(1.5)}
          >
            {m.zoomIn}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            aria-label={m.zoomOut}
            disabled={navigation.viewport.k <= 1}
            onClick={() => navigation.zoomBy(1 / 1.5)}
          >
            {m.zoomOut}
          </Button>
          {kind === "x" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={navigation.viewport.k <= 1}
                onClick={() => navigation.panBy(-0.2)}
              >
                {m.previous}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={navigation.viewport.k <= 1}
                onClick={() => navigation.panBy(0.2)}
              >
                {m.next}
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={navigation.reset}>
            {m.resetView}
          </Button>
          <span>{navigation.viewport.k.toFixed(1)}×</span>
        </div>
      )}
      {full.error ? (
        <>
          <svg
            ref={svgRef}
            className={styles.svg}
            style={{ height: 0 }}
            aria-hidden="true"
          />
          <p role="alert" className={styles.status}>
            {full.error}
          </p>
        </>
      ) : (
        <>
          {position === "top" && legend}
          <div className={styles.body} data-position={position}>
            <div className={styles.plot}>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label={label}
                aria-describedby={helpId}
                tabIndex={scene.marks.length ? 0 : undefined}
                className={styles.svg}
                onFocus={() => hover(scene.marks[0]?.datum ?? null)}
                onBlur={() => hover(null)}
                onPointerMove={(event) => hover(nearestDatum(event))}
                onPointerLeave={() => hover(null)}
                onClick={(event) => {
                  const datum = nearestDatum(event);
                  hover(datum);
                  if (datum) props.onSelect?.(datum);
                }}
                onKeyDown={(event) => {
                  const keys = [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowUp",
                    "ArrowDown",
                    "Home",
                    "End",
                    "Enter",
                    " ",
                    "Escape",
                  ];
                  if (!keys.includes(event.key) || !scene.marks.length) return;
                  event.preventDefault();
                  const index = Math.max(
                    0,
                    scene.marks.findIndex((m) => m.id === activeId),
                  );
                  if (event.key === "Escape") {
                    hover(null);
                    return;
                  }
                  if (event.key === "Enter" || event.key === " ") {
                    props.onSelect?.(scene.marks[index].datum);
                    return;
                  }
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? scene.marks.length - 1
                        : Math.max(
                            0,
                            Math.min(
                              scene.marks.length - 1,
                              index +
                                (["ArrowLeft", "ArrowUp"].includes(event.key)
                                  ? -1
                                  : 1),
                            ),
                          );
                  hover(scene.marks[next].datum);
                }}
              >
                <defs>
                  <clipPath id={clipId}>
                    <rect
                      x={layout.left}
                      y={layout.top}
                      width={width - layout.left - layout.right}
                      height={height - layout.top - layout.bottom}
                    />
                  </clipPath>
                </defs>
                {!spatial && scene.decorations}
                <g
                  transform={transform}
                  clipPath={cartesian ? `url(#${clipId})` : undefined}
                >
                  {spatial && scene.decorations}
                  {scene.plot}
                  {scene.marks.map((mark) => (
                    <g
                      key={mark.id}
                      className={styles.mark}
                      style={{ color: mark.color }}
                      data-mark={mark.id}
                      data-muted={
                        active &&
                        active.datum.seriesId &&
                        mark.datum.seriesId !== active.datum.seriesId
                          ? "true"
                          : undefined
                      }
                    >
                      {props.renderMark
                        ? props.renderMark(mark, layout)
                        : mark.element}
                      <title>{`${mark.datum.label}: ${Object.entries(
                        mark.datum.values,
                      )
                        .map(([k, v]) => `${k} ${v}`)
                        .join(", ")}`}</title>
                    </g>
                  ))}
                  {active &&
                    Number.isFinite(active.x) &&
                    Number.isFinite(active.y) && (
                      <circle
                        className={styles.marker}
                        cx={active.x}
                        cy={active.y}
                        r={8}
                      />
                    )}
                </g>
                {props.renderOverlay?.({ ...layout, scene })}
              </svg>
              {tooltip && active && (
                <div
                  className={styles.tooltip}
                  role="status"
                  aria-live="polite"
                >
                  {typeof props.tooltip === "object" && props.tooltip.render ? (
                    props.tooltip.render(active.datum)
                  ) : (
                    <>
                      <strong>{active.datum.label}</strong>
                      <dl>
                        {Object.entries(active.datum.values).map(
                          ([key, value]) => (
                            <Fragment key={key}>
                              <dt>{key}</dt>
                              <dd>
                                {typeof value === "number"
                                  ? formatX(value)
                                  : value}
                              </dd>
                            </Fragment>
                          ),
                        )}
                      </dl>
                    </>
                  )}
                </div>
              )}
            </div>
            {position === "right" && legend}
          </div>
          {props.brush && kind === "x" && full.xInvert && (
            <div
              className={styles.brushSection}
              aria-label={m.rangeOf(String(title))}
            >
              <svg
                className={styles.brushSvg}
                viewBox={`0 0 ${width} 46`}
                aria-label={m.brushHint}
                role="img"
              >
                <g opacity=".35" transform={`scale(1,${40 / height})`}>
                  {full.plot}
                  {full.marks.map((m) => (
                    <g key={m.id} style={{ color: m.color }}>
                      {m.element}
                    </g>
                  ))}
                </g>
                <g ref={navigation.brushRef} />
              </svg>
              <Range
                label={m.visibleRange}
                min={0}
                max={100}
                step={1}
                value={[navigation.range[0] * 100, navigation.range[1] * 100]}
                formatValue={(v) =>
                  formatX(
                    full.xInvert!(
                      layout.left +
                        (v / 100) * (width - layout.left - layout.right),
                    ),
                  )
                }
                onChange={([a, b]) => navigation.setWindow([a / 100, b / 100])}
              />
              <Button variant="ghost" size="sm" onClick={navigation.reset}>
                {m.clearRange}
              </Button>
            </div>
          )}
          {position === "bottom" && legend}
          <span id={helpId} className={styles.srOnly}>
            {m.keyboardHelp}
          </span>
          {!scene.marks.length && (
            <p role="status" className={styles.status}>
              {hidden.length
                ? m.reactivate
                : m.nothingToDraw}
            </p>
          )}
          {input.dataTable === "screen-reader" ? (
            <div className={styles.srOnly}>
              <p>{charts.dataOf(String(title))}</p>
            <Table
              columns={[
                { key: "label", header: m.item, cell: (row) => row.label },
                { key: "values", header: m.data, cell: (row) => row.values },
              ]}
              rowKey={(row) => row.id}
              rows={full.marks.map((m) => ({
                id: m.id,
                label: m.datum.label,
                values: Object.entries(m.datum.values)
                  .map(
                    ([k, v]) =>
                      `${k}: ${typeof v === "number" ? formatX(v) : v}`,
                  )
                  .join(" · "),
              }))}
            />
            </div>
          ) : (
          <details className={styles.data}>
            <summary>{charts.viewData(String(title))}</summary>
            <Table
              columns={[
                { key: "label", header: m.item, cell: (row) => row.label },
                { key: "values", header: m.data, cell: (row) => row.values },
              ]}
              rowKey={(row) => row.id}
              rows={full.marks.map((m) => ({
                id: m.id,
                label: m.datum.label,
                values: Object.entries(m.datum.values)
                  .map(
                    ([k, v]) =>
                      `${k}: ${typeof v === "number" ? formatX(v) : v}`,
                  )
                  .join(" · "),
              }))}
            />
          </details>
          )}
        </>
      )}
    </figure>
  );
}
export type {
  D3ChartProps,
  ChartViewport,
  ChartOptions,
  ChartAxis,
  ChartCurve,
  ChartDatum,
  ChartSeries,
  ChartPoint,
  ChartSlice,
  ChartNode,
  ChartNetwork,
  ChartX,
  ChartScene,
  ChartMark,
  ChartLayout,
} from "./d3/types";
