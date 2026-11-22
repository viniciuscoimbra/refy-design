import type { HTMLAttributes, ReactNode } from "react";
import type { ComparisonRow, ComparisonTableCoreProps, ComparisonValue } from "../../contracts/display";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import styles from "./ComparisonTable.module.css";

export type { ComparisonRow, ComparisonValue };

/** Props for the ComparisonTable component. */
export interface ComparisonTableProps extends ComparisonTableCoreProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {}

function Cell({ value, yes, no }: { value: ComparisonValue; yes: string; no: string }): ReactNode {
  if (value === true)
    return (
      <span className={styles.yes}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        <span className={styles.sr}>{yes}</span>
      </span>
    );
  if (value === false || value == null)
    return (
      <span className={styles.no}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 12h10" /></svg>
        <span className={styles.sr}>{no}</span>
      </span>
    );
  return value as ReactNode;
}

/**
 * ComparisonTable: opções lado a lado, um critério por linha. Sim e não viram marca com texto
 * para leitor de tela; a opção recomendada ganha selo e coluna tingida. Rola na horizontal
 * com o nome do critério fixo quando as colunas não cabem.
 */
export function ComparisonTable({ options, rows, highlight, highlightLabel, caption, className, ...rest }: ComparisonTableProps) {
  const m = useComponentMessages("comparisonTable", enMessages.comparisonTable);
  const badge = highlightLabel ?? m.recommended;
  const hot = (index: number) => (index === highlight ? styles.highlight : undefined);
  return (
    <div className={cn(styles.wrap, className)} role="region" aria-label={caption} tabIndex={0} {...rest}>
      <table className={styles.table}>
        <caption className={styles.sr}>{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.corner}><span className={styles.sr}>{m.feature}</span></th>
            {options.map((option, index) => (
              <th scope="col" key={option} className={cn(styles.option, hot(index))}>
                {index === highlight && <span className={styles.badge}>{badge}</span>}
                <span className={styles.name}>{option}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row.id ?? r}>
              <th scope="row" className={styles.feature}>
                {row.feature}
                {row.hint != null && <span className={styles.hint}>{row.hint}</span>}
              </th>
              {options.map((option, index) => (
                <td key={option} className={cn(styles.cell, hot(index))}>
                  <Cell value={row.values[index]} yes={m.yes} no={m.no} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
