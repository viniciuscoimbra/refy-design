import { Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import type { PlanCardCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { IconSlot } from "../icon";
import { renderText } from "../primitives";
import { Button } from "./Button";

export interface PlanCardProps extends PlanCardCoreProps, Omit<ViewProps, "children"> {}

/** Cartão de plano: nome, preço, CTA e lista de recursos. `current` trava o CTA; `highlighted` destaca o recomendado. */
export function PlanCard({ name, price, period, priceNote, features, checkIcon, cta, current = false, currentLabel = "Plano atual", highlighted = false, highlightLabel = "Recomendado", style, ...rest }: PlanCardProps) {
  const t = useRefy();
  const tag = current ? currentLabel : highlighted ? highlightLabel : null;
  const neutralTag = current && !highlighted;
  const primary = t.pick<string>("--primary");
  const ink1 = t.pick<string>("--ink-1");
  const surface = t.pick<string>("--surface");
  const h5 = t.pick<number>("--text-h5", 18);
  const h3 = t.pick<number>("--text-h3", 28);
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const s5 = t.pick<number>("--space-5", 20);
  const radius = t.pick<number>("--radius-lg-token", 8);
  return (
    <View
      {...rest}
      style={[{
        backgroundColor: current ? t.pick<string>("--surface-2") : surface,
        borderWidth: highlighted ? 2 : t.pick<number>("--surface-border-width", 1),
        borderColor: highlighted ? primary : t.pick<string>("--border", "--line"),
        borderRadius: radius,
        paddingTop: s5, paddingHorizontal: s5, paddingBottom: t.pick<number>("--space-6", 24),
      }, style]}
    >
      {highlighted && (
        <Svg pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderRadius: radius }} width="100%" height="100%">
          <Defs><LinearGradient id="plan" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={t.mix(primary, 7, surface)} /><Stop offset="0.18" stopColor={surface} /></LinearGradient></Defs>
          <Rect width="100%" height="100%" fill="url(#plan)" />
        </Svg>
      )}
      {tag && (
        <View style={{ position: "absolute", top: -10, left: s5 - (highlighted ? 2 : 1), paddingVertical: t.pick<number>("--space-1", 4), paddingHorizontal: t.pick<number>("--space-2", 8), borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: neutralTag ? t.pick<string>("--surface-2") : primary, borderWidth: neutralTag ? t.pick<number>("--surface-border-width", 1) : 0, borderColor: t.pick<string>("--border", "--line") }}>
          <Text style={{ color: neutralTag ? t.pick<string>("--ink-3") : t.pick<string>("--on-primary"), fontSize: eyebrow, letterSpacing: 0.12 * eyebrow, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...t.font(["--interface-detail-font", "--font-mono"], "--weight-bold") }}>{tag}</Text>
        </View>
      )}
      <View accessibilityRole="header" style={{ marginBottom: t.pick<number>("--space-3", 12) }}>{renderText(name, { color: ink1, fontSize: h5, letterSpacing: -0.015 * h5, ...t.font("--font-headline", "--weight-semi") })}</View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: t.pick<number>("--space-1", 4), marginBottom: t.pick<number>("--space-1", 4) }}>
        {renderText(price, { color: ink1, fontSize: h3, letterSpacing: -0.025 * h3, fontVariant: ["tabular-nums"], ...t.font("--font-headline", "--weight-semi") })}
        {period != null && renderText(period, { color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", "--weight-regular") })}
      </View>
      <View style={{ minHeight: 16, marginBottom: t.pick<number>("--space-4", 16) }}>{priceNote != null && renderText(priceNote, { color: t.pick<string>("--primary-ink"), fontSize: t.pick<number>("--text-2xs", 11), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-regular") })}</View>
      {(current || cta != null) && <View style={{ marginBottom: t.pick<number>("--space-4", 16) }}>{current ? <Button variant="secondary" block disabled>{currentLabel}</Button> : cta}</View>}
      {features && features.length > 0 && (
        <View style={{ gap: t.pick<number>("--space-2", 8) }}>
          {features.map((feature, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: t.pick<number>("--space-2", 8) }}>
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ marginTop: 3 }}>
                <IconSlot size={13} color={t.pick<string>("--primary-ink")}>{checkIcon ?? <Svg viewBox="0 0 24 24" fill="none" stroke={t.pick<string>("--primary-ink")} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><Path d="m5 12 5 5L20 7" /></Svg>}</IconSlot>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>{renderText(feature, { color: t.pick<string>("--ink-2"), fontSize: t.pick<number>("--text-sm", 13), lineHeight: Math.round(13 * 1.35), ...t.font("--font-body", "--weight-regular") })}</View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
