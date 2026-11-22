import type { HTMLAttributes } from "react";
import type { QuoteCoreProps, QuoteVariant } from "../../contracts/display";
import { cn } from "../../lib/cn";
import { Avatar } from "../Avatar";
import styles from "./Quote.module.css";

export type { QuoteVariant };

/** Props for the Quote component. */
export interface QuoteProps extends QuoteCoreProps, Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** URL the quotation comes from (the `cite` attribute). */
  cite?: string;
}

function initialsOf(author: unknown) {
  if (typeof author !== "string") return undefined;
  return author.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || undefined;
}

/**
 * Quote: citação com autoria. "block" entra no corpo do texto com a linha à esquerda;
 * "pull" é o depoimento em destaque, com a marca de aspas e a foto de quem disse.
 */
export function Quote({ children, author, source, avatar, variant = "block", cite, className, ...rest }: QuoteProps) {
  const initials = initialsOf(author);
  const showAvatar = variant === "pull" && (avatar || initials);
  return (
    <figure className={cn(styles.quote, styles[variant], className)} {...rest}>
      {variant === "pull" && (
        <svg className={styles.mark} viewBox="0 0 32 24" aria-hidden="true">
          <path d="M0 24V14.4C0 6.1 4.4 1.3 12.2 0l1.4 3.4C9 4.6 6.9 7.3 6.7 11H13v13H0zm18.4 0V14.4C18.4 6.1 22.8 1.3 30.6 0L32 3.4c-4.6 1.2-6.7 3.9-6.9 7.6h6.3v13h-13z" />
        </svg>
      )}
      <blockquote className={styles.text} cite={cite}>{children}</blockquote>
      {(author != null || source != null) && (
        <figcaption className={styles.caption}>
          {showAvatar && <Avatar size="sm" src={avatar} initials={initials} alt="" seed={typeof author === "string" ? author : undefined} />}
          <span className={styles.who}>
            {author != null && <span className={styles.author}>{author}</span>}
            {source != null && <span className={styles.source}>{source}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
