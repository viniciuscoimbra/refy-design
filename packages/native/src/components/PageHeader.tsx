import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { PageHeaderCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export interface PageHeaderProps extends PageHeaderCoreProps, Omit<ViewProps, "children"> {}

/** Cabeçalho de página: eyebrow mono, título display, lead e ações à direita. */
export function PageHeader({ eyebrow, title, lead, actions, breadcrumb, style, ...rest }: PageHeaderProps) {
  const t = useRefy();
  const eyebrowSize = t.pick<number>("--text-eyebrow", 11);
  const titleSize = t.pick<number>("--text-h3", 30);
  return (
    <View {...rest} style={[{ marginBottom: t.pick<number>("--space-8") }, style]}>
      {breadcrumb != null && <View style={{ marginBottom: t.pick<number>("--space-4") }}>{breadcrumb}</View>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: t.pick<number>("--space-6") }}>
        <View style={{ minWidth: 0, flexShrink: 1 }}>
          {eyebrow != null && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2"), marginBottom: t.pick<number>("--space-2") }}>
              {renderText(eyebrow, {
                ...baseText(t, { size: eyebrowSize, color: "--ink-3", family: ["--interface-detail-font", "--font-mono"], weight: "--weight-medium" }),
                textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase",
                letterSpacing: t.size("--interface-label-tracking", t.size("--tracking-uppercase", 0.16 * eyebrowSize, eyebrowSize), eyebrowSize),
              })}
            </View>
          )}
          <View accessibilityRole="header">
            {renderText(title, { ...baseText(t, { size: titleSize, color: "--ink-1", family: "--font-headline", weight: "--weight-semi", leading: "--leading-tight" }), letterSpacing: t.size("--tracking-display", -0.03 * titleSize, titleSize) })}
          </View>
          {lead != null && <View style={{ marginTop: t.pick<number>("--space-2") }}>{renderText(lead, baseText(t, { size: t.pick<number>("--text-base"), color: "--ink-2" }))}</View>}
        </View>
        {actions != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2"), flexShrink: 0 }}>{actions}</View>}
      </View>
    </View>
  );
}
