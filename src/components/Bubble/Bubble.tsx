import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import styles from './Bubble.module.css';
export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  side?: 'start' | 'end';
}
export function Bubble({ side = 'start', className, ...props }: BubbleProps) {
  return (
    <div
      {...props}
      className={cn(styles.bubble, side === 'end' && styles.end, className)}
    />
  );
}
