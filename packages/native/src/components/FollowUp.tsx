import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { FollowUpCoreProps, FollowUpLayout, FollowUpSuggestion } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, hitSlopFor } from "../primitives";

export type { FollowUpLayout, FollowUpSuggestion };
export interface FollowUpProps extends FollowUpCoreProps, Omit<ViewProps, "children"> {}

/** Próximas perguntas sugeridas; o toque devolve a mensagem para o app enviar. */
export function FollowUp({ suggestions, onSelect, label = "Sugestões", layout = "wrap", disabled = false, style, ...rest }: FollowUpProps) {
  const t = useRefy();
  const items = suggestions.map((item, index) => {
    const s = typeof item === "string" ? { label: item } : item;
    return { key: s.id ?? `${index}-${s.label}`, label: s.label, message: s.message ?? s.label };
  });
  if (!items.length) return null;
  const stack = layout === "stack";
  return (
    <View accessibilityLabel={label} {...rest} style={[{ flexDirection: stack ? "column" : "row", flexWrap: stack ? "nowrap" : "wrap", gap: 8 }, style]}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => onSelect(item.message)}
          hitSlop={hitSlopFor(40)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: stack ? "space-between" : "flex-start",
            gap: 8,
            minHeight: 40,
            paddingVertical: 8,
            paddingLeft: 16,
            paddingRight: 12,
            borderWidth: 1,
            borderColor: t.pick<string>(pressed ? "--primary" : "--line"),
            borderRadius: stack ? t.pick<number>("--radius-md", 10) : 999,
            backgroundColor: t.pick<string>(pressed ? "--primary-soft" : "--surface"),
            opacity: disabled ? t.pick<number>("--control-disabled-opacity", 0.5) : 1,
            alignSelf: stack ? "stretch" : "flex-start",
          })}
        >
          <Text style={[baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-1" }), { flexShrink: 1 }]}>{item.label}</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-3")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M7 17 17 7M9 7h8v8" /></Svg>
        </Pressable>
      ))}
    </View>
  );
}
