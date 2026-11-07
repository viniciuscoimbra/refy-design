import type { ProgressBarCoreProps } from "../../contracts/progress-bar";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./ProgressBar.module.css";

export type ProgressTone = "primary" | "neutral" | "warn" | "critical";

/** Props for the ProgressBar component. */
export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement>, ProgressBarCoreProps {
  /** 0–100. Ignored (and optional) when `indeterminate`. */
  value?: number;
  /**
   * Fill color. `neutral` (ink) is the tone of the quota bars
in settings screens: informative, without judging state.
   */
  tone?: ProgressTone;
  /** Track height. */
  size?: "sm" | "md";
  /**
   * Loading without known progress: the fill slides in a loop.
Exposes `aria-busy` and omits `aria-valuenow`. With `prefers-reduced-motion`
the animation stops (track filled at half opacity).
   */
  indeterminate?: boolean;
}

/** Barra de progresso horizontal (uso de créditos, consumo por projeto). */
export function ProgressBar({
  value = 0,
  tone = "primary",
  size = "md",
  indeterminate = false,
  className,
  ...rest
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(styles.track, styles[size], className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      {...(indeterminate ? { "aria-busy": true } : { "aria-valuenow": pct })}
      {...rest}
    >
      <span
        className={cn(styles.fill, styles[tone], indeterminate && styles.indeterminate)}
        style={indeterminate ? undefined : { transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}
