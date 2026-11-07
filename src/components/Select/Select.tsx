import type { SelectCoreProps } from "../../contracts/select";
import field from "../Input/Field.module.css";
import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Select.module.css";

/** Props for the Select field. */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, SelectCoreProps {
  label?: string;
  hint?: string;
  error?: string;
  block?: boolean;
  children: ReactNode;
}

/** Select nativo estilizado. Use <option>/<optgroup> como filhos. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      hint,
      error,
      block = true,
      className,
      id,
      disabled,
      children,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const helpId = error || hint ? `${fieldId}-help` : undefined;
    return (
      <div className={cn(styles.field, block && styles.block, className)}>
        {label && (
          <label className={field.label} htmlFor={fieldId}>
            {label}
          </label>
        )}
        <div
          data-refy-field=""
          className={cn(
            field.surface,
            styles.shell,
            error && field.error,
            disabled && field.disabled,
          )}
        >
          <select
            ref={ref}
            id={fieldId}
            className={styles.select}
            disabled={disabled}
            aria-invalid={error ? true : invalid}
            aria-describedby={
              [describedBy, helpId].filter(Boolean).join(" ") || undefined
            }
            {...rest}
          >
            {children}
          </select>
          <svg
            className={styles.caret}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        {(error || hint) && (
          <p id={helpId} className={cn(styles.help, error && styles.helpError)}>
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);
