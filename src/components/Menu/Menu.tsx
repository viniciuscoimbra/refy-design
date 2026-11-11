"use client";
import { AnchoredSurface } from "../../lib/AnchoredSurface";
import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { Kbd } from "../Kbd";
import { cn } from "../../lib/cn";
import styles from "./Menu.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Item acionável, separador ou rótulo de seção. */
export type MenuEntry =
  | {
      type?: "item";
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      /** Atalho exibido em `kbd` à direita. */
      shortcut?: string;
      /** Metadado simples à direita, sem semântica de atalho. */
      meta?: ReactNode;
      /** Item destrutivo (vermelho). */
      danger?: boolean;
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: "separator" }
  | { type: "label"; label: ReactNode };

/** Props for the Menu popover. */
export interface MenuProps {
  id?: string;
  anchorPoint?: { x: number; y: number };
  /** Follows the width of the anchor group, also in compositions. */
  matchWidth?: boolean;
  /** Visible menu (controlled). */
  open: boolean;
  /** Close request: Esc, click outside or selection. */
  onOpenChange: (open: boolean) => void;
  entries: MenuEntry[];
  /** Fired when any item is chosen. */
  onSelect?: (id: string) => void;
  /** Anchor element (trigger). */
  children: ReactNode;
  /** Menu edge aligned to the start or end of the trigger. Default `start`. */
  align?: "start" | "end";
  /** Opening side relative to the trigger. Default `bottom`. */
  side?: "top" | "bottom";
  className?: string;
  ariaLabel?: string;
}

/**
 * Menu — lista de ações pop-up ancorada a um trigger.
 *
 * Suporta ícone, atalho em `kbd`, separadores, rótulos de seção e item
 * destrutivo (vermelho). ↑/↓ navegam, Enter aciona, Esc/clique fora fecham.
 * `role="menu"`/`menuitem` com `aria-activedescendant`. Controlado por
 * `open`/`onOpenChange`. Largura mínima 200px.
 *
 *   <Menu open={open} onOpenChange={setOpen} entries={acoes}>
 *     <IconButton aria-label="Mais" onClick={() => setOpen(!open)}>⋯</IconButton>
 *   </Menu>
 */
export function Menu({
  open,
  onOpenChange,
  entries,
  onSelect,
  children,
  align = "start",
  side = "bottom",
  className,
  ariaLabel: ariaLabelProp,
  id,
  matchWidth = false,
  anchorPoint,
}: MenuProps) {
  const m = useComponentMessages("menu", enMessages.menu);
  const ariaLabel = ariaLabelProp ?? m.label;
  const generatedId = useId();
  const menuId = id ?? generatedId;
  const initial = useRef("first");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(
    () => entries.filter((e): e is Extract<MenuEntry, { id: string }> => !e.type || e.type === "item"),
    [entries]
  );

  useLayoutEffect(() => {
    if (!open) return;
    const enabled = items.map((item, index) => item.disabled ? -1 : index).filter(index => index >= 0);
    setActiveIndex(initial.current === "last" ? enabled[enabled.length - 1] ?? -1 : enabled[0] ?? -1);
    initial.current = "first";
    wrapRef.current?.querySelector<HTMLElement>('[role="menu"]')?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) onOpenChange(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onOpenChange]);

  function restoreTrigger() {
    const trigger = wrapRef.current?.querySelector<HTMLElement>('[aria-haspopup="menu"]');
    if (trigger?.isConnected) trigger.focus();
  }

  function choose(item: Extract<MenuEntry, { id: string }>) {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item.id);
    onOpenChange(false);
    restoreTrigger();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); initial.current = e.key === "ArrowUp" ? "last" : "first"; onOpenChange(true);
      }
      return;
    }
    const enabled = items.map((item, index) => item.disabled ? -1 : index).filter(index => index >= 0);
    const cursor = enabled.indexOf(activeIndex);
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault(); e.stopPropagation();
        const offset = e.key === "ArrowDown" ? 1 : -1;
        setActiveIndex(enabled.length ? enabled[(cursor + offset + enabled.length) % enabled.length] : -1);
        break;
      }
      case "Home": e.preventDefault(); e.stopPropagation(); setActiveIndex(enabled[0] ?? -1); break;
      case "End": e.preventDefault(); e.stopPropagation(); setActiveIndex(enabled[enabled.length - 1] ?? -1); break;
      case "Enter":
      case " ":
        e.preventDefault(); e.stopPropagation();
        if (items[activeIndex]) choose(items[activeIndex]);
        break;
      case "Tab": onOpenChange(false); restoreTrigger(); break;
      case "Escape": e.preventDefault(); e.stopPropagation(); onOpenChange(false); restoreTrigger(); break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          const search = [...enabled.slice(cursor + 1), ...enabled.slice(0, cursor + 1)];
          const match = search.find(index => typeof items[index].label === "string" && (items[index].label as string).toLocaleLowerCase().startsWith(e.key.toLocaleLowerCase()));
          if (match !== undefined) { e.preventDefault(); setActiveIndex(match); }
        }
    }
  }

  let itemIndex = -1;
  const trigger = isValidElement<HTMLAttributes<HTMLElement>>(children) &&
    (typeof children.type === "string" ? ["button", "a", "input"].includes(children.type) || children.props.role === "button" : typeof children.type !== "symbol")
    ? cloneElement(children, { "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? menuId : undefined }) : children;

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)} onKeyDown={onKeyDown}>
      {trigger}
      {(
        <AnchoredSurface open={open} anchorPoint={anchorPoint} onClose={() => onOpenChange(false)} side={side} align={align} matchWidth={matchWidth}
          id={menuId} tabIndex={0} aria-label={ariaLabel}
          role="menu"
          aria-activedescendant={items[activeIndex] ? `${menuId}-${items[activeIndex].id}` : undefined}
          className={cn(styles.menu, align === "end" && styles.menuEnd, side === "top" && styles.menuTop)}
        >
          {entries.map((entry, i) => {
            if (entry.type === "separator") return <div key={`sep-${i}`} className={styles.sep} role="separator" />;
            if (entry.type === "label")
              return (
                <div key={`label-${i}`} className={styles.label}>
                  {entry.label}
                </div>
              );
            itemIndex += 1;
            const index = itemIndex;
            const isActive = index === activeIndex;
            return (
              <div
                key={entry.id}
                id={`${menuId}-${entry.id}`}
                role="menuitem"
                aria-disabled={entry.disabled || undefined}
                className={cn(
                  styles.item,
                  isActive && styles.active,
                  entry.danger && styles.danger,
                  entry.disabled && styles.itemDisabled
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(entry)}
              >
                {entry.icon && <span className={styles.icon}>{entry.icon}</span>}
                <span className={styles.itemLabel}>{entry.label}</span>
                {entry.meta && <span className={styles.meta}>{entry.meta}</span>}
                {entry.shortcut && <Kbd className={styles.kbd}>{entry.shortcut}</Kbd>}
              </div>
            );
          })}
        </AnchoredSurface>
      )}
    </div>
  );
}
