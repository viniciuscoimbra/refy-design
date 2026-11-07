// Contratos de LineChart, AreaChart, BarChart, DonutChart, Sparkline e ChartLegend. `className` fica só na web.
import type { ReactNode } from "react";

export type ChartTone = "primary" | "info" | "warn" | "critical";

export interface LineSeries {
  name: string;
  data: number[];
  tone?: ChartTone;
}
/** Props for the LineChart component. */
export interface LineChartCoreProps {
  title: string;
  showTitle?: boolean;
  data?: number[];
  series?: LineSeries[];
  xLabels?: string[];
  pointLabels?: string[];
  yTitle?: string;
  xTitle?: string;
  formatY?: (value: number) => string;
  max?: number;
  area?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  curve?: "smooth" | "linear" | "step";
  label: string;
}
/** Props for the AreaChart component. */
export type AreaChartCoreProps = Omit<LineChartCoreProps, "area">;

export interface BarChartItem {
  label: string;
  value: number;
  tone?: ChartTone;
}
/** Props for the BarChart component. */
export interface BarChartCoreProps {
  title: string;
  showTitle?: boolean;
  items: BarChartItem[];
  formatValue?: (value: number) => string;
  valueTitle?: string;
  label: string;
}

export interface DonutSegment {
  value: number;
  tone?: ChartTone | "muted";
  label?: string;
}
/** Props for the DonutChart component. */
export interface DonutChartCoreProps {
  value?: number;
  segments?: DonutSegment[];
  centerLabel?: string;
  caption?: string;
  showLegend?: boolean;
  formatValue?: (value: number) => string;
  size?: number;
  label: string;
}

/** Props for the Sparkline component. */
export interface SparklineCoreProps {
  data: number[];
  tone?: "good" | "bad";
  width?: number;
  height?: number;
  label: string;
}

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
}
/** Props for the ChartLegend component. */
export interface ChartLegendCoreProps {
  label: string;
  items: ChartLegendItem[];
  hidden?: string[];
  onToggle?: (id: string) => void;
  marker?: "square" | "circle" | "line";
  render?: (item: ChartLegendItem) => ReactNode;
}
