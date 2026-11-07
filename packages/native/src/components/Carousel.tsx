import { useEffect, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Text, View } from "react-native";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { CarouselCoreProps, CarouselItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { IconButton } from "./IconButton";

export type { CarouselItem };
export interface CarouselProps extends CarouselCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Um conteúdo por vez, com setas e "1 de N", como na web. No toque também troca com o
 * arrasto lateral; o leitor de tela usa as setas e ouve só o conteúdo visível.
 */
export function Carousel({ items, label = "Conteúdos em destaque", index, defaultIndex = 0, onIndexChange, style }: CarouselProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [internal, setInternal] = useState(defaultIndex);
  const [width, setWidth] = useState(0);
  const current = Math.max(0, Math.min(index ?? internal, items.length - 1));
  const offset = useRef(new Animated.Value(0)).current;
  const move = (next: number) => {
    const value = Math.max(0, Math.min(next, items.length - 1));
    if (index === undefined) setInternal(value);
    if (value !== current) onIndexChange?.(value);
  };
  useEffect(() => {
    const run = Animated.timing(offset, { toValue: -current * width, duration: reduced ? 0 : t.pick<number>("--motion-context-duration", 240), easing: Easing.bezier(...t.easing("--motion-ease-enter")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [current, width, reduced, offset, t]);
  const moveRef = useRef(move);
  moveRef.current = move;
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_, g) => { if (Math.abs(g.dx) > 48) moveRef.current(currentRef.current + (g.dx < 0 ? 1 : -1)); },
  })).current;
  const currentRef = useRef(current);
  currentRef.current = current;
  const arrow = (left: boolean) => (
    <Svg viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-2")} strokeWidth={2}><Path d={left ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} /></Svg>
  );
  return (
    <View
      role="region"
      accessibilityLabel={label}
      style={[{ minWidth: 0, gap: t.pick<number>("--space-3", 12) }, style]}
    >
      {items.length ? (
        <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ overflow: "hidden" }} {...pan.panHandlers}>
          <Animated.View style={{ flexDirection: "row", alignItems: "flex-start", width: width * items.length || undefined, transform: [{ translateX: offset }] }}>
            {items.map((item, i) => (
              <View key={item.id} accessibilityLabel={`${i + 1} de ${items.length}: ${item.label}`} accessibilityElementsHidden={i !== current} importantForAccessibility={i === current ? "auto" : "no-hide-descendants"} style={{ width: width || "100%" }}>
                {item.content}
              </View>
            ))}
          </Animated.View>
        </View>
      ) : (
        <Text style={{ color: t.pick<string>("--ink-2"), fontSize: t.pick<number>("--text-sm", 13) }}>Nenhum conteúdo disponível.</Text>
      )}
      {items.length > 1 && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: t.pick<number>("--space-3", 12) }}>
          <IconButton accessibilityLabel="Conteúdo anterior" disabled={current === 0} icon={arrow(true)} onPress={() => move(current - 1)} />
          <Text accessibilityLiveRegion="polite" style={{ color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-sm", 13), fontVariant: ["tabular-nums"], ...t.font("--font-body", "--weight-regular") }}>{current + 1} de {items.length}</Text>
          <IconButton accessibilityLabel="Próximo conteúdo" disabled={current === items.length - 1} icon={arrow(false)} onPress={() => move(current + 1)} />
        </View>
      )}
    </View>
  );
}
