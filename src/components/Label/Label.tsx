import type { LabelHTMLAttributes } from 'react';
import field from '../Input/Field.module.css';
import { cn } from '../../lib/cn';
export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn(field.label, className)} />;
}
