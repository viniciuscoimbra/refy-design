import type { TextareaCoreProps } from "../../contracts/textarea";
import field from "../Input/Field.module.css";
import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import styles from "./Textarea.module.css";

/** Props for the Textarea field. */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, TextareaCoreProps {
  label?: string;
  hint?: string;
  error?: string;
  block?: boolean;
}

/** Área de texto multi-linha. Mesmo chrome do Input, altura ajustável. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      block = true,
      className,
      id,
      disabled,
      rows = 3,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const helpId = `${fieldId}-help`;
    return (
      <div className={cn(styles.field, block && styles.block, className)}>
        {label && (
          <label className={field.label} htmlFor={fieldId}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          disabled={disabled}
          data-refy-field=""
          className={cn(
            field.surface,
            styles.textarea,
            error && field.error,
            disabled && field.disabled,
          )}
          {...rest}
          aria-invalid={error ? true : rest["aria-invalid"]}
          aria-describedby={
            [rest["aria-describedby"], (error || hint) && helpId]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
        {(error || hint) && (
          <p id={helpId} className={cn(styles.help, error && styles.helpError)}>
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);
