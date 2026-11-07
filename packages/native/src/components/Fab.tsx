import { forwardRef } from "react";
import { Pressable, Text } from "react-native";
import type { PressableProps, View as ViewType } from "react-native";
import type { FabCoreProps, FabSize, FabVariant } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useReducedMotion } from "../hooks";
import { IconSlot } from "../icon";
import { fill } from "../primitives";

export type { FabSize, FabVariant };
export interface FabProps extends FabCoreProps, Omit<PressableProps, "children" | "style"> {
  style?: PressableProps["style"];
}

/** Botão de ação flutuante. Redondo; com `extended` e `label`, pílula com texto. Quem posiciona é o app. */
export const Fab = forwardRef<ViewType, FabProps>(function Fab(
  { icon, label, extended = false, size = "lg", variant = "primary", disabled, style, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const isExtended = extended && !!label;
  const box = size === "md" ? 44 : 56;
  const glyph = size === "md" ? 18 : 22;
  const p = (...c: (string | number)[]) => t.pick<string>(...c);
  const tone = (pressed: boolean) => variant === "surface"
    ? { bg: p("--fab-surface", "--surface"), fg: p("--ink-1") }
    : pressed
      ? { bg: p("--button-primary-background-active", "--primary-container"), fg: p("--button-primary-foreground-active", "--on-primary-container") }
      : { bg: p("--button-primary-background", "--primary"), fg: p("--button-primary-foreground", "--on-primary") };
  const shadow = p("--fab-shadow", "--elev-3", "none");
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (!isExtended ? label : undefined)}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      {...rest}
      style={(state) => {
        const c = tone(state.pressed);
        return [
          {
            height: box, minWidth: box, paddingHorizontal: isExtended ? 22 : 0,
            flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 10,
            borderRadius: isExtended ? t.pick<number>("--fab-extended-radius", "--radius-pill") : t.pick<number>("--fab-radius", "--radius-lg", 14),
            ...fill(c.bg),
            boxShadow: [shadow !== "none" ? shadow : "", variant === "surface" ? `inset 0 0 0 1px ${p("--line")}` : ""].filter(Boolean).join(", ") || undefined,
            transform: state.pressed && !reduced ? [{ scale: 0.96 }] : undefined,
          },
          typeof style === "function" ? style(state) : style,
        ];
      }}
    >
      {(state) => {
        const c = tone(state.pressed);
        return (
          <>
            <IconSlot size={glyph} color={c.fg}>{icon}</IconSlot>
            {isExtended && <Text numberOfLines={1} style={{ color: c.fg, fontSize: t.pick<number>("--text-base", 14), ...t.font("--font-body", 600) }}>{label}</Text>}
          </>
        );
      }}
    </Pressable>
  );
});
