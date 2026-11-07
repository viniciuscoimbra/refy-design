import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { DividerCoreProps, DividerOrientation, DividerSpacing } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";

export type { DividerOrientation, DividerSpacing };
export interface DividerProps extends DividerCoreProps, Omit<ViewProps, "children"> {}

const gaps: Record<DividerSpacing, string | number> = { none: 0, sm: "--space-2", md: "--space-4", lg: "--space-6" };

/** Separador entre blocos: linha horizontal (com rótulo central opcional) ou vertical. */
export function Divider({ orientation = "horizontal", label, spacing = "md", style, ...rest }: DividerProps) {
  const t = useRefy();
  const line = t.pick<string>("--line-soft");
  const margin = t.pick<number>(gaps[spacing], 0);
  const vertical = orientation === "vertical";
  const a11y = { accessibilityRole: "none" as const, role: "separator" as const, "aria-orientation": vertical ? ("vertical" as const) : undefined };
  if (vertical) {
    return <View {...a11y} {...rest} style={[{ width: 1, alignSelf: "stretch", minHeight: t.pick<number>("--space-4", 16), backgroundColor: line, marginHorizontal: margin }, style]} />;
  }
  if (label == null) return <View {...a11y} {...rest} style={[{ height: 1, backgroundColor: line, marginVertical: margin }, style]} />;
  const size = t.pick<number>("--text-eyebrow", 11);
  const text = {
    fontSize: size, color: t.pick<string>("--ink-4"),
    ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium"),
    textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase",
    letterSpacing: t.size("--interface-label-tracking", t.size("--tracking-uppercase", 0.16 * size, size), size),
  };
  const rule = <View style={{ flex: 1, height: 1, backgroundColor: line }} />;
  return (
    <View {...a11y} {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-3", 12), marginVertical: margin }, style]}>
      {rule}{renderText(label, text, { numberOfLines: 1 })}{rule}
    </View>
  );
}
