import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import type { ViewProps } from "react-native";
import type { StatusDotCoreProps, StatusDotTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { renderText } from "../primitives";

export type { StatusDotTone };
export interface StatusDotProps extends StatusDotCoreProps, Omit<ViewProps, "children"> {}

const inks: Record<StatusDotTone, string> = { good: "--good-ink", ok: "--ok-ink", warn: "--weak-ink", critical: "--critical-ink", info: "--info-ink", neutral: "--ink-4" };

/** Ponto de estado de 6 pt com halo, rótulo opcional e pulso "ao vivo". */
export function StatusDot({ tone = "good", pulse = false, children, style, ...rest }: StatusDotProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const color = t.pick<string>(inks[tone]);
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!pulse || reduced) return;
    const half = 2 * t.pick<number>("--motion-feedback-duration", 120);
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: half, useNativeDriver: true }),
      Animated.timing(breath, { toValue: 0, duration: half, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced, breath, t]);
  // Halo de 3 pt a 18%, que respira até 6 pt a 8%, como o box-shadow da web.
  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 18 / 12] });
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 8 / 18] });
  const size = t.pick<number>("--text-2xs", 11);
  return (
    <View {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8) }, style]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 12, height: 12, alignItems: "center", justifyContent: "center", margin: -3 }}>
        <Animated.View style={{ position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: t.mix(color, 18, "transparent"), transform: [{ scale }], opacity }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      </View>
      {children != null && renderText(children, {
        fontSize: size, color: tone === "neutral" ? t.pick<string>("--ink-3") : color,
        ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium"),
        textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase",
        letterSpacing: t.size("--interface-label-tracking", 0.08 * size, size),
      })}
    </View>
  );
}
