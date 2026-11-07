import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { TimelineCoreProps, TimelineMilestone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { EmptyState } from "./EmptyState";
import { StatusDot } from "./StatusDot";

export type { TimelineMilestone };
export interface TimelineProps extends TimelineCoreProps {
  style?: StyleProp<ViewStyle>;
}

const STATE = {
  completed: { dot: "good", badge: "success", label: "Concluído" },
  current: { dot: "info", badge: "info", label: "Em andamento" },
  upcoming: { dot: "neutral", badge: "neutral", label: "Previsto" },
} as const;

/** Mês, dia e ano do cartão, no fuso pedido, como na web. */
export function milestoneDate(value: Date | string, locale: string, timeZone: string) {
  const date = new Date(value);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone }).format(date);
  return { month: f({ month: "short" }), day: f({ day: "2-digit" }), year: f({ year: "numeric" }), long: f({ dateStyle: "long" }) };
}

/**
 * Marcos de uma jornada. Em tela estreita a linha fica à esquerda e os cartões à direita;
 * acima de 640 pt eles alternam dos dois lados, e `horizontal` vira uma faixa que rola.
 */
export function Timeline({ items, title, description, orientation = "vertical", locale = "pt-BR", timezone = "America/Sao_Paulo", emptyMessage = "Adicione os marcos importantes desta jornada.", style }: TimelineProps) {
  const t = useRefy();
  const [width, setWidth] = useState(0);
  if (!items.length) return <EmptyState title="Nenhum marco ainda" message={emptyMessage} style={style} />;
  const lineColor = t.pick<string>("--timeline-line", "--outline", "--line");
  const narrow = width > 0 && width <= 380;
  const wide = width > 640;
  const horizontal = orientation === "horizontal";
  const s = (n: string, f: number) => t.size(n, f);
  const ink2 = t.pick<string>("--ink-2");

  const marker = (state: keyof typeof STATE) => (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ zIndex: 1, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface"), borderWidth: 1, borderColor: lineColor }}>
      <StatusDot tone={STATE[state].dot} />
    </View>
  );
  const card = (item: TimelineMilestone, state: keyof typeof STATE) => {
    const d = milestoneDate(item.timestamp, locale, timezone);
    const base = t.size("--text-base", 14);
    const sm = t.size("--text-sm", 13);
    return (
      <Card padding="none" style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "stretch" }}>
        <View style={{ flex: 1, minWidth: 0, padding: narrow ? s("--space-3", 12) : s("--space-4", 16) }}>
          <Badge tone={STATE[state].badge} style={{ alignSelf: "flex-start" }}>{STATE[state].label}</Badge>
          <View accessibilityRole="header" style={{ marginTop: s("--space-2", 8) }}>{renderText(item.title, { color: t.pick<string>("--ink-1"), fontSize: base, lineHeight: Math.round(base * 1.5), ...t.font("--font-headline", "--weight-bold") })}</View>
          {item.description != null && <View style={{ marginTop: s("--space-2", 8) }}>{renderText(item.description, { color: ink2, fontSize: sm, lineHeight: Math.round(sm * 1.65), ...t.font("--font-body", "--weight-regular") })}</View>}
          {item.media != null && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: s("--space-2", 8), marginTop: s("--space-3", 12) }}>{item.media}</View>}
          {item.action != null && <View style={{ marginTop: s("--space-3", 12) }}>{item.action}</View>}
        </View>
        <View accessible accessibilityLabel={d.long} style={{ minWidth: narrow ? 52 : 64, alignItems: "center", justifyContent: "center", gap: s("--space-1", 4), paddingVertical: s("--space-3", 12), paddingHorizontal: narrow ? s("--space-2", 8) : s("--space-3", 12), borderLeftWidth: 1, borderLeftColor: t.pick<string>("--line-soft") }}>
          <Text style={{ color: ink2, fontSize: t.size("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>{d.month}</Text>
          <Text style={{ color: t.pick<string>("--ink-1"), fontSize: t.size("--text-h3", 24), lineHeight: t.size("--text-h3", 24), ...t.font("--font-headline", "--weight-bold") }}>{d.day}</Text>
          <Text style={{ color: ink2, fontSize: t.size("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>{d.year}</Text>
        </View>
      </Card>
    );
  };

  const h3 = t.size("--text-h3", 24);
  const itemW = Math.min(368, Math.max(256, width * 0.34));
  return (
    <View accessibilityLabel={typeof title === "string" ? title : "Marcos da jornada"} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[{ width: "100%", minWidth: 0 }, style]}>
      {(title != null || description != null) && (
        <View style={{ marginBottom: s("--space-7", 32) }}>
          {title != null && <View accessibilityRole="header">{renderText(title, { color: t.pick<string>("--ink-1"), fontSize: h3, ...t.font("--font-headline", "--weight-bold") })}</View>}
          {description != null && <View style={{ marginTop: s("--space-2", 8) }}>{renderText(description, { color: t.pick<string>("--ink-3"), fontSize: t.size("--text-sm", 13), lineHeight: Math.round(t.size("--text-sm", 13) * 1.65), ...t.font("--font-body", "--weight-regular") })}</View>}
        </View>
      )}
      {horizontal ? (
        <ScrollView horizontal style={{ flexGrow: 0 }} accessibilityLabel="Marcos, role para ver a sequência" showsHorizontalScrollIndicator contentContainerStyle={{ gap: s("--space-5", 20), paddingBottom: s("--space-3", 12), minWidth: "100%" }}>
          <View style={{ position: "absolute", left: 0, right: 0, top: 8, height: 1, backgroundColor: lineColor }} />
          {items.map((item) => {
            const state = item.status ?? "completed";
            return (
              <View key={item.id} style={{ width: itemW, gap: s("--space-4", 16) }}>
                <View style={{ alignSelf: "flex-start", marginLeft: s("--space-4", 16) }}>{marker(state)}</View>
                {card(item, state)}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View>
          <View style={{ position: "absolute", top: 0, bottom: 0, left: wide ? "50%" : 7.5, width: 1, marginLeft: wide ? -0.5 : 0, backgroundColor: lineColor }} />
          {items.map((item, i) => {
            const state = item.status ?? "completed";
            const right = wide && i % 2 === 1;
            return (
              <View key={item.id} accessibilityState={{ selected: state === "current" }} style={{ flexDirection: "row", alignItems: "center", gap: wide ? s("--space-5", 20) : s("--space-3", 12), paddingVertical: s("--space-4", 16) }}>
                {wide ? (<>
                  <View style={{ flex: 1, minWidth: 0 }}>{right ? null : card(item, state)}</View>
                  {marker(state)}
                  <View style={{ flex: 1, minWidth: 0 }}>{right ? card(item, state) : null}</View>
                </>) : (<>
                  {marker(state)}
                  {card(item, state)}
                </>)}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
