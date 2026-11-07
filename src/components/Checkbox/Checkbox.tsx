import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Checkbox.module.css";

/** Props for the accessible Checkbox control. */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label to the right of the box. */
  label?: ReactNode;
  /** Supporting text below the label. */
  description?: ReactNode;
  /**
   * Inline tag after the label (e.g. `<Badge tone="danger">destructive</Badge>`
on a dangerous permission). Slot: the atom does not bundle text.
   */
  tag?: ReactNode;
  /** Mono meta on the right of the row (e.g. "42k clicks / 28d"). */
  meta?: ReactNode;
  /**
   * Boxed variant: a selectable row with a border (property lists,
choices in a modal). The border lights up when checked.
   */
  boxed?: boolean;
}

/** Caixa de seleção com check customizado, mantendo o input nativo no DOM. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, tag, meta, boxed = false, className, id, disabled, ...rest },
  ref
) {
  const fieldId = id || rest.name;
  return (
    <label
      className={cn(styles.row, boxed && styles.boxed, disabled && styles.disabled, className)}
      htmlFor={fieldId}
    >
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className={styles.input}
        disabled={disabled}
        {...rest}
      />
      <span className={styles.box} aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {(label || description) && (
        <span className={styles.text}>
          {label && (
            <span className={styles.label}>
              {label}
              {tag != null && <span className={styles.tag}>{tag}</span>}
            </span>
          )}
          {description && <span className={styles.desc}>{description}</span>}
        </span>
      )}
      {meta != null && <span className={styles.meta}>{meta}</span>}
    </label>
  );
});
