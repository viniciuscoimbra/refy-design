import { forwardRef, useImperativeHandle, useId, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import type { MultiselectCoreProps, MultiselectOption } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor } from "../primitives";
import { AnchoredLayer } from "../overlay";
import { Chip } from "./Chip";
import { EmptyRow, listboxStyle } from "./Combobox";
import { FieldShell, surfaceStyle } from "./Field";

export type { MultiselectOption };
export interface MultiselectProps extends MultiselectCoreProps, Omit<TextInputProps, "value" | "defaultValue" | "onChange" | "style" | "placeholder"> {
  style?: TextInputProps["style"];
}

/**
 * Quantos chips inteiros cabem na área, contando o "+N" quando sobra algum. Mesma conta da web
 * (Multiselect.tsx, `measure`), com a largura do contador medida uma vez.
 */
export function visibleChipCount(widths: number[], gap: number, area: number, counter: number, max?: number) {
  const total = widths.length;
  const ceiling = Math.min(total, max === undefined || !Number.isFinite(max) ? total : Math.max(0, Math.floor(max)));
  const prefix = [0];
  widths.forEach((w) => prefix.push(prefix[prefix.length - 1] + w));
  let count = ceiling;
  for (; count > 0; count--) {
    const hidden = total - count;
    if (prefix[count] + gap * (count - 1) + (hidden ? counter + gap : 0) <= area) break;
  }
  return count;
}

/**
 * Seleção de várias opções com chips dentro do campo. Mostra os chips que cabem inteiros e
 * resume o resto num "+N", como na web. A lista abre dentro do campo (`inline`) ou ancorada
 * embaixo dele (`overlay`).
 */
