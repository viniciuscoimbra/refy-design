import { Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { BillingCardCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Card } from "./Card";

export interface BillingCardProps extends BillingCardCoreProps, Omit<ViewProps, "children"> {}

/** Método de pagamento, próxima cobrança e ações sobre o Card. Bandeira, status e ações entram por slots. */
export function BillingCard({ brandIcon, methodLabel, lastDigits, methodMeta, status, nextChargeLabel = "Próxima cobrança", nextChargeAmount, nextChargeDate, actions, elevation = 0, style, ...rest }: BillingCardProps) {
  const t = useRefy();
  const ink1 = t.pick<string>("--ink-1");
  const ink3 = t.pick<string>("--ink-3");
  const mono = (w: string) => t.font(["--interface-detail-font", "--font-mono"], w);
  const hasFooter = nextChargeAmount != null || actions != null;
  const h4 = t.pick<number>("--text-h4", 20);
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  return (
    <Card elevation={elevation} {...rest} style={[{ gap: t.pick<number>("--space-4", 16) }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-4", 16) }}>
        {brandIcon != null && (
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 44, height: 32, borderRadius: t.pick<number>("--radius-sm", 4), backgroundColor: ink1, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {renderText(brandIcon, { color: t.pick<string>("--surface"), fontSize: t.pick<number>("--text-2xs", 11), letterSpacing: -0.02 * 11, ...t.font("--font-body", "--weight-bold") })}
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: ink1, fontSize: t.pick<number>("--text-base", 14), ...t.font("--font-body", "--weight-semi") }}>
            {methodLabel}{lastDigits ? ` · final ${lastDigits}` : ""}
          </Text>
          {methodMeta != null && <View style={{ marginTop: 2 }}>{renderText(methodMeta, { color: ink3, fontSize: t.pick<number>("--text-xs", 12), ...mono("--weight-regular") })}</View>}
        </View>
        {status != null && <View style={{ flexShrink: 0 }}>{status}</View>}
      </View>
      {hasFooter && (
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: t.pick<number>("--space-3", 12), borderTopWidth: 1, borderTopColor: t.pick<string>("--border-soft", "--line"), paddingTop: t.pick<number>("--space-4", 16) }}>
          {nextChargeAmount != null && (
            <View style={{ minWidth: 0 }}>
              <View style={{ marginBottom: t.pick<number>("--space-1", 4) }}>{renderText(nextChargeLabel, { color: ink3, fontSize: eyebrow, letterSpacing: 0.14 * eyebrow, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...mono("--weight-medium") })}</View>
              <Text style={{ color: ink1, fontSize: h4, letterSpacing: -0.02 * h4, fontVariant: ["tabular-nums"], ...t.font("--font-headline", "--weight-semi") }}>
                {nextChargeAmount}
                {nextChargeDate != null && <Text style={{ color: ink3, fontSize: t.pick<number>("--text-2xs", 11), letterSpacing: 0, ...mono("--weight-regular") }}> {nextChargeDate}</Text>}
              </Text>
            </View>
          )}
          {actions != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8), flexShrink: 0 }}>{actions}</View>}
        </View>
      )}
    </Card>
  );
}
