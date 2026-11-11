import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ProgressBar } from "../ProgressBar";
import type { ProgressTone } from "../ProgressBar";
import styles from "./UsageMeter.module.css";

import { useLocale, useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Props for the UsageMeter component. */
export interface UsageMeterProps extends HTMLAttributes<HTMLDivElement> {
  /** Name of the measured resource. E.g. "Cycle credits". */
  label: ReactNode;
  /** Amount used. */
  used: number;
  /** Resource limit. */
  limit: number;
  /** Unit shown after the numbers. E.g. "credits". */
  unit?: ReactNode;
  /** Secondary line. E.g. "8 standard analyses · 0 syntheses". */
  meta?: ReactNode;
  /** Number formatting (default: pt-BR, e.g. 2.500). */
  formatValue?: (value: number) => string;
  /** % from which the tone turns to warning (default 80). */
  warnAt?: number;
  /** % from which the tone turns critical (default 100). */
  criticalAt?: number;
  /** Bar height (passed to ProgressBar). */
  size?: "sm" | "md";
}

/** Props for the UsageMeterGroup list wrapper. */
export interface UsageMeterGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}


/** Deriva o tom da barra a partir do % consumido e dos limiares. */
export function usageTone(percent: number, warnAt = 80, criticalAt = 100): ProgressTone {
  if (percent >= criticalAt) return "critical";
  if (percent >= warnAt) return "warn";
  return "primary";
}

/**
 * Consumo vs limite: label, "usado / limite" e barra (composição sobre
 * `ProgressBar`). O tom muda por limiar: ok → atenção (≥80%) → crítico (≥100%).
 */
export function UsageMeter({
  label,
  used,
  limit,
  unit,
  meta,
  formatValue: formatValueProp,
  warnAt = 80,
  criticalAt = 100,
  size = "md",
  className,
  ...rest
}: UsageMeterProps) {
  const m = useComponentMessages("usageMeter", enMessages.usageMeter);
  const locale = useLocale();
  const formatValue = formatValueProp ?? ((value: number) => new Intl.NumberFormat(locale).format(value));
  const percent = limit > 0 ? (used / limit) * 100 : 0;
  const tone = usageTone(percent, warnAt, criticalAt);
  const usedText = formatValue(used);
  const limitText = formatValue(limit);
  return (
    <div className={cn(styles.meter, className)} {...rest}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={cn(styles.value, styles[`value-${tone}`])}>
          <span className={styles.used}>{usedText}</span>
          <span className={styles.limit}> / {limitText}</span>
          {unit && <span className={styles.unit}> {unit}</span>}
        </span>
      </div>
      <ProgressBar
        value={percent}
        tone={tone}
        size={size}
        aria-label={typeof label === "string" ? label : undefined}
        aria-valuetext={`${usedText} ${m.of} ${limitText}${typeof unit === "string" ? ` ${unit}` : ""}`}
      />
      {meta && <div className={styles.meta}>{meta}</div>}
    </div>
  );
}

/**
 * Lista de medidores (ex.: consumo por projeto) — empilha `UsageMeter`
 * com divisores, como na tela de Uso.
 */
export function UsageMeterGroup({ children, className, ...rest }: UsageMeterGroupProps) {
  return (
    <div role="list" className={cn(styles.group, className)} {...rest}>
      {children}
    </div>
  );
}
