import type { ItemCoreProps } from "../../contracts/item";
import type { ReactNode } from 'react';
import { Button } from '../Button';
import { cn } from '../../lib/cn';
import styles from './Item.module.css';
export interface ItemProps extends ItemCoreProps {
  title: string;
  description?: ReactNode;
  media?: ReactNode;
  actions?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  /** Removes the surface to compose metadata inside another surface. */
  variant?: 'default' | 'plain';
}
export function Item({
  title,
  description,
  media,
  actions,
  onClick,
  selected,
  variant = 'default',
}: ItemProps) {
  const body = (
    <span className={styles.body}>
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </span>
  );
  return (
    <div className={cn(styles.item, variant === 'plain' && styles.plain, selected && styles.selected)}>
      {onClick ? (
        <Button
          variant="ghost"
          leadingIcon={media && <span className={styles.media}>{media}</span>}
          type="button"
          onClick={onClick}
          className={styles.action}
          aria-pressed={selected}
        >
          {body}
        </Button>
      ) : (
        <div className={styles.action}>
          {media && <span className={styles.media} aria-hidden="true">{media}</span>}
          {body}
        </div>
      )}
      {actions && <div>{actions}</div>}
    </div>
  );
}
