import type { PageHeaderCoreProps } from "../../contracts/page-header";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./PageHeader.module.css";

/** Props for the PageHeader page hero. */
export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "title">, PageHeaderCoreProps {
  /** Mono uppercase eyebrow above the title (e.g. "Workspace · Example Team"). */
  eyebrow?: ReactNode;
  /** Page title (becomes the `<h1>`; only one per page). */
  title: ReactNode;
  /** Lead/description under the title (max 62ch, secondary color). */
  lead?: ReactNode;
  /** Actions on the right (`Button`/`SplitButton`), aligned to the bottom of the text block. */
  actions?: ReactNode;
  /** Trail slot above the eyebrow: pass the `Breadcrumb` atom. A breadcrumb always leads back to the parent. */
  breadcrumb?: ReactNode;
}

/**
 * PageHeader — cabeçalho de página do app (padrão `.ph`/`.shell-page-*` das
 * telas de referência). Eyebrow mono opcional + `<h1>` + lead + slot de ações
 * à direita; variante com `Breadcrumb` em cima via slot `breadcrumb`.
 *
 * Composição: `actions` recebe `Button`/`SplitButton`; `breadcrumb` recebe o
 * átomo `Breadcrumb` (sempre com volta ao pai — regra do PO); dentro do
 * `eyebrow` cabe um StatusDot/indicador "ao vivo".
 *
 *   <PageHeader
 *     eyebrow="Workspace · última análise há 14min"
 *     title="Visão geral"
 *     lead="3 projetos · 12 análises este mês"
 *     actions={<Button>Nova análise</Button>}
 *   />
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    { eyebrow, title, lead, actions, breadcrumb, className, ...rest },
    ref
  ) {
    return (
      <header ref={ref} className={cn(styles.header, className)} {...rest}>
        {breadcrumb != null && <div className={styles.breadcrumb}>{breadcrumb}</div>}
        <div className={styles.row}>
          <div className={styles.text}>
            {eyebrow != null && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h1 className={styles.title}>{title}</h1>
            {lead != null && <p className={styles.lead}>{lead}</p>}
          </div>
          {actions != null && <div className={styles.actions}>{actions}</div>}
        </div>
      </header>
    );
  }
);
