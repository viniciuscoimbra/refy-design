import { forwardRef } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./SiteFooter.module.css";

export interface SiteFooterLink {
  label: ReactNode;
  href: string;
  /** Abre em outra aba; mostra ↗ quando o rodapé tem `externalIcon`. */
  external?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}
export interface SiteFooterColumn {
  title: string;
  links: SiteFooterLink[];
}

/** Props for the SiteFooter. */
export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  /** Brand (e.g. `BrandLogo`). */
  brand?: ReactNode;
  /** Short line under the brand. */
  tagline?: ReactNode;
  /** Link columns, each with its own title and navigation. */
  columns: SiteFooterColumn[];
  /** Credits on the left of the bottom line. */
  credits?: ReactNode;
  /** Year, license or notice on the right of the bottom line. */
  legal?: ReactNode;
  /** `columns` stacks the links under the title; `inline` puts brand and links in a single band, for sites with few links. */
  layout?: "columns" | "inline";
  /** Site preferences, such as language and color mode, aligned to the right below the links. */
  settings?: ReactNode;
  /** Shows ↗ after external links. Off when every link should read the same and the column title already names the destination. */
  externalIcon?: boolean;
}

/** SiteFooter — rodapé de site: marca, linha curta, colunas de links e créditos. */
export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(function SiteFooter(
  { brand, tagline, columns, credits, legal, settings, layout = "columns", externalIcon = true, className, style, ...rest },
  ref,
) {
  return (
    <footer ref={ref} className={cn(styles.footer, layout === "inline" && styles.inline, className)} style={{ ["--site-footer-columns" as string]: columns.length, ...style }} {...rest}>
      <div className={styles.grid}>
        <div className={styles.identity}>
          {brand}
          {tagline && <p className={styles.tagline}>{tagline}</p>}
        </div>
        {columns.map((column) => (
          <nav key={column.title} className={styles.column} aria-label={column.title}>
            <h2 className={styles.heading}>{column.title}</h2>
            {column.links.map((link) => (
              <a
                key={link.href}
                className={styles.link}
                href={link.href}
                onClick={link.onClick}
                {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {link.label}{link.external && externalIcon && " ↗"}
              </a>
            ))}
          </nav>
        ))}
        {settings && <div className={styles.settings}>{settings}</div>}
      </div>
      {(credits || legal) && (
        <div className={styles.bottom}>
          <span>{credits}</span>
          <span>{legal}</span>
        </div>
      )}
    </footer>
  );
});
