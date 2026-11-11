"use client";
import { motionTiming } from "../../lib/motionTiming";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "../../lib/cn";
import styles from "./TableOfContents.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Uma âncora do sumário. `id` é o id do elemento-alvo na página. */
export interface TocItem {
  id: string;
  label: string;
  /** Nível de indentação (1 = raiz). */
  level?: 1 | 2 | 3;
}

/** Props for the TableOfContents rail. */
export interface TableOfContentsProps {
  /** Anchors, in the order they appear on the page. */
  items: TocItem[];
  /** Rail label (visible + `aria-label` of the `<nav>`). */
  label?: string;
  /** Controlled active item; turns off the scrollspy. */
  activeId?: string;
  /** Initial active item (uncontrolled). Default: first item. */
  defaultActiveId?: string;
  /** Fired when the active item changes (scrollspy or click). */
  onActiveChange?: (id: string) => void;
  /** Turns on the scrollspy via IntersectionObserver (ignored if `activeId` is passed). */
  scrollSpy?: boolean;
  /** Reading band; vertical percentages relative to the container height. */
  rootMargin?: string;
  /**
   * Scrollable container watched by the scrollspy (`root` of the
IntersectionObserver). Default: `null` (viewport). Pass the element with
`overflow-y: auto` when the scrolling is NOT the page's.
   */
  root?: Element | null;
  /** Sticks the rail while scrolling (`position: sticky`). */
  sticky?: boolean;
  className?: string;
}

/**
 * TableOfContents — trilho lateral de sumário de página longa ("Nesta
 * página"). Lista âncoras `{id, label}` e destaca a seção visível via
 * scrollspy (IntersectionObserver). Clique rola suave até a âncora
 * (instantâneo com `prefers-reduced-motion`). Para controlar por fora,
 * passe `activeId`/`onActiveChange` — o scrollspy é desligado.
 *
 *   <TableOfContents items={[{ id: "perfil", label: "Perfil" }]} />
 */
export function TableOfContents({
  items,
  label: labelProp,
  activeId,
  defaultActiveId,
  onActiveChange,
  scrollSpy = true,
  rootMargin = "-80px 0px -60% 0px",
  root = null,
  sticky = false,
  className,
}: TableOfContentsProps) {
  const m = useComponentMessages("tableOfContents", enMessages.tableOfContents);
  const label = labelProp ?? m.label;
  const [internal, setInternal] = useState<string | undefined>(
    defaultActiveId ?? items[0]?.id,
  );
  const controlled = activeId !== undefined;
  const active = controlled ? activeId : internal;

  const changeRef = useRef(onActiveChange);
  changeRef.current = onActiveChange;

  const ids = items.map((i) => i.id).join(",");

  useEffect(() => {
    if (controlled || !scrollSpy || typeof IntersectionObserver === "undefined")
      return;
    const sections = ids
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el != null);
    if (!sections.length) return;

    const intersections = new Map<Element, IntersectionObserverEntry>();
    let observer: IntersectionObserver;
    function connect() {
      observer?.disconnect();
      intersections.clear();
      const [top, right, bottom, left] = rootMargin.split(/\s+/);
      // IntersectionObserver usa largura até para margens verticais percentuais.
      const height = root?.clientHeight ?? window.innerHeight;
      const vertical = (value: string) =>
        value.endsWith("%") ? `${(parseFloat(value) * height) / 100}px` : value;
      const margin = [
        vertical(top),
        right ?? top,
        vertical(bottom ?? top),
        left ?? right ?? top,
      ].join(" ");
      observer = new IntersectionObserver(
        (entries) => {
          // pega a seção visível mais próxima do topo.
          // exige área de interseção real (> 0): uma seção que só ENCOSTA na
          // borda da zona reporta isIntersecting com área zero e roubaria o foco.
          for (const entry of entries) intersections.set(entry.target, entry);
          const readingTop =
            Math.max(0, root?.getBoundingClientRect().top ?? 0) +
            Math.max(0, -parseFloat(vertical(top)));
          const visible = [...intersections.values()]
            .filter(
              (e) =>
                e.isIntersecting &&
                e.intersectionRect.height > 0 &&
                e.target.getBoundingClientRect().bottom > readingTop,
            )
            .sort(
              (a, b) =>
                a.target.getBoundingClientRect().top -
                b.target.getBoundingClientRect().top,
            );
          if (visible.length) {
            const id = visible[0].target.id;
            setInternal((prev) => {
              if (prev !== id) changeRef.current?.(id);
              return id;
            });
          }
        },
        { root, rootMargin: margin, threshold: 0 },
      );
      sections.forEach((s) => observer.observe(s));
    }
    connect();
    const resize = new ResizeObserver(connect);
    if (root) resize.observe(root);
    window.addEventListener("resize", connect);
    return () => {
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", connect);
    };
  }, [ids, controlled, scrollSpy, rootMargin, root]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>, item: TocItem) {
    const el = document.getElementById(item.id);
    if (!el) return; // deixa o hash nativo agir
    e.preventDefault();
    const timing = motionTiming(e.currentTarget, "context");
    el.scrollIntoView({
      behavior: timing.duration ? "smooth" : "auto",
      block: "start",
    });
    if (!controlled) setInternal(item.id);
    onActiveChange?.(item.id);
  }

  return (
    <nav
      className={cn(styles.toc, sticky && styles.sticky, className)}
      aria-label={label}
    >
      <div className={styles.label} aria-hidden="true">
        {label}
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  styles.item,
                  item.level === 2 && styles.l2,
                  item.level === 3 && styles.l3,
                  isActive && styles.active,
                )}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => handleClick(e, item)}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
