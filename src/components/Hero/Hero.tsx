import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import styles from "./Hero.module.css";

/** Props for the Hero first fold. */
export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Main title (becomes `<h1>`). */
  title: ReactNode;
  /** End of the title in the theme's accent color (e.g. the period). */
  accent?: ReactNode;
  /** Lead sentence under the title. */
  lead?: ReactNode;
  /** Main actions (buttons, links). */
  actions?: ReactNode;
  /** Strip above the title: switcher, badge or overline. */
  top?: ReactNode;
  /** Content below the hero (demo, image). */
  children?: ReactNode;
  /** Gives View Transition names to the parts, so the theme switch animates each one. */
  transitionNames?: boolean;
}

/**
 * Hero — primeira dobra de uma página. A composição inteira vem do tema: alinhamento,
 * colunas e áreas (`--hero-columns`, `--hero-areas`), título (`--hero-title-*`), destaque,
 * frase de apoio e posição das ações. Trocar o arquivo de tema troca o arranjo.
 */
export const Hero = forwardRef<HTMLElement, HeroProps>(function Hero(
  { title, accent, lead, actions, top, children, transitionNames = false, className, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cn(styles.hero, transitionNames && styles.named, className)} {...rest}>
      <div className={styles.fold}>
        {top && <div className={styles.top} data-hero-part="">{top}</div>}
        <h1 className={styles.title} data-hero-part="">
          {title}
          {accent && <span className={styles.accent}>{accent}</span>}
        </h1>
        {lead && <p className={styles.lead} data-hero-part="">{lead}</p>}
        {actions && <div className={styles.actions} data-hero-part="">{actions}</div>}
      </div>
      {children && <div className={styles.media} data-hero-part="">{children}</div>}
    </section>
  );
});
