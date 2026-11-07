import { useEffect, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { CoverflowCoreProps, CoverflowItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { useIconStyle } from "../icon";
import { renderText } from "../primitives";
import { IconButton } from "./IconButton";

export type { CoverflowItem };
export interface CoverflowProps<T extends CoverflowItem = CoverflowItem> extends CoverflowCoreProps<T> {
  /** Largura do cartão em pt (a web usa 16rem). Nunca passa da largura disponível menos 64. */
  itemWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/** Índice depois de arrastar `dx` pt com cartões de `stride` pt, preso à lista. Mesma conta da web. */
export function coverflowTarget(index: number, dx: number, stride: number, count: number) {
  if (!stride || !count) return index;
  return Math.max(0, Math.min(count - 1, index - Math.round(dx / stride)));
}

function Arrow({ left }: { left: boolean }) {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}><Path d={left ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} /></Svg>;
}

/** Navegação finita por conteúdo visual: toque, arrasto lateral ou setas. Sem autoplay. */
export function Coverflow<T extends CoverflowItem>({ items, renderItem, selectedId, defaultSelectedId, onSelectionChange, onActivate, label = "Explorar conteúdos", disabled = false, emptyContent = "Nenhum conteúdo disponível.", itemWidth = 256, style }: CoverflowProps<T>) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [internalId, setInternalId] = useState(defaultSelectedId);
  const [width, setWidth] = useState(0);
  const requested = selectedId ?? internalId;
  const currentIndex = Math.max(0, items.findIndex((item) => item.id === requested));
  const current = items[currentIndex];
  const space4 = t.size("--space-4", 16);
  const cardWidth = Math.max(0, Math.min(itemWidth, width - t.size("--space-8", 32) * 2));
  const stride = cardWidth + space4;
  const pad = (width - cardWidth) / 2;
  const shift = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const state = useRef({ currentIndex, stride, count: items.length, disabled });
  state.current = { currentIndex, stride, count: items.length, disabled };

  const select = (index: number) => {
    if (disabled || !items.length) return;
    const item = items[Math.max(0, Math.min(items.length - 1, index))];
    if (item.id !== current?.id) {
      if (selectedId === undefined) setInternalId(item.id);
      onSelectionChange?.(item.id);
    }
  };
  const selectRef = useRef(select);
  selectRef.current = select;

  useEffect(() => {
    const run = Animated.timing(shift, { toValue: -currentIndex * stride, duration: reduced ? 0 : t.pick<number>("--motion-context-duration", "--duration-base", 240), easing: Easing.bezier(...t.easing("--motion-ease-enter")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [currentIndex, stride, reduced, shift, t]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => !state.current.disabled && Math.abs(g.dx) >= 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: (_, g) => {
      const { currentIndex: i, stride: s, count } = state.current;
      drag.setValue(Math.max(-(count - 1 - i) * s, Math.min(i * s, g.dx)));
    },
    onPanResponderRelease: (_, g) => {
      const { currentIndex: i, stride: s, count } = state.current;
      drag.setValue(0);
      selectRef.current(coverflowTarget(i, g.dx, s, count));
    },
    onPanResponderTerminate: () => drag.setValue(0),
  })).current;

  const ink3 = t.pick<string>("--ink-3");
  const sm = t.pick<number>("--text-sm", 14);
  const radius = t.pick<number>("--radius-default", 6);
  return (
    <View accessibilityRole="none" accessibilityLabel={label} style={[{ gap: t.size("--space-3", 12) }, style]}>
      {current ? (
        <>
          <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ overflow: "hidden", paddingVertical: t.size("--space-5", 20) }} {...pan.panHandlers}>
            <Animated.View style={{ flexDirection: "row", alignItems: "stretch", gap: space4, paddingHorizontal: pad, opacity: width ? 1 : 0, transform: [{ translateX: Animated.add(shift, drag) }] }}>
              {items.map((item, index) => {
                const selected = index === currentIndex;
                const distance = Math.min(2, Math.abs(index - currentIndex));
                const side = Math.sign(index - currentIndex);
                return (
                  <View key={item.id} style={{ width: cardWidth, transform: reduced ? [] : [{ perspective: 900 }, { rotateY: `${side * -12}deg` }, { scale: 1 - distance * 0.04 }] }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected, disabled }}
                      disabled={disabled}
                      onPress={() => (selected ? onActivate?.(item) : select(index))}
                      style={({ pressed }) => ({
                        flex: 1,
                        minHeight: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        padding: space4,
                        borderRadius: radius,
                        borderWidth: t.pick<number>("--surface-border-width", 1),
                        borderColor: selected ? t.pick<string>("--primary") : t.pick<string>("--line"),
                        backgroundColor: selected ? t.pick<string>("--primary-soft", "--surface-2") : t.pick<string>("--surface"),
                        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                      })}
                    >
                      {renderText(renderItem(item, { selected, index }), { textAlign: "center", color: selected ? t.pick<string>("--primary-ink", "--ink-1") : t.pick<string>("--ink-1"), fontSize: sm, ...t.font("--font-body", "--weight-medium") })}
                    </Pressable>
                  </View>
                );
              })}
            </Animated.View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: t.size("--space-3", 12) }}>
            <IconButton accessibilityLabel="Conteúdo anterior" icon={<Arrow left />} disabled={disabled || currentIndex === 0} onPress={() => select(currentIndex - 1)} />
            <Text accessibilityLiveRegion="polite" style={{ flexShrink: 1, textAlign: "center", color: ink3, fontSize: sm, ...t.font("--font-body", "--weight-regular") }}>{`${currentIndex + 1} de ${items.length} · ${current.label}`}</Text>
            <IconButton accessibilityLabel="Próximo conteúdo" icon={<Arrow left={false} />} disabled={disabled || currentIndex === items.length - 1} onPress={() => select(currentIndex + 1)} />
          </View>
        </>
      ) : (
        <View accessibilityLiveRegion="polite" style={{ padding: t.size("--space-5", 20) }}>{renderText(emptyContent, { color: ink3, fontSize: sm, ...t.font("--font-body", "--weight-regular") })}</View>
      )}
    </View>
  );
}
