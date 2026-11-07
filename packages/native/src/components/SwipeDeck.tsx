import { useEffect, useRef, useState } from "react";
import { Animated, Easing, PanResponder, Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { PropertyAction, SwipeDeckCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { renderText } from "../primitives";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { PropertyActionGroup, decisionLabels } from "./PropertyActionGroup";
import { PropertyCard } from "./PropertyCard";
import type { PropertyCardProps } from "./PropertyCard";

export interface SwipeDeckItem extends PropertyCardProps {
  id: string;
}
export interface SwipeDeckProps extends SwipeDeckCoreProps {
  items: SwipeDeckItem[];
  onAction?: (action: PropertyAction, item: SwipeDeckItem) => void;
  style?: StyleProp<ViewStyle>;
}

/** Decisão do gesto: 72 pt ou mais para a esquerda descarta, para a direita seleciona. */
export function swipeDecision(dx: number): PropertyAction | undefined {
  return dx <= -72 ? "reject" : dx >= 72 ? "visit" : undefined;
}

/**
 * Fila de revisão no estilo "deslize para decidir". Os botões são o caminho principal;
 * arrastar o cartão é atalho equivalente, como na web.
 */
export function SwipeDeck({ items, index, defaultIndex = 0, onIndexChange, onAction, onReset, gestureEnabled = true, motion = "auto", title = "Revisar conteúdos", instructions = "visible", style }: SwipeDeckProps) {
  const t = useRefy();
  const systemReduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const reduced = motion === "reduced" || systemReduced;
  const { width: screen } = useWindowDimensions();
  const [internal, setInternal] = useState(defaultIndex);
  const [active, setActive] = useState<PropertyAction>();
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<PropertyAction>();
  const [lastDecision, setLastDecision] = useState("");
  const offset = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const currentIndex = index ?? internal;
  const current = items[currentIndex];
  const remaining = Math.max(0, items.length - currentIndex - 1);
  const state = useRef({ processing, current, currentIndex });
  state.current = { processing, current, currentIndex };

  useEffect(() => { offset.setValue(0); fade.setValue(1); setActive(undefined); setProcessing(false); setPreview(undefined); }, [currentIndex, current?.id, offset, fade]);

  const finish = (action: PropertyAction) => {
    const { current: item, currentIndex: i } = state.current;
    if (!item) return;
    setProcessing(false);
    setLastDecision(`${action === "reject" ? "Descartado" : action === "save" ? "Salvo" : "Selecionado"}: item ${i + 1} de ${items.length}.`);
    onAction?.(action, item);
    if (index === undefined) setInternal(i + 1);
    onIndexChange?.(i + 1);
  };
  const commit = (action: PropertyAction) => {
    if (!state.current.current || state.current.processing) return;
    setActive(action); setPreview(action); setProcessing(true);
    if (reduced) { finish(action); return; }
    const duration = t.pick<number>("--motion-orientation-exit-duration", 160);
    const easing = Easing.bezier(...t.easing("--motion-ease-exit"));
    const run = action === "save"
      ? Animated.parallel([Animated.timing(fade, { toValue: 0, duration, easing, useNativeDriver: true })])
      : Animated.timing(offset, { toValue: (action === "reject" ? -1.1 : 1.1) * screen, duration, easing, useNativeDriver: true });
    run.start(() => finish(action));
  };

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => gestureEnabledRef.current && !state.current.processing && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: (_, g) => { const dx = Math.max(-140, Math.min(140, g.dx)); offset.setValue(dx); setPreview(dx <= -32 ? "reject" : dx >= 32 ? "visit" : undefined); },
    onPanResponderRelease: (_, g) => {
      const decision = swipeDecision(g.dx);
      if (decision) commitRef.current(decision);
      else { setPreview(undefined); Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start(); }
    },
    onPanResponderTerminate: () => { setPreview(undefined); Animated.spring(offset, { toValue: 0, useNativeDriver: true }).start(); },
  })).current;
  const commitRef = useRef(commit);
  commitRef.current = commit;
  const gestureEnabledRef = useRef(gestureEnabled);
  gestureEnabledRef.current = gestureEnabled;

  const s = (n: string, f: number) => t.size(n, f);
  const narrow = screen <= 608;
  if (!current) {
    return (
      <View style={[{ width: "100%", maxWidth: 672, alignSelf: "center", marginVertical: s("--space-8", 32) }, style]}>
        <EmptyState title="Todos os itens foram revisados" message="Você chegou ao final da fila. Recomece para experimentar as decisões novamente."
          action={<Button variant="primary" onPress={() => { if (index === undefined) setInternal(0); setProcessing(false); setActive(undefined); setLastDecision(""); onIndexChange?.(0); onReset?.(); }}>Recomeçar fila</Button>} />
      </View>
    );
  }
  const { id: _id, ...cardProps } = current;
  const ink3 = t.pick<string>("--ink-3");
  const back = (lift: number, scale: number, opacity: number) => (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", top: s("--space-3", 12), bottom: 0, left: s("--space-6", 24), right: s("--space-6", 24), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--radius-xl", 16), backgroundColor: t.pick<string>("--surface"), boxShadow: t.pick<string>("--shadow-1", "") || undefined, opacity, transform: [{ translateY: lift }, { scale }] }} />
  );
  const labelColor = preview === "reject" ? t.pick<string>("--critical") : t.pick<string>("--primary-ink", "--primary");
  const labelSize = narrow ? t.size("--text-h4", 20) : t.size("--text-h3", 24);

  return (
    <View accessibilityLabel="Fila de revisão" style={[{ width: "100%", maxWidth: 832, alignSelf: "center", gap: narrow ? s("--space-3", 12) : s("--space-4", 16) }, style]}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: s("--space-3", 12) }}>
        <View style={{ flex: 1, minWidth: 0 }}>{renderText(title, { color: t.pick<string>("--ink-1"), fontSize: narrow ? t.size("--text-h5", 18) : t.size("--text-h4", 20), ...t.font("--font-headline", "--weight-bold") })}</View>
        <Text style={{ color: ink3, fontSize: narrow ? t.size("--text-xs", 12) : t.size("--text-sm", 13), ...t.font("--font-body", "--weight-regular") }}>{remaining} depois deste</Text>
      </View>
      {instructions === "visible" && (
        <Text style={{ color: ink3, fontSize: t.size("--text-sm", 13), lineHeight: Math.round(t.size("--text-sm", 13) * 1.5), ...t.font("--font-body", "--weight-regular") }}>
          Fotos: use as setas sobre a imagem. {gestureEnabled ? "Decisões: arraste o cartão para a esquerda (descartar) ou direita (selecionar), ou use os botões abaixo." : "Decisões: use os botões abaixo."}
        </Text>
      )}
      <View style={{ position: "relative", minWidth: 0, paddingBottom: s("--space-3", 12) }}>
        {remaining > 0 && back(16, 0.94, 0.45)}
        {remaining > 0 && back(8, 0.97, 0.7)}
        <Animated.View
          {...pan.panHandlers}
          accessibilityLabel={`Item ${currentIndex + 1} de ${items.length}`}
          accessibilityActions={[{ name: "reject", label: decisionLabels.reject }, { name: "save", label: decisionLabels.save }, { name: "visit", label: decisionLabels.visit }]}
          onAccessibilityAction={(e) => commit(e.nativeEvent.actionName as PropertyAction)}
          style={{ zIndex: 2, opacity: fade, transform: [{ translateX: offset }, { rotate: offset.interpolate({ inputRange: [-280, 280], outputRange: ["-10deg", "10deg"] }) }, { scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.08, 1] }) }] }}
        >
          <PropertyCard {...cardProps} layout="deck" actions={false} />
          {preview && (
            <View pointerEvents="none" style={{ position: "absolute", zIndex: 8, top: s("--space-8", 32), ...(preview === "reject" ? { left: s("--space-6", 24), transform: [{ rotate: "8deg" }] } : preview === "visit" ? { right: s("--space-6", 24), transform: [{ rotate: "-8deg" }] } : { alignSelf: "center" }), paddingVertical: s("--space-2", 8), paddingHorizontal: s("--space-4", 16), borderWidth: 3, borderColor: labelColor, borderRadius: t.pick<number>("--radius-default", 6), backgroundColor: t.mix(t.pick<string>("--surface"), 88, "transparent") }}>
              <Text style={{ color: labelColor, fontSize: labelSize, letterSpacing: labelSize * 0.04, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...t.font("--font-headline", 800) }}>{decisionLabels[preview]}</Text>
            </View>
          )}
        </Animated.View>
      </View>
      <PropertyActionGroup
        style={{ zIndex: 4 }}
        state={processing ? "processing" : "idle"}
        activeAction={processing ? active : preview}
        onAction={commit}
        statusMessage={processing ? "Registrando decisão…" : lastDecision || (instructions === "hidden" ? "" : "Arraste o cartão ou use os botões. Para salvar, use o botão Salvar.")}
      />
    </View>
  );
}
