import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { BrandLogoCoreProps, BrandLogoSize } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";

export type { BrandLogoSize };
export interface BrandLogoProps extends BrandLogoCoreProps, Omit<ViewProps, "children"> {}

// Valores de BrandLogo.module.css: corpo da fonte e o ponto (lado, margem inferior).
const sizes: Record<BrandLogoSize, [number, number, number]> = {
  xs: [16, 4, 2],
  sm: [22, 5, 3],
  md: [32, 7, 5],
  lg: [48, 10, 7],
  xl: [72, 14, 11],
};

/** Assinatura do Refy: "refy" em mono com o ponto que pulsa. markOnly mostra o monograma "r". */
export function BrandLogo({ brand = "refy", size = "sm", tone = "default", animated = false, markOnly = false, children, style, ...rest }: BrandLogoProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [fontSize, dot, dotBottom] = sizes[size];
  const pulse = useRef(new Animated.Value(1)).current;
  const live = animated && !reduced && !markOnly;
  useEffect(() => {
    if (!live) { pulse.setValue(1); return; }
    const half = { duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true };
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 0, ...half }), Animated.timing(pulse, { toValue: 1, ...half })]));
    loop.start();
    return () => loop.stop();
  }, [live, pulse]);
  const color = tone === "inverse" ? t.pick<string>("--legacy-white") : t.pick<string>("--ink-1");
  const word = { color, fontSize, lineHeight: fontSize, letterSpacing: 0, ...t.font(["--brand-logo-font", "--font-mono"], "--weight-bold") };
  const primaryContainer = t.pick<string>("--primary-container");
  const markSide = t.size("--brand-mark-size", 1.75 * fontSize, fontSize);
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={brand} {...rest} style={[{ flexDirection: "row", alignItems: "flex-end", alignSelf: "flex-start", gap: markOnly ? 0 : t.size("--brand-logo-gap", 0.27 * fontSize, fontSize) }, style]}>
      {children ?? (markOnly ? (
        <View style={{ width: markSide, height: markSide, borderRadius: t.pick<number>("--radius-default", 4), backgroundColor: t.pick<string>("--primary"), alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: t.pick<string>("--on-primary"), fontSize: 0.72 * fontSize, letterSpacing: 0, ...t.font("--font-headline", "--weight-bold") }}>r</Text>
        </View>
      ) : (
        <>
          <Text style={word}>refy</Text>
          <Animated.View
            style={{
              width: dot,
              height: dot,
              marginBottom: dotBottom,
              borderRadius: t.pick<number | string>("--brand-dot-radius", dot / 2) as number,
              backgroundColor: t.pick<string>("--brand-dot-background", primaryContainer),
              boxShadow: t.pick<string>("--brand-dot-shadow", `0 0 ${0.5 * fontSize}px ${t.mix(primaryContainer, 58, "transparent")}`),
              opacity: live ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) : 1,
              transform: [{ scale: live ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) : 1 }],
            }}
          />
        </>
      ))}
    </View>
  );
}
