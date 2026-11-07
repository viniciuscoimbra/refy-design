import { forwardRef, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import type { ComboboxCoreProps, ComboboxOption, ComboboxOptionAvatar } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { hitSlopFor } from "../primitives";
import { IconSlot } from "../icon";
import { Avatar } from "./Avatar";
import { initialsOf } from "./AvatarGroup";
import { FieldShell, surfaceStyle } from "./Field";

export type { ComboboxOption, ComboboxOptionAvatar };
export interface ComboboxProps extends ComboboxCoreProps, Omit<TextInputProps, "value" | "defaultValue" | "onChange" | "style" | "placeholder"> {
  style?: TextInputProps["style"];
}

const defaultFilter = (option: ComboboxOption, query: string) => option.label.toLowerCase().includes(query.toLowerCase());

/** Filtro e seções na ordem de aparição, iguais aos da web. */
export function comboboxSections(options: ComboboxOption[], query: string, filter: ComboboxCoreProps["filter"] = true) {
  const fn = filter === false ? null : filter === true ? defaultFilter : filter;
  const filtered = fn && query.trim() ? options.filter((o) => fn(o, query)) : options;
  const map = new Map<string, ComboboxOption[]>();
  for (const option of filtered) {
    const key = option.group ?? "";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(option);
  }
  return { filtered, sections: Array.from(map, ([group, items]) => ({ group, items })) };
}

/** Lista embutida no campo (Field.module.css `.options`). */
export function listboxStyle(t: RefyContext) {
  return { maxHeight: 320, padding: t.pick<number>("--space-1", 4), borderTopWidth: t.pick<number>("--field-border-width", 1), borderTopColor: t.pick<string>("--border-soft", "--border", "--line") };
}

export function EmptyRow({ children }: { children: ReactNode }) {
  const t = useRefy();
  return <Text style={{ paddingVertical: 18, paddingHorizontal: 14, textAlign: "center", color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-regular") }}>{children}</Text>;
}

const OptionAvatar = ({ avatar }: { avatar: ComboboxOptionAvatar }) => (
  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    <Avatar size="sm" src={avatar.src} alt="" initials={initialsOf(avatar.name)} color={avatar.color} accessible={false} />
  </View>
);

/**
 * Campo com sugestões. A lista abre dentro do mesmo contorno do campo e empurra o conteúdo
 * abaixo, como na web. Filtro, destaque do trecho digitado e seções por `group` iguais.
 */
export const Combobox = forwardRef<TextInput, ComboboxProps>(function Combobox(
  { options, value, defaultValue = null, onChange, inputValue, onInputValueChange, label, filter = true, icon, emptyMessage = "Nenhum resultado", defaultOpen = false, clearable = true, error, hint, disabled = false, placeholder = "Buscar…", style, onFocus, onBlur, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const labelId = useId();
  const [selectedInternal, setSelectedInternal] = useState<string | null>(defaultValue);
  const selected = value !== undefined ? value : selectedInternal;
  const selectedOption = useMemo(() => options.find((o) => o.value === selected) ?? null, [options, selected]);
  const [textInternal, setTextInternal] = useState(selectedOption?.label ?? "");
  const text = inputValue !== undefined ? inputValue : textInternal;
  const setText = (next: string) => { if (inputValue === undefined) setTextInternal(next); onInputValueChange?.(next); };
  const [open, setOpen] = useState(defaultOpen);
  const [focused, setFocused] = useState(false);
  const query = selectedOption && text === selectedOption.label ? "" : text;
  const { filtered, sections } = useMemo(() => comboboxSections(options, query, filter), [options, query, filter]);

  const commit = (option: ComboboxOption) => {
    if (option.disabled) return;
    if (value === undefined) setSelectedInternal(option.value);
    setText(option.label);
    onChange?.(option);
    setOpen(false);
  };
  const clear = () => {
    if (value === undefined) setSelectedInternal(null);
    setText("");
    onChange?.(null);
  };

  const ink1 = t.pick<string>("--ink-1", "--on-surface");
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const sm = t.pick<number>("--text-sm", 13);
  const xs2 = t.pick<number>("--text-2xs", 11);
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const mono = (weight: string | number) => t.font(["--interface-detail-font", "--font-mono"], weight);
  const height = t.pick<number>("--combobox-input-height", "--field-height", 38) - 2 * t.pick<number>("--field-border-width", 1);
  const clearSize = t.pick<number>("--embedded-clear-size", 22);
  const q = query.trim();
  const highlight = (text: string) => {
    const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
    if (at < 0) return text;
    return <>{text.slice(0, at)}<Text style={{ color: t.pick<string>("--primary-ink", "--primary"), ...t.font("--font-body", "--weight-bold") }}>{text.slice(at, at + q.length)}</Text>{text.slice(at + q.length)}</>;
  };

  return (
    <FieldShell label={label} labelId={labelId} hint={hint} error={error} block>
      <View style={[surfaceStyle(t, { focused, error: Boolean(error), disabled }), { overflow: "hidden" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8), height, paddingHorizontal: t.pick<number>("--space-3", 12) }}>
          {selectedOption?.avatar && text === selectedOption.label ? <OptionAvatar avatar={selectedOption.avatar} /> : (
            <IconSlot size={16} color={ink3}>
              {icon ?? <Svg viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Circle cx={11} cy={11} r={7} /><Line x1={21} y1={21} x2={16.65} y2={16.65} /></Svg>}
            </IconSlot>
          )}
          <TextInput
            ref={ref}
            editable={!disabled}
            accessibilityRole="search"
            accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
            accessibilityLabelledBy={label ? labelId : undefined}
            accessibilityState={{ disabled, expanded: open }}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            placeholder={placeholder}
            placeholderTextColor={t.pick<string>("--ink-4")}
            value={text}
            onChangeText={(next) => { setText(next); setOpen(true); }}
            onFocus={(e) => { setFocused(true); setOpen(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); setOpen(false); onBlur?.(e); }}
            {...rest}
            style={[{ flex: 1, minWidth: 0, height: "100%", padding: 0, color: ink1, fontSize: t.pick<number>("--field-font-size", "--text-sm"), ...t.font("--font-body", "--weight-medium") }, style]}
          />
          {clearable && !!text && !disabled && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpar"
              onPress={clear}
              hitSlop={hitSlopFor(clearSize, clearSize)}
              style={({ pressed }) => ({ width: clearSize, height: clearSize, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--embedded-action-radius", "--radius-pill"), backgroundColor: pressed ? t.pick<string>("--surface-2", "--surface-container-high") : "transparent" })}
            >
              <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2.4} strokeLinecap="round"><Line x1={6} y1={6} x2={18} y2={18} /><Line x1={18} y1={6} x2={6} y2={18} /></Svg>
            </Pressable>
          )}
        </View>
        {open && (
          <ScrollView role="list" accessibilityLabel={label || placeholder} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={listboxStyle(t)}>
            {filtered.length === 0 ? <EmptyRow>{emptyMessage}</EmptyRow> : sections.map(({ group, items }) => (
              <View key={group || "__default"} style={{ padding: t.pick<number>("--space-1", 4) }}>
                {group ? <Text accessibilityRole="header" style={{ paddingTop: t.pick<number>("--space-2", 8), paddingBottom: t.pick<number>("--space-1", 4), paddingHorizontal: 10, color: ink3, fontSize: eyebrow, letterSpacing: eyebrow * 0.14, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...mono("--weight-regular") }}>{group}</Text> : null}
                {items.map((option) => (
                  <Pressable
                    key={option.value}
                    role="option"
                    accessibilityLabel={[option.label, option.description, option.meta].filter(Boolean).join(", ")}
                    accessibilityState={{ selected: option.value === selected, disabled: Boolean(option.disabled) }}
                    disabled={option.disabled}
                    onPress={() => commit(option)}
                    style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: t.pick<number>("--space-2", 8), paddingHorizontal: 10, borderRadius: t.pick<number>("--radius-md", 8), opacity: option.disabled ? 0.45 : 1, backgroundColor: pressed && !option.disabled ? t.pick<string>("--surface-2", "--surface-container-high") : "transparent" })}
                  >
                    {option.avatar ? <OptionAvatar avatar={option.avatar} /> : option.lead ? (
                      <View style={{ width: 24, height: 24, borderRadius: t.pick<number>("--radius-md", 8), alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface-2", "--surface-container-high") }}>
                        <Text style={{ color: ink3, fontSize: eyebrow, ...mono("--weight-semi") }}>{option.lead}</Text>
                      </View>
                    ) : null}
                    <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
                      <Text numberOfLines={1} style={{ color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}>{highlight(option.label)}</Text>
                      {option.description ? <Text numberOfLines={1} style={{ color: ink3, fontSize: xs2, ...mono("--weight-regular") }}>{option.description}</Text> : null}
                    </View>
                    {option.meta ? <Text style={{ color: ink3, fontSize: xs2, ...mono("--weight-medium") }}>{option.meta}</Text> : null}
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </FieldShell>
  );
});
