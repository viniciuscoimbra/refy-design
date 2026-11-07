import { forwardRef } from "react";
import { Pressable, Text, View } from "react-native";
import type { PressableProps, View as ViewType } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import type { CheckboxCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable } from "../hooks";
import { hitSlopFor, lineHeight, renderText } from "../primitives";

export interface CheckboxProps extends CheckboxCoreProps, Omit<PressableProps, "children" | "style" | "disabled"> {
  /** Chamado com o novo estado. Na web o equivalente é o `onChange` do input. */
  onCheckedChange?: (checked: boolean) => void;
  style?: PressableProps["style"];
}

/** Caixa de seleção com check desenhado; `boxed` vira linha com borda que acende quando marcada. */
export const Checkbox = forwardRef<ViewType, CheckboxProps>(function Checkbox(
  { label, description, tag, meta, boxed = false, checked, defaultChecked = false, disabled, onCheckedChange, onPress, style, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const primary = t.pick<string>("--primary");
  const surface = t.pick<string>("--surface", "--surface-container-low");
  const labelSize = t.pick<number>("--text-sm", 13);
  const descSize = t.pick<number>("--text-xs", 12);
  const snug = t.pick<number>("--leading-snug", 1.35);
  const box = 18;
  const min = Math.max(t.pick<number>("--choice-hit-height", 0), boxed ? box + 2 * t.pick<number>("--space-3", 12) : box);
  const name = accessibilityLabel ?? (typeof label === "string" ? label : undefined);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityLabel={name}
      accessibilityHint={typeof description === "string" ? description : undefined}
      accessibilityState={{ checked: on, disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={hitSlopFor(min, label || description || meta != null ? undefined : box)}
      onPress={(event) => { onPress?.(event); setOn(!on); }}
      {...rest}
      style={(state) => [
        {
          flexDirection: "row" as const, gap: 10, minHeight: min, opacity: disabled ? 0.55 : 1,
          alignItems: boxed ? ("center" as const) : t.pick<"flex-start" | "center">("--choice-align", "flex-start"),
          ...(label || description || meta != null || boxed ? {} : { width: box, alignSelf: "flex-start" as const }),
          ...(boxed ? {
            paddingVertical: t.pick<number>("--space-3", 12), paddingHorizontal: t.pick<number>("--space-4", 16),
            borderWidth: t.pick<number>("--control-border-width", 1), borderRadius: t.pick<number>("--radius-md", 8),
            borderColor: on ? primary : state.pressed ? t.pick<string>("--legacy-line-strong") : t.pick<string>("--border", "--line"),
            backgroundColor: on ? t.mix(primary, 3, surface) : surface,
          } : {}),
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {(state) => {
        const pressed = !disabled && state.pressed;
        const filled = on ? (pressed ? t.mix(t.pick<string>("--ink-1"), 10, primary) : primary) : surface;
        return (
          <>
            <View style={{
              width: box, height: box, marginTop: boxed ? 0 : 1, alignItems: "center", justifyContent: "center",
              borderWidth: t.pick<number>("--control-border-width", 1.5), borderRadius: t.pick<number>("--checkbox-radius", "--radius-sm", 4),
              borderColor: on ? filled : pressed ? t.pick<string>("--ink-3") : t.pick<string>("--line", "--surface-container-high"),
              backgroundColor: filled, transform: [{ scale: pressed ? 0.92 : 1 }],
            }}>
              {on && (
                <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--selection-on-primary", "--on-primary")} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <Polyline points="20 6 9 17 4 12" />
                </Svg>
              )}
            </View>
            {(label || description) && (
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                {label && (
                  <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: t.pick<number>("--space-2", 8) }}>
                    {renderText(label, { fontSize: labelSize, lineHeight: lineHeight(labelSize, snug), color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-regular") })}
                    {tag}
                  </View>
                )}
                {description && renderText(description, { fontSize: descSize, lineHeight: lineHeight(descSize, snug), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}
              </View>
            )}
            {meta != null && (
              <Text style={{ marginLeft: "auto", alignSelf: "center", fontSize: t.pick<number>("--text-2xs", 11), color: t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") }}>{meta}</Text>
            )}
          </>
        );
      }}
    </Pressable>
  );
});
