import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Modal as RNModal, PanResponder, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Line } from "react-native-svg";
import type { DrawerCoreProps, DrawerSide } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { useIconStyle } from "../icon";
import { renderText } from "../primitives";
import { IconButton } from "./IconButton";

export type { DrawerSide };
export interface DrawerProps extends DrawerCoreProps {
  /** Largura do painel lateral em pt. Padrão `--drawer-width` (320), até 90% da tela. */
  width?: number;
  /**
   * Só no nativo: margens seguras do aparelho (entalhe, barra de gestos), vindas de
   * react-native-safe-area-context no app. O pacote não traz essa dependência.
   */
  insets?: { top?: number; bottom?: number; left?: number; right?: number };
  style?: StyleProp<ViewStyle>;
}

function Close() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"><Line x1={6} y1={6} x2={18} y2={18} /><Line x1={18} y1={6} x2={6} y2={18} /></Svg>;
}

/**
 * Painel que desliza da lateral, de baixo ou ocupa a tela. Fecha no ✕, no toque no fundo, no
 * voltar do Android e, no painel de baixo, ao arrastar o topo para baixo.
 */
export function Drawer({ open, modal = true, onOpenChange, side = "right", title, footer, width, children, hideClose, insets = {}, style }: DrawerProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const screen = useWindowDimensions();
  const [present, setPresent] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const close = () => onOpenChange(false);

  useEffect(() => {
    if (open) { setPresent(true); drag.setValue(0); }
    const run = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: reduced ? 0 : t.pick<number>(open ? "--motion-orientation-duration" : "--motion-orientation-exit-duration", open ? 240 : 160),
      easing: Easing.bezier(...t.easing(open ? "--motion-ease-enter" : "--motion-ease-exit")),
      useNativeDriver: true,
    });
    run.start(({ finished }) => { if (finished && !open) setPresent(false); });
    return () => run.stop();
  }, [open, reduced, progress, drag, t]);
  useEffect(() => { if (open && typeof title === "string") AccessibilityInfo.announceForAccessibility(title); }, [open, title]);

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderMove: (_, g) => drag.setValue(Math.max(0, g.dy)),
    onPanResponderRelease: (_, g) => {
      if (g.dy > 80 || g.vy > 0.8) onOpenChangeRef.current(false);
      else Animated.spring(drag, { toValue: 0, useNativeDriver: true }).start();
    },
  })).current;
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  if (!present) return null;
  const line = t.pick<string>("--line", "--surface-container-high");
  const lineSoft = t.pick<string>("--line-soft", "--surface-container-high");
  const radius = t.pick<number>("--drawer-radius", side === "bottom" ? 20 : 0);
  const panelW = Math.min(width ?? t.pick<number>("--drawer-width", 320), screen.width * 0.9);
  const h5 = t.size("--text-h5", 18);
  const bottom = side === "bottom";
  const lateral = side === "left" || side === "right";

  const placement: ViewStyle = lateral
    ? { position: "absolute", top: 0, bottom: 0, [side]: 0, width: panelW, paddingTop: insets.top ?? 0, paddingBottom: insets.bottom ?? 0, ...(side === "left" ? { borderRightWidth: 1, borderRightColor: line, borderTopRightRadius: radius, borderBottomRightRadius: radius } : { borderLeftWidth: 1, borderLeftColor: line, borderTopLeftRadius: radius, borderBottomLeftRadius: radius }) }
    : bottom
      ? { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: screen.height * 0.85, paddingBottom: insets.bottom ?? 0, borderTopWidth: 1, borderTopColor: line, borderTopLeftRadius: radius, borderTopRightRadius: radius, boxShadow: t.pick<string>("--elev-5", "") || undefined }
      : { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, paddingTop: insets.top ?? 0, paddingBottom: insets.bottom ?? 0 };
  const travel = lateral ? (side === "left" ? -panelW : panelW) : bottom ? screen.height : t.size("--space-3", 12);
  const transform = lateral
    ? [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [travel, 0] }) }]
    : [{ translateY: Animated.add(progress.interpolate({ inputRange: [0, 1], outputRange: [travel, 0] }), drag) }];

  return (
    <RNModal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      {modal ? (
        <Animated.View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, opacity: progress }}>
          <Pressable accessible={false} importantForAccessibility="no" onPress={open ? close : undefined} style={{ flex: 1, backgroundColor: t.pick<string>("--legacy-modal-scrim") }} />
        </Animated.View>
      ) : null}
      <Animated.View
        accessibilityViewIsModal={modal}
        accessibilityLabel={typeof title === "string" ? title : title ? undefined : "Painel"}
        onAccessibilityEscape={close}
        pointerEvents={open ? "auto" : "none"}
        style={[placement, { flexDirection: "column", backgroundColor: t.pick<string>("--drawer-surface", "--surface", "--surface-container"), opacity: side === "full" ? progress : 1, transform }, style]}
      >
        {bottom && <View {...pan.panHandlers} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ paddingTop: 12, paddingBottom: 4, alignItems: "center" }}><View style={{ width: 36, height: 4, borderRadius: t.pick<number>("--radius-sm", 4), backgroundColor: line }} /></View>}
        {(title != null || !hideClose) && (
          <View {...(bottom ? pan.panHandlers : {})} style={{ flexDirection: "row", alignItems: "center", gap: t.size("--space-3", 12), paddingTop: bottom ? 12 : 20, paddingBottom: bottom ? t.size("--space-2", 8) : 20, paddingHorizontal: 22, borderBottomWidth: bottom ? 0 : 1, borderBottomColor: lineSoft }}>
            <View accessibilityRole="header" style={{ flex: 1, minWidth: 0 }}>
              {title != null ? renderText(title, { color: t.pick<string>("--ink-1", "--on-surface"), fontSize: h5, letterSpacing: -0.01 * h5, ...t.font("--font-headline", "--weight-bold") }) : null}
            </View>
            {!hideClose && <IconButton size="sm" accessibilityLabel="Fechar" icon={<Close />} onPress={close} />}
          </View>
        )}
        <ScrollView style={{ flexShrink: 1, flexGrow: bottom ? 0 : 1 }} contentContainerStyle={{ padding: t.pick<number>("--drawer-body-padding", "--space-4", 16) }} keyboardShouldPersistTaps="handled">
          {renderText(children, { color: t.pick<string>("--ink-2", "--on-surface-variant"), fontSize: t.size("--text-sm", 13), lineHeight: Math.round(t.size("--text-sm", 13) * 1.55), ...t.font("--font-body", "--weight-regular") })}
        </ScrollView>
        {footer != null && <View style={{ paddingVertical: t.size("--space-4", 16), paddingHorizontal: 22, borderTopWidth: 1, borderTopColor: lineSoft }}>{footer}</View>}
      </Animated.View>
    </RNModal>
  );
}
