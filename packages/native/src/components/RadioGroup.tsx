import { Pressable, View } from "react-native";
import type { ViewProps } from "react-native";
import type { RadioGroupCoreProps, RadioOption } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable } from "../hooks";
import { hitSlopFor, lineHeight, renderText } from "../primitives";

export type { RadioOption };
export interface RadioGroupProps extends RadioGroupCoreProps, Omit<ViewProps, "children"> {}

/** Escolha única: cada opção é uma linha tocável com borda, que acende na selecionada. */
export function RadioGroup({ options, value, defaultValue, onChange, label, style, ...rest }: RadioGroupProps) {
  const t = useRefy();
  const [current, setCurrent] = useControllable<string | undefined>(value, defaultValue, (next) => next !== undefined && onChange?.(next));
  const primary = t.pick<string>("--primary");
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const labelSize = t.pick<number>("--text-sm", 13);
  const hintSize = t.pick<number>("--text-2xs", 11);
  const snug = t.pick<number>("--leading-snug", 1.35);
  const min = Math.max(t.pick<number>("--choice-hit-height", 0), 18 + 2 + 20);
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} {...rest} style={[{ gap: 8 }, style]}>
      {label && renderText(label, {
        marginBottom: 2, fontSize: eyebrow, color: t.pick<string>("--ink-3"),
        ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium"),
        textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase",
        letterSpacing: t.size("--interface-label-tracking", 0.14 * eyebrow, eyebrow),
      })}
      {options.map((option) => {
        const checked = current === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityHint={option.hint}
            accessibilityState={{ checked, disabled: Boolean(option.disabled) }}
            disabled={option.disabled}
            hitSlop={hitSlopFor(min)}
            onPress={() => setCurrent(option.value)}
            style={({ pressed }) => ({
              minHeight: min, flexDirection: "row", gap: 10, paddingVertical: 10, paddingHorizontal: 12,
              alignItems: t.pick<"flex-start" | "center">("--choice-align", "flex-start"),
              borderWidth: t.pick<number>("--control-border-width", 1), borderRadius: t.pick<number>("--radius-md", 8),
              borderColor: checked ? primary : pressed ? t.pick<string>("--legacy-line-strong") : t.pick<string>("--line"),
              backgroundColor: checked ? t.pick<string>("--primary-soft", "--surface-container-low") : "transparent",
              opacity: option.disabled ? 0.5 : 1,
            })}
          >
            <View style={{
              width: 18, height: 18, marginTop: 1, alignItems: "center", justifyContent: "center", borderRadius: 9,
              borderWidth: t.pick<number>("--control-border-width", 1.5), borderColor: checked ? primary : t.pick<string>("--line", "--surface-container-high"),
              backgroundColor: t.pick<string>("--surface", "--surface-container-low"),
            }}>
              {checked && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: primary }} />}
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              {renderText(option.label, { fontSize: labelSize, lineHeight: lineHeight(labelSize, snug), color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") })}
              {option.hint && renderText(option.hint, { fontSize: hintSize, lineHeight: lineHeight(hintSize, 1.45), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
