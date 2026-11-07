import type { InputCoreProps } from "../../contracts/input";
import field from "./Field.module.css";
import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { InputControl } from "./InputControl";
import styles from "./Input.module.css";

/** Props for the text Input field. */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix">, InputCoreProps {
  /** Uppercase mono label above the field. */
  label?: string;
  /** Help text below the field. */
  hint?: string;
  /** Error message (replaces the hint and colors the border). */
  error?: string;
  /** Fixed content on the left (icon or a prefix like "example.com/"). */
  prefix?: ReactNode;
  /** Fixed content on the right (icon or suffix). */
  suffix?: ReactNode;
  block?: boolean;
}

/**
 * Campo de texto do Refy. Rótulo mono uppercase e foco na cor da marca ativa.
 * Números/URLs devem usar a família mono via a prop `mono`… ou classe utilitária.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    prefix,
    suffix,
    block = true,
    className,
    id,
    disabled,
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    ...rest
  },
  ref
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helpId = fieldId && (error || hint) ? `${fieldId}-help` : undefined;
  return (
    <div className={cn(styles.field, block && styles.block, className)}>
      {label && (
        <label className={field.label} htmlFor={fieldId}>
          {label}
        </label>
      )}
      <div
        data-refy-field="" className={cn(field.surface, styles.shell, error && field.error, disabled && field.disabled)}
      >
        {prefix && <span className={styles.affix}>{prefix}</span>}
        <InputControl
          ref={ref}
          id={fieldId}
          disabled={disabled}
          aria-describedby={[describedBy, helpId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : invalid}
          {...rest}
        />
        {suffix && <span className={styles.affix}>{suffix}</span>}
      </div>
      {(error || hint) && (
        <p id={helpId} className={cn(styles.help, error && styles.helpError)}>{error || hint}</p>
      )}
    </div>
  );
});
