"use client";
import { useState } from "react";
import { IconButton } from "../IconButton";
import { Menu, type MenuEntry } from "../Menu";
import { cn } from "../../lib/cn";
import styles from "./HelpMenu.module.css";

import { useMessages } from "../../lib/locale";
import type { RefyMessages } from "../../lib/locale";
/** Props for the HelpMenu component. */
export interface HelpMenuProps {
  /** Menu items. Default: Documentation, Shortcuts, ─, Contact support. */
  entries?: MenuEntry[];
  onSelect?: (id: string) => void;
  /** Accessible label. */
  label?: string;
  className?: string;
}

const defaultEntries = (m: RefyMessages["helpMenu"]): MenuEntry[] => [
  { id: "docs", label: m.docs },
  { id: "shortcuts", label: m.shortcuts, shortcut: "⌘K" },
  { type: "separator" },
  { id: "support", label: m.support },
];

/**
 * HelpMenu — botão "?" que abre o menu de ajuda.
 *
 * Compõe `IconButton` (lg, mesmo tamanho do NotificationBell) + `Menu` com
 * itens padrão (Documentação, Atalhos, Suporte), customizáveis via
 * `entries`. Alinhado ao fim (canto da topbar).
 *
 *   <HelpMenu onSelect={(id) => id === "docs" && openDocs()} />
 */
export function HelpMenu({ entries: entriesProp, onSelect, label: labelProp, className }: HelpMenuProps) {
  const m = useMessages("helpMenu");
  const entries = entriesProp ?? defaultEntries(m);
  const label = labelProp ?? m.label;
  const [open, setOpen] = useState(false);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      entries={entries}
      onSelect={onSelect}
      align="end"
      className={className}
    >
      <IconButton
        size="lg"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(open && styles.open)}
        onClick={() => setOpen((v) => !v)}
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
      />
    </Menu>
  );
}
