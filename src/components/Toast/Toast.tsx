"use client";
import type { ToastCoreProps, ToastRegionCoreProps } from "../../contracts/toast";
import { inertAttribute } from "../../lib/inertAttribute";
import { usePresence } from "../../lib/usePresence";
import { createPortal } from "react-dom";
import { activeDialog, dialogEvent } from "../../lib/dialogs";
import { focusFirst } from "../../lib/useDialogFocusTrap";
import { preserveAnimationProgress, useTopLayer } from "../../lib/useTopLayer";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Toast.module.css";

import { useMessages } from "../../lib/locale";
export type ToastTone = "default" | "success" | "danger";

/** Dados de um toast na pilha. */
export interface ToastData {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Inline action (e.g. Undo). */
  action?: { label: string; onClick: () => void };
  /** ms until auto-dismiss. `null` = stays until closed. Default 5000. */
  duration?: number | null;
}

const ICONS: Record<Exclude<ToastTone, "default">, ReactNode> = {
  success: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="8.5 12.5 11 15 15.5 9.5" />
    </svg>
  ),
  danger: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
    </svg>
  ),
};

/** Props for a single Toast notification. */
export interface ToastProps extends ToastData, ToastCoreProps {
  onDismiss?: (id: string) => void;
}

/** Um toast individual — pílula escura com ícone por tom, título e descrição. */
export function Toast({
  id,
  title,
  description,
  tone = "default",
  action,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  const common = useMessages("common");
  const nodeRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const node = nodeRef.current;
    return () => {
      if (!node?.contains(node.ownerDocument.activeElement)) return;
      const owner = node.closest<HTMLElement>("[data-refy-scope]") ?? node;
      queueMicrotask(() => {
        const doc = node.ownerDocument;
        if (doc.activeElement !== doc.body && doc.activeElement?.isConnected)
          return;
        const dialog = activeDialog(doc, owner);
        if (
          previousFocus.current?.isConnected &&
          (!dialog || dialog.contains(previousFocus.current))
        )
          previousFocus.current.focus();
        else if (dialog) focusFirst(dialog);
      });
    };
  }, []);
  const [paused, setPaused] = useState(false);
  const [closing, setClosing] = useState(false);
  const present = usePresence(!closing, nodeRef);
  const notified = useRef(false);
  const remaining = useRef(duration);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  function requestDismiss() {
    if (closing || !dismiss.current) return;
    const node = nodeRef.current;
    if (node?.contains(node.ownerDocument.activeElement)) {
      const dialog = activeDialog(
        node.ownerDocument,
        node.closest<HTMLElement>("[data-refy-scope]") ?? node,
      );
      if (
        previousFocus.current?.isConnected &&
        (!dialog || dialog.contains(previousFocus.current))
      )
        previousFocus.current.focus();
      else if (dialog) focusFirst(dialog);
    }
    setClosing(true);
  }
  const requestClose = useRef(requestDismiss);
  requestClose.current = requestDismiss;
  useEffect(() => {
    if (closing && !present && !notified.current) {
      notified.current = true;
      dismiss.current?.(id);
    }
  }, [closing, present, id]);
  useEffect(() => {
    remaining.current = duration;
  }, [id, duration]);
  useEffect(() => {
    if (duration === null || !onDismiss || paused || closing) return;
    const started = Date.now();
    const t = setTimeout(
      () => requestClose.current(),
      remaining.current ?? duration,
    );
    return () => {
      clearTimeout(t);
      remaining.current = Math.max(
        0,
        (remaining.current ?? duration) - (Date.now() - started),
      );
    };
  }, [id, duration, paused, closing, !!onDismiss]);

  return (
    <div
      ref={nodeRef}
      className={styles.toast}
      data-motion-state={closing ? "closing" : "open"}
      inert={inertAttribute(closing)}
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={(event) =>
        setPaused(
          event.currentTarget.contains(
            event.currentTarget.ownerDocument.activeElement,
          ),
        )
      }
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          previousFocus.current = event.relatedTarget as HTMLElement | null;
        setPaused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setPaused(event.currentTarget.matches(":hover"));
      }}
    >
      {tone !== "default" && (
        <span className={cn(styles.icon, styles[tone])}>{ICONS[tone]}</span>
      )}
      <div className={styles.textBlock}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.desc}>{description}</div>}
      </div>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            action.onClick();
            requestDismiss();
          }}
        >
          {action.label}
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          className={styles.close}
          aria-label={common.close}
          onClick={requestDismiss}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/** Props for the ToastRegion stack. */
export interface ToastRegionProps extends ToastRegionCoreProps {
  /** Toast stack (controlled: the app owns the list). */
  toasts: ToastData[];
  /** Removes a toast from the list (auto-dismiss, ×, or after the action). */
  onDismiss: (id: string) => void;
  /** Screen corner. Default `bottom-right`. */
  position?: "bottom-right" | "bottom-left" | "top-right";
  className?: string;
}

/**
 * ToastRegion — pilha fixa de toasts num canto da tela.
 *
 * Totalmente controlada: o app mantém a lista e recebe `onDismiss` quando um
 * toast expira (`duration`, padrão 5s), é fechado no × ou tem a ação clicada.
 * `aria-live="polite"` anuncia entradas para leitores de tela.
 *
 *   const [toasts, setToasts] = useState<ToastData[]>([]);
 *   <ToastRegion toasts={toasts} onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))} />
 */
export function ToastRegion({
  toasts,
  onDismiss,
  position = "bottom-right",
  className,
}: ToastRegionProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const owner = anchor.current;
    if (!owner) return;
    const doc = owner.ownerDocument;
    const node = doc.createElement("div");
    node.style.display = "contents";
    const update = () => {
      const parent = activeDialog(doc, owner) ?? owner;
      if (node.parentElement !== parent)
        preserveAnimationProgress(node, () => parent.appendChild(node));
    };
    update();
    setHost(node);
    doc.addEventListener(dialogEvent, update);
    return () => {
      doc.removeEventListener(dialogEvent, update);
      node.remove();
    };
  }, []);
  useTopLayer(ref, "toast", toasts.length > 0 && host !== null);
  return (
    <span ref={anchor} style={{ display: "contents" }}>
      {host &&
        createPortal(
          <div
            ref={ref}
            popover="manual"
            aria-live="polite"
            aria-relevant="additions text"
            className={cn(
              styles.region,
              styles[position.replace("-", "_") as keyof typeof styles],
              className,
            )}
          >
            {toasts.map((toast) => (
              <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
          </div>,
          host,
        )}
    </span>
  );
}
