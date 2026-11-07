"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { motionTiming } from "../../lib/motionTiming";
import { cn } from "../../lib/cn";
import styles from "./Coverflow.module.css";

import { useMessages } from "../../lib/locale";
export interface CoverflowItem {
  /** Identidade estável e única, preservada quando a lista muda de ordem. */
  id: string;
  /** Nome acessível do item. */
  label: string;
}
export interface CoverflowProps<T extends CoverflowItem = CoverflowItem> {
  items: readonly T[];
  /** Non-interactive visual content: do not include links, buttons or fields. */
  renderItem: (
    item: T,
    state: { selected: boolean; index: number },
  ) => ReactNode;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectionChange?: (id: string) => void;
  /** Activating a selected item is different from just selecting it. */
  onActivate?: (item: T) => void;
  label?: string;
  disabled?: boolean;
  emptyContent?: ReactNode;
  className?: string;
}

/** Navegação finita por conteúdo visual. Sem autoplay, serviço ou assets embutidos. */
export function Coverflow<T extends CoverflowItem>({
  items,
  renderItem,
  selectedId,
  defaultSelectedId,
  onSelectionChange,
  onActivate,
  label: labelProp,
  disabled = false,
  emptyContent: emptyContentProp,
  className,
}: CoverflowProps<T>) {
  const m = useMessages("coverflow");
  const carousel = useMessages("carousel");
  const label = labelProp ?? m.label;
  const emptyContent = emptyContentProp ?? m.empty;
  const [internalId, setInternalId] = useState(defaultSelectedId);
  const requestedId = selectedId ?? internalId;
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.id === requestedId),
  );
  const current = items[currentIndex];
  const root = useRef<HTMLElement>(null),
    track = useRef<HTMLDivElement>(null);
  const controls = useRef(new Map<string, HTMLButtonElement>());
  const gesture = useRef<
    | {
        pointer: number;
        x: number;
        y: number;
        offset: number;
        horizontal: boolean;
        cancelled: boolean;
      }
    | undefined
  >(undefined);
  const suppressClick = useRef(false);
  const [stride, setStride] = useState(0),
    [offset, setOffset] = useState(0),
    [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(false);
  const trackId = useId();
  const identity = items.map((item) => item.id).join("\u0000");
  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => {
      const first = node.children[0] as HTMLElement | undefined;
      const second = node.children[1] as HTMLElement | undefined;
      setStride(
        first
          ? second
            ? second.offsetLeft - first.offsetLeft
            : first.offsetWidth
          : 0,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [identity]);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const view = node.ownerDocument.defaultView!;
    const media = view.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setReduced(motionTiming(node, "context").duration === 0);
    update();
    media.addEventListener("change", update);
    const observer = new MutationObserver(update);
    for (
      let ancestor: HTMLElement | null = node;
      ancestor;
      ancestor = ancestor.parentElement
    )
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["style", "class", "data-refy-motion", "data-theme"],
      });
    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    gesture.current = undefined;
    setOffset(0);
    setDragging(false);
  }, [identity, disabled]);

  function select(index: number, focus = false) {
    if (disabled || !items.length) return;
    const item = items[Math.max(0, Math.min(items.length - 1, index))];
    if (focus) controls.current.get(item.id)?.focus({ preventScroll: true });
    if (item.id !== current?.id) {
      if (selectedId === undefined) setInternalId(item.id);
      onSelectionChange?.(item.id);
    }
  }
  function finish(cancelled: boolean, node: HTMLElement) {
    const active = gesture.current;
    if (!active) return;
    gesture.current = undefined;
    if (node.hasPointerCapture(active.pointer))
      node.releasePointerCapture(active.pointer);
    setDragging(false);
    setOffset(0);
    if (active.horizontal || active.cancelled || cancelled)
      suppressClick.current = true;
    if (active.horizontal) {
      if (!cancelled && !active.cancelled && stride)
        select(currentIndex - Math.round(active.offset / stride));
    }
  }
  const arrow = (left: boolean) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={left ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
  return (
    <section
      ref={root}
      className={cn(styles.root, className)}
      role="region"
      aria-roledescription="carrossel"
      aria-label={label}
      data-reduced-motion={reduced || undefined}
    >
      {current ? (
        <>
          <div
            className={styles.viewport}
            data-dragging={dragging || undefined}
            onPointerDown={(event) => {
              suppressClick.current = false;
              if (
                disabled ||
                !event.isPrimary ||
                event.button !== 0 ||
                gesture.current
              )
                return;
              gesture.current = {
                pointer: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                offset: 0,
                horizontal: false,
                cancelled: false,
              };
            }}
            onPointerMove={(event) => {
              const active = gesture.current;
              if (
                !active ||
                active.pointer !== event.pointerId ||
                active.cancelled
              )
                return;
              const x = event.clientX - active.x,
                y = event.clientY - active.y;
              if (!active.horizontal) {
                if (Math.max(Math.abs(x), Math.abs(y)) < 8) return;
                if (Math.abs(y) >= Math.abs(x)) {
                  active.cancelled = true;
                  return;
                }
                active.horizontal = true;
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
              }
              active.offset = x;
              setOffset(
                Math.max(
                  -(items.length - 1 - currentIndex) * stride,
                  Math.min(currentIndex * stride, x),
                ),
              );
            }}
            onPointerUp={(event) => {
              if (gesture.current?.pointer === event.pointerId)
                finish(false, event.currentTarget);
            }}
            onPointerCancel={(event) => {
              if (gesture.current?.pointer === event.pointerId)
                finish(true, event.currentTarget);
            }}
            onLostPointerCapture={(event) => {
              // Touch starts with implicit capture on the child Button. Its loss
              // during transfer is not cancellation of the viewport gesture.
              if (
                event.target === event.currentTarget &&
                gesture.current?.pointer === event.pointerId
              )
                finish(true, event.currentTarget);
            }}
            onClickCapture={(event) => {
              if (suppressClick.current && event.detail > 0) {
                event.preventDefault();
                event.stopPropagation();
                suppressClick.current = false;
              }
            }}
          >
            <div
              id={trackId}
              ref={track}
              className={styles.track}
              style={{
                transform: `translateX(${-currentIndex * stride + offset}px)`,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={styles.item}
                  style={
                    {
                      "--coverflow-distance": Math.min(
                        2,
                        Math.abs(index - currentIndex),
                      ),
                      "--coverflow-side": Math.sign(index - currentIndex),
                    } as CSSProperties
                  }
                >
                  <Button
                    ref={(node) => {
                      if (node) controls.current.set(item.id, node);
                      else controls.current.delete(item.id);
                    }}
                    type="button"
                    variant="secondary"
                    className={styles.surface}
                    disabled={disabled}
                    aria-label={item.label}
                    aria-pressed={index === currentIndex}
                    tabIndex={index === currentIndex ? 0 : -1}
                    onDragStart={(event) => event.preventDefault()}
                    onKeyDown={(event) => {
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? items.length - 1
                            : event.key === "ArrowLeft"
                              ? currentIndex - 1
                              : event.key === "ArrowRight"
                                ? currentIndex + 1
                                : undefined;
                      if (next !== undefined) {
                        event.preventDefault();
                        select(next, true);
                      }
                      if (event.key === "Escape" && gesture.current) {
                        event.preventDefault();
                        finish(true, track.current!.parentElement!);
                      }
                    }}
                    onClick={() => {
                      if (index !== currentIndex) select(index);
                      else onActivate?.(item);
                    }}
                  >
                    {renderItem(item, {
                      selected: index === currentIndex,
                      index,
                    })}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.controls}>
            <IconButton
              type="button"
              aria-controls={trackId}
              aria-label={carousel.previous}
              icon={arrow(true)}
              disabled={disabled || currentIndex === 0}
              onClick={() => select(currentIndex - 1)}
            />
            <span role="status" aria-live="polite" aria-atomic="true">
              {carousel.position(currentIndex + 1, items.length)} · {current.label}
            </span>
            <IconButton
              type="button"
              aria-controls={trackId}
              aria-label={carousel.next}
              icon={arrow(false)}
              disabled={disabled || currentIndex === items.length - 1}
              onClick={() => select(currentIndex + 1)}
            />
          </div>
        </>
      ) : (
        <div className={styles.empty} role="status">
          {emptyContent}
        </div>
      )}
    </section>
  );
}
