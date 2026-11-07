import { useId, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { SelectCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { MIN_TOUCH, baseText } from "../primitives";
import { FieldShell, surfaceStyle } from "./Field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// A web recebe <option> como filhos; o RN não tem <select>, então as opções viram dados.
export interface SelectProps extends SelectCoreProps, Omit<ViewProps, "children"> {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/** Seleção única. Abre uma lista em folha modal no lugar do popup do sistema. */
export function Select({ label, hint, error, block = true, options, value, onValueChange, placeholder = "Selecione", disabled = false, style, ...rest }: SelectProps) {
  const t = useRefy();
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const selected = options.find((option) => option.value === value);
  const height = t.pick<number>("--field-height", 38);
  const fontSize = t.pick<number>("--field-font-size", "--text-sm");
  return (
    <FieldShell label={label} labelId={labelId} hint={hint} error={error} block={block}>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        hitSlop={height < MIN_TOUCH ? { top: (MIN_TOUCH - height) / 2, bottom: (MIN_TOUCH - height) / 2 } : undefined}
        {...rest}
        style={[surfaceStyle(t, { focused: open, error: Boolean(error), disabled }), { height, flexDirection: "row", alignItems: "center", paddingLeft: t.pick<number>("--field-padding-inline", 12), paddingRight: 34 }, style]}
      >
        <Text numberOfLines={1} style={{ flex: 1, fontSize, color: t.pick<string>(selected ? "--ink-1" : "--ink-4"), ...t.font("--font-body", "--weight-regular") }}>{selected?.label ?? placeholder}</Text>
        <Svg style={{ position: "absolute", right: 11 }} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-3")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m6 9 6 6 6-6" />
        </Svg>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityLabel="Fechar lista" style={{ flex: 1, backgroundColor: t.pick<string>("--scrim", "rgba(0, 0, 0, 0.4)") }} onPress={() => setOpen(false)} />
        <View accessibilityViewIsModal style={{ maxHeight: "60%", backgroundColor: t.pick<string>("--surface"), borderTopLeftRadius: t.pick<number>("--radius-lg"), borderTopRightRadius: t.pick<number>("--radius-lg"), paddingVertical: t.pick<number>("--space-2") }}>
          {label ? <Text style={{ ...baseText(t, { size: t.pick<number>("--text-sm"), color: "--ink-3", weight: "--weight-semi" }), paddingHorizontal: t.pick<number>("--space-4"), paddingVertical: t.pick<number>("--space-2") }}>{label}</Text> : null}
          <FlatList
            data={options}
            keyExtractor={(option) => option.value}
            renderItem={({ item }) => {
              const active = item.value === value;
              return (
                <Pressable
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active, disabled: item.disabled }}
                  disabled={item.disabled}
                  onPress={() => { onValueChange?.(item.value); setOpen(false); }}
                  style={({ pressed }) => ({ minHeight: MIN_TOUCH, justifyContent: "center", paddingHorizontal: t.pick<number>("--space-4"), backgroundColor: pressed || active ? t.pick<string>("--surface-2") : "transparent", opacity: item.disabled ? 0.55 : 1 })}
                >
                  <Text style={{ ...baseText(t, { size: fontSize, color: "--ink-1", weight: active ? "--weight-semi" : "--weight-regular" }) }}>{item.label}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </FieldShell>
  );
}
