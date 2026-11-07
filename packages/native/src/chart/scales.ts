// Cópia das funções puras de src/components/Charts/d3/shared.tsx e cartesian.tsx (escala,
// coordenadas, curvas). O arquivo web importa CSS Module e não roda no React Native.
// test/chart-parity.test.tsx compara as duas versões com os mesmos dados.
import { scaleBand, scaleLinear, scaleLog, scaleSqrt, scaleSymlog, scaleTime } from "d3-scale";
import { curveBasis, curveBumpX, curveCardinal, curveCatmullRom, curveLinear, curveMonotoneX, curveNatural, curveStep, curveStepAfter, curveStepBefore } from "d3-shape";
import type { ChartAxis, ChartCurve, ChartViewport, ChartX } from "./types";

export const palette = [
  "var(--chart-primary)",
  "var(--chart-secondary)",
  "var(--chart-tertiary, var(--weak))",
  "var(--chart-quaternary, var(--critical))",
  "var(--chart-quinary)",
  "var(--chart-senary)",
  "var(--chart-septenary)",
  "var(--chart-octonary)",
];
export const colorAt = (index: number, colors?: string[]) => (colors?.length ? colors : palette)[index % (colors?.length || palette.length)];
export const keyX = (value: ChartX) => (value instanceof Date ? value.toISOString() : String(value));
export const formatX = (value: ChartX, locale = "en") =>
  value instanceof Date ? value.toLocaleDateString(locale) : typeof value === "number" ? value.toLocaleString(locale, { maximumFractionDigits: 2 }) : value;

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
export const resolveCurve = (curve: ChartCurve = "natural") => (typeof curve === "function" ? curve : curves[curve]);

export function numericScale(domain: [number, number], range: [number, number], axis?: ChartAxis) {
  const input = axis?.domain?.map(Number) as [number, number] | undefined;
  const d = input ?? domain;
  if (!d.every(Number.isFinite) || d[0] >= d[1]) throw Error("O domínio deve ter dois limites finitos em ordem crescente.");
  if (axis?.scale === "log" && d[0] <= 0) throw Error("A escala logarítmica exige valores e limites maiores que zero.");
  const scale = axis?.createScale
    ? axis.createScale()
    : axis?.scale === "log" ? scaleLog() : axis?.scale === "symlog" ? scaleSymlog() : axis?.scale === "sqrt" ? scaleSqrt() : scaleLinear();
  scale.domain(d).range(range);
  if (axis?.nice !== false && !input) scale.nice(axis?.tickCount ?? 4);
  if (![scale(scale.domain()[0]), scale(scale.domain()[1])].every(Number.isFinite)) throw Error("A escala configurada não representa este domínio.");
  return scale;
}

export function xCoordinates(values: ChartX[], range: [number, number], axis?: ChartAxis, viewport?: ChartViewport) {
  const unique = [...new Map(values.map((value) => [keyX(value), value])).values()];
  const k = viewport?.k ?? 1,
    offset = viewport?.x ?? 0;
  const numeric = unique.every((value) => typeof value === "number" || value instanceof Date);
  const visible = (value: ChartX, at: (value: ChartX) => number) => at(value) >= range[0] - 1 && at(value) <= range[1] + 1;
  if (!numeric) {
    const band = scaleBand<string>().domain(unique.map(keyX)).range(range.map((v) => v * k + offset) as [number, number]).padding(0.2);
    const at = (value: ChartX) => (band(keyX(value)) ?? range[0]) + band.bandwidth() / 2;
    const candidates = (axis?.tickValues ?? unique).filter((v) => visible(v, at));
    const step = Math.max(1, Math.ceil(candidates.length / Math.max(2, Math.min(axis?.tickCount ?? Infinity, (range[1] - range[0]) / 50))));
    return {
      at,
      ticks: candidates.filter((_, i) => i % step === 0),
      bandwidth: band.bandwidth(),
      invert: (pixel: number) => unique.reduce((best, v) => (Math.abs(at(v) - pixel) < Math.abs(at(best) - pixel) ? v : best), unique[0]),
    };
  }
  const numbers = unique.map(Number),
    lo = Math.min(...numbers),
    hi = Math.max(...numbers);
  if (axis?.scale === "log" && lo <= 0) throw Error("A escala logarítmica exige valores maiores que zero.");
  if (unique[0] instanceof Date || axis?.scale === "time") {
    const d = axis?.domain ?? [new Date(lo), new Date(hi === lo ? lo + 86400000 : hi)];
    const base = scaleTime().domain(d.map((v) => new Date(v))).range(range);
    const scale = base.copy().domain(range.map((v) => base.invert((v - offset) / k)));
    const at = (v: ChartX) => scale(new Date(v));
    return {
      at,
      ticks: (axis?.tickValues ?? scale.ticks(axis?.tickCount ?? 5)).filter((v) => visible(v, at)),
      bandwidth: ((range[1] - range[0]) / Math.max(1, unique.length)) * 0.65 * k,
      invert: (pixel: number): ChartX => scale.invert(pixel),
    };
  }
  const base = numericScale([lo, hi === lo ? lo + 1 : hi], range, axis),
    scale = base.copy().domain(range.map((v) => base.invert((v - offset) / k)));
  const at = (v: ChartX) => scale(Number(v));
  return {
    at,
    ticks: (axis?.tickValues ?? scale.ticks(axis?.tickCount ?? 5)).filter((v) => visible(v, at)),
    bandwidth: ((range[1] - range[0]) / Math.max(1, unique.length)) * 0.65 * k,
    invert: (pixel: number): ChartX => scale.invert(pixel),
  };
}

export function finite(values: number[]) {
  if (values.some((v) => !Number.isFinite(v))) throw Error("Há valores inválidos. Use apenas números finitos.");
}
export function uniqueIds(items: { id: string }[]) {
  if (new Set(items.map((i) => i.id)).size !== items.length) throw Error("Cada série ou item deve ter um id único.");
}
