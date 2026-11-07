import type { ReactNode } from "react";
import { Avatar } from "../Avatar";
import { Badge, type BadgeTone } from "../Badge";
import { Card } from "../Card";
import { cn } from "../../lib/cn";
import styles from "./ActivityItem.module.css";

export interface ActivityActor {
  name: string;
  initials?: string;
  seed?: string;
  src?: string;
  href?: string;
  target?: string;
}
export interface ActivityItemProps {
  title: ReactNode;
  actor?: ActivityActor;
  timestamp?: ReactNode;
  description?: ReactNode;
  badge?: { label: ReactNode; tone?: BadgeTone };
  status?: ReactNode;
  metadata?: ReactNode;
  action?: ReactNode;
  density?: "default" | "compact";
  className?: string;
}
/** Autoria e conteúdo de uma ocorrência; o eixo temporal pertence ao organismo. */
export function ActivityItem({ title, actor, timestamp, description, badge, status, metadata, action, density = "default", className }: ActivityItemProps) {
  const body = <>
    <header className={styles.header}>
      {actor && <Avatar size="sm" initials={actor.initials ?? actor.name.split(" ").map(part => part[0]).slice(0, 2).join("")} src={actor.src} seed={actor.seed} alt={actor.name} />}
      <div className={styles.copy}>
        <h3>{actor && <strong>{actor.href ? <a href={actor.href} target={actor.target} rel={actor.target === "_blank" ? "noopener noreferrer" : undefined}>{actor.name}</a> : actor.name}</strong>} {title}</h3>
        {timestamp && <div className={styles.time}>{timestamp}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </header>
    {description && <div className={styles.description}>{description}</div>}
    {(badge || status || metadata) && <div className={styles.meta}>
      {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
      {status}{metadata}
    </div>}
  </>;
  const classes = cn(styles.root, density === "compact" ? styles.compact : styles.feed, badge?.tone && styles[badge.tone], className);
  return density === "compact" ? <article className={classes}>{body}</article> : <Card padding="none" className={classes}>{body}</Card>;
}
