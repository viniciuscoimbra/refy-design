"use client";
import { useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactElement } from "react";
import type { RatingCoreProps, RatingSize } from "../../contracts/display";
import { cn } from "../../lib/cn";
import { useComponentMessages, useLocale } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import styles from "./Rating.module.css";

export type { RatingSize };

/** Props for the Rating component. */
export interface RatingProps extends RatingCoreProps, Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {}

const STAR = "M12 2.8l2.84 5.76 6.36.92-4.6 4.49 1.08 6.33L12 17.3l-5.68 3 1.08-6.33-4.6-4.49 6.36-.92z";

function Star({ fill }: { fill: number }) {
  const clip = useId();
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden="true">
      <path className={styles.empty} d={STAR} />
      {fill > 0 && (
        <>
          <clipPath id={clip}>
            <rect x="0" y="0" width={24 * fill} height="24" />
          </clipPath>
          <path className={styles.full} d={STAR} clipPath={`url(#${clip})`} />
        </>
      )}
    </svg>
  );
}

const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value));

/**
 * Rating: nota em estrelas. Na leitura aceita fração e mostra o número e as avaliações;
 * na escolha vira um grupo de rádios (setas mudam a nota, Home e End vão às pontas).
 */
export function Rating({
  label,
  value: valueProp,
  defaultValue = 0,
  onChange,
  max = 5,
  readOnly = false,
  count,
  showValue,
  size = "md",
  disabled = false,
  showLabel = false,
  className,
  ...rest
}: RatingProps) {
  const m = useComponentMessages("rating", enMessages.rating);
  const locale = useLocale();
  const [inner, setInner] = useState(defaultValue);
  const [hover, setHover] = useState<number | null>(null);
  const value = clamp(valueProp ?? inner, max);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const shownValue = showValue ?? readOnly;
  const labelId = useId();
  // Rótulo visível em cima das estrelas: o mesmo texto que nomeia a nota para o leitor de tela.
  const withLabel = (node: ReactElement) =>
    showLabel ? (
      <div className={cn(styles.labeled, className)} {...rest}>
        <span id={labelId} className={styles.label} aria-hidden="true">{label}</span>
        {node}
      </div>
    ) : node;
  const outer = { className: showLabel ? undefined : className };
  const extra = (
    <>
      {shownValue && <span className={styles.value}>{number.format(value)}</span>}
      {count != null && <span className={styles.count}>({m.reviews(count, number.format(count))})</span>}
    </>
  );

  if (readOnly) {
    return withLabel(
      <div
        role="img"
        aria-label={`${label}: ${m.value(number.format(value), max)}${count != null ? `, ${m.reviews(count, number.format(count))}` : ""}`}
        className={cn(styles.rating, styles[size], outer.className)}
        {...(showLabel ? {} : rest)}
      >
        <span className={styles.stars}>
          {stars.map((n) => <Star key={n} fill={clamp(value - (n - 1), 1)} />)}
        </span>
        <span aria-hidden="true" className={styles.meta}>{extra}</span>
      </div>
    );
  }

  const choose = (next: number) => {
    if (disabled) return;
    const n = clamp(Math.round(next), max);
    if (valueProp === undefined) setInner(n);
    onChange?.(n);
  };
  const selected = Math.round(value);
  const focusIndex = Math.max(selected, 1);
  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    let next: number | undefined;
    if (event.key in keys) next = clamp(selected + keys[event.key], max) || 1;
    if (event.key === "Home") next = 1;
    if (event.key === "End") next = max;
    if (next === undefined) return;
    event.preventDefault();
    choose(next);
    refs.current[next - 1]?.focus();
  };
  const shown = hover ?? selected;
  return withLabel(
    <div className={cn(styles.rating, styles[size], styles.input, disabled && styles.disabled, outer.className)} {...(showLabel ? {} : rest)}>
      <span
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        className={styles.stars}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHover(null)}
      >
        {stars.map((n) => (
          <span
            key={n}
            ref={(node) => { refs.current[n - 1] = node; }}
            role="radio"
            aria-checked={selected === n}
            aria-label={m.star(n, max)}
            tabIndex={disabled ? -1 : n === focusIndex ? 0 : -1}
            className={styles.option}
            onClick={() => choose(selected === n ? 0 : n)}
            onMouseEnter={() => !disabled && setHover(n)}
          >
            <Star fill={n <= shown ? 1 : 0} />
          </span>
        ))}
      </span>
      <span className={styles.meta}>{extra}</span>
    </div>
  );
}
