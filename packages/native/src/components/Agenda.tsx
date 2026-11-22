import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { AgendaCoreProps, AgendaEvent, AgendaTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";
import { groupAgenda } from "./agendaDays";

export type { AgendaEvent, AgendaTone };
export interface AgendaProps extends AgendaCoreProps, Omit<ViewProps, "children"> {}

const TONE: Record<AgendaTone, string[]> = {
  primary: ["--primary"], info: ["--info"], good: ["--good"], warn: ["--weak"], critical: ["--critical"], neutral: ["--line-strong", "--ink-3"],
};

/** Compromissos por dia num cartão: título, um dia por faixa e blocos compactos. Mesmo agrupamento da web. */
export function Agenda({ events, label, locale = "pt-BR", timezone, onEventClick, emptyMessage = "Nada marcado.", title, from, to, style, ...rest }: AgendaProps) {
  const t = useRefy();
  const days = groupAgenda(events, timezone, from, to);
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const time = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: timezone });
  const xs = t.pick<number>("--text-xs", 12);
  const xxs = t.pick<number>("--text-2xs", 10);
  const sm = t.pick<number>("--text-sm", 13);
  const line = t.pick<string>("--line-soft");
  const name = label ?? (typeof title === "string" ? title : "Agenda");
  const small = (text: string) => <Text style={baseText(t, { size: xxs, color: "--ink-3" })}>{text.replace(/\.$/, "")}</Text>;
  return (
    <View accessibilityLabel={name} {...rest} style={[{ overflow: "hidden", borderWidth: 1, borderColor: line, borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>("--card-background", "--surface") }, style]}>
      {title != null && (
        <View accessibilityRole="header" accessible style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: line }}>
          {renderText(title, baseText(t, { size: sm, color: "--ink-1", family: "--font-headline", weight: "--weight-semi" }))}
        </View>
      )}
      {!days.length && <View style={{ padding: 16 }}>{renderText(emptyMessage, baseText(t, { size: sm, color: "--ink-3" }))}</View>}
      {days.map((day, dayIndex) => (
        <View key={day.key} style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: dayIndex > 0 ? 1 : 0, borderTopColor: line }}>
          <View accessibilityRole="header" accessible accessibilityLabel={dayLabel.format(day.date)} style={{ width: 40, alignItems: "center" }}>
            {small(weekday.format(day.date))}
            <Text style={{ ...baseText(t, { size: t.pick<number>("--text-h4", 20), color: "--ink-1", family: "--font-headline", weight: "--weight-semi", leading: "--leading-tight" }), fontVariant: ["tabular-nums"] }}>{String(day.date.getUTCDate())}</Text>
            {small(month.format(day.date))}
          </View>
          <View style={{ flex: 1, gap: 8, justifyContent: day.events.length ? "flex-start" : "center" }}>
            {day.events.length === 0 && renderText("Nada marcado", baseText(t, { size: sm, color: "--ink-3" }))}
            {day.events.map(({ event, allDay, start, end }) => {
              const spoken = allDay ? "Dia todo" : end ? `${time.format(start)} às ${time.format(end)}` : time.format(start);
              const body = (
                <>
                  <View style={{ width: 3, alignSelf: "stretch", borderRadius: 2, backgroundColor: t.pick<string>(...TONE[event.tone ?? "primary"]) }} />
                  <View style={{ minWidth: 56 }}>
                    <Text style={{ ...baseText(t, { size: xs, color: "--ink-2" }), fontVariant: ["tabular-nums"] }}>{allDay ? "Dia todo" : time.format(start)}</Text>
                    {!allDay && end && <Text style={{ ...baseText(t, { size: xxs, color: "--ink-3" }), fontVariant: ["tabular-nums"] }}>{time.format(end)}</Text>}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    {renderText(event.title, baseText(t, { size: sm, color: "--ink-1", weight: "--weight-semi" }))}
                    {event.location != null && renderText(event.location, baseText(t, { size: xs, color: "--ink-3" }))}
                    {event.description != null && renderText(event.description, baseText(t, { size: xs, color: "--ink-3" }))}
                  </View>
                </>
              );
              const frame = { flexDirection: "row" as const, gap: 10, minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: line, borderRadius: t.pick<number>("--radius-md", 10), backgroundColor: t.pick<string>("--surface-2", "--surface-container-low") };
              return onEventClick ? (
                <Pressable key={event.id} accessibilityRole="button" accessibilityLabel={typeof event.title === "string" ? [event.title, spoken, ...(typeof event.location === "string" ? [event.location] : [])].join(", ") : undefined} onPress={() => onEventClick(event)} style={({ pressed }) => [frame, pressed && { backgroundColor: t.pick<string>("--surface-container", "--surface-2") }]}>{body}</Pressable>
              ) : (
                <View key={event.id} accessible accessibilityLabel={typeof event.title === "string" ? [event.title, spoken, ...(typeof event.location === "string" ? [event.location] : [])].join(", ") : undefined} style={frame}>{body}</View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
