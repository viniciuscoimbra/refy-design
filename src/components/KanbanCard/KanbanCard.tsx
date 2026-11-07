import type { ReactNode } from "react";
import { Button } from "../Button";
import { Card, type CardProps } from "../Card";
import { cn } from "../../lib/cn";
import styles from "./KanbanCard.module.css";

export interface KanbanCardItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  footer?: ReactNode;
}
export interface KanbanCardProps extends Omit<CardProps, "children" | "title"> {
  item: KanbanCardItem;
  onOpen?: () => void;
  dragHandle?: ReactNode;
  actions?: ReactNode;
}
/** O mesmo card compõe a coluna e a prévia do arraste; regras pertencem ao quadro. */
export function KanbanCard({ item, onOpen, dragHandle, actions, className, elevation = 1, ...rest }: KanbanCardProps) {
  return <Card role="article" elevation={elevation} padding="sm" className={cn(styles.card, className)} {...rest}>
    <div className={styles.header}>
      {item.leading && <span className={styles.leading}>{item.leading}</span>}
      <h3>{onOpen ? <Button variant="ghost" size="sm" type="button" onClick={onOpen}>{item.title}</Button> : item.title}</h3>
      {/* Handle and actions sit at the trailing edge, so the title shares the body's inset. */}
      {(dragHandle || actions) && <span className={styles.controls}>{dragHandle}{actions}</span>}
    </div>
    {item.description && <div className={styles.description}>{item.description}</div>}
    {item.meta && <div className={styles.meta}>{item.meta}</div>}
    {item.footer && <footer>{item.footer}</footer>}
  </Card>;
}
