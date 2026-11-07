import { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import type { SplitButtonCoreProps, SplitButtonOption, SplitButtonVariant } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable, useReducedMotion } from "../hooks";
import { hitSlopFor } from "../primitives";
import { Button } from "./Button";
import { Menu } from "./Menu";
import type { MenuEntry } from "./Menu";

export type { SplitButtonOption, SplitButtonVariant };
export interface SplitButtonProps extends SplitButtonCoreProps {
  style?: StyleProp<ViewStyle>;
}

const optionId = (option: SplitButtonOption, index: number) => option.id ?? `${index}-${option.label}`;

/** Botão com menu de variações: a opção escolhida vira a ação do botão principal. Button + Menu, como na web. */
export function SplitButton({ label, variant = "secondary", menuAlign = "end", leadingIcon, onClick, onSelect, options, size = "md", disabled = false, loading = false, loadingLabel = "Processando…", open, defaultOpen = false, onOpenChange, defaultOptionId, style }: SplitButtonProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const firstEnabled = options.findIndex((option) => !option.disabled);
  const [selectedId, setSelectedId] = useState(defaultOptionId ?? (firstEnabled >= 0 ? optionId(options[firstEnabled], firstEnabled) : undefined));
  const selected = options.find((option, index) => optionId(option, index) === selectedId || option.label === selectedId);
  const entries: MenuEntry[] = options.map((option, index) => ({ id: optionId(option, index), label: option.label, meta: option.hint, disabled: option.disabled, danger: option.danger, onSelect: option.onSelect }));
  const turn = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(turn, { toValue: isOpen ? 1 : 0, duration: reduced ? 0 : t.pick<number>("--duration-fast", 150), easing: Easing.bezier(...t.easing("--ease-emph")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [isOpen, reduced, turn, t]);
  const height = size === "md" ? t.pick<number>("--button-height-md", 34) : t.pick<number>("--button-height-sm", 28);
  const caretWidth = t.pick<number>("--split-control-size", 34);
  const fg = variant === "primary" ? t.pick<string>("--button-primary-foreground", "--on-primary") : t.pick<string>("--button-secondary-foreground", "--ink-1");
  return (
    <Menu
      open={isOpen}
      onOpenChange={setOpen}
      onSelect={(id) => { setSelectedId(id); onSelect?.(id); }}
      entries={entries}
      align={menuAlign}
      style={style}
    >
      <View style={{ flexDirection: "row", borderRadius: t.pick<number>("--button-radius", "--radius-default") }}>
        <Button
          variant={variant}
          size={size}
          leadingIcon={leadingIcon}
          loading={loading}
          loadingLabel={loadingLabel}
          disabled={disabled}
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          onPress={() => { selected?.onSelect?.(); onClick?.(); }}
        >
          {selected ? `${label} ${selected.label}` : label}
        </Button>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || loading}
          accessibilityLabel="Mais opções"
          accessibilityState={{ disabled: disabled || loading, expanded: isOpen }}
          hitSlop={hitSlopFor(height, caretWidth)}
          style={{ width: caretWidth, paddingHorizontal: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, marginLeft: -t.pick<number>("--button-border-width", 1) }}
          onPress={() => setOpen(!isOpen)}
        >
          <Animated.View style={{ transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }] }}>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Polyline points="6 9 12 15 18 9" /></Svg>
          </Animated.View>
        </Button>
      </View>
    </Menu>
  );
}
