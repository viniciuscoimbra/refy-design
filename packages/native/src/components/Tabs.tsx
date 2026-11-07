import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { TabItem, TabsCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { MIN_TOUCH, paddingFrom } from "../primitives";
import { useReducedMotion } from "../hooks";

export type { TabItem };
export interface TabsProps extends TabsCoreProps, Omit<ViewProps, "children"> {}

function StatusIcon({ status, color }: { status: "complete" | "warning"; color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={status === "complete" ? 2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
      {status === "complete" ? <Path d="m3 8 3 3 7-7" /> : <><Path d="M8 2 14 13H2L8 2Z" /><Path d="M8 6v3M8 11.5h.01" /></>}
    </Svg>
  );
}

/** Traço do underline (horizontal) ou da borda esquerda (vertical) que cresce na aba ativa. */
function Indicator({ on, vertical }: { on: boolean; vertical: boolean }) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const scale = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(scale, { toValue: on ? 1 : 0, duration: reduced ? 0 : t.pick<number>("--duration-mid", 220), easing: Easing.bezier(...t.easing(vertical ? "--ease-emph" : "--ease-out")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [on, reduced, scale, t, vertical]);
  const primary = t.pick<string>("--primary");
  return vertical
    ? <Animated.View pointerEvents="none" style={{ position: "absolute", top: 6, bottom: 6, left: -1, width: 2, borderRadius: t.pick<number>("--radius-pill"), backgroundColor: primary, transform: [{ scaleY: scale }] }} />
    : <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, backgroundColor: primary, transform: [{ scaleX: scale }] }} />;
}

/** Abas com indicador. Mostra o conteúdo da aba ativa quando `content` vem no item. */
export function Tabs({ items, value, defaultValue, onChange, variant = "underline", orientation = "horizontal", wrap = false, style, ...rest }: TabsProps) {
  const t = useRefy();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;
  const vertical = orientation === "vertical";
  const pill = !vertical && variant === "pill";
  const select = (id: string) => {
    if (items.find((item) => item.id === id)?.disabled) return;
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };
  const line = t.pick<string>("--line");
  const fontSize = t.size("--tabs-font-size", t.size("--text-sm", 13));
  const hit = Math.max(MIN_TOUCH, t.size("--navigation-hit-height", 0));
  const activeItem = items.find((item) => item.id === active);

  const tabs = items.map((item) => {
    const on = item.id === active;
    const color = on ? t.pick<string>(vertical ? "--ink-1" : "--tabs-active-foreground", "--ink-1") : t.pick<string>("--ink-3");
    const weight = on ? (vertical ? "--weight-semi" : t.pick<number | string>("--tabs-active-weight", "--weight-medium")) : "--weight-medium";
    const pad = vertical ? { paddingVertical: 10, paddingHorizontal: 16 } : pill ? { paddingVertical: 6, paddingHorizontal: 14 } : paddingFrom(t, "--tabs-tab-padding", [10, 2]);
    const statusColors = item.status === "complete" ? [t.pick<string>("--good-soft"), t.pick<string>("--good-ink", "--on-good")] : [t.pick<string>("--weak-soft"), t.pick<string>("--weak-ink", "--legacy-warn-ink")];
    return (
      <Pressable
        key={item.id}
        accessibilityRole="tab"
        accessibilityState={{ selected: on, disabled: item.disabled }}
        accessibilityHint={item.status === "complete" ? "Status: concluída" : item.status === "warning" ? "Status: requer atenção" : undefined}
        disabled={item.disabled}
        onPress={() => select(item.id)}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: vertical ? "flex-start" : "center",
          gap: 7,
          minHeight: hit,
          minWidth: vertical ? 180 : undefined,
          flex: pill && t.pick<string | number>("--tabs-pill-flex", "initial") !== "initial" ? 1 : undefined,
          ...pad,
          opacity: item.disabled ? 0.42 : 1,
          borderRadius: pill ? t.pick<number>("--radius-md", 8) : 0,
          backgroundColor: pill && on ? t.pick<string>("--tabs-pill-active-background", "--surface") : pressed ? (vertical ? t.pick<string>("--surface-2") : pill ? t.mix(t.pick<string>("--ink-1"), 9, "transparent") : "transparent") : "transparent",
          boxShadow: pill && on ? t.pick<string>("--elev-1", "") || undefined : undefined,
        })}
      >
        <Text numberOfLines={1} style={{ color, fontSize, ...t.font("--font-body", weight) }}>{item.label}</Text>
        {item.badge != null && (
          <View style={{ borderRadius: t.pick<number>("--radius-pill"), paddingVertical: 1, paddingHorizontal: 6, backgroundColor: pill && on ? t.pick<string>("--primary-soft") : t.pick<string>("--surface-2") }}>
            <Text style={{ fontSize: t.size("--text-2xs", 11), color: pill && on ? t.pick<string>("--primary-ink") : t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-semi") }}>{item.badge}</Text>
          </View>
        )}
        {item.status != null && (
          <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: statusColors[0] }}>
            <StatusIcon status={item.status} color={statusColors[1]} />
          </View>
        )}
        {!pill && <Indicator on={on} vertical={vertical} />}
      </Pressable>
    );
  });

  const listStyle = vertical
    ? { flexDirection: "column" as const, alignItems: "stretch" as const, borderLeftWidth: 1, borderLeftColor: line }
    : pill
      ? { flexDirection: "row" as const, gap: 2, padding: 3, borderRadius: t.pick<number>("--radius-lg", 12), backgroundColor: t.pick<string>("--surface-2"), alignSelf: t.pick<string>("--tabs-pill-align", "flex-start") as "flex-start" }
      : { flexDirection: "row" as const, gap: 20, borderBottomWidth: 1, borderBottomColor: line };

  return (
    <View {...rest} style={[{ flexDirection: vertical ? "row" : "column", alignItems: vertical ? "flex-start" : "stretch", gap: vertical ? t.size("--space-5", 24) : t.size("--tabs-panel-gap", 20) }, style]}>
      {vertical || wrap
        ? <View accessibilityRole="tablist" style={[listStyle, wrap && !vertical ? { flexWrap: "wrap" } : null]}>{tabs}</View>
        : <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" style={{ flexGrow: 0, alignSelf: pill ? listStyle.alignSelf : "stretch" }} contentContainerStyle={listStyle}>{tabs}</ScrollView>}
      {activeItem?.content != null && <View style={{ minWidth: 0, flex: vertical ? 1 : undefined, paddingTop: vertical ? t.size("--space-2", 8) : 0 }}>{activeItem.content}</View>}
    </View>
  );
}
