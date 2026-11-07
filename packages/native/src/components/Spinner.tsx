import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import type { ViewProps } from "react-native";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";

export interface SpinnerProps extends ViewProps {
  /** Nome lido pelo leitor de tela. Padrão "Carregando". */
  accessibilityLabel?: string;
}

/** Indicador de carregamento: anel com o topo na cor da marca, uma volta a cada 800 ms. */
export function Spinner({ accessibilityLabel = "Carregando", style, ...rest }: SpinnerProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(Animated.timing(turn, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [reduced, turn]);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: true }}
      {...rest}
      style={[{
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        borderColor: t.pick<string>("--line"), borderTopColor: t.pick<string>("--primary-ink"),
        borderStyle: reduced ? "dotted" : "solid", transform: [{ rotate }],
      }, style]}
    />
  );
}
