import { useId } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Badge } from "../Badge";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";
import { StatusDot } from "../StatusDot";
import { cn } from "../../lib/cn";
import styles from "./Timeline.module.css";

import { useLocale, useComponentMessages } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
export interface TimelineMilestone {
  id: string;
  timestamp: Date | string;
  title: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  action?: ReactNode;
  status?: "completed" | "current" | "upcoming";
}
export interface TimelineProps {
  /** The order of milestones is set by the consumer, not by the visual state. */
  items: TimelineMilestone[];
  title?: ReactNode;
  description?: ReactNode;
  orientation?: "vertical" | "horizontal";
  locale?: string;
  timezone?: string;
  emptyMessage?: ReactNode;
  className?: string;
}
/** Marcos de uma jornada. Ocorrências e autoria pertencem a ActivityTimeline. */
export function Timeline({ items, title, description, orientation = "vertical", locale: localeProp, timezone = "America/Sao_Paulo", emptyMessage: emptyMessageProp, className }: TimelineProps) {
  const m = useComponentMessages("timeline", enMessages.timeline);
  const contextLocale = useLocale();
  const locale = localeProp ?? contextLocale;
  const emptyMessage = emptyMessageProp ?? m.empty;
  const id = useId();
  function scrollByKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.target !== event.currentTarget || event.altKey || event.ctrlKey || event.metaKey) return;
    const node = event.currentTarget;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      node.scrollBy({ left: node.clientWidth * .8 * (event.key === "ArrowRight" ? 1 : -1), behavior: "instant" });
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      node.scrollTo({ left: event.key === "Home" ? 0 : node.scrollWidth, behavior: "instant" });
    }
  }
  if (!items.length) return <EmptyState className={className} title={m.emptyTitle} message={emptyMessage} />;
  return <section className={cn(styles.root, styles[orientation], className)} aria-label={typeof title === "string" ? title : m.label}>
    {(title || description) && <header className={styles.header}>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</header>}
    <div className={styles.scroller} onKeyDown={orientation === "horizontal" ? scrollByKey : undefined} role={orientation === "horizontal" ? "region" : undefined} aria-label={orientation === "horizontal" ? m.scroll : undefined} tabIndex={orientation === "horizontal" ? 0 : undefined}>
      <ol className={styles.list}>
        {items.map(item => {
          const date = new Date(item.timestamp);
          const state = item.status ?? "completed";
          return <li key={item.id} className={styles.item} data-milestone-id={item.id} aria-current={state === "current" ? "step" : undefined}>
            <div className={styles.marker} aria-hidden="true"><StatusDot tone={state === "completed" ? "good" : state === "current" ? "info" : "neutral"} /></div>
            <Card padding="none" className={styles.card}>
              <div className={styles.body}>
                <Badge tone={state === "completed" ? "success" : state === "current" ? "info" : "neutral"}>{state === "completed" ? m.completed : state === "current" ? m.current : m.planned}</Badge>
                <h3 id={`${id}-${item.id}`}>{item.title}</h3>
                {item.description && <div className={styles.description}>{item.description}</div>}
                {item.media && <div className={styles.media}>{item.media}</div>}
                {item.action && <div className={styles.action}>{item.action}</div>}
              </div>
              <time className={styles.date} dateTime={date.toISOString()} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: timezone }).format(date)}>
                <span>{new Intl.DateTimeFormat(locale, { month: "short", timeZone: timezone }).format(date)}</span>
                <strong>{new Intl.DateTimeFormat(locale, { day: "2-digit", timeZone: timezone }).format(date)}</strong>
                <span>{new Intl.DateTimeFormat(locale, { year: "numeric", timeZone: timezone }).format(date)}</span>
              </time>
            </Card>
          </li>;
        })}
      </ol>
    </div>
  </section>;
}
