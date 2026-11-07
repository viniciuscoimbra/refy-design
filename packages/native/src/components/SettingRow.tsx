import { Children, Fragment, useId } from "react";
import type { ReactNode } from "react";
import { Pressable, Switch, View } from "react-native";
import type { PressableProps, SwitchProps, ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { SettingRowCoreProps, SettingRowGroupCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { MIN_TOUCH, baseText, renderText } from "../primitives";

export interface SettingRowProps extends SettingRowCoreProps, Omit<ViewProps, "children"> {
  /** Linha clicável; no web é onClick/href. */
  onPress?: PressableProps["onPress"];
  /** Switch nativo no lugar das ações, como `switchProps` na web. */
  switchProps?: Omit<SwitchProps, "accessibilityLabel">;
}
export interface SettingRowGroupProps extends SettingRowGroupCoreProps, Omit<ViewProps, "children"> {}

/** Linha de lista e configuração: leading, título, descrição, meta e ações, chevron ou switch. */
export function SettingRow({ title, description, meta, leading, leadingFrame = false, actions, disabled = false, showChevron = true, onPress, switchProps, style, ...rest }: SettingRowProps) {
  const t = useRefy();
  const titleId = useId();
  const clickable = !switchProps && onPress != null;
  const space2 = t.pick<number>("--space-2");
  const body = (pressed: boolean) => (
    <>
      {leading != null && (
        <View style={[{ alignItems: "center", justifyContent: "center", flexShrink: 0 }, leadingFrame && { width: 36, height: 36, borderRadius: t.pick<number>("--radius-md"), backgroundColor: t.pick<string>("--legacy-surface-hover"), borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--legacy-line-faint") }]}>{leading}</View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View nativeID={titleId} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: space2 }}>
          {renderText(title, baseText(t, { size: t.pick<number>("--text-sm"), color: "--ink-1", weight: "--weight-semi", leading: "--leading-snug" }))}
        </View>
        {description != null && <View style={{ marginTop: 2 }}>{renderText(description, baseText(t, { size: t.pick<number>("--text-xs"), color: "--ink-3", leading: "--leading-snug" }))}</View>}
        {meta != null && <View style={{ marginTop: 2 }}>{renderText(meta, baseText(t, { size: t.pick<number>("--text-2xs"), color: "--ink-3", family: ["--interface-detail-font", "--font-mono"] }))}</View>}
      </View>
      {actions != null && <View style={{ flexDirection: "row", alignItems: "center", gap: space2, flexShrink: 0 }}>{actions}</View>}
      {switchProps != null && (
        <Switch
          accessibilityLabel={typeof title === "string" ? title : undefined}
          accessibilityLabelledBy={titleId}
          disabled={disabled || switchProps.disabled}
          trackColor={{ false: t.pick<string>("--legacy-line"), true: t.pick<string>("--primary") }}
          thumbColor={switchProps.value ? t.pick<string>("--switch-thumb-color", "--on-primary") : t.pick<string>("--switch-thumb-off-color", "--switch-thumb-color", "--legacy-white")}
          ios_backgroundColor={t.pick<string>("--legacy-line")}
          {...switchProps}
        />
      )}
      {clickable && showChevron && (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={t.pick<string>(pressed && !disabled ? "--primary-ink" : "--ink-4")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="m9 18 6-6-6-6" />
        </Svg>
      )}
    </>
  );
  const rowStyle = { flexDirection: "row" as const, alignItems: "center" as const, gap: t.pick<number>("--space-4"), paddingVertical: t.pick<number>("--space-3"), minHeight: clickable ? MIN_TOUCH : undefined, opacity: disabled ? 0.55 : 1 };
  if (clickable) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={typeof title === "string" ? [title, typeof description === "string" ? description : null].filter(Boolean).join(", ") : undefined}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        {...rest}
        style={({ pressed }) => [rowStyle, { marginHorizontal: -space2, paddingHorizontal: space2, borderRadius: t.pick<number>("--radius-default"), backgroundColor: pressed ? t.pick<string>("--legacy-surface-muted") : "transparent" }, typeof style === "function" ? undefined : style]}
      >
        {({ pressed }) => body(pressed)}
      </Pressable>
    );
  }
  return <View {...rest} style={[rowStyle, style]}>{body(false)}</View>;
}

/** Lista de SettingRow com divisor entre itens. */
export function SettingRowGroup({ children, "aria-label": label, style, ...rest }: SettingRowGroupProps) {
  const t = useRefy();
  const items = Children.toArray(children as ReactNode);
  return (
    <View accessibilityRole="list" accessibilityLabel={label} {...rest} style={style}>
      {items.map((child, index) => (
        <Fragment key={index}>
          <View style={index > 0 ? { borderTopWidth: 1, borderTopColor: t.pick<string>("--legacy-surface-muted") } : undefined}>{child}</View>
        </Fragment>
      ))}
    </View>
  );
}
