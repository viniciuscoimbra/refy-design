import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { ViewProps } from "react-native";
import type { BrandLogoCoreProps, BrandLogoSize } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";

export type { BrandLogoSize };
export interface BrandLogoProps extends BrandLogoCoreProps, Omit<ViewProps, "children"> {}

// O símbolo tem 1,22 em de altura: o corpo que faz o logo inteiro ter `height`.
const SYMBOL_EM = 1.22;
// O monograma "r" é um quadrado de 1,75 em (--brand-mark-size na web).
const MONOGRAM_EM = 1.75;

// Valores de BrandLogo.module.css: corpo da fonte e o ponto (lado, margem inferior).
const sizes: Record<BrandLogoSize, [number, number, number]> = {
  xs: [16, 4, 2],
  sm: [22, 5, 3],
  md: [32, 7, 5],
  lg: [48, 10, 7],
  xl: [72, 14, 11],
};

/** Assinatura do Refy: "refy" em mono com o ponto que pulsa. markOnly mostra o monograma "r". */
export function BrandLogo({ brand = "refy", size = "sm", tone = "default", animated = false, markOnly = false, symbol = false, height, children, style, ...rest }: BrandLogoProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [baseSize, dot, dotBottom] = sizes[size];
  const withSymbol = symbol && !children;
  const monogram = markOnly && !withSymbol && !children;
  // `height` manda no lugar de `size`: com o símbolo, ele é que tem essa altura; no monograma
  // (lado de 1,75 em), o quadrado tem essa altura.
  const fontSize = height ? height / (withSymbol ? SYMBOL_EM : monogram ? MONOGRAM_EM : 1) : baseSize;
  // Com altura fixa o logo é um desenho fechado: o texto não cresce com a fonte do sistema.
  const fixed = withSymbol || height !== undefined;
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
  const markSide = height && monogram ? height : t.size("--brand-mark-size", MONOGRAM_EM * fontSize, fontSize);
  if (withSymbol) {
    // Símbolo e palavra são um desenho fixo: o tema só pinta o símbolo (--brand-mark).
    const markHeight = SYMBOL_EM * fontSize;
    const wordColor = tone === "inverse" ? t.pick<string>("--legacy-white") : t.pick<string>("--brand-wordmark", "--ink-1");
    return (
      <View accessible accessibilityRole="image" accessibilityLabel={brand} {...rest} style={[{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: markOnly ? 0 : t.size("--brand-logo-gap", 0.18 * fontSize, fontSize) }, height ? { height } : null, style]}>
        <Svg width={(26 / 36) * markHeight} height={markHeight} viewBox="0 0 26 36" fill={t.pick<string>("--brand-mark", "--brand-primary-container", "--primary-container")}>
          <Path d="M0 12A12 12 0 0 1 12 0h14a12 12 0 0 1-12 12H0Z" />
          <Path d="M0 15h12v9A12 12 0 0 1 0 36V15Z" />
        </Svg>
        {!markOnly && <Text allowFontScaling={false} style={{ color: wordColor, fontSize, lineHeight: fontSize, letterSpacing: -0.06 * fontSize, ...t.fonts("Manrope", 800) }}>refy</Text>}
      </View>
    );
  }
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={brand} {...rest} style={[{ flexDirection: "row", alignItems: "flex-end", alignSelf: "flex-start", gap: markOnly ? 0 : t.size("--brand-logo-gap", 0.27 * fontSize, fontSize) }, height ? { height } : null, style]}>
      {children ?? (markOnly ? (
        <View style={{ width: markSide, height: markSide, borderRadius: t.pick<number>("--radius-default", 4), backgroundColor: t.pick<string>("--primary"), alignItems: "center", justifyContent: "center" }}>
          <Text allowFontScaling={!fixed} style={{ color: t.pick<string>("--on-primary"), fontSize: 0.72 * fontSize, letterSpacing: 0, ...t.font("--font-headline", "--weight-bold") }}>r</Text>
        </View>
      ) : (
        <>
          <Text allowFontScaling={!fixed} style={word}>refy</Text>
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
