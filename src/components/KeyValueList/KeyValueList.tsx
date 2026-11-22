import { useId } from "react";
import type { HTMLAttributes } from "react";
import type { KeyValueItem, KeyValueListCoreProps, KeyValueListLayout } from "../../contracts/display";
import { cn } from "../../lib/cn";
import styles from "./KeyValueList.module.css";

export type { KeyValueItem, KeyValueListLayout };

/** Props for the KeyValueList component. */
export interface KeyValueListProps extends KeyValueListCoreProps, Omit<HTMLAttributes<HTMLDListElement>, "children" | "title"> {}

/**
 * KeyValueList: pares de rótulo e valor, como ficha técnica, detalhes de pedido ou dados de
 * contato. Sai como `<dl>`, então o leitor de tela anuncia cada valor com o rótulo dele.
 */
export function KeyValueList({ items, layout = "rows", dividers, title, className, ...rest }: KeyValueListProps) {
  const lines = dividers ?? layout === "rows";
  const titleId = useId();
  const list = (
    <dl
      aria-labelledby={title != null ? titleId : undefined}
      className={cn(styles.list, styles[layout], lines && styles.dividers, title == null && className)}
      {...rest}
    >
      {items.map((item, index) => (
        <div className={styles.pair} key={item.id ?? index}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>
            {item.value}
            {item.hint != null && <span className={styles.hint}>{item.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
  if (title == null) return list;
  return (
    <div className={cn(styles.titled, className)}>
      <h3 id={titleId} className={styles.title}>{title}</h3>
      {list}
    </div>
  );
}
