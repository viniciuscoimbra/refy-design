"use client";
import { inertAttribute } from "./inertAttribute";
import { useLayoutEffect, useRef } from "react";
import type { HTMLAttributes } from "react";

import { usePresence } from "./usePresence";
import { useTopLayer } from "./useTopLayer";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";
type Rect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
};

export function floatingPosition(
  anchor: Rect,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  side: Side,
  align: Align,
  gap = 6,
) {
  const edge = 8;
  const above = Math.max(0, anchor.top - gap - edge),
    below = Math.max(0, viewport.height - anchor.bottom - gap - edge);
  const leftSpace = anchor.left - gap - edge,
    rightSpace = viewport.width - anchor.right - gap - edge;
  if (side === "bottom" && size.height > below && above > below) side = "top";
  else if (side === "top" && size.height > above && below > above)
    side = "bottom";
  else if (
    side === "right" &&
    size.width > rightSpace &&
    leftSpace > rightSpace
  )
    side = "left";
  else if (side === "left" && size.width > leftSpace && rightSpace > leftSpace)
    side = "right";
  const maxHeight =
    side === "top"
      ? above
      : side === "bottom"
        ? below
        : viewport.height - edge * 2;
  const height = Math.min(size.height, maxHeight);
  let left =
    align === "end"
      ? anchor.right - size.width
      : align === "center"
        ? anchor.left + (anchor.width - size.width) / 2
        : anchor.left;
  let top = side === "top" ? anchor.top - gap - height : anchor.bottom + gap;
  if (side === "left" || side === "right") {
    left =
      side === "left" ? anchor.left - gap - size.width : anchor.right + gap;
    top =
      align === "center"
        ? anchor.top + (anchor.bottom - anchor.top - height) / 2
        : anchor.top;
  }
  return {
    left: Math.max(edge, Math.min(left, viewport.width - size.width - edge)),
    top: Math.max(edge, Math.min(top, viewport.height - height - edge)),
    maxHeight,
    side,
  };
}

/** A top layer evita recorte sem mover o nó para fora do tema ou do foco modal. */
export function AnchoredSurface({
  onClose,
  open = true,
  anchorPoint,
  side = "bottom",
  align = "start",
  matchWidth = false,
  gap = 6,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  onClose: () => void;
  open?: boolean;
  anchorPoint?: { x: number; y: number };
  side?: Side;
  align?: Align;
  matchWidth?: boolean;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const present = usePresence(open, ref);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useTopLayer(ref, "floating", present, () => closeRef.current(), undefined, undefined, open);
  useLayoutEffect(() => {
    const surface = ref.current;
    const anchor = surface?.parentElement;
    if (!present || !surface || !anchor) return;
    const doc = surface.ownerDocument,
      win = doc.defaultView!;

    // shortcut: navegadores sem Popover API mantêm posição fixa; exigir adaptador se suporte legado for necessário.
    const preferredWidth =
      parseFloat(win.getComputedStyle(surface).maxWidth) || Infinity;
    const preferredHeight =
      parseFloat(win.getComputedStyle(surface).maxHeight) || Infinity;
    function update() {
      if (!surface || !anchor) return;
      const viewport = {
        width: doc.documentElement.clientWidth,
        height: win.innerHeight,
      };
      const rect = anchorPoint
        ? {
            left: anchorPoint.x,
            right: anchorPoint.x,
            top: anchorPoint.y,
            bottom: anchorPoint.y,
            width: 0,
          }
        : anchor.getBoundingClientRect();
      surface.style.maxWidth = `${Math.min(preferredWidth, viewport.width - 16)}px`;
      if (matchWidth)
        surface.style.width = `${Math.min(rect.width, viewport.width - 16)}px`;
      surface.style.maxHeight = `${Math.min(preferredHeight, viewport.height - 16)}px`;
      const position = floatingPosition(
        rect,
        surface.getBoundingClientRect(),
        viewport,
        side,
        align,
        gap,
      );
      surface.dataset.side = position.side;
      Object.assign(surface.style, {
        left: `${position.left}px`,
        top: `${position.top}px`,
        maxHeight: `${Math.min(preferredHeight, position.maxHeight)}px`,
      });
    }
    function onScroll(event: Event) {
      if (!surface?.contains(event.target as Node)) update();
    }
    update();
    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    observer.observe(surface);
    win.addEventListener("resize", update);
    doc.addEventListener("scroll", onScroll, true);
    doc.addEventListener("animationend", update, true);
    return () => {
      observer.disconnect();
      win.removeEventListener("resize", update);
      doc.removeEventListener("scroll", onScroll, true);
      doc.removeEventListener("animationend", update, true);
    };
  }, [align, side, matchWidth, anchorPoint, gap, present]);
  if (!present) return null;
  return (
    <div
      {...props}
      ref={ref}
      popover="manual"
      data-ds-floating=""
      data-motion-state={open ? "open" : "closing"}
      aria-hidden={!open || undefined}
      inert={inertAttribute(!open)}
      style={{
        ...style,
        animation: `${open ? "refy-context-in" : "refy-context-out"} var(--motion-context${open ? "" : "-exit"}-duration) var(--motion-ease-${open ? "enter" : "exit"}) both`,
        position: "fixed",
        inset: "auto",
        margin: 0,
        minWidth: matchWidth ? 0 : undefined,
        translate: "none",
        overflowY: "auto",
        overflowWrap: "anywhere",
        color: "var(--ink-1)",
        boxSizing: "border-box",
      }}
    />
  );
}
