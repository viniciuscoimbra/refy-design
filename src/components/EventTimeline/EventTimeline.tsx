import { useId, useMemo } from "react";
import type { ReactNode } from "react";
import { ActivityItem, type ActivityActor } from "../ActivityItem";
import type { BadgeTone } from "../Badge";
import { Button } from "../Button";
import { Callout } from "../Callout";
import { EmptyState } from "../EmptyState";
import { StatusDot, type StatusDotTone } from "../StatusDot";
import { cn } from "../../lib/cn";
import styles from "./EventTimeline.module.css";

import { useMessages, useLocale } from "../../lib/locale";
export type TimelineActor = ActivityActor;
export interface TimelineEvent {
  id: string;
  timestamp: Date | string;
  title: ReactNode;
  description?: ReactNode;
  actor?: TimelineActor;
  icon?: ReactNode;
  metadata?: ReactNode;
  status?: { label: ReactNode; tone?: StatusDotTone; pulse?: boolean };
  badge?: { label: ReactNode; tone?: BadgeTone };
  action?: ReactNode;
}
export interface EventTimelineProps {
  title?: ReactNode;
  context?: ReactNode;
  events: TimelineEvent[];
  locale?: string;
  timezone?: string;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: ReactNode;
  emptyMessage?: ReactNode;
  density?: "default" | "compact";
  showHeader?: boolean;
  /** Remove day separators when composing a compact widget. */
  groupByDate?: boolean;
  className?: string;
}
export type ActivityTimelineProps = EventTimelineProps;
export type ActivityEvent = TimelineEvent;
/** Histórico de atividades. Para marcos de uma jornada, use Timeline. */
export function ActivityTimeline({ title: titleProp, context, events, locale: localeProp, timezone = "America/Sao_Paulo", error, onRetry, emptyTitle: emptyTitleProp, emptyMessage: emptyMessageProp, density = "default", showHeader = true, groupByDate = true, className }: ActivityTimelineProps) {
  const m = useMessages("activityTimeline");
  const contextLocale = useLocale();
  const locale = localeProp ?? contextLocale;
  const title = titleProp ?? m.title;
  const emptyTitle = emptyTitleProp ?? m.emptyTitle;
  const emptyMessage = emptyMessageProp ?? m.emptyMessage;
  const instanceId = useId();
  const groups = useMemo(() => {
    const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const grouped = new Map<string, { date: Date; items: TimelineEvent[] }>();
    const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
    for (const event of sorted) {
      const date = new Date(event.timestamp);
      const key = groupByDate ? formatter.format(date) : "all";
      const group = grouped.get(key);
      if (group) group.items.push(event); else grouped.set(key, { date, items: [event] });
    }
    return [...grouped.entries()];
  }, [events, timezone, groupByDate]);
  if (error) return <Callout className={className} tone="danger" role="alert" title={m.loadError} action={onRetry ? <Button size="sm" variant="danger" onClick={onRetry}>{m.retry}</Button> : undefined}>{error}</Callout>;
  if (!events.length) return <EmptyState className={className} title={emptyTitle} message={emptyMessage} />;
  return <div className={cn(styles.root, density === "compact" && styles.compact, className)} aria-label={m.label}>
    {showHeader && <header className={styles.contextHeader}><h2>{title}</h2>{context && <p>{context}</p>}</header>}
    {groups.map(([key, group]) => <section key={key} className={styles.group} aria-labelledby={groupByDate ? `${instanceId}-${key}` : undefined}>
      {groupByDate && <div className={styles.dateRow}><h3 id={`${instanceId}-${key}`}>{new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "long", timeZone: timezone }).format(group.date)}</h3></div>}
      <ol className={styles.list}>
        {group.items.map(event => {
          const date = new Date(event.timestamp);
          return <li key={event.id} className={styles.item} data-activity-id={event.id}>
            <div className={styles.marker} aria-hidden="true">{event.icon ?? <StatusDot tone={event.status?.tone ?? "neutral"} pulse={event.status?.pulse} />}</div>
            <ActivityItem title={event.title} actor={event.actor} description={event.description} badge={event.badge} metadata={event.metadata} action={event.action} density={density}
              timestamp={<time dateTime={date.toISOString()}>{new Intl.DateTimeFormat(locale, { ...(groupByDate ? {} : { day: "2-digit", month: "short" }), hour: "2-digit", minute: "2-digit", timeZone: timezone }).format(date)}</time>}
              status={event.status && <StatusDot tone={event.status.tone} pulse={event.status.pulse}>{event.status.label}</StatusDot>} />
          </li>;
        })}
      </ol>
    </section>)}
  </div>;
}
/** Compatibilidade: o histórico legado representa atividades, não marcos. */
export { ActivityTimeline as EventTimeline };
