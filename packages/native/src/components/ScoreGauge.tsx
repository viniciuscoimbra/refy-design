import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { ScoreBand, ScoreGaugeCoreProps, ScoreGaugeSize } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { renderText } from "../primitives";

export type { ScoreBand, ScoreGaugeSize };
export interface ScoreGaugeProps extends ScoreGaugeCoreProps, Omit<ViewProps, "children"> {}

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function scoreBand(value: number, okAt = 70, warnAt = 40): ScoreBand {
  if (value >= okAt) return "ok";
  if (value >= warnAt) return "warn";
  return "critical";
}
const clamp = (v: number) => Math.min(100, Math.max(0, v));

/** Nota de 0 a 100 num anel colorido pela faixa; o arco cresce até o valor ao aparecer. */
export function ScoreGauge({ value, label, size = "md", okAt = 70, warnAt = 40, formatValue, style, accessibilityLabel, ...rest }: ScoreGaugeProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const target = clamp(value);
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const anim = Animated.timing(progress, { toValue: target, duration: reduced ? 0 : t.pick<number>("--motion-context-duration", 180), easing: Easing.bezier(...t.easing("--ease-emph", [0.2, 0, 0, 1])), useNativeDriver: false });
    anim.start(() => setMounted(true));
    return () => anim.stop();
  }, [target, reduced, t, progress]);
  const band = scoreBand(target, okAt, warnAt);
  const stroke = t.pick<string>(band === "ok" ? "--good" : band === "warn" ? "--weak" : "--critical");
  const box = size === "sm" ? t.pick<number>("--space-8", 32) : size === "md" ? 56 : 96;
  const width = size === "sm" ? 6 : 5;
  const valueSize = size === "sm" ? t.pick<number>("--text-2xs", 11) : size === "md" ? t.pick<number>("--text-h5", 17) : t.pick<number>("--text-h3", 30);
  const display = formatValue ? formatValue(target) : Math.round(target);
  const offset = progress.interpolate({ inputRange: [0, 100], outputRange: [CIRCUMFERENCE, 0] });
  const labelSize = size === "md" ? 8 : t.pick<number>("--text-eyebrow", 11);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? (typeof label === "string" ? label : "Score")}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(target) }}
      {...rest}
      style={[{ width: box, height: box, alignItems: "center", justifyContent: "center" }, style]}
    >
      <Svg width={box} height={box} viewBox="0 0 64 64" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={32} cy={32} r={RADIUS} fill="none" strokeWidth={width} stroke={t.mix(t.pick<string>("--ink-1"), 8, "transparent")} />
        <AnimatedCircle cx={32} cy={32} r={RADIUS} fill="none" strokeWidth={width} stroke={stroke} strokeLinecap="round" strokeDasharray={`${CIRCUMFERENCE}`} strokeDashoffset={mounted && reduced ? 0 : offset} />
      </Svg>
      <View style={{ alignItems: "center", maxWidth: "80%" }}>
        {renderText(display, { fontSize: valueSize, lineHeight: Math.round(valueSize * t.pick<number>("--leading-tight", 1.06)), letterSpacing: t.size("--tracking-display", -0.03 * valueSize, valueSize), color: t.pick<string>("--ink-1"), ...t.font("--font-headline", "--weight-bold"), fontVariant: ["tabular-nums"] })}
        {label != null && size !== "sm" && (
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ maxWidth: box * 0.62, fontSize: labelSize, color: t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium"), textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", letterSpacing: t.size("--interface-label-tracking", 0.08 * labelSize, labelSize) }}>{label}</Text>
        )}
      </View>
    </View>
  );
}
