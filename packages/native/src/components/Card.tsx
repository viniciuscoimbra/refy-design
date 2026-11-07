import { View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop, LinearGradient } from "react-native-svg";
import type { CardCoreProps, CardHeaderCoreProps, CardTone } from "@refy-design/web/contracts";
import { RefyScope, useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export type { CardTone };
export interface CardProps extends CardCoreProps, Omit<ViewProps, "children"> {}
export interface CardHeaderProps extends CardHeaderCoreProps, Omit<ViewProps, "children"> {}

// .inverted re-escopa tinta e linha para os filhos lerem texto claro sem prop extra.
function invertedTokens(white: string, mix: (a: string, p: number, b: string) => string): Record<`--${string}`, string> {
  return {
    "--ink-1": white,
    "--ink-2": mix(white, 78, "transparent"),
    "--ink-3": mix(white, 60, "transparent"),
    "--ink-4": mix(white, 40, "transparent"),
    "--surface": "transparent",
    "--surface-2": mix(white, 8, "transparent"),
    "--border": mix(white, 14, "transparent"),
    "--line": mix(white, 16, "transparent"),
    "--line-soft": mix(white, 10, "transparent"),
  };
}

/** Superfície base. `elevation` usa as sombras --elev-*; `inverted` desenha o degradê com SVG. */
export function Card({ elevation = 0, padding = "md", tone = "default", children, style, ...rest }: CardProps) {
  const t = useRefy();
  const inverted = tone === "inverted";
  const white = t.pick<string>("--legacy-white", "#ffffff");
  const ink = t.pick<string>("--legacy-ink-1");
  const primary = t.pick<string>("--primary");
  const pad = padding === "none" ? 0 : padding === "sm" ? t.pick<number>("--space-3") : t.pick<number>("--card-padding", "--space-5");
  const shadow = elevation > 0 ? t.pick<string>(`--elev-${elevation}`) : undefined;
  const body = (
    <View
      {...rest}
      style={[
        {
          backgroundColor: inverted ? ink : t.pick<string>("--card-background", "--surface"),
          borderWidth: t.pick<number>("--card-border-width", 1),
          borderColor: inverted ? t.mix(white, 12, "transparent") : t.pick<string>("--border"),
          borderRadius: t.pick<number>("--card-radius", "--radius-lg-token"),
          padding: pad,
          overflow: inverted ? "hidden" : undefined,
          boxShadow: shadow,
        },
        style,
      ]}
    >
      {inverted && (
        <Svg pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="refy-card-base" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={ink} />
              <Stop offset="1" stopColor={t.mix(ink, 93, white)} />
            </LinearGradient>
            <RadialGradient id="refy-card-glow-a" cx="100%" cy="0%" r="50%">
              <Stop offset="0" stopColor={primary} stopOpacity={0.18} />
              <Stop offset="1" stopColor={primary} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="refy-card-glow-b" cx="0%" cy="100%" r="60%">
              <Stop offset="0" stopColor={primary} stopOpacity={0.1} />
              <Stop offset="1" stopColor={primary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#refy-card-base)" />
          <Rect width="100%" height="100%" fill="url(#refy-card-glow-a)" />
          <Rect width="100%" height="100%" fill="url(#refy-card-glow-b)" />
        </Svg>
      )}
      {children}
    </View>
  );
  return inverted ? <RefyScope tokens={invertedTokens(white, t.mix)}>{body}</RefyScope> : body;
}

export function CardHeader({ title, count, action, icon, description, size = "md", style, ...rest }: CardHeaderProps) {
  const t = useRefy();
  const sm = size === "sm";
  const titleSize = sm ? t.pick<number>("--card-sm-title-size", "--text-base") : t.pick<number>("--card-title-size", "--text-h5");
  const iconSize = sm ? t.pick<number>("--card-sm-icon-size", 32) : t.pick<number>("--card-icon-size", 48);
  const titleStyle = { ...baseText(t, { size: titleSize, color: "--ink-1", family: "--font-headline", weight: t.pick<number>("--card-title-weight", "--weight-semi") }), letterSpacing: -0.01 * titleSize };
  const descriptionSize = sm ? t.pick<number>("--card-sm-description-size", "--card-description-size", "--text-sm") : t.pick<number>("--card-description-size", "--text-sm");
  const heading = renderText(title, titleStyle);
  return (
    <View
      accessibilityRole="header"
      {...rest}
      style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: t.pick<number>("--card-header-gap", "--space-3"), marginBottom: t.pick<number>("--card-header-margin-bottom", "--space-3") }, style]}
    >
      {icon != null && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: iconSize, height: iconSize, borderRadius: t.pick<number>("--card-icon-radius", "--radius-sm"), backgroundColor: t.pick<string>("--card-icon-background", "--primary-soft"), alignItems: "center", justifyContent: "center" }}>
          {icon}
        </View>
      )}
      {description != null ? (
        <View style={{ flex: 1, minWidth: 0 }}>
          {heading}
          <View style={{ marginTop: t.pick<number>("--card-description-gap", 4) }}>{renderText(description, baseText(t, { size: descriptionSize, color: "--ink-3" }))}</View>
        </View>
      ) : (
        <View style={{ flexShrink: 1, minWidth: 0 }}>{heading}</View>
      )}
      {count != null && (
        <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: t.pick<number>("--radius-pill"), backgroundColor: t.pick<string>("--surface-2"), flexShrink: 0 }}>
          {renderText(count, baseText(t, { size: t.pick<number>("--text-2xs"), color: "--ink-3", family: ["--interface-detail-font", "--font-mono"] }))}
        </View>
      )}
      {action != null && <View style={{ marginLeft: "auto", flexShrink: 0 }}>{action}</View>}
    </View>
  );
}
