// Peças comuns de Slider e Range: trilha arrastável, mostrador e legendas.
import { useMemo, useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";
import type { GestureResponderHandlers } from "react-native";
import type { RefyContext } from "../theme";

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Arredonda ao passo sem o 0.30000000000000004 dos passos decimais, como a web. */
export function snap(v: number, min: number, max: number, step: number) {
  const snapped = clamp(Math.round((v - min) / step) * step + min, min, max);
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Number(snapped.toFixed(decimals));
}

/**
 * Toque e arraste na trilha. `onStart` recebe o valor do ponto tocado (a web teleporta o
 * controle para ali); `onMove` recebe o valor enquanto o dedo anda; `onEnd` solta.
 */
export function useTrackGesture(min: number, max: number, disabled: boolean | undefined, handlers: { onStart: (v: number) => void; onMove: (v: number) => void; onEnd: () => void }) {
  const [width, setWidth] = useState(0);
  const start = useRef(0);
  const live = useRef({ width, min, max, disabled, handlers });
  live.current = { width, min, max, disabled, handlers };
  const responder = useMemo(() => {
    const valueAt = (x: number) => {
      const { width: w, min: lo, max: hi } = live.current;
      return lo + clamp(w ? x / w : 0, 0, 1) * (hi - lo);
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !live.current.disabled,
      onMoveShouldSetPanResponder: () => !live.current.disabled,
      // O arraste na horizontal não pode virar rolagem da tela no meio do gesto.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => { start.current = e.nativeEvent.locationX; live.current.handlers.onStart(valueAt(start.current)); },
      onPanResponderMove: (_, g) => live.current.handlers.onMove(valueAt(start.current + g.dx)),
      onPanResponderRelease: () => live.current.handlers.onEnd(),
      onPanResponderTerminate: () => live.current.handlers.onEnd(),
    });
  }, []);
  return { width, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setWidth(e.nativeEvent.layout.width), handlers: responder.panHandlers as GestureResponderHandlers };
}

export function mono(t: RefyContext, size: string) {
  return { fontSize: t.pick<number>(size, 11), color: t.pick<string>("--ink-3", "--on-surface-variant"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") };
}

export function Header({ t, label, readout }: { t: RefyContext; label?: string; readout?: string }) {
  if (!label && readout === undefined) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      {label ? <Text style={{ fontSize: t.pick<number>("--text-sm", 13), color: t.pick<string>("--ink-1", "--on-surface"), ...t.font("--font-body", "--weight-semi") }}>{label}</Text> : <View />}
      {readout !== undefined && (
        <Text style={{
          fontSize: t.pick<number>("--text-xs", 12), color: t.pick<string>("--ink-1", "--on-surface"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular"),
          paddingVertical: 5, paddingHorizontal: 10, borderRadius: t.pick<number>("--radius-pill", 999), overflow: "hidden",
          backgroundColor: t.pick<string>("--surface-2", "--surface-container-high"),
        }}>{readout}</Text>
      )}
    </View>
  );
}

/** Bolinha do controle: anel da superfície, sombra e halo da marca enquanto arrasta. */
export function thumbStyle(t: RefyContext, size: number, left: number, dragging: boolean, reduced: boolean) {
  const primary = t.pick<string>("--primary");
  const elev = t.pick<string>("--elev-1", "none");
  const ring = `0 0 0 1px ${t.pick<string>("--line", "--outline-variant")}`;
  return {
    position: "absolute" as const, top: "50%" as const, left, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2,
    borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: primary, borderWidth: 3, borderColor: t.pick<string>("--surface"),
    boxShadow: dragging ? `0 0 0 6px ${t.mix(primary, 30, "transparent")}${elev !== "none" ? `, ${elev}` : ""}` : `${elev !== "none" ? `${elev}, ` : ""}${ring}`,
    transform: dragging && !reduced ? [{ scale: 1.2 }] : undefined,
  };
}
