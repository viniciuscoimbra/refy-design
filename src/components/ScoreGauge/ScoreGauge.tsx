"use client";
import { forwardRef, useEffect, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./ScoreGauge.module.css";

export type ScoreGaugeSize = "sm" | "md" | "lg";
import { scoreBand } from "./scoreBand";
import type { ScoreBand } from "./scoreBand";
export { scoreBand };
export type { ScoreBand };

/** Props for the ScoreGauge component. */
export interface ScoreGaugeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Score from 0 to 100 (out-of-range values are clamped). */
  value: number;
  /** Short label under the number (e.g. "Editorial"). Hidden at size sm. */
  label?: ReactNode;
  /** Diameter: sm 32px (rows), md 56px (cards, default), lg 96px (hero). */
  size?: ScoreGaugeSize;
  /** Minimum score of the ok band (default 70). */
  okAt?: number;
  /** Minimum score of the warn band (default 40; below = critical). */
  warnAt?: number;
  /** Formatting of the central number (default: rounded integer). */
  formatValue?: (value: number) => ReactNode;
  /** Accessible text of the meter. Required if `label` is not a string. */
  "aria-label"?: string;
}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const clamp = (v: number) => Math.min(100, Math.max(0, v));

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Medidor circular de score (0–100): arco SVG com progresso animado ao montar
 * e ao mudar de valor (motion tokens; `prefers-reduced-motion` zera a animação),
 * cor por banda de limiar (ok/warn/critical) e rótulo central.
 * `role="meter"` com valuemin/max/now.
 */
export const ScoreGauge = forwardRef<HTMLDivElement, ScoreGaugeProps>(function ScoreGauge(
  {
    value,
    label,
    size = "md",
    okAt = 70,
    warnAt = 40,
    formatValue,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref
) {
  const target = clamp(value);
  /* com reduced-motion o arco nasce já no valor final (sem frame em 0) */
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(target);
      return;
    }
    const id = requestAnimationFrame(() => setProgress(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  const band = scoreBand(target, okAt, warnAt);
  const offset = CIRCUMFERENCE * (1 - progress / 100);
  const display = formatValue ? formatValue(target) : Math.round(target);
  const accessibleName =
    ariaLabel ?? (typeof label === "string" ? label : "Score");

  return (
    <div
      ref={ref}
      role="meter"
      aria-label={accessibleName}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={target}
      className={cn(styles.gauge, styles[size], styles[`band-${band}`], className)}
      {...rest}
    >
      <svg className={styles.svg} viewBox="0 0 64 64" aria-hidden="true">
        <circle className={styles.track} cx="32" cy="32" r={RADIUS} />
        <circle
          className={styles.arc}
          cx="32"
          cy="32"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={styles.center} aria-hidden="true">
        <span className={styles.value}>{display}</span>
        {label != null && <span className={styles.label}>{label}</span>}
      </span>
    </div>
  );
});
