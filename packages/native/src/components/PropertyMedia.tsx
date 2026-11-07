import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { PropertyMediaCoreProps, PropertyMediaItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { useIconStyle } from "../icon";
import { Button } from "./Button";
import { Callout } from "./Callout";
import { IconButton } from "./IconButton";
import { Skeleton } from "./Skeleton";

export type { PropertyMediaItem };
export interface PropertyMediaProps extends PropertyMediaCoreProps {
  /** Só no nativo: largura ÷ altura. Na web é `aspectRatio` do CSS ("4 / 3"). */
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
}

function Chevron({ d }: { d: string }) {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d={d} /></Svg>;
}

/** Índice seguinte em volta, igual à web: passa do último volta ao primeiro. */
export function wrapIndex(next: number, length: number) {
  return length === 0 ? 0 : (next + length) % length;
}

/**
 * Galeria de fotos com setas, pontos e contador "Foto X de N". Carregando mostra o esqueleto;
 * se a foto falha, um aviso com "Tentar novamente". A foto entra deslizando do lado escolhido.
 */
export function PropertyMedia({ items, index, defaultIndex = 0, onIndexChange, aspectRatio = 4 / 3, fit = "cover", loading = false, errorMessage, onRetry, style }: PropertyMediaProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [internal, setInternal] = useState(defaultIndex);
  const [result, setResult] = useState<{ src: string; status: "ready" | "error" }>();
  const [width, setWidth] = useState(0);
  const direction = useRef(1);
  const slide = useRef(new Animated.Value(0)).current;
  const maxIndex = Math.max(0, items.length - 1);
  const currentIndex = Math.min(Math.max(index ?? internal, 0), maxIndex);
  const current = items[currentIndex];
  const imageState = result && result.src === current?.src ? result.status : "loading";
  const failed = Boolean(errorMessage) || imageState === "error" || items.length === 0;
  const busy = loading || (!failed && imageState === "loading");

  const shown = useRef(currentIndex);
  useEffect(() => {
    if (shown.current === currentIndex || imageState !== "ready") return;
    shown.current = currentIndex;
    if (reduced || !width) return;
    slide.setValue(direction.current * width);
    const run = Animated.timing(slide, { toValue: 0, duration: t.pick<number>("--duration-mid", 240), easing: Easing.bezier(...t.easing("--ease-emph")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [currentIndex, imageState, reduced, width, slide, t]);

  const select = (next: number) => {
    if (!items.length) return;
    const normalized = wrapIndex(next, items.length);
    direction.current = next < currentIndex ? -1 : 1;
    if (index === undefined) setInternal(normalized);
    onIndexChange?.(normalized);
  };

  const black = t.pick<string>("--legacy-black", "#000000");
  const white = t.pick<string>("--legacy-white", "#ffffff");
  const space3 = t.size("--space-3", 12);
  const pill = t.mix(black, 72, "transparent");
  const narrow = width > 0 && width <= 544;
  const arrowStyle: ViewStyle = { position: "absolute", zIndex: 3, ...(narrow ? { bottom: space3 } : { top: "50%", marginTop: -18 }), borderColor: t.mix(black, 18, "transparent"), backgroundColor: t.mix(white, 94, "transparent"), boxShadow: t.pick<string>("--shadow-2", "") || undefined };
  const many = items.length > 1 && !failed;

  return (
    <View
      accessibilityLabel="Galeria de mídia"
      accessibilityState={{ busy }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={[{ width: "100%", minWidth: 0, aspectRatio, overflow: "hidden", borderRadius: t.pick<number>("--radius-lg", 12), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line-soft"), backgroundColor: t.pick<string>("--surface-2") }, style]}
    >
      {current && !failed && (
        <Animated.View style={{ flex: 1, transform: [{ translateX: slide }] }}>
          <Image
            key={current.src}
            source={{ uri: current.src }}
            accessible
            accessibilityLabel={current.alt}
            resizeMode={fit}
            onLoad={() => setResult({ src: current.src, status: "ready" })}
            onError={() => setResult({ src: current.src, status: "error" })}
            style={{ width: "100%", height: "100%", backgroundColor: t.pick<string>("--surface-2") }}
          />
        </Animated.View>
      )}
      {busy && (
        <View accessibilityLabel="Carregando foto" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 4 }}>
          <Skeleton width="100%" height="100%" style={{ borderRadius: 0 }} />
        </View>
      )}
      {failed && (
        <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 5, alignItems: "center", justifyContent: "center", padding: t.size("--space-5", 20), backgroundColor: t.pick<string>("--surface-2") }}>
          <Callout
            tone="danger"
            accessibilityRole="alert"
            title="Foto indisponível"
            action={onRetry ? <Button size="sm" variant="danger" onPress={onRetry}>Tentar novamente</Button> : undefined}
            style={{ width: "100%", maxWidth: 512 }}
          >
            {errorMessage ?? "Não foi possível carregar esta imagem."}
          </Callout>
        </View>
      )}
      {many && (
        <>
          <IconButton variant="outline" size="lg" accessibilityLabel="Foto anterior" icon={<Chevron d="m15 18-6-6 6-6" />} onPress={() => select(currentIndex - 1)} style={[arrowStyle, { left: space3 }]} />
          <IconButton variant="outline" size="lg" accessibilityLabel="Próxima foto" icon={<Chevron d="m9 18 6-6-6-6" />} onPress={() => select(currentIndex + 1)} style={[arrowStyle, { right: space3 }]} />
          <View role="group" accessibilityLabel="Escolher foto" style={{ position: "absolute", zIndex: 3, alignSelf: "center", bottom: narrow ? space3 + 44 : space3, flexDirection: "row", alignItems: "center", paddingHorizontal: 5, borderRadius: 999, backgroundColor: pill }}>
            {items.map((item, i) => {
              const active = i === currentIndex;
              return (
                <Pressable
                  key={`${item.src}-${i}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Mostrar foto ${i + 1} de ${items.length}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => select(i)}
                  hitSlop={{ top: 11, bottom: 11 }}
                  style={{ height: 22, paddingHorizontal: 3.5, alignItems: "center", justifyContent: "center" }}
                >
                  <View style={{ width: active ? 22 : 8, height: 8, borderRadius: 999, backgroundColor: active ? white : t.mix(white, 58, "transparent") }} />
                </Pressable>
              );
            })}
          </View>
          <View accessibilityLiveRegion="polite" style={{ position: "absolute", zIndex: 2, top: space3, right: space3, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999, backgroundColor: pill }}>
            <Text style={{ color: white, fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", 650) }}>Foto {currentIndex + 1} de {items.length}</Text>
          </View>
        </>
      )}
    </View>
  );
}
