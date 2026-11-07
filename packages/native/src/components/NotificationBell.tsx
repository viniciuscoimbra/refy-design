import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { NotificationBellCoreProps, NotificationItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useIconStyle } from "../icon";
import { hitSlopFor } from "../primitives";
import { AnchoredLayer, panelSurface } from "../overlay";
import { IconButton } from "./IconButton";

export type { NotificationItem };
export interface NotificationBellProps extends NotificationBellCoreProps {
  style?: StyleProp<ViewStyle>;
}

function BellGlyph() {
  const { size, color } = useIconStyle();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><Path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </Svg>
  );
}

/**
 * Sino com o número de não lidas e o painel das notificações. O estado é do app: o componente
 * só mostra `items` e avisa toque e "Marcar todas como lidas", como na web.
 */
export function NotificationBell({ items, onItemClick, onMarkAllRead, title = "Notificações", emptyMessage = "Nenhuma notificação", style }: NotificationBellProps) {
  const t = useRefy();
  const viewport = useWindowDimensions();
  const anchor = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const unread = items.filter((i) => i.unread).length;
  const surface = t.pick<string>("--surface", "--surface-container");
  const lineSoft = t.pick<string>("--line-soft", "--surface-container-high");
  const ink1 = t.pick<string>("--ink-1", "--on-surface");
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const xs2 = t.pick<number>("--text-2xs", 11);
  const mono = (weight: string | number) => t.font(["--interface-detail-font", "--font-mono"], weight);
  const close = () => setOpen(false);

  return (
    <View style={[{ alignSelf: "flex-start" }, style]}>
      <View ref={anchor} collapsable={false}>
        <IconButton
          size="lg"
          accessibilityLabel={unread ? `Notificações: ${unread} não lidas` : "Notificações"}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((v) => !v)}
          style={open ? { backgroundColor: t.pick<string>("--surface-2", "--surface-container-low") } : undefined}
          icon={<BellGlyph />}
        />
        {unread > 0 && (
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", top: 3, right: 3, minWidth: 16, height: 16, paddingHorizontal: 2, borderRadius: 999, borderWidth: 2, borderColor: surface, backgroundColor: t.pick<string>("--critical", "--error"), alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: surface, fontSize: 10, lineHeight: 11, ...mono("--weight-bold") }}>{unread > 9 ? "9+" : unread}</Text>
          </View>
        )}
      </View>
      <AnchoredLayer
        open={open}
        onClose={close}
        anchorRef={anchor}
        align="end"
        gap={8}
        label={title}
        panelStyle={[panelSurface(t), { width: Math.min(340, viewport.width - 16), overflow: "hidden", boxShadow: t.pick<string>("--elev-4", "") || undefined }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: t.size("--space-3", 12), paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: lineSoft }}>
          <Text accessibilityRole="header" style={{ color: ink3, fontSize: eyebrow, letterSpacing: eyebrow * 0.08, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...mono("--weight-semi") }}>{title}</Text>
          {onMarkAllRead && unread > 0 && (
            <Pressable accessibilityRole="button" accessibilityLabel="Marcar todas como lidas" onPress={onMarkAllRead} hitSlop={hitSlopFor(24)} style={{ minHeight: 24, justifyContent: "center" }}>
              {({ pressed }) => <Text style={{ color: t.pick<string>("--primary-ink", "--primary"), fontSize: xs2, textDecorationLine: pressed ? "underline" : "none", ...t.font("--font-body", "--weight-semi") }}>Marcar todas como lidas</Text>}
            </Pressable>
          )}
        </View>
        <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ padding: 4 }} bounces={false}>
          {items.length === 0 ? (
            <Text style={{ paddingVertical: 28, paddingHorizontal: 14, textAlign: "center", color: ink3, fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>{emptyMessage}</Text>
          ) : items.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={[item.title, item.unread ? "não lida" : null, item.description, item.time].filter(Boolean).join(", ")}
              onPress={() => { onItemClick?.(item); close(); }}
              style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 10, borderRadius: t.pick<number>("--radius-md", 8), backgroundColor: pressed ? t.pick<string>("--surface-2", "--surface-container-low") : "transparent" })}
            >
              <View style={{ width: 7, height: 7, marginTop: 6, borderRadius: 999, backgroundColor: item.unread ? t.pick<string>("--primary") : "transparent" }} />
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <Text style={{ color: item.unread ? ink1 : t.pick<string>("--ink-2", "--on-surface-variant"), fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", item.unread ? "--weight-semi" : "--weight-medium") }}>{item.title}</Text>
                {item.description ? <Text style={{ color: ink3, fontSize: xs2, ...t.font("--font-body", "--weight-regular") }}>{item.description}</Text> : null}
              </View>
              {item.time ? <Text style={{ marginTop: 2, color: t.pick<string>("--ink-4", "--on-surface-variant"), fontSize: eyebrow, ...mono("--weight-regular") }}>{item.time}</Text> : null}
            </Pressable>
          ))}
        </ScrollView>
      </AnchoredLayer>
    </View>
  );
}
