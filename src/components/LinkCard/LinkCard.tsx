import type { AnchorHTMLAttributes } from "react";
import type { LinkCardCoreProps, LinkCardLayout } from "../../contracts/media-links";
import { cn } from "../../lib/cn";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import { domainOf } from "./domain";
import styles from "./LinkCard.module.css";

export type { LinkCardLayout };

/** Props for the LinkCard component. */
export interface LinkCardProps extends LinkCardCoreProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "title" | "href"> {}

/** Ícone do site; sem endereço, a inicial do domínio. Nada é buscado fora. */
export function SiteMark({ favicon, site, className }: { favicon?: string; site: string; className?: string }) {
  return favicon ? (
    <img className={cn(styles.favicon, className)} src={favicon} alt="" />
  ) : (
    <span className={cn(styles.initial, className)} aria-hidden="true">{site.charAt(0).toUpperCase()}</span>
  );
}

/**
 * LinkCard: prévia de um endereço com ícone, site, título, descrição e miniatura. O cartão
 * inteiro é o link. Abre em outra aba por padrão e avisa isso ao leitor de tela.
 */
export function LinkCard({
  href,
  title,
  description,
  image,
  favicon,
  siteName,
  layout = "horizontal",
  target = "_blank",
  rel = "noopener noreferrer",
  className,
  ...rest
}: LinkCardProps) {
  const m = useComponentMessages("linkCard", enMessages.linkCard);
  const site = siteName ?? domainOf(href);
  return (
    <a className={cn(styles.card, styles[layout], className)} href={href} target={target} rel={rel} {...rest}>
      {image && <img className={styles.image} src={image} alt="" loading="lazy" />}
      <span className={styles.body}>
        <span className={styles.site}>
          <SiteMark favicon={favicon} site={site} />
          <span className={styles.siteName}>{site}</span>
        </span>
        <span className={styles.title}>{title}</span>
        {description != null && <span className={styles.description}>{description}</span>}
        {target === "_blank" && <span className={styles.sr}>{m.newTab}</span>}
      </span>
    </a>
  );
}
