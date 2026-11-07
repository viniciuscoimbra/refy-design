import { Children, Fragment } from "react";
import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { DangerZoneCoreProps, DangerZoneRowCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Button } from "./Button";

export interface DangerZoneProps extends DangerZoneCoreProps, Omit<ViewProps, "children"> {}
export interface DangerZoneRowProps extends DangerZoneRowCoreProps, Omit<ViewProps, "children"> {}

/** Seção de ações destrutivas: borda tracejada em tom crítico. Cada linha só pede confirmação ao app. */
export function DangerZone({ title, children, style, ...rest }: DangerZoneProps) {
  const t = useRefy();
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const rows = Children.toArray(children);
  return (
    <View role="group" {...rest} style={[{
      backgroundColor: t.pick<string>("--legacy-surface-hover", "--surface-2"),
      borderWidth: t.pick<number>("--surface-border-width", 1), borderStyle: "dashed",
      borderColor: t.mix(t.pick<string>("--critical"), 35, t.pick<string>("--legacy-line", "--line")),
      borderRadius: t.pick<number>("--radius-lg-token", 8),
      paddingVertical: t.pick<number>("--space-4", 16), paddingHorizontal: t.pick<number>("--space-5", 20),
    }, style]}>
      {title != null && (
        <View accessibilityRole="header" style={{ marginBottom: t.pick<number>("--space-3", 12) }}>
          {renderText(title, { color: t.pick<string>("--critical"), fontSize: eyebrow, letterSpacing: 0.14 * eyebrow, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") })}
        </View>
      )}
      {rows.map((row, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={{ borderTopWidth: 1, borderStyle: "dashed", borderColor: t.pick<string>("--legacy-line", "--line") }} />}
          <View style={{ paddingTop: i === 0 ? 0 : t.pick<number>("--space-3", 12), paddingBottom: i === rows.length - 1 ? 0 : t.pick<number>("--space-3", 12) }}>{row}</View>
        </Fragment>
      ))}
    </View>
  );
}

/** Linha de ação destrutiva: o que acontece, a consequência e o botão de perigo. */
export function DangerZoneRow({ title, description, actionLabel, onConfirm, disabled = false, style, ...rest }: DangerZoneRowProps) {
  const t = useRefy();
  return (
    <View {...rest} style={[{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-4", 16) }, style]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ marginBottom: 2 }}>{renderText(title, { color: t.pick<string>("--ink-1"), fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", "--weight-semi") })}</View>
        {description != null && renderText(description, { color: t.pick<string>("--ink-3"), fontSize: t.pick<number>("--text-xs", 12), ...t.font("--font-body", "--weight-regular") })}
      </View>
      <Button variant="danger" size="sm" disabled={disabled} onPress={onConfirm}>{actionLabel}</Button>
    </View>
  );
}
