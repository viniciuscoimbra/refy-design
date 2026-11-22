"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import type { CitationCoreProps, CitationSource } from "../../contracts/media-links";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import { SiteMark } from "../LinkCard/LinkCard";
import { domainOf } from "../LinkCard/domain";
import styles from "./Citation.module.css";

export type { CitationSource };

/** Props for the Citation component. */
export interface CitationProps extends CitationCoreProps, Omit<HTMLAttributes<HTMLSpanElement>, "children"> {}

/**
 * Citation: marcador de fonte [1] dentro do texto. Apontar ou focar mostra o título, o trecho
 * que sustenta a frase e o link; clicar fixa o painel. Só usa elementos de linha, então cabe
 * dentro de um parágrafo.
 */
export function Citation({ index, source, className, ...rest }: CitationProps) {
  const m = useComponentMessages("citation", enMessages.citation);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const root = useRef<HTMLSpanElement>(null);
  const panelId = useId();
  const site = source.siteName ?? (source.href ? domainOf(source.href) : "");
  const name = m.source(index, source.title);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) { setPinned(false); setOpen(false); }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  const close = () => { setPinned(false); setOpen(false); };
  return (
    <span
      ref={root}
      className={cn(styles.citation, className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => !pinned && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => { if (!pinned && !root.current?.contains(event.relatedTarget as Node)) setOpen(false); }}
      onKeyDown={(event) => { if (event.key === "Escape" && open) { event.stopPropagation(); close(); } }}
      {...rest}
    >
      <button
        type="button"
        className={styles.marker}
        aria-label={name}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => { const next = !pinned; setPinned(next); setOpen(next); }}
      >
        {index}
      </button>
      {open && (
        <span id={panelId} role="note" aria-label={name} className={styles.panel}>
          {site && (
            <span className={styles.site}>
              <SiteMark favicon={source.favicon} site={site} />
              <span>{site}</span>
            </span>
          )}
          <span className={styles.title}>{source.title}</span>
          {source.snippet != null && <span className={styles.snippet}>{source.snippet}</span>}
          {source.href && (
            <a className={styles.link} href={source.href} target="_blank" rel="noopener noreferrer">
              {m.open}
            </a>
          )}
        </span>
      )}
    </span>
  );
}
