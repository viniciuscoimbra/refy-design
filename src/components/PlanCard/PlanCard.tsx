import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import styles from "./PlanCard.module.css";

import { useMessages } from "../../lib/locale";
/** Props for the PlanCard component. */
export interface PlanCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Plan name. E.g. "Pro". */
  name: ReactNode;
  /** Formatted price. E.g. "$ 199". */
  price: ReactNode;
  /** Price suffix. E.g. "/month". */
  period?: ReactNode;
  /** Note below the price. E.g. "$ 2,388 billed yearly". */
  priceNote?: ReactNode;
  /** List of features (one node per line). */
  features?: ReactNode[];
  /** Check icon for the features (via prop; the DS does not bundle icons). Has an internal fallback. */
  checkIcon?: ReactNode;
  /** Plan CTA, a slot for `Button`. Ignored when `current` (becomes a disabled button). */
  cta?: ReactNode;
  /** The workspace's current plan: tag + disabled CTA. */
  current?: boolean;
  /** Tag/CTA text when `current`. */
  currentLabel?: string;
  /** Visual highlight of the recommended plan. */
  highlighted?: boolean;
  /** Tag text when `highlighted` (and not `current`). */
  highlightLabel?: string;
}

const defaultCheck = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5L20 7" />
  </svg>
);

/**
 * Card de plano (pricing): nome, preço/período, features com check e CTA.
 * `current` marca o plano vigente (tag + CTA desabilitada);
 * `highlighted` destaca o recomendado. A grade 2–4 colunas é do consumidor
 * (ver story "Grade de planos").
 */
export function PlanCard({
  name,
  price,
  period,
  priceNote,
  features,
  checkIcon,
  cta,
  current = false,
  currentLabel: currentLabelProp,
  highlighted = false,
  highlightLabel: highlightLabelProp,
  className,
  ...rest
}: PlanCardProps) {
  const m = useMessages("planCard");
  const currentLabel = currentLabelProp ?? m.current;
  const highlightLabel = highlightLabelProp ?? m.recommended;
  const tag = current ? currentLabel : highlighted ? highlightLabel : null;
  return (
    <div
      className={cn(
        styles.plan,
        current && styles.current,
        highlighted && styles.highlighted,
        className
      )}
      {...rest}
    >
      {tag && (
        <span className={cn(styles.tag, current && !highlighted && styles.tagNeutral)}>{tag}</span>
      )}
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.priceRow}>
        <span className={styles.price}>{price}</span>
        {period && <span className={styles.period}>{period}</span>}
      </div>
      <div className={styles.priceNote}>{priceNote}</div>
      <div className={styles.cta}>
        {current ? (
          <Button variant="secondary" block disabled>
            {currentLabel}
          </Button>
        ) : (
          cta
        )}
      </div>
      {features && features.length > 0 && (
        <ul className={styles.features}>
          {features.map((feature, i) => (
            <li key={i} className={styles.feature}>
              <span className={styles.check} aria-hidden="true">
                {checkIcon ?? defaultCheck}
              </span>
              <span className={styles.featureText}>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
