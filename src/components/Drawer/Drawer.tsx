"use client";
import { usePresence } from "../../lib/usePresence";
import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { IconButton } from "../IconButton";
import { cn } from "../../lib/cn";
import { useDialogFocusTrap } from "../../lib/useDialogFocusTrap";
import styles from "./Drawer.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export type DrawerSide = "left" | "right" | "bottom" | "full";

/** Props for the Drawer component. */
export interface DrawerProps {
  /** Visible panel (controlled; the overlay has no internal state). */
  modal?: boolean;
  open: boolean;
  /** Close request: Esc, scrim or the × button. */
  onOpenChange: (open: boolean) => void;
  /** `left`/`right` = side; `bottom` = bottom; `full` = dynamic full screen. */
  side?: DrawerSide;
  /** Header title. */
  title?: ReactNode;
  /** Fixed footer (actions). */
  footer?: ReactNode;
  /** Side panel width. Ignored in bottom and full-screen panels. */
  width?: number | string;
  children: ReactNode;
  /** Hides the header × button. */
  hideClose?: boolean;
  className?: string;
}

/**
 * Drawer — painel deslizante; `side="bottom"` usa a variação inferior.
 *
 * Scrim atrás (clique fecha), Esc fecha, botão × no cabeçalho. Estrutura
 * head/body/foot com o body rolável. `role="dialog"` + `aria-modal`.
 * Controlado por `open`/`onOpenChange` — sem estado global.
 *
 *   <Drawer open={open} onOpenChange={setOpen} side="right" title="Detalhes">…</Drawer>
 */
export function Drawer({
  open,
  modal = true,
  onOpenChange,
  side = "right",
  title,
  footer,
  width,
  children,
  hideClose,
  className,
}: DrawerProps) {
  const m = useComponentMessages("common", enMessages.common);
  const panelRef = useRef<HTMLDivElement>(null);
  const present = usePresence(open, panelRef);
  const titleId = useId();
  useDialogFocusTrap(present, panelRef, () => onOpenChange(false), modal);

  if (!present) return null;

  return (
    <>
      {modal && <div data-refy-scrim="" data-motion-state={open ? "open" : "closing"} className={styles.scrim} aria-hidden="true" onClick={open ? () => onOpenChange(false) : undefined} />}
      <div
        ref={panelRef}
        data-motion-state={open ? "open" : "closing"}
        onClickCapture={open ? undefined : event => { event.preventDefault(); event.stopPropagation(); }}
        onKeyDownCapture={open ? undefined : event => { event.preventDefault(); event.stopPropagation(); }}
        role="dialog"
        aria-modal={modal || undefined}
        onKeyDown={event => { if (!modal && event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); onOpenChange(false); } }}
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? m.panel : undefined}
        tabIndex={-1}
        className={cn(styles.panel, styles[side], className)}
        style={side === "bottom" || side === "full" || width == null ? undefined : { width }}
      >
        {side === "bottom" && <span className={styles.grab} aria-hidden="true" />}
        {(title || !hideClose) && (
          <div className={styles.head}>
            {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
            {!hideClose && (
              <IconButton
                size="sm"
                aria-label={m.close}
                className={styles.close}
                onClick={() => onOpenChange(false)}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                }
              />
            )}
          </div>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.foot}>{footer}</div>}
      </div>
    </>
  );
}
