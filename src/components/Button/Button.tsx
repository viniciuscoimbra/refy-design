import type { ButtonCoreProps } from "../../contracts/button";
import { forwardRef } from "react";
import type React from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonStatus = "idle" | "loading" | "success" | "error";
export type ButtonProgressEffect =
  | "spinner"
  | "fill-horizontal"
  | "fill-vertical"
  | "shrink-horizontal"
  | "shrink-vertical"
  | "rotate-angle-bottom"
  | "rotate-angle-top"
  | "rotate-angle-left"
  | "rotate-angle-right"
  | "rotate-side-down"
  | "rotate-side-up"
  | "rotate-side-left"
  | "rotate-side-right"
  | "rotate-back"
  | "flip-open"
  | "slide-down"
  | "move-up"
  | "top-line"
  | "lateral-lines";

/** Props for the base Refy button. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonCoreProps {
  /** Visual hierarchy. Primary uses the text set by the on-primary token. */
  variant?: ButtonVariant;
  /** Web: `field` makes the button read as a field (search, picker), with field background and text. */
  appearance?: "default" | "field";
  /** With `href`, the button is a link (`<a>`) with the same look. Disabled or loading, it goes back to being a button. */
  href?: string;
  /** Link target when there is an `href`. */
  target?: string;
  /** Link `rel`; with `target="_blank"` the default is `noreferrer`. */
  rel?: string;
  /** Visual preview of a linked gesture; it does not click or change disabled. */
  interactionState?: "hover" | "pressed";
  size?: ButtonSize;
  /** Icon to the left of the label (16px recommended). */
  leadingIcon?: ReactNode;
  /** Icon to the right of the label. */
  trailingIcon?: ReactNode;
  /** Shows a spinner and blocks clicks. */
  loading?: boolean;
  /** Explicit state to show completion or error; `loading` stays compatible. */
  status?: ButtonStatus;
  /** Loading: spinner, fill or line. Older spin/shrink options use the line without hiding the label. */
  progressEffect?: ButtonProgressEffect;
  /** Accessible/visible label while processing. */
  loadingLabel?: ReactNode;
  /** Takes 100% of the container width. */
  block?: boolean;
}

/**
 * Botão base do Refy. Texto de ação curto, em português, sem hype.
 * O contraste depende dos tokens e estados da identidade aplicada.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "secondary",
      interactionState,
      size = "md",
      leadingIcon,
      trailingIcon,
      loading = false,
      status = "idle",
      progressEffect = "spinner",
      loadingLabel,
      block = false,
      disabled,
      type,
      className,
      children,
      href,
      target,
      rel,
      appearance = "default",
      ...rest
    },
    ref,
  ) {
    const currentStatus: ButtonStatus = loading ? "loading" : status;
    const isLoading = currentStatus === "loading";
    const hasFeedback =
      currentStatus === "success" || currentStatus === "error";

    const content = (
      <>
        {isLoading && progressEffect !== "spinner" && (
          <>
            <span className={styles.progress} aria-hidden="true" />
            </>
        )}
        {isLoading && progressEffect === "spinner" && (
          <span className={styles.spinner} aria-hidden="true" />
        )}
        {!isLoading && !hasFeedback && leadingIcon && (
          <span className={styles.icon}>{leadingIcon}</span>
        )}
        {hasFeedback && (
          <span className={styles.feedbackIcon} aria-hidden="true">
            {currentStatus === "success" ? "✓" : "×"}
          </span>
        )}
        {children && (
          <span className={styles.label}>
            {isLoading ? (loadingLabel ?? children) : children}
          </span>
        )}
        {!isLoading && !hasFeedback && trailingIcon && (
          <span className={styles.icon}>{trailingIcon}</span>
        )}
      </>
    );
    if (href && !disabled && !isLoading) {
      const { onClick, id, title, style, tabIndex } = rest;
      return (
        <a
          ref={ref as unknown as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={rel ?? (target === "_blank" ? "noreferrer" : undefined)}
          data-refy-interaction={interactionState}
          className={cn(
          styles.btn,
          styles[variant],
          appearance === "field" && styles.field,
          styles[size],
          block && styles.block,
          styles[currentStatus],
          isLoading &&
            styles[
              `effect-${["spinner", "fill-horizontal", "fill-vertical"].includes(progressEffect) ? progressEffect : "top-line"}`
            ],
          className,
        )}
          data-status={currentStatus}
          onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
          id={id}
          title={title}
          style={style}
          tabIndex={tabIndex}
          aria-label={rest["aria-label"]}
        >
          {content}
        </a>
      );
    }
    return (
      <button
        ref={ref}
        data-refy-interaction={interactionState}
        type={type}
        className={cn(
          styles.btn,
          styles[variant],
          appearance === "field" && styles.field,
          styles[size],
          block && styles.block,
          styles[currentStatus],
          isLoading &&
            styles[
              `effect-${["spinner", "fill-horizontal", "fill-vertical"].includes(progressEffect) ? progressEffect : "top-line"}`
            ],
          className,
        )}
        disabled={disabled || isLoading}
        data-status={currentStatus}
        {...rest}
        aria-busy={isLoading || rest["aria-busy"] || undefined}
      >
        {content}
      </button>
    );
  },
);
