import { useState } from "react";
import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { KeyValueItem, KeyValueListCoreProps, KeyValueListLayout } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export type { KeyValueItem, KeyValueListLayout };
export interface KeyValueListProps extends KeyValueListCoreProps, Omit<ViewProps, "children"> {}

/** Pares de rótulo e valor: linhas com valor à direita, ou grade de pares com rótulo em cima. */
export function KeyValueList({ items, layout = "rows", dividers, title, style, ...rest }: KeyValueListProps) {
  const t = useRefy();
  const [width, setWidth] = useState(0);
  const lines = dividers ?? layout === "rows";
  const line = t.pick<string>("--line-soft");
  const sm = t.pick<number>("--text-sm", 13);
  const label = baseText(t, { size: sm, color: "--ink-3" });
  const value = { ...baseText(t, { size: sm, color: "--ink-1", weight: "--weight-medium" }), fontVariant: ["tabular-nums" as const] };
  const hint = baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3" });
  const heading = title != null && (
    <View accessibilityRole="header" accessible style={{ marginBottom: 4 }}>
      {renderText(title, baseText(t, { size: sm, color: "--ink-1", family: "--font-headline", weight: "--weight-semi" }))}
    </View>
  );
  if (layout === "columns") {
    const gap = t.pick<number>("--space-5", 20);
    const columns = Math.max(1, Math.floor((width + gap) / (150 + gap)));
    const cell = width ? (width - gap * (columns - 1)) / columns : 150;
    const eyebrow = t.pick<number>("--text-eyebrow", 11);
    return (
      <View {...rest} style={style}>
      {heading}
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: "row", flexWrap: "wrap", columnGap: gap, rowGap: t.pick<number>("--space-4", 16) }}>
        {items.map((item, index) => (
          <View key={item.id ?? index} accessible style={{ width: cell, gap: 2, paddingTop: lines ? 12 : 0, borderTopWidth: lines ? 1 : 0, borderTopColor: line }}>
            {renderText(item.label, { ...baseText(t, { size: eyebrow, color: "--ink-3", family: ["--interface-detail-font", "--font-mono"] }), textTransform: "uppercase", letterSpacing: 0.16 * eyebrow })}
            {renderText(item.value, value)}
            {item.hint != null && renderText(item.hint, hint)}
          </View>
        ))}
      </View>
      </View>
    );
  }
  return (
    <View {...rest} style={[{ minWidth: 0 }, style]}>
      {heading}
      {items.map((item, index) => (
        <View key={item.id ?? index} accessible style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 16, paddingVertical: 8, borderTopWidth: lines && index > 0 ? 1 : 0, borderTopColor: line }}>
          <View style={{ flexShrink: 1 }}>{renderText(item.label, label)}</View>
          <View style={{ flexShrink: 1, alignItems: "flex-end" }}>
            {renderText(item.value, { ...value, textAlign: "right" })}
            {item.hint != null && renderText(item.hint, { ...hint, textAlign: "right" })}
          </View>
        </View>
      ))}
    </View>
  );
}
