import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import styles from './Input.module.css';

/** Controle do átomo Input, reutilizado por campos compostos que fornecem sua própria moldura. */
export const InputControl = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function InputControl({ className, ...props }, ref) {
  return <input {...props} ref={ref} className={cn(styles.input, className)} />;
});
