import { forwardRef, useId, useState } from "react";
import { TextInput } from "react-native";
import type { TextInputProps } from "react-native";
import type { TextareaCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { lineHeight } from "../primitives";
import { FieldShell, surfaceStyle } from "./Field";

export interface TextareaProps extends TextareaCoreProps, Omit<TextInputProps, "style" | "multiline"> {
  disabled?: boolean;
  /** Linhas visíveis antes de rolar; a web usa rows=3. */
  rows?: number;
  style?: TextInputProps["style"];
}

/** Texto longo. Mesma moldura do Input; cresce até `rows` linhas visíveis. */
export const Textarea = forwardRef<TextInput, TextareaProps>(function Textarea(
  { label, hint, error, block = true, disabled = false, rows = 3, style, onFocus, onBlur, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const [focused, setFocused] = useState(false);
  const labelId = useId();
  const fontSize = t.pick<number>("--field-font-size", "--text-sm");
  const lh = lineHeight(fontSize, t.pick<number>("--leading-normal", 1.55)) ?? Math.round(fontSize * 1.55);
  return (
    <FieldShell label={label} labelId={labelId} hint={hint} error={error} block={block}>
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        editable={!disabled}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityLabelledBy={label ? labelId : undefined}
        accessibilityState={{ disabled }}
        placeholderTextColor={t.pick<string>("--ink-4")}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        {...rest}
        style={[surfaceStyle(t, { focused, error: Boolean(error), disabled }), { minHeight: rows * lh + 18, paddingVertical: 9, paddingHorizontal: t.pick<number>("--field-padding-inline", 12), color: t.pick<string>("--ink-1"), fontSize, lineHeight: lh, ...t.font("--font-body", "--weight-regular") }, style]}
      />
    </FieldShell>
  );
});
