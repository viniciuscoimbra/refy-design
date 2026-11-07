import { Pressable, View } from "react-native";
import type { ViewProps } from "react-native";
import type { ItemCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { MIN_TOUCH, baseText, renderText } from "../primitives";

export interface ItemProps extends ItemCoreProps, Omit<ViewProps, "children"> {}

/** Linha de item com mídia, título, descrição e ações. `onClick` mantém o nome do contrato. */
export function Item({ title, description, media, actions, onClick, selected = false, variant = "default", style, ...rest }: ItemProps) {
  const t = useRefy();
  const gap = t.pick<number>("--item-gap", "--space-3");
  const plain = variant === "plain";
  const size = t.pick<number>("--item-media-size", 20);
  const content = (
    <>
      {media != null && <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, flexShrink: 0 }}>{media}</View>}
      <View style={{ flex: 1, minWidth: 0, gap: t.pick<number>("--item-description-gap", 4) }}>
        {renderText(title, baseText(t, { size: t.pick<number>("--item-title-size", "--text-base"), color: "--ink-1", weight: t.pick<number>("--item-title-weight", 700) }))}
        {description != null && description !== false && renderText(description, baseText(t, { size: t.pick<number>("--item-description-size", "--text-sm"), color: "--ink-3" }))}
      </View>
    </>
  );
  return (
    <View
      {...rest}
      style={[
        { flexDirection: "row", alignItems: "center", gap, minWidth: 0 },
        !plain && { borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line"), borderRadius: t.pick<number>("--radius-md"), backgroundColor: t.pick<string>("--surface"), padding: t.pick<number>("--space-3") },
        selected && { backgroundColor: t.pick<string>("--primary-soft"), borderColor: t.pick<string>("--primary-ink") },
        style,
      ]}
    >
      {onClick ? (
        <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ selected }} onPress={onClick} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: MIN_TOUCH, flexDirection: "row", alignItems: "center", gap, opacity: pressed ? 0.7 : 1 })}>
          {content}
        </Pressable>
      ) : (
        <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap }}>{content}</View>
      )}
      {actions != null && <View>{actions}</View>}
    </View>
  );
}
