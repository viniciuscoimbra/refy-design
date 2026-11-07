import { Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { StatCoreProps, StatDelta, StatDeltaSentiment, StatGroupCoreProps, StatSize, StatTrend } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export type { StatDelta, StatDeltaSentiment, StatSize, StatTrend };
export interface StatProps extends StatCoreProps, Omit<ViewProps, "children"> {}
export interface StatGroupProps extends StatGroupCoreProps, Omit<ViewProps, "children"> {
  /** Largura mínima do tile; a web usa minmax(180px, 1fr). */
  minTileWidth?: number;
}

const trendPath: Record<StatTrend, string> = { up: "M7 17 17 7M8 7h9v9", down: "M7 7l10 10M17 8v9H8" };
const sizeToken: Record<StatSize, string> = { sm: "--text-h4", md: "--text-h3", lg: "--text-h2" };

/** Número em destaque com rótulo mono, unidade, delta e descrição. */
export function Stat({ label, value, unit, description, delta, chart, size = "md", style, accessibilityLabel, ...rest }: StatProps) {
  const t = useRefy();
  const labelSize = t.pick<number>("--text-eyebrow", 11);
  const valueSize = t.pick<number>(sizeToken[size]);
  const sentiment = delta?.sentiment ?? (delta?.trend === "up" ? "positive" : "negative");
  const deltaColor = t.pick<string>(sentiment === "positive" ? "--good-ink" : sentiment === "negative" ? "--critical" : "--ink-3");
  const valueStyle = { ...baseText(t, { size: valueSize, color: "--ink-1", family: "--font-headline", weight: "--weight-semi", leading: "--leading-tight" }), letterSpacing: t.size("--tracking-display", -0.03 * valueSize, valueSize), fontVariant: ["tabular-nums" as const] };
  const spoken = [label, value, unit, delta && `${delta.value} ${delta.trend === "up" ? "em alta" : "em queda"}`].filter((part) => typeof part === "string" || typeof part === "number").join(" ");
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? (spoken || undefined)} {...rest} style={[{ gap: t.pick<number>("--space-1"), minWidth: 0 }, style]}>
      {renderText(label, { ...baseText(t, { size: labelSize, color: "--ink-3", family: ["--interface-detail-font", "--font-mono"], weight: "--weight-medium" }), textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", letterSpacing: t.size("--interface-label-tracking", t.size("--tracking-uppercase", 0.16 * labelSize, labelSize), labelSize) })}
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", gap: t.pick<number>("--space-2"), minWidth: 0 }}>
        <Text style={valueStyle}>
          {value}
          {unit != null && <Text style={{ fontSize: valueSize * 0.55, ...t.font("--font-headline", "--weight-medium"), letterSpacing: 0, color: t.pick<string>("--ink-3") }}>{" "}{unit}</Text>}
        </Text>
        {delta && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            <Svg width={t.pick<number>("--space-3")} height={t.pick<number>("--space-3")} viewBox="0 0 24 24" fill="none" stroke={deltaColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <Path d={trendPath[delta.trend]} />
            </Svg>
            {renderText(delta.value, { ...baseText(t, { size: t.pick<number>("--text-xs"), color: "--ink-3", family: ["--interface-detail-font", "--font-mono"], weight: "--weight-semi" }), color: deltaColor, fontVariant: ["tabular-nums"] })}
          </View>
        )}
      </View>
      {description != null && renderText(description, baseText(t, { size: t.pick<number>("--text-xs"), color: "--ink-3", leading: "--leading-snug" }))}
      {chart != null && <View style={{ marginTop: t.pick<number>("--space-2") }}>{chart}</View>}
    </View>
  );
}

/** Tiles lado a lado com largura mínima; quebra de linha no lugar do grid auto-fit. */
export function StatGroup({ children, minTileWidth = 180, style, ...rest }: StatGroupProps) {
  const t = useRefy();
  const gap = t.pick<number>("--space-5");
  return (
    <View {...rest} style={[{ flexDirection: "row", flexWrap: "wrap", gap }, style]}>
      {Array.isArray(children) ? children.map((child, index) => <View key={index} style={{ flexGrow: 1, flexBasis: minTileWidth, minWidth: minTileWidth }}>{child}</View>) : <View style={{ flexGrow: 1, flexBasis: minTileWidth }}>{children}</View>}
    </View>
  );
}
