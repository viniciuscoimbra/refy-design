"use client";
import type { ModalCoreProps } from "../../contracts/modal";
import { usePresence } from "../../lib/usePresence";
import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useDialogFocusTrap } from "../../lib/useDialogFocusTrap";
import { IconButton } from "../IconButton";
import styles from "./Modal.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
const CloseIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

/** Props for the Modal dialog. */
export interface ModalProps extends ModalCoreProps {
  role?: "dialog" | "alertdialog";
  hideCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  ariaDescribedBy?: string;
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Accessible name when there is no visible title. */
  ariaLabel?: string;
  /** Footer actions (buttons). No footer if absent. */
  footer?: ReactNode;
  /** Max width in px. Default 520. */
  width?: number;
  children: ReactNode;
  className?: string;
}

/** Modal centralizado com scrim, fecha no Esc / clique fora / botão ✕. */
export function Modal({ role = "dialog", hideCloseButton = false, closeOnBackdrop = true, ariaDescribedBy, open, onClose, title, ariaLabel: ariaLabelProp, footer, width = 520, children, className }: ModalProps) {
  const m = useComponentMessages("modal", enMessages.modal);
  const common = useComponentMessages("common", enMessages.common);
  const ariaLabel = ariaLabelProp ?? m.label;
  const modalRef = useRef<HTMLDivElement>(null);
  const present = usePresence(open, modalRef);
  const titleId = useId();
  useDialogFocusTrap(present, modalRef, onClose);

  if (!present) return null;

  return (
    <div className={styles.scrim} data-motion-state={open ? "open" : "closing"} onClick={open && closeOnBackdrop ? onClose : undefined}>
      <div
        ref={modalRef}
        data-motion-state={open ? "open" : "closing"}
        onClickCapture={open ? undefined : event => { event.preventDefault(); event.stopPropagation(); }}
        onKeyDownCapture={open ? undefined : event => { event.preventDefault(); event.stopPropagation(); }}
        role={role}
        aria-modal="true"
        aria-describedby={ariaDescribedBy}
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        className={cn(styles.modal, className)}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            {!hideCloseButton && <IconButton icon={CloseIcon} aria-label={common.close} variant="ghost" onClick={onClose} />}
          </header>
        )}
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  );
}
