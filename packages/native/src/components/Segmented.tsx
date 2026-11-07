import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, View } from "react-native";
import type { ViewProps } from "react-native";
import type { SegmentedCoreProps, SegmentedOption } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor, paddingFrom, renderText } from "../primitives";
import { useReducedMotion } from "../hooks";

export type { SegmentedOption };
export interface SegmentedProps extends SegmentedCoreProps, Omit<ViewProps, "children"> {}

/**
 * Seleção única em pílula. Semântica de radiogroup; cada segmento é radio. Sem tooltip no
 * toque: em iconOnly o rótulo textual vira só o nome acessível.
 */
export function Segmented({ options, value, defaultValue, onChange, label, disabled = false, sliding = false, iconOnly = false, style, ...rest }: SegmentedProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value);
  const current = value !== undefined ? value : internal;
  const [frames, setFrames] = useState<Record<string, { x: number; width: number }>>({});
  const x = useRef(new Animated.Value(0)).current;
  const w = useRef(new Animated.Value(0)).current;
  const active = current != null ? frames[current] : undefined;
  useEffect(() => {
    if (!sliding || !active) return;
    const cfg = { duration: reduced ? 0 : t.pick<number>("--motion-feedback-duration", 120), easing: Easing.bezier(...t.easing("--ease-out")), useNativeDriver: false };
    const run = Animated.parallel([Animated.timing(x, { toValue: active.x, ...cfg }), Animated.timing(w, { toValue: active.width, ...cfg })]);
    run.start();
    return () => run.stop();
  }, [sliding, active?.x, active?.width, reduced, t, x, w]);

  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  const groupRadius = t.pick<number>("--control-group-radius", "--radius-pill");
  const activeBg = t.pick<string>("--segment-active-background", "--surface", "--surface-container");
  const elev = t.pick<string>("--elev-1", "");
  const fontSize = t.size("--control-font-size", t.size("--text-xs", 12));
  const segHeight = t.size("--segment-height", sliding ? 28 : iconOnly ? 34 : 0);
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      {...rest}
      style={[{ alignSelf: "flex-start", maxWidth: "100%", opacity: disabled ? 0.55 : 1, padding: 3, backgroundColor: t.pick<string>("--surface-2", "--surface-container-low"), borderWidth: t.pick<number>("--control-border-width", 1), borderColor: t.pick<string>("--line", "--surface-container-high"), borderRadius: groupRadius }, style]}
    >
      <ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false} scrollEnabled={!iconOnly} contentContainerStyle={{ gap: 2 }}>
        {sliding && active && (
          <Animated.View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: w, transform: [{ translateX: x }], borderRadius: groupRadius, backgroundColor: activeBg, boxShadow: elev || undefined }} />
        )}
        {options.map((option) => {
          const isActive = option.value === current;
          const compact = iconOnly && Boolean(option.icon) && typeof option.label === "string";
          const off = disabled || Boolean(option.disabled);
          const color = isActive ? t.pick<string>("--segment-active-color", "--ink-1", "--on-surface") : t.pick<string>("--ink-3", "--on-surface-variant");
          const text = { color, fontSize, lineHeight: Math.round(fontSize * 1.3), ...t.font("--font-body", isActive ? t.pick<number | string>("--segment-active-weight", "--weight-medium") : "--weight-medium") };
          const pad = compact ? { paddingTop: 6, paddingRight: 6, paddingBottom: 6, paddingLeft: 6 } : paddingFrom(t, "--segment-padding", [7, 14]);
          // Altura natural da web (padding + linha) fica explícita para o hitSlop completar 44 pt.
          const height = compact ? segHeight || 34 : segHeight || pad.paddingTop + pad.paddingBottom + Math.round(fontSize * 1.3);
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={compact ? String(option.label) : undefined}
              accessibilityState={{ checked: isActive, disabled: off }}
              disabled={off}
              onPress={() => select(option.value)}
              onLayout={(e) => {
                const { x: fx, width } = e.nativeEvent.layout;
                setFrames((prev) => (prev[option.value]?.x === fx && prev[option.value]?.width === width ? prev : { ...prev, [option.value]: { x: fx, width } }));
              }}
              hitSlop={hitSlopFor(height, compact ? height : undefined)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                ...pad,
                width: compact ? height : undefined,
                height,
                borderRadius: groupRadius,
                opacity: option.disabled && !disabled ? 0.45 : 1,
                backgroundColor: isActive && !sliding ? activeBg : pressed ? t.mix(t.pick<string>("--ink-1"), 9, "transparent") : "transparent",
                boxShadow: isActive && !sliding && elev ? elev : undefined,
              })}
            >
              {option.icon != null && <View style={{ width: compact ? 16 : 13, height: compact ? 16 : 13 }}>{option.icon}</View>}
              {!compact && renderText(option.label, text, { numberOfLines: 1 })}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
