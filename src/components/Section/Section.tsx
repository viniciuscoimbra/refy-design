import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Section.module.css";

export type SectionLayout = "split" | "stacked" | "columns";

/** Props for the Section layout. */
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** `split`: text and proof side by side; `stacked`: text above the proof; `columns`: the theme's column grid. */
  layout?: SectionLayout;
  /** In `split`, puts the proof before the text on wide screens (zigzag). On the phone, the text comes first. */
  reverse?: boolean;
  /** In `split`, gives the proof more width. */
  wide?: boolean;
  /** The section's proof or media (in `split` and `stacked`). */
  aside?: ReactNode;
  children?: ReactNode;
}

/**
 * Section — bloco de página. `split` alterna texto e prova com `reverse`; `columns` distribui
 * os filhos pela grade do tema (`--section-columns`) e na ordem do tema (`--section-order-1..4`).
 */
export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  { layout = "split", reverse = false, wide = false, aside, className, children, ...rest },
  ref,
) {
  if (layout === "columns")
    return <section ref={ref} className={cn(styles.columns, className)} {...rest}>{children}</section>;
  return (
    <section
      ref={ref}
      className={cn(styles.section, styles[layout], reverse && styles.reverse, wide && styles.wide, className)}
      {...rest}
    >
      <div className={styles.text}>{children}</div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </section>
  );
});
