"use client";
import { inertAttribute } from "../../lib/inertAttribute";
import { usePresence } from "../../lib/usePresence";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "../IconButton";
import styles from "./Callout.module.css";

import { useMessages } from "../../lib/locale";
export type CalloutTone = "info" | "note" | "success" | "warn" | "danger" | "upsell";

/** Props for the Callout component. */
export interface CalloutProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Banner semantic tone (default: "info"). */
  tone?: CalloutTone;
  /** Icon on the left (the DS bundles no icons; pass one by prop). */
  icon?: ReactNode;
  /** Banner title. */
  title: ReactNode;
  /** Banner body. */
  children?: ReactNode;
  /** Optional action on the right (e.g. `<Button size="sm">Upgrade</Button>`). */
  action?: ReactNode;
  /** Shows the close button. The banner leaves with a transition and unmounts. */
  dismissible?: boolean;
  /** Called after the banner leaves (end of the transition). */
  onDismiss?: () => void;
  /** Accessible label of the close button (default: "Dismiss notice", in the active language). */
  dismissLabel?: string;
}

/**
 * Banner ESTÁTICO inline: contexto que pertence à página (dica de first-run,
 * nota explicativa, aviso de limite, upsell de plano). Não é transiente —
 * a fronteira com Toast/Snackbar está documentada na story.
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(
  function Callout(
    {
      tone = "info",
      icon,
      title,
      children,
      action,
      dismissible = false,
      onDismiss,
      dismissLabel: dismissLabelProp,
      className,
      ...rest
    },
    ref,
  ) {
    const m = useMessages("callout");
    const dismissLabel = dismissLabelProp ?? m.dismiss;
    const [closing, setClosing] = useState(false);
    const node = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => node.current!, []);
    const present = usePresence(!closing, node);
    const done = useRef(false);
    useEffect(() => {
      if (closing && !present && !done.current) {
        done.current = true;
        onDismiss?.();
      }
    }, [closing, present, onDismiss]);
    if (!present) return null;

    return (
      <div
        ref={node}
        role="note"
        className={cn(
          styles.callout,
          styles[tone],
          closing && styles.closing,
          className,
        )}
        inert={inertAttribute(closing)}
        {...rest}
      >
        {icon != null && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <div className={styles.body}>
          <p className={styles.title}>{title}</p>
          {children != null && <div className={styles.text}>{children}</div>}
        </div>
        {action != null && <div className={styles.action}>{action}</div>}
        {dismissible && (
          <IconButton
            size="sm"
            variant="ghost"
            className={styles.close}
            aria-label={dismissLabel}
            onClick={() => setClosing(true)}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            }
          />
        )}
      </div>
    );
  },
);
