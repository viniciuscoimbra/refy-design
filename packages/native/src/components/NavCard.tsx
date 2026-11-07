import { forwardRef } from "react";
import { Pressable, View } from "react-native";
import type { PressableProps, View as ViewType } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { NavCardCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { lineHeight, renderText } from "../primitives";

export interface NavCardProps extends NavCardCoreProps, Omit<PressableProps, "children" | "style" | "disabled"> {
  style?: PressableProps["style"];
}

/** Cartão que leva a outra tela: título, descrição, meta à direita e a seta. */
export const NavCard = forwardRef<ViewType, NavCardProps>(function NavCard(
  { title, description, meta, leading, disabled = false, current = false, variant = "solid", showChevron = true, style, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const primary = t.pick<string>("--primary");
  const surface = t.pick<string>("--surface");
  const base = t.pick<number>("--text-base", 14);
  const xs = t.pick<number>("--text-xs", 12);
  const snug = t.pick<number>("--leading-snug", 1.35);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof title === "string" ? title : undefined)}
      accessibilityHint={typeof description === "string" ? description : undefined}
      accessibilityState={{ disabled, selected: current }}
      disabled={disabled}
      {...rest}
      style={(state) => {
        const pressed = state.pressed && !disabled;
        return [
          {
            flexDirection: "row" as const, alignItems: "center" as const, gap: t.pick<number>("--space-4", 16), width: "100%" as const, minHeight: 44,
            padding: t.pick<number>("--space-4", 16), borderRadius: t.pick<number>("--radius-lg-token", 8),
            borderWidth: t.pick<number>("--surface-border-width", 1), borderStyle: variant === "dashed" && !pressed ? ("dashed" as const) : ("solid" as const),
            borderColor: disabled ? t.pick<string>("--line-soft") : current || pressed ? primary : t.pick<string>("--border"),
            backgroundColor: current ? t.pick<string>("--primary-soft") : pressed && variant === "dashed" ? t.mix(primary, 4, surface) : surface,
            boxShadow: pressed ? `0 4px 14px ${t.mix(primary, 8, "transparent")}` : undefined,
          },
          typeof style === "function" ? style(state) : style,
        ];
      }}
    >
      {(state) => {
        const pressed = state.pressed && !disabled;
        return (
          <>
            {leading != null && <View style={{ alignItems: "center", justifyContent: "center", opacity: disabled ? 0.55 : 1 }}>{leading}</View>}
            <View style={{ flex: 1, minWidth: 0, gap: t.pick<number>("--space-1", 4) }}>
              {renderText(title, { fontSize: base, lineHeight: lineHeight(base, snug), color: disabled ? t.pick<string>("--ink-3") : t.pick<string>("--ink-1"), ...t.font("--font-body", "--weight-semi") })}
              {description != null && renderText(description, { fontSize: xs, lineHeight: lineHeight(xs, snug), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}
            </View>
            {meta != null && <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-2", 8) }}>{renderText(meta, { fontSize: t.pick<number>("--text-2xs", 11), color: t.pick<string>("--ink-3"), ...t.font("--font-body", "--weight-regular") })}</View>}
            {showChevron && (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={pressed ? t.pick<string>("--primary-ink") : t.pick<string>("--ink-4")} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="m9 18 6-6-6-6" /></Svg>
            )}
          </>
        );
      }}
    </Pressable>
  );
});