export const Multiselect = forwardRef<TextInput, MultiselectProps>(function Multiselect(
  { options, value, defaultValue = [], onChange, label, maxVisibleChips, listPlacement = "inline", emptyMessage = "Nenhuma opção", error, hint, disabled = false, placeholder = "Adicionar…", style, onBlur, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const labelId = useId();
  const input = useRef<TextInput>(null);
  useImperativeHandle(ref, () => input.current as TextInput);
  const wrap = useRef<View>(null);
  const [selectedInternal, setSelectedInternal] = useState<string[]>(defaultValue);
  const selected = value !== undefined ? value : selectedInternal;
  const selectedOptions = useMemo(() => selected.map((v) => options.find((o) => o.value === v)).filter(Boolean) as MultiselectOption[], [selected, options]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const [counter, setCounter] = useState(0);
  const [area, setArea] = useState(0);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const setSelected = (next: string[]) => { if (value === undefined) setSelectedInternal(next); onChange?.(next); };
  const toggle = (option: MultiselectOption) => {
    if (option.disabled) return;
    setSelected(selected.includes(option.value) ? selected.filter((v) => v !== option.value) : [...selected, option.value]);
  };
  const remove = (v: string) => setSelected(selected.filter((x) => x !== v));

  const gap = t.pick<number>("--space-1", 4);
  const measured = selectedOptions.every((o) => widths[o.value] !== undefined) && area > 0;
  const visible = measured ? visibleChipCount(selectedOptions.map((o) => widths[o.value]), gap, area, counter, maxVisibleChips) : Math.min(selectedOptions.length, maxVisibleChips ?? selectedOptions.length);
  const hidden = selectedOptions.length - visible;
  const height = t.pick<number>("--field-height", 38) - 2 * t.pick<number>("--field-border-width", 1);
  const caretW = t.pick<number>("--embedded-caret-size", 24);
  const ink1 = t.pick<string>("--ink-1", "--on-surface");
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const primary = t.pick<string>("--primary");
  const fontSize = t.pick<number>("--field-font-size", "--text-sm");

  const list = filtered.length === 0 ? <EmptyRow>{emptyMessage}</EmptyRow> : filtered.map((option) => {
    const isSelected = selected.includes(option.value);
    return (
      <Pressable
        key={option.value}
        role="option"
        accessibilityLabel={option.label}
        accessibilityState={{ selected: isSelected, checked: isSelected, disabled: Boolean(option.disabled) }}
        disabled={option.disabled}
        onPress={() => toggle(option)}
        style={({ pressed }) => ({
          minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: t.pick<number>("--space-2", 8), paddingHorizontal: 10,
          borderRadius: t.pick<number>("--radius-md", 8), opacity: option.disabled ? 0.45 : 1,
          backgroundColor: isSelected ? t.mix(primary, pressed ? 12 : 6, "transparent") : pressed && !option.disabled ? t.pick<string>("--surface-2", "--surface-container-high") : "transparent",
        })}
      >
        <View style={{ width: 16, height: 16, borderRadius: t.pick<number>("--radius-sm", 4), borderWidth: t.pick<number>("--control-border-width", 1.5), borderColor: isSelected ? primary : t.pick<string>("--border", "--line"), backgroundColor: isSelected ? primary : t.pick<string>("--field-background", "--surface"), alignItems: "center", justifyContent: "center" }}>
          {isSelected && <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--on-primary", "--surface")} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><Polyline points="20 6 9 17 4 12" /></Svg>}
        </View>
        <Text style={{ flex: 1, color: ink1, fontSize, ...t.font("--font-body", "--weight-medium") }}>{option.label}</Text>
      </Pressable>
    );
  });

  const openList = () => { setOpen(true); input.current?.focus(); };
  return (
    <FieldShell label={label} labelId={labelId} hint={hint} error={error} block>
      <View ref={wrap} collapsable={false} style={[surfaceStyle(t, { focused: open, error: Boolean(error), disabled }), { overflow: "hidden" }, open && listPlacement === "overlay" ? { borderColor: primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, boxShadow: undefined } : null]}>
        <Pressable accessible={false} disabled={disabled} onPress={openList} style={{ height, flexDirection: "row", alignItems: "center", gap, paddingLeft: 10, paddingRight: gap, overflow: "hidden" }}>
          {selectedOptions.length > 0 && (
            <View onLayout={(e) => setArea(e.nativeEvent.layout.width)} style={{ flex: 1, minWidth: 0, height: "100%", flexDirection: "row", alignItems: "center", gap, overflow: "hidden" }}>
              {selectedOptions.slice(0, visible).map((option) => (
                <Chip key={option.value} variant="selection" removable disabled={disabled} style={{ alignSelf: "center" }} accessibilityLabel={`Remover ${option.label}`} onRemove={() => remove(option.value)}>{option.label}</Chip>
              ))}
              {hidden > 0 && (
                <Chip variant="selection" disabled={disabled} style={{ alignSelf: "center" }} accessibilityLabel={`${hidden} outras opções selecionadas. Abrir opções`} onPress={openList}>{`+${hidden}`}</Chip>
              )}
              <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", left: 0, top: 0, flexDirection: "row", opacity: 0 }}>
                {selectedOptions.map((option) => (
                  <View key={option.value} onLayout={(e) => { const w = e.nativeEvent.layout.width; setWidths((m) => (m[option.value] === w ? m : { ...m, [option.value]: w })); }}>
                    <Chip variant="selection" removable accessible={false}>{option.label}</Chip>
                  </View>
                ))}
                <View onLayout={(e) => setCounter(e.nativeEvent.layout.width)}><Chip variant="selection" accessible={false}>+9</Chip></View>
              </View>
            </View>
          )}
          <TextInput
            ref={input}
            editable={!disabled}
            accessibilityHint="Digite para filtrar as opções"
            accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
            accessibilityLabelledBy={label ? labelId : undefined}
            accessibilityState={{ disabled, expanded: open }}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            autoCorrect={false}
            spellCheck={false}
            placeholder={selected.length ? "" : placeholder}
            placeholderTextColor={t.pick<string>("--ink-4")}
            value={query}
            onChangeText={(next) => { setQuery(next); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyPress={(e) => { if (e.nativeEvent.key === "Backspace" && !query && selected.length) remove(selected[selected.length - 1]); }}
            onBlur={(e) => { if (listPlacement === "inline") setOpen(false); onBlur?.(e); }}
            {...rest}
            style={[{ height: "100%", padding: 0, color: ink1, fontSize, ...t.font("--font-body", "--weight-medium") }, selectedOptions.length ? { width: query ? Math.max(40, Math.min(area / 2, query.length * fontSize * 0.6 + 8)) : 8 } : { flex: 1, minWidth: t.pick<number>("--multiselect-input-min-width", 80) }, style]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={open ? "Fechar opções" : "Abrir opções"}
            disabled={disabled}
            onPress={() => (open ? setOpen(false) : openList())}
            hitSlop={hitSlopFor(28, caretW)}
            style={({ pressed }) => ({ width: caretW, height: 28, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--radius-md", 8), backgroundColor: pressed ? t.pick<string>("--surface-2", "--surface-container-high") : "transparent", transform: open ? [{ rotate: "180deg" }] : undefined })}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Polyline points="6 9 12 15 18 9" /></Svg>
          </Pressable>
        </Pressable>
        {listPlacement === "inline" && open && (
          <ScrollView role="list" accessibilityLabel={label || placeholder} nestedScrollEnabled keyboardShouldPersistTaps="handled" style={listboxStyle(t)}>{list}</ScrollView>
        )}
      </View>
      {listPlacement === "overlay" && (
        <AnchoredLayer
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={wrap}
          matchWidth
          gap={0}
          label={label || placeholder}
          panelStyle={{ backgroundColor: t.pick<string>("--field-background", "--surface"), borderWidth: t.pick<number>("--field-border-width", 1), borderTopWidth: 0, borderColor: primary, borderBottomLeftRadius: t.pick<number>("--field-radius", "--radius-default"), borderBottomRightRadius: t.pick<number>("--field-radius", "--radius-default"), overflow: "hidden" }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" style={listboxStyle(t)}>{list}</ScrollView>
        </AnchoredLayer>
      )}
    </FieldShell>
  );
});
