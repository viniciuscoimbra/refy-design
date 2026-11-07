import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import type { VoiceRecorderCoreProps, VoiceRecorderState } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { useIconStyle } from "../icon";
import { Button } from "./Button";
import { Callout } from "./Callout";
import { IconButton } from "./IconButton";
import { ProgressBar } from "./ProgressBar";

export type { VoiceRecorderState };
export interface VoiceRecorderProps extends VoiceRecorderCoreProps {
  style?: StyleProp<ViewStyle>;
}

function Mic({ size: forced, color: forcedColor }: { size?: number; color?: string }) {
  const icon = useIconStyle();
  const size = forced ?? icon.size;
  const color = forcedColor ?? icon.color;
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Rect x={9} y={2} width={6} height={12} rx={3} /><Path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" /></Svg>;
}
function Pause() { const { size, color } = useIconStyle(); return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Rect x={6} y={5} width={4} height={14} rx={1} /><Rect x={14} y={5} width={4} height={14} rx={1} /></Svg>; }
function Play() { const { size, color } = useIconStyle(); return <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}><Path d="m8 5 11 7-11 7z" /></Svg>; }

/** "mm:ss", igual à web. */
export function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60).toString().padStart(2, "0")}:${(safe % 60).toString().padStart(2, "0")}`;
}

const FACTORS = [0.55, 0.85, 1, 0.72, 0.42, 0.7, 0.92, 0.6];

function Bar({ factor, level, active, color, paused }: { factor: number; level: number; active: boolean; color: string; paused: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!active) { scale.setValue(1); return; }
    const half = 620 + factor * 260;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 0.55, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: half, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active, factor, scale]);
  const height = Math.max(4, level * 0.24 * factor);
  return <Animated.View style={{ width: 3, height: paused ? 4 : height, borderRadius: 999, backgroundColor: color, transform: [{ scaleY: scale }] }} />;
}

/**
 * Captura de voz controlada. O microfone e a transcrição são do app; o componente mostra os
 * estados (convite, escutando, pausado, erro, ditado do teclado) e devolve os toques.
 */
export function VoiceRecorder({ state = "idle", duration = 0, level = 0, errorMessage = "Revise a permissão do microfone nos ajustes ou continue pelo teclado.", onStart, onPause, onResume, onCancel, onFinish, onRetry, onUseFallback, style }: VoiceRecorderProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const pulse = useRef(new Animated.Value(0)).current;
  const listening = state === "listening";
  useEffect(() => {
    if (!listening || reduced) { pulse.setValue(0); return; }
    const half = (t.pick<number>("--duration-progress", 600) * 1.4) / 2;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: half, easing: Easing.bezier(...t.easing("--ease-out")), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: half, easing: Easing.bezier(...t.easing("--ease-out")), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [listening, reduced, pulse, t]);

  const ink1 = t.pick<string>("--ink-1");
  const ink3 = t.pick<string>("--ink-3");
  const sm = t.pick<number>("--text-sm", 13);
  const xs = t.pick<number>("--text-xs", 12);
  const space2 = t.size("--space-2", 8);
  const space3 = t.size("--space-3", 12);
  const strong = { color: ink1, fontSize: sm, ...t.font("--font-body", "--weight-semi") };
  const soft = { color: ink3, fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") };
  const normalized = Math.max(0, Math.min(100, level));

  if (state === "error") {
    return (
      <Callout tone="danger" accessibilityRole="alert" icon={<Mic />} title="Não conseguimos acessar o microfone" style={style}>
        {errorMessage}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space2, marginTop: space2 }}><Button size="sm" variant="primary" onPress={onRetry}>Tentar novamente</Button><Button size="sm" variant="secondary" onPress={onUseFallback}>Usar ditado</Button></View>
      </Callout>
    );
  }
  if (state === "fallback") {
    return (
      <Callout tone="note" icon={<Mic />} title="Use o ditado do seu celular" style={style} action={<Button size="sm" variant="secondary" onPress={onUseFallback}>Entendi</Button>}>
        Toque no microfone do teclado. O texto aparece no campo e continua editável antes de enviar.
      </Callout>
    );
  }
  if (state === "idle") {
    return (
      <View style={[{ flexDirection: "row", alignItems: "center", gap: space3, minWidth: 0 }, style]}>
        <IconButton accessibilityLabel="Começar gravação de voz" variant="solid" size="lg" icon={<Mic />} onPress={onStart} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={strong}>Prefere falar?</Text>
          <Text style={soft}>Conte do seu jeito. Você revisa o texto antes de continuar.</Text>
        </View>
      </View>
    );
  }
  const primary = t.pick<string>("--primary");
  return (
    <View accessibilityLabel="Gravação de voz" style={[{ gap: space3, padding: space3, borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line"), borderRadius: t.pick<number>("--radius-lg-token", "--radius-lg", 12), backgroundColor: t.pick<string>("--surface"), boxShadow: t.pick<string>("--elev-1", "") || undefined }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: space3 }}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: listening ? primary : t.pick<string>("--surface-2") }}>
          {listening && <Animated.View style={{ position: "absolute", left: -5, right: -5, top: -5, bottom: -5, borderRadius: 23, borderWidth: 2, borderColor: t.mix(primary, 32, "transparent"), opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.8] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] }) }] }} />}
          <Mic size={18} color={listening ? t.pick<string>("--on-primary") : t.pick<string>("--ink-2")} />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={strong}>{listening ? "Escutando você" : "Gravação pausada"}</Text>
          <Text style={soft}>{listening ? "Fale normalmente. O texto aparece enquanto você fala." : "Retome quando estiver pronto."}</Text>
        </View>
        <Text accessibilityLabel={`Duração ${formatDuration(duration)}`} style={{ color: t.pick<string>("--ink-2"), fontSize: sm, fontVariant: ["tabular-nums"], ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") }}>{formatDuration(duration)}</Text>
      </View>
      <View style={{ gap: space2 }}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, height: 20 }}>
          {FACTORS.map((f, i) => <Bar key={i} factor={f} level={normalized} active={listening && !reduced} paused={!listening} color={listening ? primary : t.pick<string>("--ink-4")} />)}
        </View>
        <ProgressBar value={listening ? normalized : 0} size="sm" accessibilityLabel={listening ? `Nível do microfone: ${Math.round(normalized)}%` : "Microfone pausado"} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: space2 }}>
        <Button size="sm" variant="ghost" onPress={onCancel}>Cancelar</Button>
        <IconButton accessibilityLabel={listening ? "Pausar gravação" : "Retomar gravação"} variant="outline" icon={listening ? <Pause /> : <Play />} onPress={listening ? onPause : onResume} />
        <Button size="sm" variant="primary" onPress={onFinish}>Concluir</Button>
      </View>
    </View>
  );
}
