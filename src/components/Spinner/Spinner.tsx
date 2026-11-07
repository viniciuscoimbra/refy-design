import type { HTMLAttributes } from 'react';
import styles from './Spinner.module.css';
import { cn } from '../../lib/cn';
import { useMessages } from "../../lib/locale";
export function Spinner({
  className,
  'aria-label': labelProp,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  const m = useMessages("spinner");
  const label = labelProp ?? m.loading;
  return (
    <span
      {...props}
      role="status"
      aria-label={label}
      className={cn(styles.spinner, className)}
    />
  );
}
