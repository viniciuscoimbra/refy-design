"use client";
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';
/** Keep SVG text at its actual CSS size instead of shrinking all labels on mobile. */
export function useChartWidth(ref: RefObject<SVGSVGElement | null>) {
 const [width,setWidth] = useState(520);
 useLayoutEffect(() => { const element = ref.current; if (!element) return; const observer = new ResizeObserver(entries => { const value = entries[0]?.contentRect.width; if (value > 0) setWidth(Math.max(220,Math.round(value))); }); observer.observe(element); return () => observer.disconnect(); },[ref]);
 return width;
}
