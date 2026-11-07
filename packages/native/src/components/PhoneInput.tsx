import { forwardRef, useId, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import type { PhoneCountry, PhoneInputCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor } from "../primitives";
import { FieldShell, surfaceStyle } from "./Field";
import { Menu } from "./Menu";

export type { PhoneCountry };

/** Cópia da lista da web; o teste de paridade compara as duas. */
export const phoneCountries: PhoneCountry[] = [
  { code: "AR", name: "Argentina", callingCode: "+54", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", callingCode: "+55", flag: "🇧🇷" },
  { code: "CL", name: "Chile", callingCode: "+56", flag: "🇨🇱" },
  { code: "US", name: "Estados Unidos", callingCode: "+1", flag: "🇺🇸" },
  { code: "PY", name: "Paraguai", callingCode: "+595", flag: "🇵🇾" },
  { code: "PT", name: "Portugal", callingCode: "+351", flag: "🇵🇹" },
  { code: "UY", name: "Uruguai", callingCode: "+598", flag: "🇺🇾" },
];

export function formatBrazilianPhone(value: string) {
  const number = value.replace(/\D/g, "").slice(0, 11);
  if (number.length <= 2) return number.replace(/^(\d+)/, "($1");
  if (number.length <= 6) return number.replace(/^(\d{2})(\d+)/, "($1) $2");
  if (number.length <= 10) return number.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return number.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

export interface PhoneInputProps extends PhoneInputCoreProps, Omit<TextInputProps, "style" | "keyboardType"> {
  disabled?: boolean;
  style?: TextInputProps["style"];
}

/** Telefone com país e código internacional no mesmo campo. No Brasil, formata (31) 99999-9999 enquanto digita. */
export const PhoneInput = forwardRef<TextInput, PhoneInputProps>(function PhoneInput(
  { label, hint, error, country = "BR", countries = phoneCountries, onCountryChange, disabled = false, value, onChangeText, onFocus, onBlur, style, accessibilityLabel, maxLength, ...rest },
  ref,
) {
  const t = useRefy();
  const [focused, setFocused] = useState(false);
  const [menu, setMenu] = useState(false);
  const labelId = useId();
  const selected = countries.find((item) => item.code === country) ?? countries[0];
  const height = t.pick<number>("--phone-input-height", "--field-height", 38);
  const br = country === "BR";
  return (
    <FieldShell label={label} labelId={labelId} hint={hint} error={error} block>
      <View style={[surfaceStyle(t, { focused, error: Boolean(error), disabled }), { flexDirection: "row", height, overflow: "hidden" }]}>
        <Menu
          open={menu}
          onOpenChange={setMenu}
          ariaLabel="País e código internacional"
          entries={countries.map((item) => ({ id: item.code, label: `${item.name} · ${item.callingCode}`, icon: <Text>{item.flag}</Text> }))}
          onSelect={(code) => { const next = countries.find((item) => item.code === code); if (next) onCountryChange?.(next); }}
          style={{ alignSelf: "stretch" }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`País: ${selected.name} ${selected.callingCode}`}
            accessibilityState={{ disabled, expanded: menu }}
            disabled={disabled}
            onPress={() => setMenu(true)}
            hitSlop={hitSlopFor(height)}
            style={{ width: 58, height: "100%", minHeight: height, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: t.pick<number>("--space-1", 4), borderRightWidth: 1, borderRightColor: t.pick<string>("--line"), backgroundColor: t.pick<string>("--surface-2") }}
          >
            <Text style={{ fontSize: t.pick<number>("--text-base", 14) }}>{selected.flag}</Text>
            <Text style={{ color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-xs", 12) }}>⌄</Text>
          </Pressable>
        </Menu>
        <TextInput
          ref={ref}
          editable={!disabled}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityLabelledBy={label ? labelId : undefined}
          accessibilityState={{ disabled }}
          aria-invalid={Boolean(error)}
          placeholderTextColor={t.pick<string>("--ink-4")}
          value={br && typeof value === "string" ? formatBrazilianPhone(value) : value}
          maxLength={br ? 15 : maxLength}
          onChangeText={(text) => onChangeText?.(br ? formatBrazilianPhone(text) : text)}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          {...rest}
          style={[{ flex: 1, minWidth: 0, height: "100%", paddingVertical: 0, paddingHorizontal: t.pick<number>("--space-3", 12), color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--field-font-size", "--text-sm"), ...t.font("--font-body", "--weight-regular") }, style]}
        />
      </View>
    </FieldShell>
  );
});
