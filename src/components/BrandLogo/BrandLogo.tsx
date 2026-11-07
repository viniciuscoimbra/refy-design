import type { BrandLogoCoreProps } from "../../contracts/brand-logo";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./BrandLogo.module.css";

export type BrandLogoBrand = "refy";
export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface BrandLogoProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children">, BrandLogoCoreProps {
  brand?: BrandLogoBrand;
  size?: BrandLogoSize;
  tone?: "default" | "inverse";
  animated?: boolean;
  markOnly?: boolean;
  /**
   * The refy symbol before the word. The word's shape and font are fixed in any theme;
the symbol color comes from the theme's `--brand-mark` token.
   */
  symbol?: boolean;
  /** Brand provided by the consumer. Refy includes no third-party assets. */
  children?: ReactNode;
}

/** Assinatura do Refy. Marcas de produtos podem ser fornecidas pela aplicação. */
export function BrandLogo({ brand = "refy", size = "sm", tone = "default", animated = false, markOnly = false, symbol = false, children, className, ...rest }: BrandLogoProps) {
  if (symbol && !children) {
    return <span role="img" aria-label={brand} className={cn(styles.logo, styles.refy, styles.withSymbol, styles[size], styles[tone], markOnly && styles.markOnly, className)} {...rest}>
      <svg className={styles.symbol} viewBox="0 0 26 36" fill="currentColor" aria-hidden="true" data-refy-brand-mark="">
        <path d="M0 12A12 12 0 0 1 12 0h14a12 12 0 0 1-12 12H0Z" />
        <path d="M0 15h12v9A12 12 0 0 1 0 36V15Z" />
      </svg>
      {!markOnly && <span aria-hidden="true" className={styles.wordmark}>refy</span>}
    </span>;
  }
  return <span role="img" aria-label={brand} className={cn(styles.logo, styles.refy, styles[size], styles[tone], markOnly && styles.markOnly, !animated && styles.static, className)} {...rest}>
    {children ?? <><span aria-hidden="true" className={markOnly ? styles.monogram : styles.word}>{markOnly ? "r" : "refy"}</span>
    {!markOnly && <span aria-hidden="true" className={styles.dot} />}</>}
  </span>;
}
