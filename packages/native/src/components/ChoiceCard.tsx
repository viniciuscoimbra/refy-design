import { Children, createContext, useCallback, useContext, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { ChoiceCardCoreProps, ChoiceCardGroupCoreProps, ChoiceCardMode } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { useReducedMotion } from "../hooks";

export type { ChoiceCardMode };
export interface ChoiceCardGroupProps extends ChoiceCardGroupCoreProps, Omit<ViewProps, "children"> {}
export interface ChoiceCardProps extends ChoiceCardCoreProps, Omit<ViewProps, "children"> {}

interface ChoiceCtx {
  mode: ChoiceCardMode;
  isSelected: (value: string) => boolean;
  select: (value: string) => void;
}
const Ctx = createContext<ChoiceCtx | null>(null);

const toArray = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);

/**
 * Grupo de cards com semântica de radio (single) ou checkbox (multiple). No toque não há
 * roving de teclado: o leitor de tela anda card a card e anuncia "selecionado".
 */
export function ChoiceCardGroup({ mode = "single", value, defaultValue, onChange, label, columns = 3, children, style, ...rest }: ChoiceCardGroupProps) {
  const t = useRefy();
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(() => toArray(defaultValue));
  const selected = controlled ? toArray(value) : internal;
  const [width, setWidth] = useState(0);
  const select = useCallback((v: string) => {
    const next = mode === "single" ? [v] : selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v];
    if (!controlled) setInternal(next);
    onChange?.(mode === "single" ? (next[0] ?? "") : next);
  }, [mode, selected, controlled, onChange]);
  const isSelected = useCallback((v: string) => selected.includes(v), [selected]);
  const ctx = useMemo(() => ({ mode, isSelected, select }), [mode, isSelected, select]);
  const gap = t.size("--space-3", 12);
  const cols = Math.max(1, columns);
  const cell = width ? (width - gap * (cols - 1)) / cols : undefined;
  return (
    <Ctx.Provider value={ctx}>
      <View
        accessibilityRole={mode === "single" ? "radiogroup" : undefined}
        accessibilityLabel={label}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...rest}
        style={[{ flexDirection: "row", flexWrap: "wrap", gap }, style]}
      >
        {Children.map(children, (child) => (child == null ? null : <View style={{ width: cell ?? `${100 / cols}%` }}>{child}</View>))}
      </View>
    </Ctx.Provider>
  );
}

/** Card selecionável: preview opcional, título com ícone, descrição e meta. Só dentro de ChoiceCardGroup. */
export function ChoiceCard({ value, title, description, icon, preview, meta, disabled = false, style, ...rest }: ChoiceCardProps) {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ChoiceCard deve estar dentro de ChoiceCardGroup.");
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const checked = ctx.isSelected(value);
  const primary = t.pick<string>("--primary");
  const snug = t.pick<number>("--leading-snug", 1.35);
  const sm = t.size("--text-sm", 13);
  const xs2 = t.size("--text-2xs", 11);
  return (
    <Pressable
      accessibilityRole={ctx.mode === "single" ? "radio" : "checkbox"}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => ctx.select(value)}
      {...rest}
      style={({ pressed }) => [
        {
          flex: 1,
          minHeight: 44,
          padding: t.size("--space-3", 12),
          backgroundColor: t.pick<string>("--surface"),
          borderWidth: t.pick<number>("--control-border-width", 1),
          borderColor: checked ? primary : pressed ? t.pick<string>("--legacy-line-strong") : t.pick<string>("--border"),
          borderRadius: t.pick<number>("--radius-lg-token", 12),
          boxShadow: checked ? `0 0 0 3px ${t.mix(primary, 12, "transparent")}` : undefined,
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed && !disabled && !reduced ? t.pick<number>("--motion-pressed-scale", 0.98) : 1 }],
        },
        typeof style === "function" ? undefined : style,
      ]}
    >
      {preview != null && (
        <View style={{ minHeight: 80, marginBottom: 10, alignItems: "center", justifyContent: "center", overflow: "hidden", borderWidth: t.pick<number>("--control-border-width", 1), borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--radius-md", 8) }}>{preview}</View>
      )}
      <View style={{ gap: 2, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: t.size("--space-2", 8) }}>
          {icon != null && <View>{icon}</View>}
          <View style={{ flexShrink: 1 }}>{renderText(title, { fontSize: sm, lineHeight: Math.round(sm * snug), color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") })}</View>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginLeft: "auto", width: 18, height: 18, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--control-radius", "--radius-sm", 4), backgroundColor: primary, opacity: checked ? 1 : 0, transform: [{ scale: checked ? 1 : 0.7 }] }}>
            <Text style={{ color: t.pick<string>("--on-primary"), fontSize: t.size("--text-xs", 12) }}>✓</Text>
          </View>
        </View>
        {description != null && renderText(description, { fontSize: xs2, lineHeight: Math.round(xs2 * snug), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}
        {meta != null && <View style={{ marginTop: t.size("--space-2", 8) }}>{renderText(meta, { fontSize: xs2, color: t.pick<string>("--ink-2"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") })}</View>}
      </View>
    </Pressable>
  );
}
