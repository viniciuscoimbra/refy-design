import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Modal as RNModal, Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { ModalCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { useReducedMotion } from "../hooks";

export interface ModalProps extends ModalCoreProps, Omit<ViewProps, "children" | "role"> {}

/**
 * Modal centralizado com scrim. Fecha no botão voltar do Android (onRequestClose), no toque
 * fora e no ✕. O foco preso da web vem do próprio Modal do RN (accessibilityViewIsModal).
 */
export function Modal({ role = "dialog", hideCloseButton = false, closeOnBackdrop = true, ariaDescribedBy, open, onClose, title, ariaLabel = "Janela modal", footer, width = 520, children, style, ...rest }: ModalProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const { height: screenHeight } = useWindowDimensions();
  const [present, setPresent] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    if (open) setPresent(true);
    const run = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: reduced ? 0 : t.pick<number>(open ? "--motion-orientation-duration" : "--motion-orientation-exit-duration", open ? 240 : 160),
      easing: Easing.bezier(...t.easing(open ? "--motion-ease-enter" : "--motion-ease-exit")),
      useNativeDriver: true,
    });
    run.start(({ finished }) => { if (finished && !open) setPresent(false); });
    return () => run.stop();
  }, [open, reduced, progress, t]);
  useEffect(() => {
    if (open && typeof title === "string") AccessibilityInfo.announceForAccessibility(title);
  }, [open, title]);
  if (!present) return null;
  const line = t.pick<string>("--line");
  const scrimPadding = t.size("--dialog-scrim-padding", 32);
  // --dialog-max-height é calc(100dvh - 64px) na web; calc não vira token nativo.
  const maxHeight = screenHeight - 2 * scrimPadding;
  const bodySize = t.size("--text-base", 14);
  const h5 = t.size("--text-h5", 18);
  return (
    <RNModal transparent visible animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <Animated.View style={{ flex: 1, opacity: progress }}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={open && closeOnBackdrop ? onClose : undefined}
          style={{ flex: 1, padding: scrimPadding, backgroundColor: t.pick<string>("--legacy-modal-scrim"), alignItems: "center", justifyContent: t.pick<string>("--dialog-align", "center") as "center" }}
        >
          <Animated.View
            accessibilityViewIsModal
            accessibilityRole={role === "alertdialog" ? "alert" : undefined}
            accessibilityLabel={!title ? ariaLabel : typeof title === "string" ? title : undefined}
            aria-describedby={ariaDescribedBy}
            onStartShouldSetResponder={() => true}
            {...rest}
            style={[{
              width: "100%",
              maxWidth: width,
              maxHeight,
              overflow: "hidden",
              backgroundColor: t.pick<string>("--dialog-surface", "--surface"),
              borderWidth: t.size("--dialog-border-width", 0),
              borderColor: t.pick<string>("--dialog-border-color", "--line"),
              borderRadius: t.size("--dialog-radius", t.pick<number>("--radius-xl", 16)),
              boxShadow: t.pick<string>("--dialog-shadow", "--elev-5", "") || undefined,
              transform: [
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.99, 1] }) },
              ],
            }, style]}
          >
            {title != null && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 18, paddingBottom: 18, paddingRight: 20, paddingLeft: 24, borderBottomWidth: 1, borderBottomColor: line }}>
                <View accessibilityRole="header" style={{ flexShrink: 1 }}>
                  {renderText(title, { color: t.pick<string>("--ink-1"), fontSize: h5, letterSpacing: -0.01 * h5, ...t.font("--font-headline", "--weight-semi") })}
                </View>
                {!hideCloseButton && (
                  <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={onClose} hitSlop={6} style={({ pressed }) => ({ width: t.size("--icon-button-md", 32), height: t.size("--icon-button-md", 32), alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--control-radius", "--radius-default", 6), backgroundColor: pressed ? t.mix(t.pick<string>("--ink-1"), 9, "transparent") : "transparent" })}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-1")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M18 6 6 18M6 6l12 12" /></Svg>
                  </Pressable>
                )}
              </View>
            )}
            <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 24 }}>
              {renderText(children, { color: t.pick<string>("--ink-2"), fontSize: bodySize, lineHeight: Math.round(bodySize * 1.55), ...t.font("--font-body", "--weight-regular") })}
            </ScrollView>
            {footer != null && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10, paddingVertical: 16, paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: line, backgroundColor: t.pick<string>("--surface-2") }}>{footer}</View>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </RNModal>
  );
}
