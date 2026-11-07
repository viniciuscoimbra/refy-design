import { forwardRef, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { ViewProps, View as ViewType } from "react-native";
import type { OtpCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { lineHeight } from "../primitives";

export interface OtpProps extends OtpCoreProps, Omit<ViewProps, "children"> {}

/**
 * Código de verificação, um dígito por campo. Digitar avança; apagar num campo vazio volta e
 * limpa o anterior; colar ou o preenchimento automático do SMS distribui o código inteiro.
 */
export const Otp = forwardRef<ViewType, OtpProps>(function Otp(
  { length = 6, groupSize, value, defaultValue = "", onChange, onComplete, alphanumeric = false, label = "Código de verificação", error, disabled, autoFocus, style, ...rest },
  ref,
) {
  const t = useRefy();
  const [internal, setInternal] = useState(defaultValue.slice(0, length));
  const [focused, setFocused] = useState<number | null>(null);
  const code = (value !== undefined ? value : internal).slice(0, length);
  const inputs = useRef<Array<TextInput | null>>([]);
  const allowed = alphanumeric ? /[a-zA-Z0-9]/ : /[0-9]/;

  const commit = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    if (next.length === length && !next.includes(" ")) onComplete?.(next);
  };
  const cellsOf = () => Array.from({ length }, (_, i) => code[i] ?? " ");
  const focusAt = (i: number) => inputs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const onInput = (index: number, raw: string) => {
    const previous = code[index] && code[index] !== " " ? code[index] : "";
    // O campo mostra o dígito atual; o novo é o que sobrou depois de tirar o antigo.
    const typed = previous && raw.startsWith(previous) ? raw.slice(previous.length) : raw;
    const chars = typed.split("").filter((c) => allowed.test(c));
    if (!raw) {
      const cells = cellsOf(); cells[index] = " ";
      return commit(cells.join("").replace(/\s+$/, ""));
    }
    if (!chars.length) return;
    const cells = cellsOf();
    chars.slice(0, length - index).forEach((c, k) => { cells[index + k] = c; });
    commit(cells.join("").replace(/\s+$/, ""));
    focusAt(index + chars.length);
  };

  const critical = t.pick<string>("--critical", "--error");
  const primary = t.pick<string>("--primary");
  const cellWidth = t.pick<number>("--otp-cell-width", 48);
  const children: React.ReactNode[] = [];
  for (let i = 0; i < length; i++) {
    if (groupSize && i > 0 && i % groupSize === 0) {
      children.push(<Text key={`sep-${i}`} accessibilityElementsHidden importantForAccessibility="no" style={{ alignSelf: "center", color: t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") }}>—</Text>);
    }
    const char = code[i] && code[i] !== " " ? code[i] : "";
    const isFocused = focused === i;
    children.push(
      <TextInput
        key={i}
        ref={(node) => { inputs.current[i] = node; }}
        accessibilityLabel={`Dígito ${i + 1} de ${length}`}
        accessibilityState={{ disabled: Boolean(disabled) }}
        editable={!disabled}
        autoFocus={autoFocus && i === 0}
        keyboardType={alphanumeric ? "default" : "number-pad"}
        autoCapitalize="characters"
        autoCorrect={false}
        textContentType={i === 0 ? "oneTimeCode" : "none"}
        autoComplete={i === 0 ? "sms-otp" : "off"}
        selectTextOnFocus
        value={char}
        onChangeText={(text) => onInput(i, text)}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Backspace" && !char && i > 0) {
            const cells = cellsOf(); cells[i - 1] = " ";
            commit(cells.join("").replace(/\s+$/, ""));
            focusAt(i - 1);
          }
        }}
        onFocus={() => setFocused(i)}
        onBlur={() => setFocused((f) => (f === i ? null : f))}
        selectionColor={primary}
        style={{
          width: cellWidth, flexShrink: 1, minWidth: 0, height: 56, textAlign: "center", padding: 0,
          fontSize: 22, ...t.font(["--interface-detail-font", "--font-mono"], "--weight-semi"), color: t.pick<string>("--ink-1", "--on-surface"),
          backgroundColor: disabled ? t.pick<string>("--surface-2", "--surface-container-low") : t.pick<string>("--surface", "--surface-container-low"),
          borderWidth: t.pick<number>("--control-border-width", 1), borderRadius: t.pick<number>("--radius-default", 6),
          borderColor: error ? critical : isFocused ? primary : t.pick<string>("--line", "--surface-container-high"),
          boxShadow: isFocused ? `0 0 0 3px ${t.mix(error ? critical : primary, error ? 16 : 18, "transparent")}` : undefined,
          opacity: disabled ? 0.6 : 1,
        }}
      />,
    );
  }
  const help = t.pick<number>("--text-xs", 12);
  return (
    <View {...rest} style={[{ maxWidth: "100%", alignSelf: "flex-start", gap: t.pick<number>("--space-2", 8) }, style]}>
      <View ref={ref} accessibilityRole="none" role="group" accessibilityLabel={label} style={{ flexDirection: "row", gap: t.pick<number>("--space-2", 8), maxWidth: "100%" }}>{children}</View>
      {error && <Text accessibilityLiveRegion="polite" style={{ fontSize: help, lineHeight: lineHeight(help, t.pick<number>("--leading-snug", 1.35)), color: critical, ...t.font("--font-body", "--weight-regular") }}>{error}</Text>}
    </View>
  );
});
