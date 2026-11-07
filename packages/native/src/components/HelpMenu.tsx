import { useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import type { HelpMenuCoreProps, MenuEntry } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useIconStyle } from "../icon";
import { IconButton } from "./IconButton";
import { Menu } from "./Menu";

export interface HelpMenuProps extends HelpMenuCoreProps {
  style?: StyleProp<ViewStyle>;
}

// O atalho de teclado da web (⌘K) não aparece no toque; o item continua.
const DEFAULT_ENTRIES: MenuEntry[] = [
  { id: "docs", label: "Documentação" },
  { id: "shortcuts", label: "Atalhos de teclado", shortcut: "⌘K" },
  { type: "separator" },
  { id: "support", label: "Falar com suporte" },
];

function HelpGlyph() {
  const { size, color } = useIconStyle();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={10} /><Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><Line x1={12} y1={17} x2={12.01} y2={17} />
    </Svg>
  );
}

/** Botão "?" que abre o menu de ajuda, alinhado ao fim, como o sino de notificações. */
export function HelpMenu({ entries = DEFAULT_ENTRIES, onSelect, label = "Ajuda", style }: HelpMenuProps) {
  const t = useRefy();
  const [open, setOpen] = useState(false);
  return (
    <Menu open={open} onOpenChange={setOpen} entries={entries} onSelect={onSelect} align="end" style={style}>
      <IconButton
        size="lg"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={open ? { backgroundColor: t.pick<string>("--surface-2", "--surface-container-low") } : undefined}
        icon={<HelpGlyph />}
      />
    </Menu>
  );
}
