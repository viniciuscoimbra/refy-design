import { useEffect, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { AudioPlayerCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, hitSlopFor, renderText } from "../primitives";

/** Estado que o player do app informa. */
export interface AudioPlayerState { playing: boolean; position: number; duration?: number }

/**
 * Só no nativo: ponte com o player do app (expo-audio, react-native-track-player). O refy
 * desenha os controles; quem toca é o app.
 */
export interface AudioPlayerController {
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  /** Avisa mudanças de estado; devolve a função que cancela a inscrição. */
  subscribe(listener: (state: AudioPlayerState) => void): () => void;
}

export interface AudioPlayerProps extends AudioPlayerCoreProps, Omit<ViewProps, "children"> {
  /** Sem `controller`, tocar abre o arquivo no app do sistema. */
  controller?: AudioPlayerController;
}

export function formatClock(seconds: number) {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** Tocar e pausar, linha do tempo que se toca para pular, tempo e saltos de 15 segundos. */
export function AudioPlayer({ src, title, description, artwork, duration: durationProp, controller, style, ...rest }: AudioPlayerProps) {
  const t = useRefy();
  const [state, setState] = useState<AudioPlayerState>({ playing: false, position: 0, duration: durationProp });
  const [track, setTrack] = useState(0);
  useEffect(() => controller?.subscribe((next) => setState((prev) => ({ ...prev, ...next, duration: next.duration ?? prev.duration }))), [controller]);
  const duration = state.duration ?? durationProp ?? 0;
  const progress = duration ? Math.min(1, state.position / duration) : 0;
  const toggle = () => {
    if (!controller) return void Linking.openURL(src);
    if (state.playing) controller.pause();
    else controller.play();
  };
  const seek = (seconds: number) => controller?.seek(Math.min(Math.max(0, seconds), duration || seconds));
  const primary = t.pick<string>("--primary");
  const mono = { ...baseText(t, { size: t.pick<number>("--text-2xs", 10), color: "--ink-3", family: ["--interface-detail-font", "--font-mono"] }), fontVariant: ["tabular-nums" as const] };
  const skip = (back: boolean) => (
    <Pressable accessibilityRole="button" accessibilityLabel={back ? "Voltar 15 segundos" : "Avançar 15 segundos"} disabled={!controller} onPress={() => seek(state.position + (back ? -15 : 15))} hitSlop={hitSlopFor(32, 32)} style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center", opacity: controller ? 1 : 0.4 }}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--ink-2")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d={back ? "M11 7 6 12l5 5M18 7l-5 5 5 5" : "M13 7l5 5-5 5M6 7l5 5-5 5"} /></Svg>
    </Pressable>
  );
  return (
    <View {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: 16, padding: 16, borderWidth: 1, borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>("--card-background", "--surface") }, style]}>
      {artwork && <Image source={{ uri: artwork }} accessibilityIgnoresInvertColors style={{ width: 56, height: 56, borderRadius: t.pick<number>("--radius-md", 10) }} />}
      <View style={{ flex: 1, gap: 8, minWidth: 0 }}>
        <View>
          <Text numberOfLines={1} style={baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-1", weight: "--weight-semi" })}>{title}</Text>
          {description != null && renderText(description, baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3" }))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={state.playing ? `Pausar ${title}` : `Tocar ${title}`} onPress={toggle} hitSlop={hitSlopFor(40, 40)} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: primary }}>
            <Svg width={18} height={18} viewBox="0 0 24 24"><Path fill={t.pick<string>("--on-primary")} d={state.playing ? "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" : "M8 5.5v13l11-6.5z"} /></Svg>
          </Pressable>
          {skip(true)}
          <Text style={mono}>{formatClock(state.position)}</Text>
          <Pressable
            accessibilityRole="adjustable"
            accessibilityLabel="Posição"
            accessibilityValue={{ text: `${formatClock(state.position)} de ${formatClock(duration)}` }}
            accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
            onAccessibilityAction={(e) => seek(state.position + (e.nativeEvent.actionName === "increment" ? 15 : -15))}
            onLayout={(e) => setTrack(e.nativeEvent.layout.width)}
            onPress={(e) => track && duration && seek((e.nativeEvent.locationX / track) * duration)}
            hitSlop={{ top: 20, bottom: 20 }}
            style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: t.pick<string>("--surface-container-high", "--line"), justifyContent: "center" }}
          >
            <View style={{ width: `${progress * 100}%`, height: 4, borderRadius: 2, backgroundColor: primary }} />
          </Pressable>
          <Text style={mono}>{duration ? formatClock(duration) : "--:--"}</Text>
          {skip(false)}
        </View>
      </View>
    </View>
  );
}
