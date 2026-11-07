import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./PersonCell.module.css";

/** Props for the PersonCell display cell. */
export interface PersonCellProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Leading slot: `Avatar` (circle for a person, `shape="square"` for an entity:
project, workspace, organization). Composition: the atom comes from outside.
   */
  avatar?: ReactNode;
  /** Name (main line). */
  name: ReactNode;
  /** Inline suffix after the name (e.g. mono "you", role `Badge`). */
  tag?: ReactNode;
  /** Secondary line (email, description, entity meta). */
  secondary?: ReactNode;
  /** Density: `sm` for compact table cells, `md` for lists. */
  size?: "sm" | "md";
}

/**
 * PersonCell — célula padrão de pessoa/entidade: `Avatar` + nome (+ tag
 * inline) + linha secundária. Display puro (não clicável); vive dentro de
 * `Table`, listas e menus.
 */
export function PersonCell({
  avatar,
  name,
  tag,
  secondary,
  size = "md",
  className,
  ...rest
}: PersonCellProps) {
  return (
    <div className={cn(styles.cell, styles[size], className)} {...rest}>
      {avatar != null && <span className={styles.avatar}>{avatar}</span>}
      <span className={styles.info}>
        <span className={styles.name}>
          {name}
          {tag != null && <span className={styles.tag}>{tag}</span>}
        </span>
        {secondary != null && <span className={styles.secondary}>{secondary}</span>}
      </span>
    </div>
  );
}
