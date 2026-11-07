import { Pressable, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { SnackbarCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor, renderText } from "../primitives";

export interface SnackbarProps extends SnackbarCoreProps, Omit<ViewProps, "children"> {}

/** Aviso de uma linha com ação ("Desfazer"). Só apresentação: quem posiciona é o app, ou o Toast. */
export function Snackbar({ children, action, style, ...rest }: SnackbarProps) {
  const t = useRefy();
  const fg = t.pick<string>("--surface", "--on-surface");
  const sm = t.pick<number>("--text-sm", 13);
  const actionHeight = t.pick<number>("--navigation-hit-height", 24);
  return (
    <View
      accessibilityLiveRegion="polite"
      role="status"
      {...rest}
      style={[{
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: t.size("--space-4", 16),
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: t.pick<string>("--ink-1", "--surface-container-highest"),
        borderRadius: t.pick<number>("--radius-md", 8),
        boxShadow: t.pick<string>("--elev-3", "") || undefined,
      }, style]}
    >
      <View style={{ flexShrink: 1, minWidth: 0 }}>{renderText(children, { color: fg, fontSize: sm, ...t.font("--font-body", "--weight-regular") })}</View>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={action.onClick}
          hitSlop={{ ...hitSlopFor(actionHeight), left: 8, right: 8 }}
          style={({ pressed }) => ({ height: actionHeight, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: t.pick<string>("--notification-action-color", "--surface"), fontSize: sm, ...t.font("--font-body", "--weight-semi") }}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}
