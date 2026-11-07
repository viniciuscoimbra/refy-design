import type { CardCoreProps, CardHeaderCoreProps } from "../../contracts/card";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Card.module.css";

export type CardTone = "default" | "inverted";

/** Props for the Card surface component. */
export interface CardProps extends HTMLAttributes<HTMLDivElement>, CardCoreProps {
  /** Shadow elevation (0–4). 0 = flat; 4 = overlay. */
  elevation?: 0 | 1 | 2 | 3 | 4;
  padding?: "none" | "sm" | "md";
  /**
   * Surface tone. `inverted` = dark (ink) surface with a radial brand
gradient and inverted text tokens scoped to the card, the base of the
billing/usage heroes (plan-summary, usage-hero).
   */
  tone?: CardTone;
  children: ReactNode;
}

/** Props for the optional Card header. */
export interface CardHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
>, CardHeaderCoreProps {
  title: ReactNode;
  count?: ReactNode;
  action?: ReactNode;
  /** Optional media and description, with metrics set by the theme. */
  icon?: ReactNode;
  description?: ReactNode;
  /** Compact hierarchy for secondary headers; md keeps the default. */
  size?: "sm" | "md";
}

/** Superfície-base do app. Caixa branca, borda fria, cantos suaves. */
export function Card({
  elevation = 0,
  padding = "md",
  tone = "default",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        styles[`e${elevation}`],
        styles[`p-${padding}`],
        tone === "inverted" && styles.inverted,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Cabeçalho opcional do card: título + contador + ação à direita. */
export function CardHeader({
  title,
  count,
  action,
  icon,
  description,
  size = "md",
  className,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={cn(styles.header, size === "sm" && styles.headerSm, className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {description != null ? (
        <div className={styles.headingContent}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>
      ) : (
        <h3 className={styles.title}>{title}</h3>
      )}
      {count != null && <span className={styles.count}>{count}</span>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
