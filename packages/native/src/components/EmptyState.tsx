import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { EmptyStateCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export interface EmptyStateProps extends EmptyStateCoreProps, Omit<ViewProps, "children"> {}

/** Estado vazio: ícone em quadro, título, mensagem e uma ação. */
export function EmptyState({ icon, title, message, action, bordered = true, style, ...rest }: EmptyStateProps) {
  const t = useRefy();
  const line = t.pick<string>("--line", "--surface-container-high");
  const width = t.pick<number>("--surface-border-width", 1);
  return (
    <View
      {...rest}
      style={[
        { alignItems: "center", gap: t.pick<number>("--space-3"), paddingVertical: 56, paddingHorizontal: t.pick<number>("--space-8") },
        bordered && { borderWidth: width, borderStyle: "dashed", borderColor: line, borderRadius: t.pick<number>("--radius-lg") },
        style,
      ]}
    >
      {icon != null && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 56, height: 56, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--surface-2", "--surface-container-low"), borderWidth: width, borderColor: line, borderRadius: t.pick<number>("--radius-lg") }}>
          {icon}
        </View>
      )}
      <View accessibilityRole="header">{renderText(title, { ...baseText(t, { size: 18, color: "--ink-1", family: "--font-headline", weight: "--weight-semi" }), textAlign: "center" })}</View>
      {message != null && <View style={{ maxWidth: 36 * 7 }}>{renderText(message, { ...baseText(t, { size: t.pick<number>("--text-sm"), color: "--ink-3" }), textAlign: "center" })}</View>}
      {action != null && <View style={{ marginTop: t.pick<number>("--space-1") }}>{action}</View>}
    </View>
  );
}
