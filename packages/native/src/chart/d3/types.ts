import type { CSSProperties, ReactNode } from "react";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import type { GeoProjection } from "d3-geo";
import type { ScaleContinuousNumeric } from "d3-scale";
import type { CurveFactory } from "d3-shape";

/** Data coordinates. Dates use a time scale; text uses categories. */
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
export interface ChartSlice {
  id: string;
  label: string;
  value: number;
  color?: string;
}
export interface ChartNode {
  id: string;
  name: string;
  value?: number;
  children?: ChartNode[];
}
export interface ChartNetwork {
  nodes: { id: string; label: string; value?: number }[];
  links: { source: string; target: string; value: number }[];
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
export interface ChartMark {
  id: string;
  datum: ChartDatum;
  color: string;
  x?: number;
  y?: number;
  element: ReactNode;
}
export interface ChartScene {
  marks: ChartMark[];
  decorations?: ReactNode;
  plot?: ReactNode;
  legend?: ChartLegendItem[];
  error?: string;
  xScale?: (value: ChartX) => number;
  xInvert?: (pixel: number) => ChartX;
  yScale?: (value: number) => number;
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
export interface ChartBrushSelection {
  range: [ChartX, ChartX];
  items: ChartDatum[];
}
export interface ChartStreamBatch {
  seriesId: string;
  points: ChartPoint[];
}
export interface ChartStreamOptions {
  /** Subscribe once per source; return cleanup for WebSocket/SSE/listeners/timers. */
  subscribe: (
    push: (batches: ChartStreamBatch[]) => void,
  ) => void | (() => void);
  maxPoints?: number;
  paused?: boolean;
  onError?: (message: string) => void;
}
export interface ChartOptions {
  zoom?:
    | boolean
    | {
        maxScale?: number;
        wheel?: boolean;
        onChange?: (viewport: ChartViewport) => void;
      };
  brush?:
    boolean | { onChange?: (selection: ChartBrushSelection | null) => void };
  stream?: ChartStreamOptions;
  height?: number;
  margin?: Partial<Pick<ChartLayout, "top" | "right" | "bottom" | "left">>;
  colors?: string[];
  /** Cor por valor: células do heatmap e barras (bar/histogram). */
  colorScale?: (value: number) => string;
  xAxis?: ChartAxis;
  yAxis?: ChartAxis;
  grid?: boolean | "x" | "y" | "both";
  legend?:
    | boolean
    | {
        position?: "top" | "bottom" | "right";
        interactive?: boolean;
        marker?: "square" | "circle" | "line";
        render?: (item: ChartLegendItem) => ReactNode;
      };
  tooltip?: boolean | { render?: (datum: ChartDatum) => ReactNode };
  onSelect?: (datum: ChartDatum) => void;
  onHover?: (datum: ChartDatum | null) => void;
  renderMark?: (mark: ChartMark, context: ChartLayout) => ReactNode;
  renderOverlay?: (context: ChartLayout & { scene: ChartScene }) => ReactNode;
}
export interface D3ChartBaseProps extends ChartOptions {
  title: string;
  label: string;
  /** Tabela de dados: "disclosure" (padrão) mostra "Ver dados de…"; "screen-reader" a mantém só para leitores de tela. */
  dataTable?: "disclosure" | "screen-reader";
  showTitle?: boolean;
  className?: string;
  style?: CSSProperties;
}
export type ChartCurve =
  | "linear"
  | "natural"
  | "monotone"
  | "step"
  | "step-before"
  | "step-after"
  | "basis"
  | "cardinal"
  | "catmull-rom"
  | "bump"
  | CurveFactory;
export type CartesianType = "line" | "area" | "bar" | "scatter" | "bubble";
export type RadialType = "pie" | "donut" | "radial-bar" | "gauge";
export type HierarchyType =
  "treemap" | "pack" | "tree" | "cluster" | "partition" | "sunburst";
export type RelationType = "network" | "chord" | "sankey";
/** Discriminated data contracts keep incompatible data out of each family. */
export type D3ChartProps = D3ChartBaseProps &
  (
    | {
        type: CartesianType;
        series: ChartSeries[];
        curve?: ChartCurve;
        stacked?: boolean | "percent";
        orientation?: "vertical" | "horizontal";
        dots?: boolean;
        strokeWidth?: number;
        fillOpacity?: number;
        /** Preenchimento da área: "solid" (padrão) ou "gradient", que esmaece a cor da série até transparente. */
        areaFill?: "solid" | "gradient";
      }
    | { type: "histogram"; values: number[]; thresholds?: number | number[] }
    | {
        type: "boxplot";
        groups: { id: string; label: string; values: number[] }[];
      }
    | { type: "candlestick"; series: ChartSeries[] }
    | { type: "heatmap"; cells: { x: string; y: string; value: number }[] }
    | {
        type: RadialType;
        items: ChartSlice[];
        innerRadius?: number;
        padAngle?: number;
        cornerRadius?: number;
        startAngle?: number;
        endAngle?: number;
        max?: number;
      }
    | {
        type: "radar";
        series: ChartSeries[];
        max?: number;
        fillOpacity?: number;
      }
    | {
        type: HierarchyType;
        root: ChartNode;
        padding?: number;
        separation?: number;
      }
    | {
        type: RelationType;
        network: ChartNetwork;
        iterations?: number;
        padAngle?: number;
      }
    | {
        type: "geo";
        features: FeatureCollection<Geometry, GeoJsonProperties>;
        projection?:
          "mercator" | "equal-earth" | "orthographic" | (() => GeoProjection);
      }
  );
