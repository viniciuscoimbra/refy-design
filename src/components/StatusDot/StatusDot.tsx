import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./StatusDot.module.css";

export type StatusDotTone = "good" | "ok" | "warn" | "critical" | "info" | "neutral";

/** Props for the StatusDot indicator. */
export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  /** Semantic tone of the state. Default `good` (green). */
  tone?: StatusDotTone;
  /** "Live" pulse (animated halo). Off under `prefers-reduced-motion`. */
  pulse?: boolean;
  /** Mono uppercase label to the right of the dot (e.g. "Connected · primary"). */
  children?: ReactNode;
}

/**
 * StatusDot — dot de estado 6px com halo, rótulo mono uppercase opcional e
 * variante `pulse` ("ao vivo"). Sem rótulo visível, passe `aria-label`;
 * é indicador estático, não é botão.
 */
export function StatusDot({
  tone = "good",
  pulse = false,
  className,
  children,
  ...rest
}: StatusDotProps) {
  return (
    <span className={cn(styles.root, styles[tone], className)} {...rest}>
      <span className={cn(styles.dot, pulse && styles.pulse)} aria-hidden="true" />
      {children != null && <span className={styles.label}>{children}</span>}
    </span>
  );
}
