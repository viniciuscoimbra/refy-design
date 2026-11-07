import { forwardRef, useId, useState } from "react";
import { TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import type { InputCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { FieldShell, surfaceStyle } from "./Field";

export interface InputProps extends InputCoreProps, Omit<TextInputProps, "style"> {
  disabled?: boolean;
  style?: TextInputProps["style"];
}

/** Campo de texto. Rótulo mono em caixa alta; foco na cor da marca. */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, prefix, suffix, block = true, disabled = false, style, onFocus, onBlur, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const [focused, setFocused] = useState(false);
  const labelId = useId();
  const height = t.pick<number>("--field-height", 38);
  const inline = t.pick<number>("--field-padding-inline", 12);
  const affixText = { color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-xs"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") };
  return (
    <FieldShell label={label} labelId={labelId} hint={hint} error={error} block={block}>
      <View style={[surfaceStyle(t, { focused, error: Boolean(error), disabled }), { flexDirection: "row", alignItems: "center", gap: 8, height, paddingHorizontal: inline }]}>
        {prefix != null && (
          <View style={{ alignSelf: "stretch", justifyContent: "center", marginLeft: -inline, paddingHorizontal: t.pick<number>("--space-3"), borderRightWidth: 1, borderRightColor: t.pick<string>("--line"), backgroundColor: t.pick<string>("--surface-2"), borderTopLeftRadius: t.pick<number>("--radius-default") - 1, borderBottomLeftRadius: t.pick<number>("--radius-default") - 1 }}>
            {renderText(prefix, { ...affixText, color: t.pick<string>("--ink-2"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") })}
          </View>
        )}
        <TextInput
          ref={ref}
          editable={!disabled}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityState={{ disabled }}
          aria-invalid={Boolean(error)}
          placeholderTextColor={t.pick<string>("--ink-4")}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          {...rest}
          style={[{ flex: 1, minWidth: 0, height: "100%", padding: 0, color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--field-font-size", "--text-sm"), ...t.font("--font-body", "--weight-regular") }, style]}
        />
        {suffix != null && <View style={{ flexShrink: 0 }}>{renderText(suffix, affixText)}</View>}
      </View>
    </FieldShell>
  );
});
