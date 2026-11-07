import type { ConnectorCardCoreProps } from "../../contracts/connector-card";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./ConnectorCard.module.css";

/** Props for the ConnectorCard integration row. */
export interface ConnectorCardProps extends HTMLAttributes<HTMLElement>, ConnectorCardCoreProps {
  /**
   * Service logo (slot: the service's real SVG, never bundled in the DS).
Rendered in a 40px square with a neutral border.
   */
  logo?: ReactNode;
  /** Service/connection name. */
  name: ReactNode;
  /** Status next to the name (slot: `Badge` "Connected", `StatusDot`…). */
  status?: ReactNode;
  /** Short description of what the integration does. */
  description?: ReactNode;
  /** Mono metadata line (account, number of sites, last sync). */
  meta?: ReactNode;
  /** Actions on the right (slot: `Button` "Connect"/"Configure", `Menu`…). */
  actions?: ReactNode;
  /**
   * Locked by plan (upsell): dimmed surface; `lockHint` replaces
the actions (e.g. `Badge` "Growth plan" + upgrade `Button`).
   */
  locked?: boolean;
  /** Content shown in place of the actions when `locked`. */
  lockHint?: ReactNode;
}

/**
 * ConnectorCard — card de integração/conexão OAuth: logo + nome + status +
 * descrição + meta de sync + ações. Estado `locked` para conector fora do
 * plano (upsell). Display estruturado; os verbos (conectar, configurar)
 * entram pelos slots.
 */
export function ConnectorCard({
  logo,
  name,
  status,
  description,
  meta,
  actions,
  locked = false,
  lockHint,
  className,
  ...rest
}: ConnectorCardProps) {
  return (
    <article className={cn(styles.card, locked && styles.locked, className)} {...rest}>
      {logo != null && <span className={styles.logo}>{logo}</span>}
      <div className={styles.body}>
        <div className={styles.name}>
          {name}
          {status != null && <span className={styles.status}>{status}</span>}
        </div>
        {description != null && <div className={styles.description}>{description}</div>}
        {meta != null && <div className={styles.meta}>{meta}</div>}
      </div>
      {(locked ? lockHint : actions) != null && (
        <div className={styles.actions}>{locked ? lockHint : actions}</div>
      )}
    </article>
  );
}
