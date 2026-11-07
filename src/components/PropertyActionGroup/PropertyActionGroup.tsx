import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../Button";
import type { ButtonStatus } from "../Button";
import { cn } from "../../lib/cn";
import styles from "./PropertyActionGroup.module.css";

import { useMessages } from "../../lib/locale";
export type PropertyAction = "reject" | "save" | "visit";
export type PropertyActionGroupState = "idle" | "processing" | "completed" | "unavailable";

export interface PropertyActionGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  state?: PropertyActionGroupState;
  activeAction?: PropertyAction;
  onAction?: (action: PropertyAction) => void;
  orientation?: "auto" | "horizontal" | "vertical";
  disabledActions?: PropertyAction[];
  statusMessage?: ReactNode;
  labels?: Partial<Record<PropertyAction, string>>;
}

const icons: Record<PropertyAction, ReactNode> = {
  reject: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  save: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" /></svg>,
  visit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>,
};

/** Rótulos das ações no idioma atual. */
export function useDecisionLabels(): Record<PropertyAction, string> {
  const m = useMessages("propertyActionGroup");
  return { reject: m.reject, save: m.save, visit: m.visit };
}

/** Decisões sobre um item. Cada ação inicia um fluxo próprio no consumidor. */
export function PropertyActionGroup({
  state = "idle",
  activeAction,
  onAction,
  orientation = "auto",
  disabledActions = [],
  statusMessage,
  labels: labelOverrides,
  className,
  ...rest
}: PropertyActionGroupProps) {
  const m = useMessages("propertyActionGroup");
  const decisionLabels = useDecisionLabels();
  const labels = { ...decisionLabels, ...Object.fromEntries(Object.entries(labelOverrides ?? {}).filter(([, value]) => value !== undefined)) };
  const actions: PropertyAction[] = ["reject", "save", "visit"];
  const unavailable = state === "unavailable";

  function buttonStatus(action: PropertyAction): ButtonStatus {
    if (activeAction !== action) return "idle";
    if (state === "processing") return "loading";
    if (state === "completed") return "success";
    return "idle";
  }

  const message = statusMessage ?? (
    state === "processing" && activeAction ? m.processing(labels[activeAction]) :
    state === "completed" && activeAction ? m.completed(labels[activeAction]) :
    unavailable ? m.unavailable :
    m.idle
  );

  return (
    <div className={cn(styles.root, styles[orientation], className)} {...rest}>
      <div className={styles.actions} role="group" aria-label={m.group}>
        {actions.map((action) => {
          const isActive = action === activeAction;
          return (
            <Button
              key={action}
              data-decision-action={action}
              className={cn(styles.action, styles[action], isActive && styles.active)}
              variant={action === "visit" ? "primary" : "secondary"}
              status={buttonStatus(action)}
              interactionState={isActive && state === "idle" ? "pressed" : undefined}
              loadingLabel={labels[action]}
              leadingIcon={icons[action]}
              disabled={unavailable || disabledActions.includes(action) || (state !== "idle" && !isActive)}
              aria-pressed={isActive || undefined}
              onClick={() => onAction?.(action)}
            >
              {labels[action]}
            </Button>
          );
        })}
      </div>
      <span className={styles.status} role="status" aria-live="polite">{message}</span>
    </div>
  );
}

export type DecisionAction = "reject" | "save" | "select";
export interface DecisionActionsProps extends Omit<PropertyActionGroupProps, "activeAction" | "onAction" | "disabledActions" | "labels"> {
  activeAction?: DecisionAction;
  onAction?: (action: DecisionAction) => void;
  disabledActions?: DecisionAction[];
  labels?: Partial<Record<DecisionAction, string>>;
}
/** Maps the legacy event name without changing existing consumers. */
export function DecisionActions({ activeAction, onAction, disabledActions, labels, ...rest }: DecisionActionsProps) {
  return <PropertyActionGroup {...rest}
    activeAction={activeAction === "select" ? "visit" : activeAction}
    disabledActions={disabledActions?.map(action => action === "select" ? "visit" : action)}
    labels={labels ? { reject: labels.reject, save: labels.save, visit: labels.select } : undefined}
    onAction={action => onAction?.(action === "visit" ? "select" : action)} />;
}
