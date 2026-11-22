import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { ComparisonRow, ComparisonTableCoreProps, ComparisonValue } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export type { ComparisonRow, ComparisonValue };
export interface ComparisonTableProps extends ComparisonTableCoreProps, Omit<ViewProps, "children"> {}

const FEATURE = 140;
const OPTION = 110;

/**
 * Opções lado a lado, um critério por linha. Rola na horizontal quando não cabe; a coluna do
 * critério rola junto (no RN não há `position: sticky` dentro de ScrollView horizontal).
 */
export function ComparisonTable({ options, rows, highlight, highlightLabel = "Recomendado", caption, style, ...rest }: ComparisonTableProps) {
  const t = useRefy();
  const line = t.pick<string>("--line-soft");
  const soft = t.pick<string>("--primary-soft");
  const sm = t.pick<number>("--text-sm", 13);
  const cellText = { ...baseText(t, { size: sm, color: "--ink-2" }), textAlign: "center" as const, fontVariant: ["tabular-nums" as const] };
  const mark = (value: ComparisonValue): ReactNode => {
    if (value === true)
      return <Svg width={20} height={20} viewBox="0 0 24 24" accessibilityLabel="Sim"><Path d="M5 12.5l4.5 4.5L19 7.5" stroke={t.pick<string>("--good-ink")} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    if (value === false || value == null)
      return <Svg width={20} height={20} viewBox="0 0 24 24" accessibilityLabel="Não"><Path d="M7 12h10" stroke={t.pick<string>("--ink-4", "--ink-3")} strokeWidth={2.4} fill="none" strokeLinecap="round" /></Svg>;
    return renderText(value as ReactNode, cellText);
  };
  const cell = (index: number) => ({ width: OPTION, paddingVertical: 12, paddingHorizontal: 12, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: index === highlight ? soft : undefined });
  return (
    <View
      accessibilityLabel={caption}
      {...rest}
      style={[{ borderWidth: 1, borderColor: line, borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>("--card-background", "--surface"), overflow: "hidden" }, style]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View>
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: line }}>
            <View style={{ width: FEATURE }} />
            {options.map((option, index) => (
              <View key={option} accessibilityRole="header" style={[cell(index), { justifyContent: "flex-end", gap: 4 }]}>
                {index === highlight && (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: t.pick<string>("--primary") }}>
                    <Text style={{ color: t.pick<string>("--on-primary"), fontSize: t.pick<number>("--text-2xs", 10), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-semi"), textTransform: "uppercase" }}>{highlightLabel}</Text>
                  </View>
                )}
                <Text style={{ ...baseText(t, { size: t.pick<number>("--text-base", 14), color: "--ink-1", family: "--font-headline", weight: "--weight-semi" }), textAlign: "center" }}>{option}</Text>
              </View>
            ))}
          </View>
          {rows.map((row, r) => (
            <View key={row.id ?? r} accessible accessibilityLabel={undefined} style={{ flexDirection: "row", borderBottomWidth: r < rows.length - 1 ? 1 : 0, borderBottomColor: line }}>
              <View style={{ width: FEATURE, paddingVertical: 12, paddingHorizontal: 16, justifyContent: "center" }}>
                {renderText(row.feature, baseText(t, { size: sm, color: "--ink-1", weight: "--weight-medium" }))}
                {row.hint != null && renderText(row.hint, baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3" }))}
              </View>
              {options.map((option, index) => <View key={option} style={cell(index)}>{mark(row.values[index])}</View>)}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
