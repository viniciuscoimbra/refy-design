"use client";
import { AnchoredSurface } from "../../lib/AnchoredSurface";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./HoverCard.module.css";

export type HoverCardSide = "top" | "bottom";

/** Props for the HoverCard component. */
export interface HoverCardProps {
  /** Rich preview shown when hovering the trigger. */
  content: ReactNode;
  /** Reference that triggers the card (link, mention, avatar). */
  children: ReactNode;
  /** Delay before opening, in ms. Default 500. */
  openDelay?: number;
  /** Delay before closing on leave, in ms. Default 200. */
  closeDelay?: number;
  side?: HoverCardSide;
  className?: string;
}

/**
 * HoverCard — preview rico ao passar o mouse sobre uma referência.
 *
 * Abre com delay (padrão 500ms) e fecha com tolerância de 200ms, então dá
 * para mover o cursor até o card sem ele sumir. Também abre no foco por
 * teclado. Card de 280px, elevação 3. Não é interativo-modal: para conteúdo
 * clicável complexo, use `Popover`.
 *
 *   <HoverCard content={<PerfilDominio />}> <a href="…">example.com</a> </HoverCard>
 */
export function HoverCard({
  content,
  children,
  openDelay = 500,
  closeDelay = 200,
  side = "bottom",
  className,
}: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const hovering = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function schedule(next: boolean, delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), delay);
  }

  function leave(event: MouseEvent<HTMLDivElement>) {
    if (root.current?.contains(event.relatedTarget as Node | null)) return;
    hovering.current = false;
    if (!root.current?.contains(document.activeElement))
      schedule(false, closeDelay);
  }

  return (
    <div
      className={cn(styles.wrap, className)}
      ref={root}
      onMouseEnter={() => {
        hovering.current = true;
        schedule(true, openDelay);
      }}
      onMouseLeave={leave}
      onFocus={() => schedule(true, 0)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget as Node | null) &&
          !hovering.current
        )
          schedule(false, 0);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          clearTimeout(timer.current);
          setOpen(false);
        }
      }}
    >
      {children}
      <AnchoredSurface
        open={open}
        side={side}
        className={styles.card}
        onClose={() => setOpen(false)}
        onMouseEnter={() => {
          hovering.current = true;
          clearTimeout(timer.current);
        }}
        onMouseLeave={leave}
        onClickCapture={(event) => {
          if (
            (event.target as Element).closest("button:not(:disabled),a[href]")
          ) {
            // A ação pode abrir um diálogo; sua origem precisa sobreviver à saída.
            const trigger = [
              ...(root.current?.querySelectorAll<HTMLElement>(
                "button,a[href],input,[tabindex]",
              ) ?? []),
            ].find((node) => !event.currentTarget.contains(node));
            trigger?.focus({ preventScroll: true });
            clearTimeout(timer.current);
          }
        }}
        onClick={(event) => {
          if (
            (event.target as Element).closest("button:not(:disabled),a[href]")
          ) {
            clearTimeout(timer.current);
            setOpen(false);
          }
        }}
      >
        {content}
      </AnchoredSurface>
    </div>
  );
}
