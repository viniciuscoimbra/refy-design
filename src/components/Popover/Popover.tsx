"use client";
import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { AnchoredSurface } from "../../lib/AnchoredSurface";
import { cn } from "../../lib/cn";
import styles from "./Popover.module.css";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

/** Props for the Popover component. */
export interface PopoverProps {
  /** Visible popover (controlled; the overlay has no internal state). */
  open: boolean;
  /** Close request: Esc or click outside. */
  onOpenChange: (open: boolean) => void;
  /** Interactive floating content (short form, filters…). */
  content: ReactNode;
  /** Anchor element (trigger). */
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  /** Accessible label of the floating dialog. */
  label?: string;
  className?: string;
}

/**
 * Popover — conteúdo flutuante interativo ancorado a um trigger.
 *
 * Diferente do Tooltip, aceita interação (checkboxes, botões, inputs).
 * Fecha com Esc ou clique fora. Controlado por `open`/`onOpenChange`,
 * posicionado por `side` + `align`. Min-width 220px, elevação 3.
 *
 *   <Popover open={open} onOpenChange={setOpen} content={<Filtros />}>
 *     <Button onClick={() => setOpen(!open)}>Filtrar</Button>
 *   </Popover>
 */
export function Popover({
  open,
  onOpenChange,
  content,
  children,
  side = "bottom",
  align = "start",
  label,
  className,
}: PopoverProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onOpenChange]);

  useLayoutEffect(() => {
    if (!open) return;
    const panel = wrapRef.current?.querySelector<HTMLElement>('[role="dialog"]');
    (panel?.querySelector<HTMLElement>('button:not([disabled]):not([tabindex="-1"]),input:not([disabled]),select:not([disabled]),[tabindex="0"]') ?? panel)?.focus({ preventScroll: true });
  }, [open]);

  const trigger = isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    (typeof children.type === 'string' ? ['button', 'a', 'input'].includes(children.type) || children.props.role === 'button' : typeof children.type !== 'symbol')
    ? cloneElement(children, { 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? panelId : undefined }) : children;

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)}>
      {trigger}
      {(
        <AnchoredSurface open={open} id={panelId} onClose={() => onOpenChange(false)} side={side} align={align} tabIndex={-1}
          role="dialog"
          aria-label={label}
          data-side={side}
          data-align={align}
          className={styles.pop}
        >
          {content}
        </AnchoredSurface>
      )}
    </div>
  );
}
