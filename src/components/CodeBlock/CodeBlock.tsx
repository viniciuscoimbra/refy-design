"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { IconButton } from "../IconButton";
import styles from "./CodeBlock.module.css";
import { highlight } from "./highlight";

import { useMessages } from "../../lib/locale";
/** Props for the CodeBlock component. */
export interface CodeBlockProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onCopy"
> {
  /** Actual block content: what the copy button puts on the clipboard. */
  code: string;
  /** Custom rendering (e.g. highlight). Ignored while `secret` is masked. */
  children?: ReactNode;
  /** Block label. E.g. "Production API key". */
  label?: ReactNode;
  /** Language for automatic highlighting: tsx, ts, js, json, css, html, bash. Unknown uses plain text. */
  language?: string;
  /** Masks the content (API keys) with a reveal toggle. Copy copies the real value. */
  secret?: boolean;
  /** Number of trailing characters visible in `secret` mode. */
  visibleChars?: number;
  /** aria-label of the copy button. */
  copyLabel?: string;
  /** Visible/announced feedback after copying. */
  copiedLabel?: string;
  /** aria-label of the toggle when masked. */
  revealLabel?: string;
  /** aria-label of the toggle when revealed. */
  hideLabel?: string;
  /** Called after a successful copy. */
  onCopy?: (code: string) => void;
  /** Wraps long lines instead of scrolling horizontally (narrow columns). Default `false`. */
  wrap?: boolean;
}

const copyIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const checkIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
);
const eyeIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const eyeOffIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

function maskSecret(code: string, visibleChars: number): string {
  const bullets = "•".repeat(16);
  if (visibleChars <= 0 || code.length <= visibleChars) return bullets;
  return bullets + code.slice(-visibleChars);
}

/** Copia via Clipboard API com fallback de textarea (contextos sem `navigator.clipboard`). */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* cai no fallback */
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

/**
 * Bloco de código copiável, monoespaçado, com scroll horizontal próprio.
 * `secret` mascara o conteúdo (chaves de API) com toggle revelar — copiar
 * sempre copia o valor real. Feedback "Copiado" visível e anunciado
 * (`role="status"` + aria-live).
 */
export function CodeBlock({
  code,
  children,
  label,
  language,
  secret = false,
  visibleChars = 4,
  copyLabel: copyLabelProp,
  copiedLabel: copiedLabelProp,
  revealLabel: revealLabelProp,
  hideLabel: hideLabelProp,
  onCopy,
  wrap = false,
  className,
  ...rest
}: CodeBlockProps) {
  const m = useMessages("codeBlock");
  const copyLabel = copyLabelProp ?? m.copy;
  const copiedLabel = copiedLabelProp ?? m.copied;
  const revealLabel = revealLabelProp ?? m.reveal;
  const hideLabel = hideLabelProp ?? m.hide;
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    await copyText(code);
    onCopy?.(code);
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  const masked = secret && !revealed;
  const syntax = useMemo(
    () => (masked || children != null ? null : highlight(code, language)),
    [code, language, masked, children],
  );
  const display: ReactNode = masked
    ? maskSecret(code, visibleChars)
    : (children ?? syntax);
  const hasHead = label != null || language != null || secret;

  const actions = (
    <div className={styles.actions}>
      <span className={styles.copied} role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
      {secret && (
        <IconButton
          className={styles.action}
          size="sm"
          icon={revealed ? eyeOffIcon : eyeIcon}
          aria-label={revealed ? hideLabel : revealLabel}
          aria-pressed={revealed}
          onClick={() => setRevealed((r) => !r)}
        />
      )}
      <IconButton
        className={cn(styles.action, copied && styles.actionCopied)}
        size="sm"
        icon={copied ? checkIcon : copyIcon}
        aria-label={copyLabel}
        onClick={handleCopy}
      />
    </div>
  );

  return (
    <div data-refy-code="" className={cn(styles.block, className)} {...rest}>
      {hasHead && (
        <div className={styles.head}>
          <span className={styles.headInfo}>
            {label && <span className={styles.label}>{label}</span>}
            {language && <span className={styles.language}>{language}</span>}
          </span>
          {actions}
        </div>
      )}
      <div className={styles.body}>
        <pre
          className={styles.pre}
          tabIndex={0}
          aria-label={typeof label === "string" ? label : language}
        >
          <code className={cn(styles.code, wrap && styles.wrap)}>{display}</code>
        </pre>
        {!hasHead && <div className={styles.overlay}>{actions}</div>}
      </div>
    </div>
  );
}
