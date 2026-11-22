import type { HTMLAttributes } from "react";
import type { EntityCardAction, EntityCardBadgeTone, EntityCardCoreProps, EntityCardLayout } from "../../contracts/display";
import { cn } from "../../lib/cn";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Rating } from "../Rating";
import { useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import styles from "./EntityCard.module.css";

export type { EntityCardAction, EntityCardBadgeTone, EntityCardLayout };

/** Props for the EntityCard component. */
export interface EntityCardProps extends EntityCardCoreProps, Omit<HTMLAttributes<HTMLElement>, "title"> {}

/**
 * EntityCard: um produto, lugar, pessoa ou anúncio num cartão só. Foto, selo, título, linha de
 * apoio, nota, preço e até três ações, a primeira em destaque. Para imóvel, PropertyCard tem
 * os campos do setor.
 */
export function EntityCard({
  title,
  subtitle,
  category,
  description,
  image,
  imageAlt = "",
  price,
  meta,
  badge,
  badgeTone = "neutral",
  rating,
  actions = [],
  layout = "vertical",
  className,
  ...rest
}: EntityCardProps) {
  const m = useComponentMessages("entityCard", enMessages.entityCard);
  const visible = actions.slice(0, 3);
  return (
    <article className={cn(styles.card, styles[layout], !image && styles.compact, className)} {...rest}>
      {image && (
        <div className={styles.media}>
          <img className={styles.image} src={image} alt={imageAlt} loading="lazy" />
          {badge && <Badge tone={badgeTone} className={styles.badge}>{badge}</Badge>}
        </div>
      )}
      <div className={styles.body}>
        {(category != null || (!image && badge)) && (
          <p className={styles.top}>
            {category != null && <span className={styles.category}>{category}</span>}
            {!image && badge && <Badge tone={badgeTone}>{badge}</Badge>}
          </p>
        )}
        <h3 className={styles.title}>{title}</h3>
        {subtitle != null && <p className={styles.subtitle}>{subtitle}</p>}
        {rating && <Rating readOnly size="sm" label={m.rating} value={rating.value} count={rating.count} />}
        {description != null && <p className={styles.description}>{description}</p>}
        {(price != null || meta != null) && (
          <p className={styles.footer}>
            {price != null && <span className={styles.price}>{price}</span>}
            {meta != null && <span className={styles.meta}>{meta}</span>}
          </p>
        )}
        {visible.length > 0 && (
          <div className={styles.actions}>
            {visible.map((action, index) => (
              <Button
                key={action.label}
                size="sm"
                variant={index === 0 ? "primary" : index === 1 ? "secondary" : "ghost"}
                href={action.href}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
