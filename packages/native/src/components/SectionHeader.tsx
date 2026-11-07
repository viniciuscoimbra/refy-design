import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { SectionHeaderCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { lineHeight, renderText } from "../primitives";
import { Badge } from "./Badge";

export interface SectionHeaderProps extends SectionHeaderCoreProps, Omit<ViewProps, "children"> {}

/** Cabeçalho de seção: título, contador, ação à direita e descrição. `rule` é a versão compacta com régua. */
export function SectionHeader({ title, sub, count, action, rule = false, style, ...rest }: SectionHeaderProps) {
  const t = useRefy();
  const size = rule ? t.pick<number>("--text-xs", 12) : t.pick<number>("--text-h5", 17);
  const subSize = t.pick<number>("--text-sm", 13);
  return (
    <View {...rest} style={[{ marginBottom: t.pick<number>("--space-4", 16) }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-3", 12) }}>
        <View accessibilityRole="header" style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8), flexShrink: 1, minWidth: 0 }}>
          {renderText(title, {
            fontSize: size, color: t.pick<string>("--ink-1"), ...t.font(rule ? "--font-body" : "--font-headline", "--weight-semi"),
            ...(rule ? { textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", letterSpacing: t.size("--interface-label-tracking", t.size("--tracking-uppercase", 0.16 * size, size), size) } : {}),
          })}
          {count != null && <Badge tone="neutral">{count}</Badge>}
        </View>
        {rule && <View accessibilityElementsHidden importantForAccessibility="no" style={{ flex: 1, height: 1, backgroundColor: t.pick<string>("--legacy-line-faint") }} />}
        {action != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8), marginLeft: rule ? 0 : "auto" }}>{action}</View>}
      </View>
      {sub != null && <View style={{ marginTop: t.pick<number>("--space-1", 4) }}>{renderText(sub, { fontSize: subSize, lineHeight: lineHeight(subSize, t.pick<number>("--leading-snug", 1.35)), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}</View>}
    </View>
  );
}
