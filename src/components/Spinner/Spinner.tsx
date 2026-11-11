import type { HTMLAttributes } from 'react';
import styles from './Spinner.module.css';
import { cn } from '../../lib/cn';
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export function Spinner({
  className,
  'aria-label': labelProp,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  const m = useComponentMessages("spinner", enMessages.spinner);
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
