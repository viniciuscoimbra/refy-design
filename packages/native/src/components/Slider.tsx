import { useState } from "react";
import { Text, View } from "react-native";
import type { AccessibilityActionEvent, ViewProps } from "react-native";
import type { SliderCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { Header, clamp, mono, snap, thumbStyle, useTrackGesture } from "./Track";

export interface SliderProps extends SliderCoreProps, Omit<ViewProps, "children"> {}

const HEIGHT = 28;

/**
 * Controle contínuo arrastável. Tocar na trilha leva o controle ao ponto; arrastar segue o dedo.
 * Com leitor de tela, deslizar para cima ou para baixo anda um passo.
 */
export function Slider({ min = 0, max = 100, step = 1, value, defaultValue, onChange, label, hideLabel = false, formatValue = String, showValue: showValueProp = true, ticks, marks, disabled, style, ...rest }: SliderProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const [internal, setInternal] = useState(defaultValue ?? min);
  const [dragging, setDragging] = useState(false);
  const current = clamp(value !== undefined ? value : internal, min, max);
  const ratio = max === min ? 0 : (current - min) / (max - min);
  const commit = (next: number) => {
    const fixed = snap(next, min, max, step);
    if (fixed === current) return;
    if (value === undefined) setInternal(fixed);
    onChange?.(fixed);
  };
  const gesture = useTrackGesture(min, max, disabled, { onStart: (v) => { setDragging(true); commit(v); }, onMove: commit, onEnd: () => setDragging(false) });
  const readout = formatValue(current);
  const showValue = showValueProp && !hideLabel;
  const stepCount = marks ? marks.length - 1 : 0;
  const valueText = marks ? marks[Math.round((current - min) / step)] ?? readout : readout;
  const onAction = (e: AccessibilityActionEvent) => commit(current + (e.nativeEvent.actionName === "increment" ? step : -step));
  return (
    <View {...rest} style={[{ width: "100%", maxWidth: 520, opacity: disabled ? 0.55 : 1 }, style]}>
      <Header t={t} label={hideLabel ? undefined : label} readout={showValue ? readout : undefined} />
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: Math.round(min), max: Math.round(max), now: Math.round(current), text: valueText }}
        accessibilityState={{ disabled: Boolean(disabled) }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={onAction}
        hitSlop={{ top: 8, bottom: 8 }}
        onLayout={gesture.onLayout}
        {...gesture.handlers}
        style={{ height: HEIGHT, justifyContent: "center" }}
      >
        <View pointerEvents="none" style={{ height: 4, borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: t.pick<string>("--line", "--surface-container-high") }} />
        <View pointerEvents="none" style={{ position: "absolute", left: 0, width: `${ratio * 100}%`, height: 4, borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: t.pick<string>("--primary") }} />
        {marks && marks.map((_, i) => (
          <View key={i} pointerEvents="none" style={{ position: "absolute", left: (i / stepCount) * gesture.width - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: t.pick<string>("--ink-4", "--outline") }} />
        ))}
        <View pointerEvents="none" style={thumbStyle(t, 18, ratio * gesture.width, dragging, reduced)} />
      </View>
      {marks ? (
        <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>{marks.map((m) => <Text key={m} style={mono(t, "--text-eyebrow")}>{m}</Text>)}</View>
      ) : ticks && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
          {ticks.map((tick) => <Text key={tick} style={{ ...mono(t, "--text-eyebrow"), textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", letterSpacing: t.size("--interface-label-tracking", t.size("--tracking-uppercase", 1.8, 11), 11) }}>{tick}</Text>)}
        </View>
      )}
    </View>
  );
}
