import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { BadgeCoreProps, BadgeTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";

export type { BadgeTone };
export interface BadgeProps extends BadgeCoreProps, Omit<ViewProps, "children"> {}

// Mesmas cadeias de fallback de Badge.module.css.
const tones: Record<BadgeTone, [string[], string[]]> = {
  success: [["--good-soft"], ["--good-ink", "--on-good"]],
  info: [["--info-soft", "--legacy-info-soft"], ["--info-ink", "--info"]],
  warn: [["--weak-soft"], ["--weak-ink", "--legacy-warn-ink"]],
  danger: [["--critical-soft"], ["--critical-ink", "--legacy-danger-ink"]],
  neutral: [["--legacy-neutral-soft"], ["--ink-2"]],
};

/** Status curto: fundo suave e texto na cor semântica, mono e em caixa alta. */
export function Badge({ tone = "neutral", dot = false, children, style, ...rest }: BadgeProps) {
  const t = useRefy();
  const [background, foreground] = tones[tone];
  const color = t.pick<string>(...foreground);
  const fontSize = t.size("--text-2xs", 11);
  const text = {
    color,
    fontSize,
    ...t.font(["--interface-detail-font", "--font-mono"], "--weight-semi"),
    textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase",
    letterSpacing: t.size("--interface-label-tracking", 0.04 * fontSize, fontSize),
  };
  return (
    <View
      accessibilityRole="text"
      {...rest}
      style={[{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 5, height: 22, paddingHorizontal: 8, borderRadius: t.pick<number>("--control-group-radius", "--radius-pill"), backgroundColor: t.pick<string>(...background) }, style]}
    >
      {dot && <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />}
      {renderText(children, text, { numberOfLines: 1 })}
    </View>
  );
}
