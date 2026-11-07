import { useMemo } from "react";
import { Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { EventTimelineCoreProps, TimelineEventCore } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { ActivityItem } from "./ActivityItem";
import { Button } from "./Button";
import { Callout } from "./Callout";
import { EmptyState } from "./EmptyState";
import { StatusDot } from "./StatusDot";

export type TimelineEvent = TimelineEventCore;
export interface EventTimelineProps extends EventTimelineCoreProps {
  events: TimelineEvent[];
  style?: StyleProp<ViewStyle>;
}

/** Ordena do mais novo ao mais antigo e agrupa por dia no fuso pedido, como a web. */
export function groupEvents(events: TimelineEvent[], timezone: string, byDate: boolean) {
  const sorted = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const key = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const groups = new Map<string, { date: Date; items: TimelineEvent[] }>();
  for (const event of sorted) {
    const date = new Date(event.timestamp);
    const k = byDate ? key.format(date) : "all";
    const group = groups.get(k);
    if (group) group.items.push(event); else groups.set(k, { date, items: [event] });
  }
  return [...groups.entries()];
}

/** Histórico de atividades com separador por dia. Para marcos de uma jornada, use Timeline. */
export function EventTimeline({ title = "Atividades", context, events, locale = "pt-BR", timezone = "America/Sao_Paulo", error, onRetry, emptyTitle = "Nenhuma atividade ainda", emptyMessage = "As atividades aparecerão aqui quando acontecerem.", density = "default", showHeader = true, groupByDate = true, style }: EventTimelineProps) {
  const t = useRefy();
  const groups = useMemo(() => groupEvents(events, timezone, groupByDate), [events, timezone, groupByDate]);
  if (error) return <Callout tone="danger" accessibilityRole="alert" title="Não foi possível carregar o histórico" style={style} action={onRetry ? <Button size="sm" variant="danger" onPress={onRetry}>Tentar novamente</Button> : undefined}>{error}</Callout>;
  if (!events.length) return <EmptyState title={emptyTitle} message={emptyMessage} style={style} />;
  const s = (n: string, f: number) => t.size(n, f);
  const lineColor = t.pick<string>("--timeline-line", "--outline", "--line");
  const lineSoft = t.pick<string>("--line-soft");
  const compact = density === "compact";
  const h3 = t.size("--text-h3", 24);
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "long", timeZone: timezone });
  const timeLabel = new Intl.DateTimeFormat(locale, { ...(groupByDate ? {} : { day: "2-digit", month: "short" }), hour: "2-digit", minute: "2-digit", timeZone: timezone });
  return (
    <View accessibilityLabel="Histórico de atividades" style={[{ width: "100%", minWidth: 0, gap: compact ? s("--space-4", 16) : s("--space-6", 24) }, style]}>
      {showHeader && (
        <View style={{ gap: s("--space-1", 4) }}>
          <View accessibilityRole="header">{renderText(title, { color: t.pick<string>("--ink-1"), fontSize: h3, ...t.font("--font-headline", "--weight-bold") })}</View>
          {context != null && renderText(context, { color: t.pick<string>("--ink-3"), fontSize: s("--text-sm", 13), ...t.font("--font-body", "--weight-regular") })}
        </View>
      )}
      {groups.map(([key, group]) => (
        <View key={key} style={{ minWidth: 0 }}>
          {groupByDate && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: s("--space-3", 12), marginBottom: s("--space-4", 16) }}>
              <View style={{ flex: 1, height: 1, backgroundColor: lineSoft }} />
              <Text accessibilityRole="header" style={{ color: t.pick<string>("--ink-3"), fontSize: s("--text-xs", 12), textAlign: "center", ...t.font("--font-body", "--weight-medium") }}>{dayLabel.format(group.date)}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: lineSoft }} />
            </View>
          )}
          {group.items.map((event, i) => {
            const last = i === group.items.length - 1;
            const date = new Date(event.timestamp);
            return (
              <View key={event.id} style={{ flexDirection: "row", gap: compact ? s("--space-3", 12) : s("--space-4", 16), paddingBottom: last ? 0 : s("--space-5", 20) }}>
                {!last && <View style={{ position: "absolute", top: 32, bottom: 0, left: 15, width: 1, ...(compact ? { borderLeftWidth: 1, borderStyle: "dashed", borderColor: lineColor } : { backgroundColor: lineColor }) }} />}
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ zIndex: 1, width: 32, height: 32, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface"), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: lineSoft, borderRadius: t.pick<number>("--control-radius", "--radius-md", 8) }}>
                  {event.icon ?? <StatusDot tone={event.status?.tone ?? "neutral"} pulse={event.status?.pulse} />}
                </View>
                <ActivityItem style={{ flex: 1, minWidth: 0 }} title={event.title} actor={event.actor} description={event.description} badge={event.badge} metadata={event.metadata} action={event.action} density={density}
                  timestamp={timeLabel.format(date)}
                  status={event.status && <StatusDot tone={event.status.tone} pulse={event.status.pulse}>{event.status.label}</StatusDot>} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
export { EventTimeline as ActivityTimeline };
