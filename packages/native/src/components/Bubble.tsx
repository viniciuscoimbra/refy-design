import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { BubbleCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";

export interface BubbleProps extends BubbleCoreProps, ViewProps {}

/** Balão de mensagem; `end` encosta à direita na cor da marca. */
export function Bubble({ side = "start", children, style, ...rest }: BubbleProps) {
  const t = useRefy();
  const end = side === "end";
  const ink = end ? t.pick<string>("--primary-ink") : t.pick<string>("--ink-1");
  return (
    <View
      {...rest}
      style={[{
        maxWidth: "85%", alignSelf: end ? "flex-end" : "flex-start",
        paddingVertical: t.pick<number>("--space-3", 12), paddingHorizontal: t.pick<number>("--space-4", 16),
        backgroundColor: end ? t.pick<string>("--primary-soft") : t.pick<string>("--surface-2"),
        borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: end ? t.pick<string>("--primary-ink") : t.pick<string>("--line"),
        borderRadius: t.pick<number>("--radius-lg", 12),
      }, style]}
    >
      {renderText(children, { ...baseText(t), color: ink })}
    </View>
  );
}
