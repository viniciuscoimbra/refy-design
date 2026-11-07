import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";
import type { MenuEntry, UserMenuCoreProps, UserMenuUser } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useIconStyle } from "../icon";
import { hitSlopFor } from "../primitives";
import { Avatar } from "./Avatar";
import { Menu } from "./Menu";

export type { UserMenuUser };
export interface UserMenuProps extends UserMenuCoreProps {
  style?: StyleProp<ViewStyle>;
}

function Glyph({ children, strokeWidth = 2 }: { children: React.ReactNode; strokeWidth?: number }) {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{children}</Svg>;
}

const DEFAULT_ENTRIES: MenuEntry[] = [
  { id: "profile", label: "Perfil", icon: <Glyph><Circle cx={12} cy={7} r={4} /><Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /></Glyph> },
  { id: "settings", label: "Configurações", icon: <Glyph><Circle cx={12} cy={12} r={3} /><Path d="M12 1v4m0 14v4M4.2 4.2l2.8 2.8m10 10 2.8 2.8M1 12h4m14 0h4M4.2 19.8 7 17m10-10 2.8-2.8" /></Glyph> },
  { type: "separator" },
  { id: "logout", label: "Sair", danger: true, icon: <Glyph><Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><Polyline points="16 17 21 12 16 7" /><Line x1={21} y1={12} x2={9} y2={12} /></Glyph> },
];

/**
 * Bloco do usuário que abre o menu da conta. Avatar mais nome e e-mail (barra lateral) ou só o
 * avatar (`compact`, barra do topo). Itens padrão Perfil, Configurações e Sair, como na web.
 */
export function UserMenu({ user, entries = DEFAULT_ENTRIES, onSelect, compact, side = "bottom", align, style }: UserMenuProps) {
  const t = useRefy();
  const [open, setOpen] = useState(false);
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const surface2 = t.pick<string>("--surface-2", "--surface-container-low");
  const box = compact ? 32 + 4 : 32 + 2 * t.size("--space-2", 8);
  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      entries={entries}
      onSelect={onSelect}
      align={align ?? (compact ? "end" : "start")}
      side={side}
      matchWidth={!compact}
      style={[compact ? null : { alignSelf: "stretch" }, style]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Conta de ${user.name}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        hitSlop={hitSlopFor(box, compact ? box : undefined)}
        style={({ pressed }) => ({
          minHeight: box, flexDirection: "row", alignItems: "center", gap: 10,
          padding: compact ? 2 : t.size("--space-2", 8),
          borderRadius: compact ? t.pick<number>("--radius-pill", 999) : t.pick<number>("--radius-md", 8),
          backgroundColor: pressed || open ? surface2 : "transparent",
          alignSelf: compact ? "flex-start" : "stretch",
        })}
      >
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Avatar size="md" initials={user.initials} src={user.src} seed={user.seed} accessible={false} />
        </View>
        {!compact && (
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ color: t.pick<string>("--ink-1", "--on-surface"), fontSize: t.pick<number>("--text-sm", 13), ...t.font("--font-body", "--weight-semi") }}>{user.name}</Text>
            {user.email ? <Text numberOfLines={1} style={{ color: ink3, fontSize: t.pick<number>("--text-2xs", 11), ...t.font("--font-body", "--weight-regular") }}>{user.email}</Text> : null}
          </View>
        )}
        {!compact && <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Polyline points="6 9 12 15 18 9" /></Svg>}
      </Pressable>
    </Menu>
  );
}
