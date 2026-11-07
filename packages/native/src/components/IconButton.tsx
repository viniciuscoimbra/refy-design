import { forwardRef } from "react";
import { Pressable } from "react-native";
import type { PressableProps, View as ViewType } from "react-native";
import type { IconButtonCoreProps, IconButtonSize, IconButtonVariant } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { useReducedMotion } from "../hooks";
import { fill, hitSlopFor } from "../primitives";
import { IconSlot } from "../icon";

export type { IconButtonSize, IconButtonVariant };
export interface IconButtonProps extends IconButtonCoreProps, Omit<PressableProps, "children" | "style"> {
  /** Obrigatório: o botão não tem texto visível. É o `aria-label` da web. */
  accessibilityLabel: string;
  style?: PressableProps["style"];
}

// Cadeias de IconButton.module.css; "pressed" soma :hover e :active, como no Button.
function colors(t: RefyContext, variant: IconButtonVariant, pressed: boolean) {
  const p = (...c: (string | number)[]) => t.pick<string>(...c);
  switch (variant) {
    case "ghost":
      return { bg: pressed ? t.mix(p("--ink-1"), 10, "transparent") : "transparent", fg: pressed ? p("--ink-1") : p("--ink-2"), border: "transparent" };
    case "outline":
      return { bg: pressed ? t.mix(p("--ink-1"), 8, p("--surface")) : p("--surface"), fg: pressed ? p("--ink-1") : p("--ink-2"), border: pressed ? p("--ink-4") : p("--border") };
    case "solid":
      return {
        bg: pressed ? p("--button-primary-background-active", "--primary-container") : p("--button-primary-background", "--primary"),
        fg: pressed ? p("--button-primary-foreground-active", "--on-primary-container") : p("--button-primary-foreground", "--on-primary"),
        border: "transparent",
      };
  }
}

/** Botão só-ícone. O nome acessível é obrigatório. */
export const IconButton = forwardRef<ViewType, IconButtonProps>(function IconButton(
  { icon, variant = "ghost", size = "md", disabled, style, ...rest },
  ref,
) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const box = size === "sm" ? t.pick<number>("--icon-button-sm", 28) : size === "lg" ? t.pick<number>("--icon-button-lg", 36) : t.pick<number>("--icon-button-md", 32);
  const glyph = size === "sm" ? t.pick<number>("--control-icon-size-sm", 14) : size === "lg" ? 19 : 16;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={hitSlopFor(box, box)}
      {...rest}
      style={(state) => {
        const pressed = !disabled && state.pressed;
        const c = colors(t, variant, pressed);
        return [
          {
            width: box, height: box, alignItems: "center" as const, justifyContent: "center" as const,
            borderWidth: t.pick<number>("--control-border-width", 1), borderColor: c.border, ...fill(c.bg),
            borderRadius: t.pick<number>("--control-radius", "--radius-default"),
            opacity: disabled ? t.pick<number>("--control-disabled-opacity", 0.5) : 1,
            transform: pressed && !reduced && variant !== "ghost" ? [{ scale: t.pick<number>("--motion-pressed-scale", 0.97) }] : undefined,
          },
          typeof style === "function" ? style(state) : style,
        ];
      }}
    >
      {(state) => <IconSlot size={glyph} color={colors(t, variant, !disabled && state.pressed).fg}>{icon}</IconSlot>}
    </Pressable>
  );
});
