import { forwardRef } from "react";
import { Pressable, Text, View } from "react-native";
import type { PressableProps, View as ViewType } from "react-native";
import Svg, { Path, Polyline } from "react-native-svg";
import type { ChipCoreProps, ChipSelectionMode, ChipTone } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { hitSlopFor, renderText } from "../primitives";
import { IconSlot } from "../icon";

export type { ChipSelectionMode, ChipTone };
export interface ChipProps extends ChipCoreProps, Omit<PressableProps, "children" | "style"> {
  style?: PressableProps["style"];
}

const toneInk: Record<Exclude<ChipTone, "neutral">, [string, string]> = {
  critical: ["--critical-ink", "--critical-soft"],
  warning: ["--weak-ink", "--weak-soft"],
  success: ["--good-ink", "--good-soft"],
  info: ["--info-ink", "--info-soft"],
};

// Cadeias de Chip.module.css. Selecionado inverte o par: fundo na tinta, texto na superfície.
function colors(t: RefyContext, tone: ChipTone, selected: boolean, selection: boolean, pressed: boolean) {
  const p = (...c: (string | number)[]) => t.pick<string>(...c);
  const surface = p("--surface");
  if (selection) return { bg: p("--primary-soft"), fg: p("--ink-1"), border: "transparent" };
  const ink = tone === "neutral" ? p("--chip-ink", "--ink-1") : p(toneInk[tone][0]);
  if (selected) return { bg: ink, fg: surface, border: ink };
  const bg = tone === "neutral" ? p("--chip-surface", "--surface") : p(toneInk[tone][1]);
  const border = tone === "neutral" ? (pressed ? p("--line-strong", "--legacy-line-strong") : p("--chip-border", "--line")) : t.mix(ink, 45, surface);
  return {
    bg: pressed ? t.mix(p("--ink-1"), 6, surface) : bg,
    fg: tone === "neutral" ? (pressed ? p("--chip-ink", "--ink-1") : p("--chip-ink", "--ink-2")) : ink,
    border,
  };
}

/** Chip de filtro: alterna seleção; opcionalmente removível. */
export const Chip = forwardRef<ViewType, ChipProps>(function Chip(
  { variant = "filter", selected = false, count, tone = "neutral", selectionMode = "toggle", showCheck = false, removable = false, onRemove, onPress, leadingIcon, disabled, children, style, accessibilityState, ...rest },
  ref,
) {
  const t = useRefy();
  const selection = variant === "selection";
  const height = selection ? t.pick<number>("--selection-chip-height", 26) : t.pick<number>("--chip-height", 30);
  const fontSize = selection ? t.pick<number>("--text-xs", 12) : t.pick<number>("--text-sm", 13);
  const radio = selectionMode === "radio";
  return (
    <Pressable
      ref={ref}
      accessibilityRole={radio ? "radio" : "togglebutton"}
      accessibilityState={{ ...(radio ? { checked: selected } : { selected }), disabled: Boolean(disabled), ...accessibilityState }}
      accessibilityLabel={typeof children === "string" ? (typeof count === "number" ? `${children}, ${count}` : children) : undefined}
      disabled={disabled}
      hitSlop={hitSlopFor(height)}
      onPress={(event) => { onPress?.(event); if (removable) onRemove?.(); }}
      {...rest}
      style={(state) => {
        const c = colors(t, tone, selected, selection, !disabled && state.pressed);
        return [
          {
            height, flexDirection: "row" as const, alignItems: "center" as const, alignSelf: "flex-start" as const,
            gap: selection ? t.pick<number>("--space-1", 4) : 6, paddingHorizontal: 10, overflow: "hidden" as const,
            borderWidth: t.pick<number>("--control-border-width", 1), borderColor: c.border, backgroundColor: c.bg,
            borderRadius: selection ? t.pick<number>("--selection-chip-radius", "--radius-pill") : t.pick<number>("--chip-radius", "--radius-pill"),
            opacity: disabled ? 0.55 : 1,
          },
          typeof style === "function" ? style(state) : style,
        ];
      }}
    >
      {(state) => {
        const c = colors(t, tone, selected, selection, !disabled && state.pressed);
        return (
          <>
            {showCheck && selected && (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><Polyline points="20 6 9 17 4 12" /></Svg>
            )}
            {leadingIcon && <IconSlot size={14} color={c.fg}>{leadingIcon}</IconSlot>}
            {tone !== "neutral" && !selection && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.fg }} />}
            {renderText(children, { color: c.fg, fontSize, ...t.font("--font-body", "--weight-medium") }, { numberOfLines: 1 })}
            {typeof count === "number" && (
              <Text style={{
                color: selected ? c.fg : t.pick<string>("--ink-3"), backgroundColor: selected ? t.mix(c.fg, 16, "transparent") : t.pick<string>("--surface-2"),
                borderRadius: t.pick<number>("--chip-radius", "--radius-pill"), paddingHorizontal: 6, paddingVertical: 1, overflow: "hidden",
                fontSize: t.pick<number>("--text-2xs", 11), ...t.font(["--interface-detail-font", "--font-mono"], "--weight-semi"),
              }}>{count}</Text>
            )}
            {removable && (
              <View style={{ width: selection ? 18 : 16, height: selection ? 18 : 16, alignItems: "center", justifyContent: "center", opacity: selection ? 0.65 : 1, marginRight: selection ? 0 : -2 }}>
                <Svg width={selection ? 10 : 12} height={selection ? 10 : 12} viewBox="0 0 24 24" fill="none" stroke={c.fg} strokeWidth={2.4} strokeLinecap="round"><Path d="M18 6 6 18M6 6l12 12" /></Svg>
              </View>
            )}
          </>
        );
      }}
    </Pressable>
  );
});
