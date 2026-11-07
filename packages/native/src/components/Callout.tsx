import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { CalloutCoreProps, CalloutTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { useReducedMotion } from "../hooks";
import { lineHeight, renderText } from "../primitives";
import { IconSlot, useIconStyle } from "../icon";
import { IconButton } from "./IconButton";

export type { CalloutTone };
export interface CalloutProps extends CalloutCoreProps, Omit<ViewProps, "children"> {}

// Mesmas receitas de Callout.module.css: fundo, borda, cor e fundo do ícone por tom.
type Palette = { bg: string; border: string; icon: string; iconBg: string; gradient?: [string, string] };
function palette(t: RefyContext, tone: CalloutTone): Palette {
  const p = (...c: (string | number)[]) => t.pick<string>(...c);
  const surface = p("--surface");
  const tint = (token: string, bg: number, border: number, icon: number) => {
    const c = p(token);
    return { bg: t.mix(c, bg, surface), border: t.mix(c, border, "transparent"), icon: c, iconBg: t.mix(c, icon, "transparent") };
  };
  switch (tone) {
    case "info": return tint("--info", 7, 28, 12);
    case "warn": return tint("--weak", 9, 35, 14);
    case "danger": return tint("--critical", 7, 30, 12);
    case "note": return { bg: p("--callout-note-background", "--surface-2"), border: p("--line-soft"), icon: p("--callout-note-icon-color", "--ink-3"), iconBg: t.pick<string>("--callout-note-icon-background", t.mix(p("--ink-1"), 7, "transparent")) };
    case "success": return { bg: p("--callout-success-background", "--surface"), border: p("--callout-success-border", "--line-soft"), icon: p("--callout-success-icon-color", "--good"), iconBg: p("--callout-success-icon-background", "transparent") };
    case "upsell": return { bg: p("--primary-soft"), border: t.mix(p("--primary"), 28, "transparent"), icon: p("--primary-ink"), iconBg: surface, gradient: [p("--primary-soft"), surface] as [string, string] };
  }
}

function Close() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round"><Path d="M18 6 6 18M6 6l12 12" /></Svg>;
}

/** Aviso fixo dentro da página (dica, nota, limite, upsell). Para aviso passageiro, use Toast. */
export function Callout({ tone = "info", icon, title, children, action, dismissible = false, onDismiss, dismissLabel = "Dispensar aviso", style, ...rest }: CalloutProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const [gone, setGone] = useState(false);
  const exit = useRef(new Animated.Value(0)).current;
  const c = palette(t, tone);
  const iconSize = t.pick<number>("--callout-icon-size", "--space-8", 32);
  const textSize = t.pick<number>("--callout-description-size", "--text-xs", 12);
  const titleSize = t.pick<number>("--text-sm", 13);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => () => exit.stopAnimation(), [exit]);
  if (gone) return null;
  const dismiss = () => {
    Animated.timing(exit, { toValue: 1, duration: reduced ? 0 : t.pick<number>("--duration-fast", 120), useNativeDriver: true }).start(() => { setGone(true); onDismiss?.(); });
  };
  const radius = t.pick<number>("--callout-radius", "--radius-lg-token", 8);
  return (
    <Animated.View
      accessibilityRole="summary"
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      {...rest}
      style={[{
        flexDirection: "row", alignItems: "flex-start", gap: t.pick<number>("--callout-gap", "--space-3", 12), padding: t.pick<number>("--callout-padding", "--space-4", 16),
        borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: c.border, borderRadius: radius, backgroundColor: c.gradient ? undefined : c.bg, overflow: "hidden",
        opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ translateY: exit.interpolate({ inputRange: [0, 1], outputRange: [0, -t.pick<number>("--space-1", 4)] }) }],
      }, style]}
    >
      {c.gradient && box.w > 0 && (
        <Svg pointerEvents="none" width={box.w} height={box.h} style={{ position: "absolute", top: 0, left: 0 }}>
          <Defs><LinearGradient id="refy-callout" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={c.gradient[0]} /><Stop offset="1" stopColor={c.gradient[1]} /></LinearGradient></Defs>
          <Rect width={box.w} height={box.h} fill="url(#refy-callout)" />
        </Svg>
      )}
      {icon != null && (
        <View style={{
          width: iconSize, height: iconSize, alignItems: "center", justifyContent: "center", borderRadius: t.pick<number>("--radius-md", 8), backgroundColor: c.iconBg,
          ...(tone === "upsell" ? { borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: c.border } : {}),
        }}>
          <IconSlot size={t.pick<number>("--space-4", 16)} color={c.icon}>{icon}</IconSlot>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {renderText(title, { fontSize: titleSize, lineHeight: lineHeight(titleSize, t.pick<number>("--leading-snug", 1.35)), color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") })}
        {children != null && (
          <View style={{ marginTop: t.pick<number>("--callout-description-gap", 2) }}>
            {renderText(children, { fontSize: textSize, lineHeight: lineHeight(textSize, t.pick<number>("--leading-normal", 1.55)), color: t.pick<string>("--ink-2"), ...t.font("--font-body", "--weight-regular") })}
          </View>
        )}
      </View>
      {action != null && <View style={{ alignSelf: "center" }}>{typeof action === "string" ? <Text>{action}</Text> : action}</View>}
      {dismissible && (
        <IconButton size="sm" variant="ghost" accessibilityLabel={dismissLabel} icon={<Close />} onPress={dismiss} style={{ marginTop: -t.pick<number>("--space-1", 4), marginRight: -t.pick<number>("--space-1", 4) }} />
      )}
    </Animated.View>
  );
}
