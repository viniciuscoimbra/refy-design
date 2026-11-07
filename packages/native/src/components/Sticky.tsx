import { useEffect, useRef } from "react";
import { Animated, View, useWindowDimensions } from "react-native";
import type { ViewProps } from "react-native";
import type { StickyBarCoreProps, StickyFooterCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { renderText } from "../primitives";

export interface StickyBarProps extends StickyBarCoreProps, Omit<ViewProps, "children"> {}
export interface StickyFooterProps extends StickyFooterCoreProps, ViewProps {
  /** Espaço da área segura embaixo (barra de gestos). O Refy não depende de safe-area-context: o app passa o número. */
  bottomInset?: number;
}

/**
 * Barra que aparece no topo quando o cabeçalho da página sai da tela. O app decide `visible`
 * pela rolagem; posicionar (absoluta sobre a lista ou `stickyHeaderIndices`) é do app, como o `top` na web.
 */
export function StickyBar({ title, meta, status, actions, visible = true, style, ...rest }: StickyBarProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const { width } = useWindowDimensions();
  const shown = useRef(new Animated.Value(visible ? 1 : 0)).current;
  useEffect(() => {
    const anim = Animated.timing(shown, { toValue: visible ? 1 : 0, duration: reduced ? 0 : t.pick<number>("--duration-mid", 180), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [visible, reduced, t, shown]);
  return (
    <Animated.View
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      pointerEvents={visible ? "auto" : "none"}
      {...rest}
      style={[{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: t.pick<number>("--space-4", 16),
        width: "100%", minHeight: 56, paddingVertical: t.pick<number>("--space-2", 8), paddingHorizontal: t.pick<number>("--space-4", 16),
        borderBottomWidth: 1, borderBottomColor: t.pick<string>("--line"), backgroundColor: t.pick<string>("--surface"),
        boxShadow: `0 12px 24px ${t.mix(t.pick<string>("--ink-1"), 5, "transparent")}`,
        opacity: shown, transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [-56, 0] }) }],
      }, style]}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: t.pick<number>("--space-3", 12), minWidth: 0, flexShrink: 1 }}>
        {renderText(title, { flexShrink: 1, fontSize: t.pick<number>("--text-sm", 13), color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") }, { numberOfLines: 1 })}
        {meta != null && width > 720 && renderText(meta, { fontSize: t.pick<number>("--text-2xs", 11), color: t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") }, { numberOfLines: 1 })}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: t.pick<number>("--space-2", 8), minWidth: 0 }}>
        {status}
        {visible && actions != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8) }}>{actions}</View>}
      </View>
    </Animated.View>
  );
}

/** Rodapé de ações preso embaixo da tela: contexto à esquerda e botões à direita. Montado fora do ScrollView. */
export function StickyFooter({ start, children, bottomInset = 0, style, ...rest }: StickyFooterProps) {
  const t = useRefy();
  const pad = t.pick<number>("--space-3", 12);
  return (
    <View
      {...rest}
      style={[{
        flexDirection: "row", alignItems: "center", gap: pad, borderTopWidth: 1, borderTopColor: t.pick<string>("--line"), backgroundColor: t.pick<string>("--surface"),
        paddingTop: pad, paddingHorizontal: t.pick<number>("--space-5", 20), paddingBottom: pad + bottomInset,
        boxShadow: `0 -8px 24px ${t.mix(t.pick<string>("--ink-1"), 4, "transparent")}`,
      }, style]}
    >
      {start != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8), minWidth: 0, flexShrink: 1 }}>{renderText(start, { fontSize: t.pick<number>("--text-sm", 13), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}</View>}
      <View style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8), flexShrink: 0 }}>{children}</View>
    </View>
  );
}
