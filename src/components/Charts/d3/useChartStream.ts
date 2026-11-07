"use client";
import { useEffect, useState } from "react";
import type { ChartSeries, ChartStreamBatch, D3ChartProps } from "./types";
import { finite, keyX } from "./shared";
export const seriesTypes = [
  "line",
  "area",
  "bar",
  "scatter",
  "bubble",
  "candlestick",
];
/** Merge whole validated batches; keep only the last maxPoints per series. */
export function appendChartBatch(
  series: ChartSeries[],
  batches: ChartStreamBatch[],
  maxPoints: number,
): ChartSeries[] {
  if (!Array.isArray(batches) || batches.length > 10000)
    throw Error("Streaming batch is invalid or too large.");
  for (const batch of batches) {
    if (!series.some((s) => s.id === batch.seriesId))
      throw Error(`Unknown series in stream: ${batch.seriesId}.`);
    if (!Array.isArray(batch.points) || batch.points.length > 10000)
      throw Error("Limit of 10000 points per batch exceeded.");
    batch.points.forEach((p) => {
      finite([
        p.y,
        ...[p.size, p.open, p.close, p.low, p.high].filter(
          (v): v is number => v !== undefined,
        ),
      ]);
      if (typeof p.x === "number") finite([p.x]);
      else if (p.x instanceof Date) finite([+p.x]);
      else if (typeof p.x !== "string")
        throw Error("Invalid X coordinate in stream.");
    });
  }
  return series.map((s) => {
    const points = new Map(s.data.map((p) => [keyX(p.x), p]));
    batches
      .filter((b) => b.seriesId === s.id)
      .forEach((batch) =>
        batch.points.forEach((p) => points.set(keyX(p.x), { ...p })),
      );
    const data = [...points.values()];
    if (data.every((p) => typeof p.x === "number" || p.x instanceof Date))
      data.sort((a, b) => Number(a.x) - Number(b.x));
    return { ...s, data: data.slice(-maxPoints) };
  });
}
export function useChartStream(props: D3ChartProps) {
  const source = "series" in props ? props.series : undefined;
  const stream = props.stream;
  const supported = Boolean(source && seriesTypes.includes(props.type));
  const max = stream?.maxPoints ?? 120;
  const [state, setState] = useState<{
    source: typeof source;
    series: ChartSeries[];
    error?: string;
  }>({
    source,
    series: source?.map((s) => ({ ...s, data: s.data.slice(-max) })) ?? [],
  });
  const [error, setError] = useState<string>();
  useEffect(() => {
    setState((current) => ({
      source,
      series: (current.source === source ? current.series : (source ?? [])).map(
        (s) => ({ ...s, data: s.data.slice(-max) }),
      ),
    }));
    setError(undefined);
  }, [source, max]);
  useEffect(() => {
    if (!stream || !supported) return;
    if (!Number.isInteger(max) || max < 2 || max > 10000) {
      setError("maxPoints must be between 2 and 10000.");
      return;
    }
    if (stream.paused) return;
    let active = true;
    const fail = (message: string) => {
      if (active) {
        setError(message);
        stream.onError?.(message);
      }
    };
    let cleanup: void | (() => void);
    try {
      cleanup = stream.subscribe((batches) => {
        if (!active) return;
        // Validate before setState: no callbacks or side effects inside React updaters.
        try {
          appendChartBatch(source ?? [], batches, max);
        } catch (e) {
          fail(e instanceof Error ? e.message : "Invalid batch.");
          return;
        }
        const snapshot = batches.map((batch) => ({
          ...batch,
          points: batch.points.map((point) => ({
            ...point,
            x: point.x instanceof Date ? new Date(+point.x) : point.x,
          })),
        }));
        setError(undefined);
        setState((current) => ({
          source,
          series: appendChartBatch(
            current.source === source ? current.series : (source ?? []),
            snapshot,
            max,
          ),
        }));
      });
    } catch (e) {
      fail(e instanceof Error ? e.message : "The streaming source failed.");
    }
    return () => {
      active = false;
      cleanup?.();
    };
  }, [
    stream?.subscribe,
    stream?.paused,
    stream?.onError,
    source,
    supported,
    max,
  ]);
  const series = state.source === source ? state.series : source;
  return {
    props: stream && supported ? ({ ...props, series } as D3ChartProps) : props,
    error:
      stream && !supported
        ? "Subscription streaming requires a cartesian series."
        : error,
  };
}
