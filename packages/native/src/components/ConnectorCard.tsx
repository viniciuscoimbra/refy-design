import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { ConnectorCardCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export interface ConnectorCardProps extends ConnectorCardCoreProps, Omit<ViewProps, "children"> {}

/** Card de integração: logo, nome, status, descrição, meta e ações; `locked` troca ações por lockHint. */
export function ConnectorCard({ logo, name, status, description, meta, actions, locked = false, lockHint, style, ...rest }: ConnectorCardProps) {
  const t = useRefy();
  const trailing = locked ? lockHint : actions;
  return (
    <View
      {...rest}
      style={[
        { flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-4"), paddingVertical: t.pick<number>("--space-4"), paddingHorizontal: 18, backgroundColor: t.pick<string>(locked ? "--legacy-surface-hover" : "--surface"), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--border"), borderRadius: t.pick<number>("--radius-lg-token"), opacity: locked ? 0.85 : 1 },
        style,
      ]}
    >
      {logo != null && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 40, height: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface"), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--border"), borderRadius: t.pick<number>("--radius-md"), overflow: "hidden" }}>{logo}</View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: t.pick<number>("--space-2") }}>
          {renderText(name, baseText(t, { size: t.pick<number>("--text-base"), color: "--ink-1", weight: "--weight-semi", leading: "--leading-snug" }))}
          {status != null && <View>{renderText(status, baseText(t, { size: t.pick<number>("--text-xs"), color: "--ink-3" }))}</View>}
        </View>
        {description != null && <View style={{ marginTop: 2 }}>{renderText(description, { ...baseText(t, { size: t.pick<number>("--text-xs"), color: "--ink-3" }), lineHeight: Math.round(t.pick<number>("--text-xs") * 1.45) })}</View>}
        {meta != null && <View style={{ marginTop: t.pick<number>("--space-1") }}>{renderText(meta, baseText(t, { size: t.pick<number>("--text-2xs"), color: locked ? "--ink-3" : "--primary-ink", family: ["--interface-detail-font", "--font-mono"] }))}</View>}
      </View>
      {trailing != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2"), flexShrink: locked ? 1 : 0, maxWidth: locked ? "45%" : undefined }}>{renderText(trailing, baseText(t, { size: t.pick<number>("--text-xs"), color: "--ink-3" }))}</View>}
    </View>
  );
}
