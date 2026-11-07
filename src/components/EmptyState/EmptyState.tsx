import type { EmptyStateCoreProps } from "../../contracts/empty-state";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./EmptyState.module.css";

/** Props for the EmptyState component. */
export interface EmptyStateProps extends EmptyStateCoreProps {
  /** Icon inside the frame (via prop, never bundled). */
  icon?: ReactNode;
  title: ReactNode;
  /** Explanatory copy (max ~36ch). */
  message?: ReactNode;
  /** Optional CTA (e.g. <Button>Clear filters</Button>). */
  action?: ReactNode;
  /** Dashed border around it, signaling absence. Default `true`. */
  bordered?: boolean;
  className?: string;
}

/**
 * EmptyState — estado de "nada aqui" com ícone, título, copy e CTA opcional.
 *
 * Borda dashed em volta para indicar ausência (desligável com
 * `bordered={false}` quando o container já tem moldura própria).
 *
 *   <EmptyState icon={<SearchIcon />} title="Nenhuma issue corresponde"
 *     message="Tente remover filtros." action={<Button>Limpar filtros</Button>} />
 */
export function EmptyState({ icon, title, message, action, bordered = true, className }: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, bordered && styles.bordered, className)}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h4 className={styles.title}>{title}</h4>
      {message && <p className={styles.message}>{message}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
