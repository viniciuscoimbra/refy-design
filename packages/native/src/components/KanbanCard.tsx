import { Pressable, View } from "react-native";
import type { ViewProps } from "react-native";
import type { KanbanCardCoreProps, KanbanCardItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor, renderText } from "../primitives";
import { Card } from "./Card";
import type { CardProps } from "./Card";

export type { KanbanCardItem };
export interface KanbanCardProps extends KanbanCardCoreProps, Omit<CardProps, "children" | "title"> {}

/** Cartão de uma coluna do quadro. O mesmo cartão serve à coluna e à prévia do arraste. */
export function KanbanCard({ item, onOpen, dragHandle, actions, elevation = 1, ...rest }: KanbanCardProps & Omit<ViewProps, "children">) {
  const t = useRefy();
  const ink1 = t.pick<string>("--ink-1");
  const xs = t.pick<number>("--text-xs", 12);
  const sm = t.pick<number>("--text-sm", 13);
  const space1 = t.size("--space-1", 4);
  const space2 = t.size("--space-2", 8);
  const titleStyle = { color: ink1, fontSize: sm, lineHeight: Math.round(sm * 1.5), ...t.font("--font-body", "--weight-semi") };
  const title = typeof item.title === "string" ? item.title : undefined;
  return (
    <Card role="article" elevation={elevation} padding="sm" {...rest} style={[{ minWidth: 0, gap: space2 }, rest.style]}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space2 }}>
        {item.leading != null && <View style={{ minHeight: 24, justifyContent: "center" }}>{item.leading}</View>}
        <View accessibilityRole="header" style={{ flex: 1, minWidth: 0, minHeight: 24, justifyContent: "center" }}>
          {onOpen ? (
            <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onOpen} hitSlop={hitSlopFor(24)} style={{ minHeight: 24, justifyContent: "center", alignSelf: "flex-start", maxWidth: "100%" }}>
              {({ pressed }) => renderText(item.title, { ...titleStyle, textDecorationLine: pressed ? "underline" : "none" })}
            </Pressable>
          ) : renderText(item.title, titleStyle)}
        </View>
        {(dragHandle != null || actions != null) && <View style={{ flexDirection: "row", alignItems: "center", gap: space1, marginVertical: -space1 }}>{dragHandle}{actions}</View>}
      </View>
      {item.description != null && <View>{renderText(item.description, { color: t.pick<string>("--ink-3"), fontSize: xs, lineHeight: Math.round(xs * 1.5), ...t.font("--font-body", "--weight-regular") })}</View>}
      {item.meta != null && <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: space2 }}>{renderText(item.meta, { color: t.pick<string>("--ink-2"), fontSize: xs, ...t.font("--font-body", "--weight-regular") })}</View>}
      {item.footer != null && <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "space-between", gap: space2, paddingTop: space1 }}>{item.footer}</View>}
    </Card>
  );
}
