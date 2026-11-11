import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "../Badge";
import { ProgressBar } from "../ProgressBar";
import { cn } from "../../lib/cn";
import styles from "./ApprovalWorkbench.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export type ApprovalWorkbenchItemState =
  | "not-started"
  | "in-progress"
  | "complete";

export interface ApprovalWorkbenchItem {
  id: string;
  label: string;
  meta?: string;
  state: ApprovalWorkbenchItemState;
}

export interface ApprovalWorkbenchProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "onChange"> {
  /** Accessible name and title of the work list. */
  label?: string;
  /** Items evaluated in this review. */
  items: ApprovalWorkbenchItem[];
  /** Item shown in the panel. */
  activeId: string;
  /** Selects another item without changing page. */
  onActiveChange: (id: string) => void;
  /** Editor for the active item. */
  children: ReactNode;
}

const stateKey: Record<ApprovalWorkbenchItemState, "notStarted" | "inProgress" | "complete"> = {
  "not-started": "notStarted",
  "in-progress": "inProgress",
  complete: "complete",
};

/**
 * ApprovalWorkbench organiza uma análise manual em dois planos: a fila de
 * itens e o editor do item selecionado. Resultados, solicitações e decisões
 * continuam sob responsabilidade da página que compõe o organismo.
 */
export function ApprovalWorkbench({
  label: labelProp,
  items,
  activeId,
  onActiveChange,
  children,
  className,
  ...rest
}: ApprovalWorkbenchProps) {
  const m = useComponentMessages("approvalWorkbench", enMessages.approvalWorkbench);
  const label = labelProp ?? m.label;
  const completed = items.filter((item) => item.state === "complete").length;
  const progress = items.length === 0 ? 0 : (completed / items.length) * 100;

  return (
    <section className={cn(styles.root, className)} {...rest}>
      <aside className={styles.queue}>
        <div className={styles.summary}>
          <div>
            <strong>{label}</strong>
            <span>{m.summary(completed, items.length)}</span>
          </div>
          <ProgressBar
            value={progress}
            tone={completed === items.length && items.length > 0 ? "neutral" : "primary"}
            size="sm"
            aria-label={m.progress(completed, items.length)}
          />
        </div>

        <nav className={styles.items} aria-label={label}>
          {items.map((item, index) => {
            const active = item.id === activeId;
            const complete = item.state === "complete";
            return (
              <button
                key={item.id}
                type="button"
                className={cn(styles.item, active && styles.active)}
                aria-current={active ? "step" : undefined}
                onClick={() => onActiveChange(item.id)}
              >
                <span className={cn(styles.mark, complete && styles.markComplete)} aria-hidden="true">
                  {complete ? "✓" : index + 1}
                </span>
                <span className={styles.itemBody}>
                  <strong>{item.label}</strong>
                  {item.meta != null && <small>{item.meta}</small>}
                </span>
                <Badge
                  tone={complete ? "success" : item.state === "in-progress" ? "info" : "neutral"}
                >
                  {m[stateKey[item.state]]}
                </Badge>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={styles.editor}>{children}</div>
    </section>
  );
}
