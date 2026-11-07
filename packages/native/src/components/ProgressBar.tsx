import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import type { ViewProps } from "react-native";
import type { ProgressBarCoreProps, ProgressTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";

export type { ProgressTone };
export interface ProgressBarProps extends ProgressBarCoreProps, ViewProps {}

const toneToken: Record<ProgressTone, string> = { primary: "--primary", neutral: "--ink-1", warn: "--weak", critical: "--critical" };

/** Barra de progresso. Indeterminada desliza em loop; com movimento reduzido fica a meia opacidade. */
export function ProgressBar({ value = 0, tone = "primary", size = "md", indeterminate = false, style, ...rest }: ProgressBarProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const pct = Math.max(0, Math.min(100, value));
  const [width, setWidth] = useState(0);
  const scale = useRef(new Animated.Value(pct / 100)).current;
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (indeterminate) return;
    const run = Animated.timing(scale, { toValue: pct / 100, duration: reduced ? 0 : t.pick<number>("--motion-feedback-duration", 120), easing: Easing.bezier(...t.easing("--motion-ease-enter")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [pct, indeterminate, reduced, scale, t]);
  useEffect(() => {
    if (!indeterminate || reduced) return;
    const loop = Animated.loop(Animated.timing(slide, { toValue: 1, duration: 2 * t.pick<number>("--duration-progress", 650), easing: Easing.bezier(...t.easing("--ease-emph")), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [indeterminate, reduced, slide, t]);
  const color = t.pick<string>(toneToken[tone]);
  const radius = t.pick<number>("--radius-pill");
  const fillWidth = indeterminate && !reduced ? width * 0.4 : width;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={indeterminate ? undefined : { min: 0, max: 100, now: Math.round(pct) }}
      accessibilityState={indeterminate ? { busy: true } : undefined}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      {...rest}
      style={[{ width: "100%", height: size === "sm" ? 4 : 6, borderRadius: radius, overflow: "hidden", backgroundColor: t.pick<string>("--legacy-neutral-soft") }, style]}
    >
      <Animated.View
        style={{
          height: "100%",
          width: fillWidth,
          borderRadius: radius,
          backgroundColor: color,
          opacity: indeterminate && reduced ? 0.5 : 1,
          transformOrigin: "left",
          transform: indeterminate
            ? [{ translateX: reduced ? 0 : slide.interpolate({ inputRange: [0, 1], outputRange: [-fillWidth, fillWidth * 2.5] }) }]
            : [{ scaleX: scale }],
        }}
      />
    </View>
  );
}
