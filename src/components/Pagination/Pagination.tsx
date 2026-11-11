import { cn } from "../../lib/cn";
import styles from "./Pagination.module.css";

import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
/** Props for the Pagination control. */
export interface PaginationProps {
  /** Current page (1-based, controlled). */
  page: number;
  /** Total pages. */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Visible neighbors on each side of the current page. Default 1. */
  siblingCount?: number;
  className?: string;
}

/** Gera a sequência 1 … páginas vizinhas … última, com reticências. */
function pages(page: number, pageCount: number, siblingCount: number): Array<number | "…"> {
  const window = 2 * siblingCount + 5; // primeira + última + atual + vizinhos + 2 reticências
  if (pageCount <= window) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.max(2, page - siblingCount);
  const end = Math.min(pageCount - 1, page + siblingCount);
  const out: Array<number | "…"> = [1];
  if (start > 2) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}

/**
 * Pagination — paginação numérica em mono.
 *
 * Página ativa em ink-1 (preto), demais ghost; setas anterior/próximo nas
 * extremidades desabilitam nos limites; reticências colapsam trechos longos.
 * Controlada: `page` + `onPageChange`. `<nav>` com `aria-current="page"`.
 *
 *   <Pagination page={page} pageCount={12} onPageChange={setPage} />
 */
export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, className }: PaginationProps) {
  const m = useComponentMessages("pagination", enMessages.pagination);
  const go = (p: number) => onPageChange(Math.max(1, Math.min(pageCount, p)));
  return (
    <nav aria-label={m.label} className={cn(styles.pagination, className)}>
      <button
        type="button"
        className={styles.btn}
        aria-label={m.prev}
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        ‹
      </button>
      {pages(page, pageCount, siblingCount).map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className={styles.ellipsis} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={cn(styles.btn, p === page && styles.active)}
            aria-label={m.page(p)}
            aria-current={p === page ? "page" : undefined}
            onClick={() => go(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        className={styles.btn}
        aria-label={m.next}
        disabled={page >= pageCount}
        onClick={() => go(page + 1)}
      >
        ›
      </button>
    </nav>
  );
}
