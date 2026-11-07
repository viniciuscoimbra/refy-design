import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import styles from './Prose.module.css';

/** Props for the Prose component. */
export interface ProseProps extends HTMLAttributes<HTMLDivElement> {
  /** `text` limits the line to the reading measure (`--prose-measure`) and centers it; `full` fills the whole column, for docs with a menu and table of contents beside it. Default `text`. */
  measure?: 'text' | 'full';
}
export function Prose({ className, measure = 'text', ...props }: ProseProps) {
  return <div {...props} className={cn(styles.prose, measure === 'full' && styles.full, className)} />;
}
