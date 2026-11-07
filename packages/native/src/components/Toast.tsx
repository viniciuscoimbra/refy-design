import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View, useWindowDimensions } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import type { ToastCoreProps, ToastData, ToastRegionCoreProps, ToastTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { hitSlopFor } from "../primitives";

export type { ToastData, ToastTone };
export interface ToastProps extends ToastCoreProps, Omit<ViewProps, "children" | "id"> {
  /** Interno da região: o toast de cima entra de cima. */
  fromTop?: boolean;
}
export interface ToastRegionProps extends ToastRegionCoreProps, Omit<ViewProps, "children"> {}

function ToneIcon({ tone, color }: { tone: Exclude<ToastTone, "default">; color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} />
      {tone === "success" ? <Polyline points="8.5 12.5 11 15 15.5 9.5" /> : <><Line x1={12} y1={7.5} x2={12} y2={13} /><Line x1={12} y1={16.5} x2={12.01} y2={16.5} /></>}
    </Svg>
  );
}

/**
 * Toast individual: pílula escura com ícone por tom, título e descrição. Segurar o dedo pausa
 * o tempo (o equivalente do hover da web); com leitor de tela ativo o toast não some sozinho.
 */
export function Toast({ id, title, description, tone = "default", action, duration = 5000, onDismiss, fromTop = false, style, ...rest }: ToastProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const { width: screenWidth } = useWindowDimensions();
  const [paused, setPaused] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [closing, setClosing] = useState(false);
  const remaining = useRef(duration);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled().then((on) => alive && setScreenReader(on));
    const sub = AccessibilityInfo.addEventListener("screenReaderChanged", setScreenReader);
    AccessibilityInfo.announceForAccessibility(description ? `${title}. ${description}` : title);
    return () => { alive = false; sub.remove(); };
    // Anuncia uma vez por toast, como o aria-live="polite" da região na web.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    const run = Animated.timing(enter, {
      toValue: closing ? 0 : 1,
      duration: reduced ? 0 : t.pick<number>(closing ? "--motion-context-exit-duration" : "--duration-mid", closing ? 160 : 220),
      easing: Easing.bezier(...t.easing(closing ? "--motion-ease-exit" : "--ease-emph")),
      useNativeDriver: true,
    });
    run.start(({ finished }) => { if (finished && closing) dismiss.current?.(id); });
    return () => run.stop();
  }, [closing, reduced, enter, t, id]);
  useEffect(() => { remaining.current = duration; }, [id, duration]);
  useEffect(() => {
    if (duration === null || !onDismiss || paused || closing || screenReader) return;
    const started = Date.now();
    const timer = setTimeout(() => setClosing(true), remaining.current ?? duration);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, (remaining.current ?? duration) - (Date.now() - started));
    };
  }, [id, duration, paused, closing, screenReader, !!onDismiss]);

  const requestDismiss = () => { if (!closing && dismiss.current) setClosing(true); };
  const surface = t.pick<string>("--surface", "--on-surface");
  const actionColor = t.pick<string>("--notification-action-color", "--surface");
  const iconColor = tone === "danger" ? t.pick<string>("--notification-danger-color", "--surface") : actionColor;
  const sm = t.size("--text-sm", 13);
  const xs = t.size("--text-xs", 12);
  const limit = screenWidth - 32;
  const dismissSize = t.size("--dismiss-control-size", 20);
  const actionHeight = Math.max(t.size("--navigation-hit-height", 0), Math.round(sm * 1.4));
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      pointerEvents={closing ? "none" : "auto"}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
      {...rest}
      style={[{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: t.size("--space-3", 12),
        minWidth: Math.min(280, limit),
        maxWidth: Math.min(420, limit),
        paddingVertical: t.size("--space-3", 12),
        paddingHorizontal: t.size("--space-4", 16),
        backgroundColor: t.pick<string>("--ink-1", "--surface-container-highest"),
        borderRadius: t.pick<number>("--radius-default", 6),
        boxShadow: t.pick<string>("--elev-4", "") || undefined,
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [fromTop ? -8 : 8, 0] }) }],
      }, style]}
    >
      {tone !== "default" && <View style={{ marginTop: 1 }}><ToneIcon tone={tone} color={iconColor} /></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: surface, fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{title}</Text>
        {description ? <Text style={{ color: surface, opacity: 0.75, marginTop: 2, fontSize: xs, lineHeight: Math.round(xs * t.pick<number>("--leading-snug", 1.35)), ...t.font("--font-body", "--weight-regular") }}>{description}</Text> : null}
      </View>
      {action && (
        <Pressable accessibilityRole="button" onPress={() => { action.onClick(); requestDismiss(); }} hitSlop={{ ...hitSlopFor(actionHeight), left: 8, right: 8 }} style={{ alignSelf: "center", height: actionHeight, justifyContent: "center" }}>
          <Text style={{ color: actionColor, fontSize: sm, lineHeight: Math.round(sm * 1.4), ...t.font("--font-body", "--weight-semi") }}>{action.label}</Text>
        </Pressable>
      )}
      {onDismiss && (
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={requestDismiss} hitSlop={hitSlopFor(dismissSize, dismissSize)} style={({ pressed }) => ({ alignSelf: "center", width: dismissSize, height: dismissSize, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--control-group-radius", "--radius-pill"), opacity: pressed ? 1 : 0.55 })}>
          <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={surface} strokeWidth={2.4} strokeLinecap="round"><Line x1={6} y1={6} x2={18} y2={18} /><Line x1={18} y1={6} x2={6} y2={18} /></Svg>
        </Pressable>
      )}
    </Animated.View>
  );
}

/**
 * Pilha de toasts num canto. Controlada, como na web. Monte uma vez na raiz do app, acima da
 * navegação; o app soma a área segura via `style` quando precisar (o Refy não depende de
 * react-native-safe-area-context).
 */
export function ToastRegion({ toasts, onDismiss, position = "bottom-right", style, ...rest }: ToastRegionProps) {
  const t = useRefy();
  const edge = t.size("--space-6", 24);
  const place = position === "top-right" ? { top: edge, right: edge } : position === "bottom-left" ? { bottom: edge, left: edge } : { bottom: edge, right: edge };
  if (!toasts.length) return null;
  return (
    <View pointerEvents="box-none" {...rest} style={[{ position: "absolute", ...place, gap: 10, zIndex: 1300, elevation: 1300, alignItems: position === "bottom-left" ? "flex-start" : "flex-end" }, style]}>
      {toasts.map((toast) => <Toast key={toast.id} {...toast} onDismiss={onDismiss} fromTop={position === "top-right"} />)}
    </View>
  );
}
