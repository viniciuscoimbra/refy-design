import { useState } from "react";
import { Text, View } from "react-native";
import type { AccessibilityActionEvent, ViewProps } from "react-native";
import type { RangeCoreProps, RangeValue } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { Header, clamp, mono, snap, thumbStyle, useTrackGesture } from "./Track";

export type { RangeValue };
export interface RangeProps extends RangeCoreProps, Omit<ViewProps, "children"> {}

const THUMB = 22;

/**
 * Intervalo com dois controles. Tocar na trilha leva o controle mais próximo ao ponto; o mínimo
 * nunca passa do máximo. Cada controle é ajustável pelo leitor de tela, um passo por gesto.
 */
export function Range({ min = 0, max = 100, step = 1, value, defaultValue, onChange, label, formatValue = String, showValue = true, fixedMinimum = false, ticks, histogram, disabled, style, ...rest }: RangeProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const [internal, setInternal] = useState<RangeValue>(defaultValue ?? [min, max]);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);
  const raw = value !== undefined ? value : internal;
  const low = fixedMinimum ? min : clamp(Math.min(raw[0], raw[1]), min, max);
  const high = clamp(Math.max(raw[0], raw[1]), min, max);
  const pct = (v: number) => (max === min ? 0 : (v - min) / (max - min));

  const commit = (which: "low" | "high", next: number) => {
    if (fixedMinimum && which === "low") return;
    const fixed = which === "low" ? Math.min(snap(next, min, max, step), high) : Math.max(snap(next, min, max, step), low);
    const pair: RangeValue = which === "low" ? [fixed, high] : [low, fixed];
    if (pair[0] === low && pair[1] === high) return;
    if (value === undefined) setInternal(pair);
    onChange?.(pair);
  };
  const gesture = useTrackGesture(min, max, disabled, {
    onStart: (v) => {
      const which = fixedMinimum ? "high" : Math.abs(v - low) < Math.abs(v - high) ? "low" : "high";
      setDragging(which);
      commit(which, v);
    },
    onMove: (v) => dragging && commit(dragging, v),
    onEnd: () => setDragging(null),
  });
  const thumb = (which: "low" | "high") => {
    const current = which === "low" ? low : high;
    const name = `${label ? `${label} — ` : ""}${fixedMinimum ? "valor" : which === "low" ? "mínimo" : "máximo"}`;
    return (
      <View
        key={which}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={name}
        accessibilityValue={{ min: Math.round(which === "low" ? min : low), max: Math.round(which === "low" ? high : max), now: Math.round(current), text: formatValue(current) }}
        accessibilityState={{ disabled: Boolean(disabled) }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(e: AccessibilityActionEvent) => commit(which, current + (e.nativeEvent.actionName === "increment" ? step : -step))}
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
        pointerEvents="none"
        style={thumbStyle(t, THUMB, pct(current) * gesture.width, dragging === which, reduced)}
      />
    );
  };
  const peak = histogram && histogram.length ? Math.max(...histogram) : 0;
  return (
    <View {...rest} style={[{ width: "100%", opacity: disabled ? 0.55 : 1 }, style]}>
      <Header t={t} label={label} readout={showValue ? (fixedMinimum ? formatValue(high) : `${formatValue(low)} — ${formatValue(high)}`) : undefined} />
      {histogram && histogram.length > 0 && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", alignItems: "flex-end", gap: 1, height: 28, marginTop: 8, marginBottom: 6, paddingHorizontal: 11 }}>
          {histogram.map((h, i) => {
            const center = min + ((i + 0.5) / histogram.length) * (max - min);
            const inside = center >= low && center <= high;
            const xs = t.pick<number>("--radius-xs", 2);
            return <View key={i} style={{ flex: 1, height: `${peak ? (h / peak) * 100 : 0}%`, backgroundColor: t.pick<string>("--primary-ink"), opacity: inside ? 0.55 : 0.15, borderTopLeftRadius: xs, borderTopRightRadius: xs }} />;
          })}
        </View>
      )}
      <View onLayout={gesture.onLayout} {...gesture.handlers} style={{ height: 32, justifyContent: "center" }}>
        <View pointerEvents="none" style={{ height: 6, borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: t.pick<string>("--line", "--surface-container-high") }} />
        <View pointerEvents="none" style={{ position: "absolute", left: `${pct(low) * 100}%`, width: `${(pct(high) - pct(low)) * 100}%`, height: 6, borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: t.pick<string>("--primary") }} />
        {!fixedMinimum && thumb("low")}
        {thumb("high")}
      </View>
      {ticks && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
          {ticks.map((tick, i) => <Text key={i} style={mono(t, "--text-eyebrow")}>{tick}</Text>)}
        </View>
      )}
    </View>
  );
}
