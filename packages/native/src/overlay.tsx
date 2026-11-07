import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { Animated, Easing, Modal as RNModal, Pressable, View, useWindowDimensions } from "react-native";
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
import { useRefy } from "./theme";
import { useReducedMotion } from "./hooks";

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";
export type Rect = { left: number; right: number; top: number; bottom: number; width: number };

/**
 * Cópia de floatingPosition (src/lib/AnchoredSurface.tsx). O teste de paridade compara as
 * duas: o painel vira de lado e encosta na borda pelas mesmas regras da web.
 */
export function floatingPosition(
  anchor: Rect,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  side: Side,
  align: Align,
  gap = 6,
) {
  const edge = 8;
  const above = Math.max(0, anchor.top - gap - edge),
    below = Math.max(0, viewport.height - anchor.bottom - gap - edge);
  const leftSpace = anchor.left - gap - edge,
    rightSpace = viewport.width - anchor.right - gap - edge;
  if (side === "bottom" && size.height > below && above > below) side = "top";
  else if (side === "top" && size.height > above && below > above) side = "bottom";
  else if (side === "right" && size.width > rightSpace && leftSpace > rightSpace) side = "left";
  else if (side === "left" && size.width > leftSpace && rightSpace > leftSpace) side = "right";
  const maxHeight = side === "top" ? above : side === "bottom" ? below : viewport.height - edge * 2;
  const height = Math.min(size.height, maxHeight);
  let left = align === "end" ? anchor.right - size.width : align === "center" ? anchor.left + (anchor.width - size.width) / 2 : anchor.left;
  let top = side === "top" ? anchor.top - gap - height : anchor.bottom + gap;
  if (side === "left" || side === "right") {
    left = side === "left" ? anchor.left - gap - size.width : anchor.right + gap;
    top = align === "center" ? anchor.top + (anchor.bottom - anchor.top - height) / 2 : anchor.top;
  }
  return {
    left: Math.max(edge, Math.min(left, viewport.width - size.width - edge)),
    top: Math.max(edge, Math.min(top, viewport.height - height - edge)),
    maxHeight,
    side,
  };
}

export interface AnchoredLayerProps {
  open: boolean;
  onClose: () => void;
  /** Gatilho medido na janela. Sem ele, vale `anchorPoint`. */
  anchorRef?: RefObject<View | null>;
  anchorPoint?: { x: number; y: number };
  side?: Side;
  align?: Align;
  gap?: number;
  /** Painel com a largura do gatilho. */
  matchWidth?: boolean;
  /** Cor do fundo atrás do painel; transparente quando ausente. */
  scrim?: string;
  /** Com `scrim`, deixa o gatilho aceso: o fundo escurece em volta dele, com folga de `spotlight` pt. */
  spotlight?: number;
  label?: string;
  role?: "menu" | "none";
  panelStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Camada ancorada do nativo: o equivalente do AnchoredSurface. Abre num Modal transparente,
 * fecha no toque fora, no voltar do Android e no gesto de escape do VoiceOver.
 */
export function AnchoredLayer({ open, onClose, anchorRef, anchorPoint, side = "bottom", align = "start", gap = 6, matchWidth, scrim, spotlight, label, role, panelStyle, children }: AnchoredLayerProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const viewport = useWindowDimensions();
  const [present, setPresent] = useState(open);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    if (!open) return;
    setPresent(true);
    if (anchorPoint) {
      setAnchor({ left: anchorPoint.x, right: anchorPoint.x, top: anchorPoint.y, bottom: anchorPoint.y, width: 0 });
      return;
    }
    anchorRef?.current?.measureInWindow?.((x, y, width, height) => setAnchor({ left: x, right: x + width, top: y, bottom: y + height, width }));
  }, [open, anchorPoint?.x, anchorPoint?.y, anchorRef]);

  useEffect(() => {
    const run = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: reduced ? 0 : t.pick<number>("--duration-fast", 150),
      easing: Easing.bezier(...t.easing(open ? "--ease-emph" : "--ease-out")),
      useNativeDriver: true,
    });
    run.start(({ finished }) => { if (finished && !open) setPresent(false); });
    return () => run.stop();
  }, [open, reduced, progress, t]);

  if (!present) return null;
  const position = anchor && size ? floatingPosition(anchor, size, viewport, side, align, gap) : null;
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || size.width !== width || size.height !== height) setSize({ width, height });
  };
  const origin = position?.side === "top" ? "bottom" : position?.side === "left" ? "right" : position?.side === "right" ? "left" : "top";
  return (
    <RNModal transparent visible animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Pressable accessible={false} importantForAccessibility="no" onPress={onClose} style={{ flex: 1 }}>
        {scrim && spotlight !== undefined && anchor && !anchorPoint
          ? spotlightRects(anchor, spotlight, viewport).map((r, i) => (
            <Animated.View key={i} pointerEvents="none" style={{ position: "absolute", ...r, backgroundColor: scrim, opacity: progress }} />
          ))
          : scrim ? <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: scrim, opacity: progress }} /> : null}
      </Pressable>
      <Animated.View
        accessibilityViewIsModal
        accessibilityLabel={label}
        role={role === "menu" ? "menu" : undefined}
        onAccessibilityEscape={onClose}
        onLayout={onLayout}
        style={[
          {
            position: "absolute",
            left: position?.left ?? 0,
            top: position?.top ?? 0,
            maxHeight: position?.maxHeight,
            width: matchWidth && anchor?.width ? anchor.width : undefined,
            opacity: position ? progress : 0,
            transformOrigin: origin,
            transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
          },
          panelStyle,
        ]}
      >
        {children}
      </Animated.View>
    </RNModal>
  );
}

/** Quatro faixas de fundo em volta do gatilho, com folga: o "buraco" que acende o alvo do tour. */
export function spotlightRects(anchor: Rect, pad: number, viewport: { width: number; height: number }) {
  const top = Math.max(0, anchor.top - pad), bottom = Math.min(viewport.height, anchor.bottom + pad);
  const left = Math.max(0, anchor.left - pad), right = Math.min(viewport.width, anchor.right + pad);
  return [
    { left: 0, top: 0, width: viewport.width, height: top },
    { left: 0, top: bottom, width: viewport.width, height: Math.max(0, viewport.height - bottom) },
    { left: 0, top, width: left, height: bottom - top },
    { left: right, top, width: Math.max(0, viewport.width - right), height: bottom - top },
  ];
}

/** Superfície dos painéis (Popover, Menu): a mesma cadeia de tokens da web. */
export function panelSurface(t: ReturnType<typeof useRefy>): ViewStyle {
  return {
    backgroundColor: t.pick<string>("--surface", "--surface-container"),
    borderWidth: t.pick<number>("--surface-border-width", 1),
    borderColor: t.pick<string>("--line", "--surface-container-high"),
    borderRadius: t.pick<number>("--radius-default", 6),
    boxShadow: t.pick<string>("--elev-3", "") || undefined,
  };
}
