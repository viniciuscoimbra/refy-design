import { useMemo } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { VideoCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";
import { parseVideoSource } from "./videoSource";
import type { VideoSource } from "./videoSource";

export type { VideoSource };
export interface VideoProps extends VideoCoreProps, Omit<ViewProps, "children"> {
  /**
   * Só no nativo: o app toca o vídeo (expo-video, WebView). Sem ele, o toque abre o endereço
   * no app do YouTube, do Vimeo ou no navegador; o refy não traz player nativo.
   */
  onPlay?: (source: VideoSource) => void;
}

/** Capa com botão de tocar para arquivo de vídeo ou link do YouTube e do Vimeo. */
export function Video({ src, title, poster, aspectRatio = 16 / 9, description, onPlay, style, ...rest }: VideoProps) {
  const t = useRefy();
  const source = useMemo(() => parseVideoSource(src), [src]);
  const cover = poster ?? (source.kind === "youtube" ? source.poster : undefined);
  const play = () => (onPlay ? onPlay(source) : void Linking.openURL(src));
  return (
    <View {...rest} style={[{ gap: 8 }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tocar vídeo: ${title}`}
        onPress={play}
        style={{ aspectRatio, minHeight: 120, overflow: "hidden", borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>("--ink-1") }}
      >
        {cover ? <Image source={{ uri: cover }} accessibilityIgnoresInvertColors style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" /> : null}
        <View style={{ position: "absolute", top: "50%", left: "50%", width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: 32, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--primary"), boxShadow: t.pick<string>("--shadow-2", "") || undefined }}>
          <Svg width={28} height={28} viewBox="0 0 24 24" style={{ marginLeft: 3 }}><Path d="M8 5.5v13l11-6.5z" fill={t.pick<string>("--on-primary")} /></Svg>
        </View>
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 12, experimental_backgroundImage: `linear-gradient(to top, ${t.mix(t.pick<string>("--ink-1"), 70, "transparent")}, transparent)` }}>
          <Text numberOfLines={2} style={{ color: t.pick<string>("--bg", "--surface"), fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", "--weight-semi") }}>{title}</Text>
        </View>
      </Pressable>
      {description != null && renderText(description, baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-3" }))}
    </View>
  );
}
