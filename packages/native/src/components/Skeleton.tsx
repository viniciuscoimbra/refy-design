import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import type { DimensionValue, ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { SkeletonCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";

export interface SkeletonProps extends SkeletonCoreProps, Omit<ViewProps, "children"> {}

/** Placeholder com brilho correndo enquanto o conteúdo carrega. Fica parado com movimento reduzido. */
export function Skeleton({ width = "100%", height = 14, circle, style, ...rest }: SkeletonProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const base = t.pick<string>("--surface-2", "--surface-container-low");
  const shine = t.pick<string>("--line-soft", "--surface-container-high");
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced || !w) return;
    const loop = Animated.loop(Animated.timing(x, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduced, w, x]);
  // Na web o degradê tem o dobro da largura e anda de 200% a -200%; aqui a faixa anda da direita para a esquerda.
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [w, -2 * w] });
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      {...rest}
      style={[{
        width: width as DimensionValue, height: (circle ? width : height) as DimensionValue, maxWidth: "100%", overflow: "hidden",
        borderRadius: circle ? t.pick<number>("--radius-pill", 999) : t.pick<number>("--radius-sm", 4), backgroundColor: base,
      }, style]}
    >
      {w > 0 && (
        <Animated.View style={{ position: "absolute", top: 0, bottom: 0, width: 2 * w, transform: [{ translateX: reduced ? -w / 2 : translateX }] }}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="refy-skel" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={base} /><Stop offset="0.5" stopColor={shine} /><Stop offset="1" stopColor={base} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#refy-skel)" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
}
