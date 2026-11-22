import type { HTMLAttributes } from "react";
import type { FollowUpCoreProps, FollowUpLayout, FollowUpSuggestion } from "../../contracts/media-links";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import styles from "./FollowUp.module.css";

export type { FollowUpLayout, FollowUpSuggestion };

/** Props for the FollowUp component. */
export interface FollowUpProps extends FollowUpCoreProps, Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {}

/** Aceita texto solto ou objeto; devolve rótulo, mensagem e chave. */
export function normalizeSuggestions(suggestions: (string | FollowUpSuggestion)[]) {
  return suggestions.map((item, index) => {
    const s = typeof item === "string" ? { label: item } : item;
    return { key: s.id ?? `${index}-${s.label}`, label: s.label, message: s.message ?? s.label };
  });
}

/**
 * FollowUp: próximas perguntas sugeridas depois de uma resposta. Um toque manda a mensagem
 * da sugestão como a próxima fala da pessoa; o app decide o envio em `onSelect`.
 */
export function FollowUp({ suggestions, onSelect, label, layout = "wrap", disabled = false, className, ...rest }: FollowUpProps) {
  const m = useComponentMessages("followUp", enMessages.followUp);
  const items = normalizeSuggestions(suggestions);
  if (!items.length) return null;
  return (
    <div role="group" aria-label={label ?? m.label} className={cn(styles.group, styles[layout], className)} {...rest}>
      {items.map((item) => (
        <button key={item.key} type="button" className={styles.pill} disabled={disabled} onClick={() => onSelect(item.message)}>
          <span className={styles.text}>{item.label}</span>
          <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>
        </button>
      ))}
    </div>
  );
}
