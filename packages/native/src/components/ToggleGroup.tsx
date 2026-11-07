import { Pressable, View } from "react-native";
import type { ViewProps } from "react-native";
import type { ToggleGroupCoreProps, ToggleOption } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable } from "../hooks";
import { hitSlopFor, paddingFrom, renderText } from "../primitives";
import { IconSlot } from "../icon";

export type { ToggleOption };
export interface ToggleGroupProps extends ToggleGroupCoreProps, Omit<ViewProps, "children"> {}

/** Botões liga/desliga independentes (seleção múltipla). Para escolha única, use Segmented. */
export function ToggleGroup({ options, value, defaultValue = [], onChange, label, disabled, style, ...rest }: ToggleGroupProps) {
  const t = useRefy();
  const [current, setCurrent] = useControllable(value, defaultValue, onChange);
  const fontSize = t.pick<number>("--control-font-size", "--text-xs", 12);
  const pad = paddingFrom(t, "--toggle-padding", [t.pick<number>("--space-2", 8), 14]);
  const height = Math.max(t.pick<number>("--toggle-height", 0), pad.paddingTop + pad.paddingBottom + Math.round(fontSize * 1.4));
  const primary = t.pick<string>("--primary");
  return (
    <View accessibilityRole="none" role="group" accessibilityLabel={label} {...rest} style={[{ flexDirection: "row", flexWrap: "wrap", gap: 6, opacity: disabled ? 0.55 : 1 }, style]}>
      {options.map((option) => {
        const on = current.includes(option.value);
        const off = Boolean(disabled || option.disabled);
        return (
          <Pressable
            key={option.value}
            accessibilityRole="togglebutton"
            accessibilityLabel={typeof option.label === "string" ? option.label : undefined}
            accessibilityState={{ selected: on, disabled: off }}
            disabled={off}
            hitSlop={hitSlopFor(height)}
            onPress={() => setCurrent(on ? current.filter((v) => v !== option.value) : [...current, option.value])}
            style={({ pressed }) => ({
              minHeight: height, height, ...pad, flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8),
              borderWidth: t.pick<number>("--control-border-width", 1), borderRadius: t.pick<number>("--radius-default", 6),
              borderColor: on ? t.mix(primary, 40, "transparent") : t.pick<string>("--line", "--surface-container-high"),
              backgroundColor: on ? t.pick<string>("--primary-soft") : pressed ? t.mix(t.pick<string>("--ink-1"), 9, "transparent") : "transparent",
              opacity: option.disabled && !disabled ? 0.45 : 1,
            })}
          >
            {({ pressed }) => {
              const color = on ? t.pick<string>("--primary-ink", "--primary") : pressed ? t.pick<string>("--ink-1") : t.pick<string>("--ink-2", "--on-surface-variant");
              return (
                <>
                  {option.icon && <IconSlot size={13} color={color}>{option.icon}</IconSlot>}
                  {renderText(option.label, { color, fontSize, ...t.font("--font-body", "--weight-medium") }, { numberOfLines: 1 })}
                </>
              );
            }}
          </Pressable>
        );
      })}
    </View>
  );
}
