"use client";
import { inertAttribute } from "../../lib/inertAttribute";
import { usePresence } from "../../lib/usePresence";
import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Kbd } from "../Kbd";
import { cn } from "../../lib/cn";
import { useThemePortal } from "../../lib/ThemeProvider";
import { useTopLayer } from "../../lib/useTopLayer";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** Short, non-interactive label. */
  label: string;
  /** Optional second line, text only. */
  description?: string;
  /** Optional shortcut, rendered with Kbd. */
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  /** Open delay on hover/focus. */
  delayMs?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Renders the bubble in body to escape containers with overflow. */
  portalled?: boolean;
  children: ReactNode;
  className?: string;
}

/** Tooltip textual acessível. Conteúdo interativo não faz parte desta API. */
export function Tooltip({
  label,
  description,
  shortcut,
  side = "top",
  delayMs = 350,
  open,
  defaultOpen = false,
  onOpenChange,
  portalled = false,
  children,
  className,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const themePortal = useThemePortal();
  const timerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [portalPosition, setPortalPosition] = useState<{ top: number; left: number } | null>(null);
  const [portalTheme, setPortalTheme] = useState<string | null>(null);
  const id = useId();
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const present = usePresence(Boolean(isOpen), bubbleRef);
  const portalContainer = portalled && typeof document !== "undefined" ? triggerRef.current?.closest('[aria-modal="true"]') ?? themePortal ?? document.body : null;

  function setOpen(next: boolean) {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function scheduleOpen() {
    clearTimer();
    timerRef.current = window.setTimeout(() => setOpen(true), delayMs);
  }

  function close() {
    clearTimer();
    setOpen(false);
  }

  useEffect(() => () => clearTimer(), []);
  useTopLayer(bubbleRef, "tooltip", present, close, triggerRef, portalContainer, Boolean(isOpen));

  useLayoutEffect(() => {
    if (!present) return;
    function position() {
      setPortalTheme(triggerRef.current?.closest("[data-theme]")?.getAttribute("data-theme") ?? null);
      const triggerRect = triggerRef.current?.getBoundingClientRect();
      const bubbleRect = bubbleRef.current?.getBoundingClientRect();
      if (!triggerRect || !bubbleRect) return;
      const gap = 10;
      const positions = {
        top: { top: triggerRect.top - bubbleRect.height - gap, left: triggerRect.left + (triggerRect.width - bubbleRect.width) / 2 },
        bottom: { top: triggerRect.bottom + gap, left: triggerRect.left + (triggerRect.width - bubbleRect.width) / 2 },
        left: { top: triggerRect.top + (triggerRect.height - bubbleRect.height) / 2, left: triggerRect.left - bubbleRect.width - gap },
        right: { top: triggerRect.top + (triggerRect.height - bubbleRect.height) / 2, left: triggerRect.right + gap },
      };
      const preferred = positions[side];
      setPortalPosition({
        top: Math.max(8, Math.min(preferred.top, window.innerHeight - bubbleRect.height - 8)),
        left: Math.max(8, Math.min(preferred.left, window.innerWidth - bubbleRect.width - 8)),
      });
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [present, portalled, side, label, description, shortcut, themePortal]);

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": cn(
          (children as ReactElement<{ "aria-describedby"?: string }>).props["aria-describedby"],
          isOpen && id
        ),
      })
    : children;

  const bubble = present ? (
    <span
      ref={bubbleRef}
      data-motion-state={isOpen ? "open" : "closing"}
      aria-hidden={!isOpen || undefined}
      inert={inertAttribute(!isOpen)}
      role="tooltip"
      popover="manual"
      id={id}
      data-side={side}
      data-theme={portalled && !themePortal ? portalTheme ?? undefined : undefined}
      className={cn(styles.bubble, portalled && styles.portal)}
      onMouseEnter={clearTimer}
      onMouseLeave={close}
      style={{ position: "fixed", inset: "auto", margin: 0, border: 0, translate: "none", top: portalPosition?.top ?? 0, left: portalPosition?.left ?? 0, visibility: portalPosition ? "visible" : "hidden", animation: `${isOpen ? "refy-context-in" : "refy-context-out"} var(--motion-context${isOpen ? "" : "-exit"}-duration) var(--motion-ease-${isOpen ? "enter" : "exit"}) both` }}
    >
      <span className={styles.content}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {shortcut && <Kbd className={styles.shortcut}>{shortcut}</Kbd>}
    </span>
  ) : null;

  return (
    <span
      className={cn(styles.wrap, className)}
      onMouseEnter={scheduleOpen}
      onMouseLeave={(event) => {
        if (event.currentTarget.contains(document.activeElement)) return;
        clearTimer(); timerRef.current = window.setTimeout(() => setOpen(false), 150);
      }}
      onFocusCapture={scheduleOpen}
      onBlurCapture={close}
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <span ref={triggerRef} className={styles.trigger}>{trigger}</span>
      {portalContainer ? createPortal(bubble, portalContainer) : bubble}
    </span>
  );
}
