import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Card } from "../Card";
import styles from "./BillingCard.module.css";

import { useMessages } from "../../lib/locale";
/** Props for the BillingCard component. */
export interface BillingCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Method brand/icon (ReactNode; the DS does not bundle logos). E.g. <span>VISA</span>. */
  brandIcon?: ReactNode;
  /** Method name. E.g. "Credit card". */
  methodLabel: ReactNode;
  /** Last card digits, shown as "· ending 4242". */
  lastDigits?: string;
  /** Secondary line of the method. E.g. "Expires 09/2028 · Asaas (Brazil)". */
  methodMeta?: ReactNode;
  /** Billing status, a slot for `Badge` (e.g. <Badge tone="success" dot>Active</Badge>). */
  status?: ReactNode;
  /** Label of the next charge block. */
  nextChargeLabel?: ReactNode;
  /** Amount of the next charge. E.g. "$ 2,388". */
  nextChargeAmount?: ReactNode;
  /** Date/extra info of the next charge. E.g. "on May 2, 2027". */
  nextChargeDate?: ReactNode;
  /** Actions (slot), e.g. Change card, View invoices (`Button`). */
  actions?: ReactNode;
  /** Elevation passed to the Card. */
  elevation?: 0 | 1 | 2;
}

/**
 * Cartão de cobrança: método de pagamento + próxima cobrança + ações.
 * Composição sobre `Card`; bandeira, status e ações entram por slots
 * (o DS não bundleia logos de bandeira nem decide as ações).
 */
export function BillingCard({
  brandIcon,
  methodLabel,
  lastDigits,
  methodMeta,
  status,
  nextChargeLabel: nextChargeLabelProp,
  nextChargeAmount,
  nextChargeDate,
  actions,
  elevation = 0,
  className,
  ...rest
}: BillingCardProps) {
  const m = useMessages("billingCard");
  const nextChargeLabel = nextChargeLabelProp ?? m.nextCharge;
  const hasFooter = nextChargeAmount != null || actions != null;
  return (
    <Card elevation={elevation} className={cn(styles.billing, className)} {...rest}>
      <div className={styles.methodRow}>
        {brandIcon && (
          <span className={styles.brand} aria-hidden="true">
            {brandIcon}
          </span>
        )}
        <div className={styles.methodInfo}>
          <div className={styles.methodName}>
            {methodLabel}
            {lastDigits && <span className={styles.lastDigits}> · final {lastDigits}</span>}
          </div>
          {methodMeta && <div className={styles.methodMeta}>{methodMeta}</div>}
        </div>
        {status && <div className={styles.status}>{status}</div>}
      </div>

      {hasFooter && (
        <div className={styles.footer}>
          {nextChargeAmount != null && (
            <div className={styles.nextCharge}>
              <div className={styles.nextChargeLabel}>{nextChargeLabel}</div>
              <div className={styles.nextChargeValue}>
                {nextChargeAmount}
                {nextChargeDate && <span className={styles.nextChargeDate}> {nextChargeDate}</span>}
              </div>
            </div>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
    </Card>
  );
}
