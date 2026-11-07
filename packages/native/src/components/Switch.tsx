import { forwardRef, useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import type { PressableProps, View as ViewType } from "react-native";
import type { SwitchCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable, useReducedMotion } from "../hooks";
import { hitSlopFor, renderText } from "../primitives";
import { IconSlot } from "../icon";

export interface SwitchProps extends SwitchCoreProps, Omit<PressableProps, "children" | "style" | "disabled"> {
  /** Chamado com o novo estado. Na web o equivalente é o `onChange` do input. */
  onCheckedChange?: (checked: boolean) => void;
  style?: PressableProps["style"];
}

/** Liga e desliga com papel de switch; ligado usa a cor primária do tema. */
export const Switch = forwardRef<ViewType, SwitchProps>(function Switch(
  { label, icon, appearance = "plain", checked, defaultChecked = false, disabled, onCheckedChange, onPress, style, accessibilityLabel, ...rest },
  ref,
) {
  const t = useRefy();
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const width = t.pick<number>("--switch-width", 36);
  const height = t.pick<number>("--switch-height", 20);
  const thumb = t.pick<number>("--switch-thumb-size", 16);
  const travel = t.pick<number>("--switch-travel", 16);
  const x = useRef(new Animated.Value(on ? 1 : 0)).current;
  useEffect(() => {
    const anim = Animated.timing(x, { toValue: on ? 1 : 0, duration: reduced ? 0 : t.pick<number>("--motion-feedback-duration", 120), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [on, reduced, t, x]);
  const control = appearance === "control";
  const rowHeight = control ? t.pick<number>("--switch-control-height", "--button-height-sm", 28) : height;
  const name = accessibilityLabel ?? (typeof label === "string" ? label : undefined);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="switch"
      accessibilityLabel={name}
      accessibilityState={{ checked: on, disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={hitSlopFor(rowHeight, label || icon || control ? undefined : width)}
      onPress={(event) => { onPress?.(event); setOn(!on); }}
      {...rest}
      style={(state) => [
        {
          flexDirection: "row" as const, alignItems: "center" as const, alignSelf: "flex-start" as const, gap: t.pick<number>("--space-2", 8),
          minHeight: rowHeight, opacity: disabled ? 0.5 : 1,
          ...(label || icon || control ? {} : { width }),
          ...(control ? {
            paddingHorizontal: t.pick<number>("--switch-control-padding", "--space-2", 8), borderRadius: t.pick<number>("--radius-default", 6),
            borderWidth: t.pick<number>("--control-border-width", 1), borderColor: state.pressed ? t.pick<string>("--control-hover-border", "--line-strong") : t.pick<string>("--line"),
            backgroundColor: state.pressed ? t.pick<string>("--surface-2") : t.pick<string>("--surface"),
          } : {}),
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {(state) => {
        const ink = t.pick<string>("--ink-1");
        const trackOff = t.pick<string>("--legacy-line");
        const trackOn = t.pick<string>("--primary");
        const pressed = !disabled && state.pressed;
        const track = on ? (pressed ? t.mix(ink, 10, trackOn) : trackOn) : pressed ? t.mix(ink, 12, trackOff) : trackOff;
        const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, travel] });
        return (
          <>
            {icon && <IconSlot size={t.pick<number>("--switch-control-icon-size", 14)} color={ink}>{icon}</IconSlot>}
            {label != null && renderText(label, {
              color: ink, ...(control
                ? { fontSize: t.pick<number>("--control-font-size-sm", "--text-xs", 12), ...t.font("--font-body", t.pick<number>("--control-font-weight", "--weight-medium", 500)) }
                : { fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", "--weight-medium") }),
            })}
            <View style={{ width, height, borderRadius: t.pick<number>("--radius-pill", 999), backgroundColor: track }}>
              <Animated.View style={{
                position: "absolute", top: 2, left: 2, width: thumb, height: thumb, borderRadius: t.pick<number>("--radius-pill", 999),
                backgroundColor: on ? t.pick<string>("--switch-thumb-color", "--on-primary") : t.pick<string>("--switch-thumb-off-color", "--switch-thumb-color", "--legacy-white"),
                boxShadow: t.pick<string>("--legacy-switch-shadow", "none"),
                transform: [{ translateX }, { scale: pressed ? 0.9 : 1 }],
              }} />
            </View>
          </>
        );
      }}
    </Pressable>
  );
});
