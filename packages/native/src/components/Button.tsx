import { forwardRef, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, Text, View } from "react-native";
import type { PressableProps, StyleProp, TextStyle, View as ViewType } from "react-native";
import type { ButtonCoreProps, ButtonProgressEffect, ButtonSize, ButtonStatus, ButtonVariant } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { useReducedMotion } from "../hooks";
import { fill, hitSlopFor } from "../primitives";

export type { ButtonProgressEffect, ButtonSize, ButtonStatus, ButtonVariant };
export interface ButtonProps extends ButtonCoreProps, Omit<PressableProps, "children" | "style"> {
  children?: ReactNode;
  style?: PressableProps["style"];
  /** Só no nativo: estilo do rótulo, para composições como o botão do Google. */
  labelStyle?: StyleProp<TextStyle>;
}

type State = "rest" | "pressed";
// Cadeias de Button.module.css. No toque não há hover: "pressed" soma :hover e :active,
// que é o que o desktop mostra durante o clique.
function colors(t: RefyContext, variant: ButtonVariant, state: State) {
  const p = (...c: (string | number)[]) => t.pick<string>(...c);
  const pressed = state === "pressed";
  switch (variant) {
    case "primary":
      return {
        bg: pressed ? p("--button-primary-background-active", "--primary-container") : p("--button-primary-background", "--primary"),
        fg: pressed ? p("--button-primary-foreground-active", "--on-primary-container") : p("--button-primary-foreground", "--on-primary"),
        border: p("--button-primary-border", "transparent"),
      };
    case "secondary":
      return {
        bg: pressed ? p("--button-secondary-background-active", t.mix(p("--ink-1"), 8, p("--surface"))) : p("--button-secondary-background", "--surface"),
        fg: p("--button-secondary-foreground", "--ink-1"),
        border: pressed ? p("--button-secondary-border-hover", "--legacy-line-strong") : p("--button-secondary-border", "--legacy-line"),
      };
    case "ghost":
      return {
        bg: pressed ? p("--button-ghost-background-active", t.mix(p("--ink-1"), 10, "transparent")) : p("--button-ghost-background", "transparent"),
        fg: pressed ? p("--button-ghost-foreground-hover", "--ink-1") : p("--button-ghost-foreground", "--ink-2"),
        border: "transparent",
      };
    case "danger":
      return {
        bg: pressed ? p("--button-danger-background-active", t.mix(p("--critical"), 16, p("--surface"))) : p("--button-danger-background", "--surface"),
        fg: p("--button-danger-foreground", "--critical"),
        border: pressed ? p("--button-danger-border-hover", "--legacy-danger-line-hover") : p("--button-danger-border", "--legacy-danger-line"),
      };
  }
}

function Progress({ effect, color, reduced }: { effect: ButtonProgressEffect; color: string; reduced: boolean }) {
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  useEffect(() => {
    if (reduced) return progress.setValue(1);
    const run = Animated.timing(progress, { toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [progress, reduced]);
  const vertical = effect === "fill-vertical";
  const fill = effect === "fill-horizontal" || vertical;
  // transformOrigin no RN 0.73+; espelha transform-origin left/bottom do CSS.
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { position: "absolute", left: 0, right: 0, backgroundColor: color },
        fill ? { top: 0, bottom: 0, opacity: 0.22 } : { top: 0, height: 3 },
        { transformOrigin: vertical ? "bottom" : "left", transform: [vertical ? { scaleY: progress } : { scaleX: progress }] },
      ]}
    />
  );
}

/** Botão base do Refy. Mesmo contrato do web; `onPress` no lugar de `onClick`. */
export const Button = forwardRef<ViewType, ButtonProps>(function Button(
  { variant = "secondary", interactionState, size = "md", leadingIcon, trailingIcon, loading = false, status = "idle", progressEffect = "spinner", loadingLabel, block = false, disabled, children, style, labelStyle, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const current: ButtonStatus = loading ? "loading" : status;
  const isLoading = current === "loading";
  const feedback = current === "success" || current === "error";
  const height = size === "md" ? t.pick<number>("--button-height-md", 34) : t.pick<number>("--button-height-sm", 28);
  const paddingHorizontal = size === "md" ? t.pick<number>("--button-padding-md", 14) : t.pick<number>("--button-padding-sm", 10);
  const fontSize = size === "md" ? t.pick<number>("--control-font-size", "--text-sm") : t.pick<number>("--control-font-size-sm", "--text-xs");
  const effect: ButtonProgressEffect = ["spinner", "fill-horizontal", "fill-vertical"].includes(progressEffect) ? progressEffect : "top-line";
  const inactive = Boolean(disabled) || isLoading;
  const label = isLoading ? (loadingLabel ?? children) : children;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof label === "string" ? label : undefined)}
      accessibilityState={{ disabled: inactive, busy: isLoading }}
      disabled={inactive}
      hitSlop={hitSlopFor(height)}
      {...rest}
      style={(state) => {
        const pressed = !inactive && (state.pressed || interactionState === "pressed");
        const c = colors(t, variant, pressed ? "pressed" : "rest");
        const fb = current === "success" ? { bg: t.pick<string>("--good"), fg: t.pick<string>("--on-good") } : current === "error" ? { bg: t.pick<string>("--critical"), fg: t.pick<string>("--on-critical") } : null;
        const shadow = variant === "ghost" ? undefined : t.pick<string>(...(variant === "primary" ? ["--button-primary-shadow", "--legacy-button-shadow"] : ["--control-shadow"]), "none");
        return [
          {
            height, paddingHorizontal, borderRadius: t.pick<number>("--button-radius", "--radius-default"), borderWidth: t.pick<number>("--button-border-width", 1),
            borderColor: c.border, ...fill(fb?.bg ?? c.bg), overflow: "hidden" as const,
            flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: t.pick<number>("--space-2"),
            alignSelf: block ? ("stretch" as const) : ("flex-start" as const),
            opacity: disabled ? t.pick<number>("--control-disabled-opacity", 0.55) : 1,
            boxShadow: shadow && shadow !== "none" ? shadow : undefined,
            transform: pressed && !reduced ? [{ scale: t.pick<number>("--motion-pressed-scale", 0.97) }] : undefined,
          },
          typeof style === "function" ? style(state) : style,
        ];
      }}
    >
      {(state) => {
        const pressed = !inactive && (state.pressed || interactionState === "pressed");
        const c = colors(t, variant, pressed ? "pressed" : "rest");
        const fg = current === "success" ? t.pick<string>("--on-good") : current === "error" ? t.pick<string>("--on-critical") : c.fg;
        const text = { color: fg, fontSize, ...t.font("--font-body", t.pick<number>("--control-font-weight", "--weight-semi")) };
        return (
          <>
            {isLoading && effect !== "spinner" && <Progress effect={effect} color={fg} reduced={reduced} />}
            {isLoading && effect === "spinner" && <ActivityIndicator size="small" color={fg} style={{ transform: [{ scale: 0.7 }], opacity: 0.85 }} />}
            {!isLoading && !feedback && leadingIcon ? <View>{leadingIcon}</View> : null}
            {feedback && <Text accessibilityElementsHidden importantForAccessibility="no" style={{ color: fg, fontSize: 16, lineHeight: 16 }}>{current === "success" ? "✓" : "×"}</Text>}
            {label != null && label !== false && (typeof label === "string" || typeof label === "number" ? <Text numberOfLines={1} style={[text, labelStyle]}>{label}</Text> : label)}
            {!isLoading && !feedback && trailingIcon ? <View>{trailingIcon}</View> : null}
          </>
        );
      }}
    </Pressable>
  );
});
