import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { PersonCellCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { lineHeight, renderText } from "../primitives";

export interface PersonCellProps extends PersonCellCoreProps, Omit<ViewProps, "children"> {}

/** Pessoa numa linha de tabela ou lista: avatar, nome com etiqueta e uma linha de apoio. */
export function PersonCell({ avatar, name, tag, secondary, size = "md", style, ...rest }: PersonCellProps) {
  const t = useRefy();
  const nameSize = size === "sm" ? t.pick<number>("--text-sm", 13) : t.pick<number>("--text-base", 14);
  const secSize = size === "sm" ? t.pick<number>("--text-2xs", 11) : t.pick<number>("--text-xs", 12);
  const snug = t.pick<number>("--leading-snug", 1.35);
  return (
    <View {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: size === "md" ? 10 : t.pick<number>("--space-2", 8), minWidth: 0, flexShrink: 1 }, style]}>
      {avatar != null && <View style={{ flexShrink: 0 }}>{avatar}</View>}
      <View style={{ gap: 1, minWidth: 0, flexShrink: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-1", 4), minWidth: 0 }}>
          {renderText(name, { flexShrink: 1, fontSize: nameSize, lineHeight: lineHeight(nameSize, snug), color: t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") }, { numberOfLines: 1 })}
          {tag != null && <View style={{ marginLeft: t.pick<number>("--space-1", 4), flexShrink: 0 }}>{renderText(tag, { fontSize: t.pick<number>("--text-eyebrow", 11), color: t.pick<string>("--ink-3"), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") }, { numberOfLines: 1 })}</View>}
        </View>
        {secondary != null && renderText(secondary, { fontSize: secSize, lineHeight: lineHeight(secSize, snug), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") }, { numberOfLines: 1 })}
      </View>
    </View>
  );
}
