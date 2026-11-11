"use client";
import { InputControl } from "../Input/InputControl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnchoredSurface } from "../../lib/AnchoredSurface";
import { Avatar } from "../Avatar";
import { cn } from "../../lib/cn";
import styles from "./WorkspaceSwitcher.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface Workspace {
  id: string;
  name: string;
  /** Papel/plano exibido em mono (ex.: "Workspace · Pro"). */
  role?: string;
  initials: string;
}

/** Props for the workspace switcher combobox. */
export interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  /** Current workspace id (controlled). */
  value?: string;
  /** Initial workspace (uncontrolled). Default: first. */
  defaultValue?: string;
  onChange?: (workspace: Workspace) => void;
  /** Avatar only, no name (collapsed sidebar). */
  compact?: boolean;
  className?: string;
  "aria-describedby"?: string;
}

/**
 * WorkspaceSwitcher — seletor de workspace estilo combobox.
 *
 * Trigger com avatar quadrado + nome + papel + caret; abre um painel com
 * busca (quando há 5+ workspaces) e lista com check no atual. ↑/↓ + Enter,
 * Esc/clique fora fecham. Controlado (`value`/`onChange`) ou não-controlado.
 *
 *   <WorkspaceSwitcher workspaces={list} onChange={switchTo} />
 */
export function WorkspaceSwitcher({
  workspaces,
  value,
  defaultValue,
  onChange,
  compact,
  className,
  "aria-describedby": describedBy,
}: WorkspaceSwitcherProps) {
  const m = useComponentMessages("workspaceSwitcher", enMessages.workspaceSwitcher);
  const [internal, setInternal] = useState(defaultValue ?? workspaces[0]?.id);
  const currentId = value !== undefined ? value : internal;
  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const searchable = workspaces.length >= 5;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? workspaces.filter((w) => w.name.toLowerCase().includes(q)) : workspaces;
  }, [workspaces, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(Math.max(0, workspaces.findIndex((w) => w.id === currentId)));
      // Focus after the floating surface is shown; mount autofocus runs too early in WebKit.
      if (searchable) searchRef.current?.focus({ preventScroll: true });
      else listRef.current?.focus({ preventScroll: true });
    }
  }, [open, currentId, searchable]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(workspace: Workspace) {
    if (value === undefined) setInternal(workspace.id);
    onChange?.(workspace);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (filtered[activeIndex]) { e.preventDefault(); choose(filtered[activeIndex]); }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
        break;
    }
  }

  if (!current) return null;

  return (
    <div ref={wrapRef} className={cn(styles.wrap, className)} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(styles.trigger, compact && styles.triggerCompact)}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={m.current(current.name)}
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar size="md" initials={current.initials} shape="square" />
        {!compact && (
          <span className={styles.meta}>
            <span className={styles.name}>{current.name}</span>
            {current.role && <span className={styles.role}>{current.role}</span>}
          </span>
        )}
        {!compact && (
          <svg className={styles.caret} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
          </svg>
        )}
      </button>

      {(
        <AnchoredSurface open={open} className={styles.pop} onClose={() => setOpen(false)} side={compact ? "right" : "bottom"}>
          {searchable && (
            <div className={styles.searchRow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <InputControl
                ref={searchRef}
                role="combobox"
                aria-label={m.search}
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={filtered[activeIndex] ? `${listId}-${filtered[activeIndex].id}` : undefined}
                className={styles.searchInput}
                placeholder={m.searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
              />
            </div>
          )}
          <div ref={listRef} id={listId} role="listbox" tabIndex={-1} aria-label={m.list} aria-activedescendant={filtered[activeIndex] ? `${listId}-${filtered[activeIndex].id}` : undefined} className={styles.list}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>{m.empty}</div>
            ) : (
              filtered.map((workspace, index) => {
                const isCurrent = workspace.id === currentId;
                return (
                  <div
                    key={workspace.id}
                    id={`${listId}-${workspace.id}`}
                    role="option"
                    aria-selected={isCurrent}
                    className={cn(styles.option, index === activeIndex && styles.active)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(workspace)}
                  >
                    <Avatar size="sm" initials={workspace.initials} shape="square" />
                    <span className={styles.optionMeta}>
                      <span className={styles.optionName}>{workspace.name}</span>
                      {workspace.role && <span className={styles.optionRole}>{workspace.role}</span>}
                    </span>
                    {isCurrent && (
                      <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </AnchoredSurface>
      )}
    </div>
  );
}
