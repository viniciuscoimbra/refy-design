"use client";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { select } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import type { ZoomBehavior } from "d3-zoom";
import { brushX } from "d3-brush";
import type { D3BrushEvent } from "d3-brush";
import type { ChartLayout, ChartOptions, ChartViewport } from "./types";
export const identity: ChartViewport = { k: 1, x: 0, y: 0 };
export function useChartNavigation(
  svg: RefObject<SVGSVGElement | null>,
  layout: ChartLayout,
  kind: "x" | "spatial" | false,
  options: Pick<ChartOptions, "zoom" | "brush">,
  onRange: (range: [number, number] | null) => void,
) {
  const [viewport, setViewport] = useState(identity);
  const current = useRef(viewport);
  current.current = viewport;
  const behavior = useRef<ZoomBehavior<SVGSVGElement, unknown> | undefined>(
    undefined,
  );
  const brushRef = useRef<SVGGElement>(null);
  const callbacks = useRef({ options, onRange });
  callbacks.current = { options, onRange };
  const geometry = useRef(layout);
  geometry.current = layout;
  const max =
    typeof options.zoom === "object" ? (options.zoom.maxScale ?? 16) : 16;
  const enabled = Boolean(kind && (options.zoom || options.brush));
  const extent = Math.max(1, Math.min(100, Number.isFinite(max) ? max : 16));
  const rangeOf = (v: ChartViewport): [number, number] => {
    const g = geometry.current,
      W = g.width - g.left - g.right;
    return [
      Math.max(0, ((g.left - v.x) / v.k - g.left) / W),
      Math.min(1, ((g.width - g.right - v.x) / v.k - g.left) / W),
    ];
  };
  const publish = (v: ChartViewport) => {
    const next = kind === "x" ? { k: v.k, x: v.x, y: 0 } : v;
    current.current = next;
    setViewport(next);
    const setting = callbacks.current.options.zoom;
    if (typeof setting === "object") setting.onChange?.(next);
    if (kind === "x")
      callbacks.current.onRange(next.k === 1 ? null : rangeOf(next));
  };
  const apply = (v: ChartViewport) => {
    if (svg.current && behavior.current)
      select(svg.current).call(
        behavior.current.transform,
        zoomIdentity.translate(v.x, v.y).scale(v.k),
      );
  };
  const setWindow = (range: [number, number]) => {
    const g = geometry.current,
      W = g.width - g.left - g.right;
    const start = Math.max(0, Math.min(1, range[0])),
      end = Math.max(start + 1 / extent, Math.min(1, range[1]));
    const k = Math.min(extent, 1 / (end - start));
    const safeStart = Math.min(start, 1 - 1 / k);
    apply({ k, x: g.left - k * (g.left + safeStart * W), y: 0 });
  };
  useEffect(() => {
    const element = svg.current;
    if (!element || !enabled) {
      setViewport(identity);
      current.current = identity;
      return;
    }
    const {
      left: l,
      right: r,
      top: t,
      bottom: b,
      width: w,
      height: h,
    } = layout;
    const instance = zoom<SVGSVGElement, unknown>()
      .extent([
        [l, t],
        [w - r, h - b],
      ])
      .translateExtent([
        [l, t],
        [w - r, h - b],
      ])
      .scaleExtent([1, extent])
      .filter((event) => {
        if (!callbacks.current.options.zoom) return false;
        if (event.type === "touchstart" && event.touches.length < 2)
          return false;
        if (event.type === "wheel")
          return (
            event.ctrlKey ||
            event.metaKey ||
            (typeof callbacks.current.options.zoom === "object" &&
              callbacks.current.options.zoom.wheel === true)
          );
        return !event.button;
      })
      .on("zoom.refy", (event) => publish(event.transform));
    behavior.current = instance;
    const node = select(element);
    node.call(instance).on("dblclick.zoom", null);
    const old = current.current;
    // Preserve the visible fractions when the container resizes.
    const k = old.k;
    const previous = (element as SVGSVGElement & { __refySize?: ChartLayout })
      .__refySize;
    let next = old;
    if (previous && kind === "x") {
      const start =
        ((previous.left - old.x) / k - previous.left) /
        (previous.width - previous.left - previous.right);
      next = { k, x: l - k * (l + start * (w - l - r)), y: 0 };
    }
    (element as SVGSVGElement & { __refySize?: ChartLayout }).__refySize =
      layout;
    node.call(
      instance.transform,
      zoomIdentity.translate(next.x, next.y).scale(next.k),
    );
    return () => {
      node.on(".zoom", null);
      behavior.current = undefined;
    };
  }, [
    enabled,
    kind,
    layout.width,
    layout.height,
    layout.left,
    layout.right,
    layout.top,
    layout.bottom,
    extent,
  ]);
  const range = kind === "x" ? rangeOf(viewport) : ([0, 1] as [number, number]);
  useEffect(() => {
    const group = brushRef.current;
    if (!group || !options.brush || kind !== "x") return;
    const g = layout,
      W = g.width - g.left - g.right;
    const brush = brushX()
      .extent([
        [g.left, 2],
        [g.width - g.right, 42],
      ])
      .on("end.refy", (event: D3BrushEvent<unknown>) => {
        if (!event.sourceEvent) return;
        if (!event.selection) {
          apply(identity);
          return;
        }
        const [a, b] = event.selection as [number, number];
        setWindow([(a - g.left) / W, (b - g.left) / W]);
      });
    const node = select(group);
    node.call(brush);
    node.call(
      brush.move,
      viewport.k === 1 ? null : [g.left + range[0] * W, g.left + range[1] * W],
    );
    return () => {
      node.on(".brush", null);
      node.selectAll("*").remove();
    };
  }, [
    options.brush,
    kind,
    layout.width,
    layout.left,
    layout.right,
    viewport.k,
    viewport.x,
  ]);
  return {
    viewport: enabled ? viewport : identity,
    brushRef,
    range,
    setWindow,
    reset: () => apply(identity),
    zoomBy: (factor: number) => {
      if (svg.current && behavior.current)
        select(svg.current).call(behavior.current.scaleBy, factor);
    },
    panBy: (fraction: number) => {
      if (svg.current && behavior.current)
        select(svg.current).call(
          behavior.current.translateBy,
          (-fraction * (layout.width - layout.left - layout.right)) /
            current.current.k,
          0,
        );
    },
    enabled,
    kind,
    limit: extent,
  };
}
