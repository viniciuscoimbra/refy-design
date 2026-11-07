import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { FabMenuAction, FabMenuCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable, useReducedMotion } from "../hooks";
import { Fab } from "./Fab";
import { Menu } from "./Menu";
import type { MenuEntry } from "./Menu";

export type { FabMenuAction };
export interface FabMenuProps extends FabMenuCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Botão flutuante que abre um Menu acima dele, com o fundo escurecido. O ícone + gira para
 * virar ×. Quem posiciona o botão na tela é o app, como no Fab.
 */
export function FabMenu({ actions, label = "Abrir ações", open, defaultOpen = false, onOpenChange, onSelect, align = "end", style }: FabMenuProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick("--motion-reduced", 0) === 1);
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const turn = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  useEffect(() => {
    const run = Animated.timing(turn, { toValue: isOpen ? 1 : 0, duration: reduced ? 0 : t.pick<number>("--duration-base", 200), easing: Easing.bezier(...t.easing("--ease-emph")), useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [isOpen, reduced, turn, t]);
  const entries: MenuEntry[] = actions.map((action) => ({ type: "item", id: action.id, label: action.label, icon: action.icon, disabled: action.disabled, danger: action.danger, onSelect: action.onSelect }));
  const fg = t.pick<string>("--button-primary-foreground", "--on-primary");
  return (
    <Menu open={isOpen} onOpenChange={setOpen} onSelect={onSelect} entries={entries} align={align} side="top" scrim={t.mix(t.pick<string>("--ink-1"), 24, "transparent")} style={style}>
      <Fab
        label={isOpen ? "Fechar ações" : label}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setOpen(!isOpen)}
        icon={
          <Animated.View style={{ transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "135deg"] }) }] }}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth={2} strokeLinecap="round"><Path d="M12 5v14M5 12h14" /></Svg>
          </Animated.View>
        }
      />
    </Menu>
  );
}
