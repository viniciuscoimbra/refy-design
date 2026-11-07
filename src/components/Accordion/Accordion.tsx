"use client";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { DisclosureRegion } from "../../lib/DisclosureRegion";
import { cn } from "../../lib/cn";
import styles from "./Accordion.module.css";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

/** Props for the Accordion component. */
export interface AccordionProps {
  items: AccordionItem[];
  /** single = only one open at a time; multiple = several. */
  type?: "single" | "multiple";
  /** Open IDs (controlled). */
  value?: string[];
  defaultValue?: string[];
  onChange?: (open: string[]) => void;
  className?: string;
  /** plain removes the outer box, keeping the dividers between items. */
  variant?: "default" | "plain" | "joined";
  /** Compact scale for dense compositions; default keeps the current scale. */
  size?: "default" | "sm";
  /** Also shows an arrow to the left of the title (">" closed, "∨" open). Default `false`. */
  leadingIndicator?: boolean;
  /** With `leadingIndicator`, indents the content to align with the title text, after the arrow. Default `false`. */
  indentContent?: boolean;
}

/**
 * Accordion — seções expansíveis funcionais. Abre/fecha de verdade, com
 * conteúdo dimensionado pela tipografia ativa. `single` (padrão) mantém um aberto; `multiple` permite vários.
 */
export function Accordion({
  items,
  type = "single",
  value,
  defaultValue = [],
  onChange,
  className,
  variant = "default",
  size = "default",
  leadingIndicator = false,
  indentContent = false,
}: AccordionProps) {
  const baseId = useId();
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const open = value ?? internal;

  function toggle(id: string) {
    const isOpen = open.includes(id);
    let next: string[];
    if (type === "single") next = isOpen ? [] : [id];
    else next = isOpen ? open.filter((x) => x !== id) : [...open, id];
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div
      className={cn(
        styles.wrap,
        variant === "plain" && styles.plain,
        variant === "joined" && styles.joined,
        size === "sm" && styles.small,
        leadingIndicator && indentContent && styles.indented,
        className,
      )}
    >
      {items.map((it, index) => {
        const isOpen = open.includes(it.id);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div
            key={it.id}
            className={cn(styles.item, isOpen && styles.itemOpen)}
          >
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.trigger}
                aria-expanded={isOpen}
                id={triggerId}
                aria-controls={panelId}
                disabled={it.disabled}
                onClick={() => toggle(it.id)}
              >
                {leadingIndicator && (
                  <svg className={styles.lead} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-refy-accordion-lead="">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                )}
                <span className={styles.title}>{it.title}</span>
                <svg
                  className={styles.chevron}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </h3>
            <DisclosureRegion
              open={isOpen}
              id={panelId}
              aria-labelledby={triggerId}
              className={styles.panel}
              role="region"
            >
              <div className={styles.panelInner}>{it.content}</div>
            </DisclosureRegion>
          </div>
        );
      })}
    </div>
  );
}
