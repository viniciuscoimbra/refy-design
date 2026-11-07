import { useState } from "react";
import { Pressable } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { ContextMenuCoreProps } from "@refy-design/web/contracts";
import { Menu } from "./Menu";

export interface ContextMenuProps extends ContextMenuCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Menu de contexto. Na web abre no botão direito; no toque abre no toque longo, no ponto
 * do dedo. Leitor de tela: a ação "Abrir menu" ancora o menu na própria área.
 */
export function ContextMenu({ children, entries, label = "Menu de contexto", onSelect, style }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<{ x: number; y: number } | undefined>();
  return (
    <Menu open={open} onOpenChange={setOpen} entries={entries} onSelect={onSelect} ariaLabel={label} anchorPoint={point} style={{ alignSelf: "stretch" }}>
      <Pressable
        role="region"
        accessibilityLabel={label}
        accessibilityHint="Toque longo abre o menu"
        accessibilityState={{ expanded: open }}
        accessibilityActions={[{ name: "longpress", label: "Abrir menu" }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName !== "longpress") return;
          setPoint(undefined);
          setOpen(true);
        }}
        onLongPress={(e) => {
          setPoint({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
          setOpen(true);
        }}
        style={[{ minHeight: 44 }, style]}
      >
        {children}
      </Pressable>
    </Menu>
  );
}
