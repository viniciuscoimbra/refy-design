import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../Button";
import styles from "./DangerZone.module.css";

/** Props for the DangerZone container. */
export interface DangerZoneProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Zone title (critical tone). Optional when the section is already titled outside. */
  title?: ReactNode;
  /** `DangerZoneRow`(s), stacked with a dashed divider. */
  children: ReactNode;
}

/**
 * DangerZone — seção única para ações destrutivas (excluir conta, cancelar
 * assinatura, excluir workspace): card tracejado em tom critical com linhas
 * de ação. A confirmação é do app: `onConfirm` de cada linha é o gancho para
 * abrir o `Modal` de confirmação — a zona nunca executa nada sozinha.
 */
export function DangerZone({ title, className, children, ...rest }: DangerZoneProps) {
  return (
    <div role="group" className={cn(styles.zone, className)} {...rest}>
      {title != null && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.rows}>{children}</div>
    </div>
  );
}

/** Props for a destructive action row inside DangerZone. */
export interface DangerZoneRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** What the action does (e.g. "Delete account João Mendes"). */
  title: ReactNode;
  /** Consequence, always explicit (e.g. "This action cannot be undone…"). */
  description?: ReactNode;
  /** Destructive button label. */
  actionLabel: ReactNode;
  /**
   * Confirmation hook: called on click. The app opens the confirmation
Modal and only then runs it; the row destroys nothing directly.
   */
  onConfirm?: () => void;
  /** Disables the action (e.g. pending prerequisite). */
  disabled?: boolean;
}

/** Linha de ação destrutiva: título + consequência + botão danger. */
export function DangerZoneRow({
  title,
  description,
  actionLabel,
  onConfirm,
  disabled = false,
  className,
  ...rest
}: DangerZoneRowProps) {
  return (
    <div className={cn(styles.row, className)} {...rest}>
      <div className={styles.body}>
        <div className={styles.rowTitle}>{title}</div>
        {description != null && <div className={styles.rowDesc}>{description}</div>}
      </div>
      <Button variant="danger" size="sm" disabled={disabled} onClick={onConfirm}>
        {actionLabel}
      </Button>
    </div>
  );
}
