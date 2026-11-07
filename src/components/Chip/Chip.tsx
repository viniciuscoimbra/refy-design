import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Chip.module.css";

export type ChipTone = "neutral" | "critical" | "warning" | "success" | "info";
export type ChipSelectionMode = "toggle" | "radio";

/** Props for the selectable Chip control. */
export interface ChipProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onSelect"
> {
  /** Compact selection embedded in fields; filter keeps the default. */
  variant?: "filter" | "selection";
  /** Selected state (active filter). */
  selected?: boolean;
  /** Counter on the right (e.g. number of items in the filter). */
  count?: number;
  /** Optional semantic dot for severity/status filters. */
  tone?: ChipTone;
  /** Toggle uses `aria-pressed`; radio uses `role=radio` + `aria-checked`. */
  selectionMode?: ChipSelectionMode;
  /** Shows the animated check when selected. */
  showCheck?: boolean;
  /** Close icon: fires onRemove. */
  removable?: boolean;
  onRemove?: () => void;
  leadingIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Chip / filter-chip. Clicável para alternar seleção; opcionalmente removível.
 * A seleção inverte o par semântico, preservando contraste também em hover.
 */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  {
    variant = "filter",
    selected = false,
    count,
    tone = "neutral",
    selectionMode = "toggle",
    showCheck = false,
    removable = false,
    onRemove,
    onClick,
    leadingIcon,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        styles.chip,
        styles[`tone-${tone}`],
        selected && styles.selected,
        variant === "selection" && styles.selection,
        className,
      )}
      role={selectionMode === "radio" ? "radio" : undefined}
      aria-checked={selectionMode === "radio" ? selected : undefined}
      aria-pressed={selectionMode === "toggle" ? selected : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (removable) onRemove?.();
      }}
      {...rest}
    >
      {showCheck && (
        <span className={styles.check} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
      {tone !== "neutral" && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {typeof count === "number" && (
        <span className={styles.count}>{count}</span>
      )}
      {removable && (
        <span className={styles.remove} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </span>
      )}
    </button>
  );
});
