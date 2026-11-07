// Subconjunto nativo de src/components/Charts/d3/types.ts: só as famílias line e area.
// test/chart-types.ts prova que cada chave daqui tem o mesmo tipo na web.
import type { ReactNode } from "react";
import type { ScaleContinuousNumeric } from "d3-scale";
import type { CurveFactory } from "d3-shape";

export type ChartX = number | string | Date;
export interface ChartPoint {
  x: ChartX;
  y: number;
  size?: number;
  low?: number;
  high?: number;
  open?: number;
  close?: number;
}
export interface ChartSeries {
  id: string;
  label: string;
  data: ChartPoint[];
  color?: string;
}
export interface ChartAxis {
  visible?: boolean;
  line?: boolean;
  ticks?: boolean;
  tickCount?: number;
  tickValues?: ChartX[];
  domain?: [number | Date, number | Date];
  scale?: "linear" | "log" | "symlog" | "sqrt" | "time";
  nice?: boolean;
  createScale?: () => ScaleContinuousNumeric<number, number>;
  title?: string;
  format?: (value: ChartX) => string;
}
export interface ChartDatum {
  id: string;
  label: string;
  values: Record<string, string | number>;
  seriesId?: string;
}
export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
}
export interface ChartLayout {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface ChartViewport {
  k: number;
  x: number;
  y: number;
}
export type ChartCurve = "linear" | "natural" | "monotone" | "step" | "step-before" | "step-after" | "basis" | "cardinal" | "catmull-rom" | "bump" | CurveFactory;

/**
 * Props do gráfico nativo. Ficam de fora, por ora: zoom, brush, stream, renderMark e
 * renderOverlay (desenham SVG do DOM), e as famílias além de line e area.
 */
export interface D3ChartProps {
  type: "line" | "area";
  title: string;
  label: string;
  /** BCP 47 tag for axis dates and numbers, as on the web. Default: "en". */
  locale?: string;
  showTitle?: boolean;
  series: ChartSeries[];
  curve?: ChartCurve;
  stacked?: boolean | "percent";
  dots?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
  height?: number;
  margin?: Partial<Pick<ChartLayout, "top" | "right" | "bottom" | "left">>;
  colors?: string[];
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  grid?: boolean | "x" | "y" | "both";
  legend?: boolean | { position?: "top" | "bottom" | "right"; interactive?: boolean; marker?: "square" | "circle" | "line"; render?: (item: ChartLegendItem) => ReactNode };
  tooltip?: boolean | { render?: (datum: ChartDatum) => ReactNode };
  onSelect?: (datum: ChartDatum) => void;
  onHover?: (datum: ChartDatum | null) => void;
}
