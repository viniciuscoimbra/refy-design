import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { SettingsSubnavCoreProps, SettingsSubnavGroup, SettingsSubnavItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { IconSlot } from "../icon";

export type { SettingsSubnavGroup, SettingsSubnavItem };
export interface SettingsSubnavProps extends SettingsSubnavCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Menu secundário das subpáginas de um mesmo assunto (Configurações → Conta, Geral, Time).
 * O item de `activeHref` fica marcado; o toque chama `onNavigate`, e o app navega.
 * Na web cada item é um link real (`renderLink`); no nativo não há href a seguir.
 */
export function SettingsSubnav({ items, groups, activeHref, label = "Configurações", onNavigate, style }: SettingsSubnavProps) {
  const t = useRefy();
  const resolved: SettingsSubnavGroup[] = groups ?? (items ? [{ items }] : []);
  const ink1 = t.pick<string>("--ink-1");
  const ink2 = t.pick<string>("--ink-2");
  const ink3 = t.pick<string>("--ink-3");
  const line = t.pick<string>("--line");
  const sm = t.pick<number>("--text-sm", 13);
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const iconSize = t.pick<number>("--subnav-icon-size", 16);
  const indicator = t.pick<number>("--subnav-indicator-width", 0);
  const activeWeight = Number(t.pick<number>("--subnav-active-weight", "--weight-semi", 600));
  const activeShadow = t.pick<string>("--subnav-active-shadow", "") || `inset 0 0 0 1px ${line}, 0 1px 2px ${t.mix(ink1, 3, "transparent")}`;

  return (
    <View role="navigation" accessibilityLabel={label} style={[{ minWidth: 0 }, style]}>
      {resolved.map((group, gi) => (
        <View key={group.title ?? gi} style={{ marginTop: gi === 0 ? 0 : t.pick<number>("--subnav-group-gap", "--space-2", 8) }}>
          {group.title != null && (
            <Text accessibilityRole="header" style={{
              paddingTop: gi === 0 ? t.size("--space-1", 4) : t.size("--space-4", 16), paddingBottom: t.size("--space-2", 8), paddingHorizontal: t.size("--space-3", 12),
              color: ink3, fontSize: eyebrow, letterSpacing: eyebrow * 0.14,
              textTransform: t.pick<string>("--subnav-heading-transform", "--interface-label-transform", "uppercase") as "uppercase",
              ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium"),
            }}>{group.title}</Text>
          )}
          <View style={{ gap: t.pick<number>("--subnav-item-gap", 2) }}>
            {group.items.map((item) => {
              const active = item.href === activeHref;
              return (
                <Pressable
                  key={item.href}
                  role="link"
                  accessibilityLabel={item.description ? `${item.label}, ${item.description}` : item.label}
                  accessibilityState={{ selected: active }}
                  onPress={() => onNavigate?.(item)}
                  style={({ pressed }) => ({
                    minHeight: 44, flexDirection: "row", alignItems: t.pick<string>("--subnav-item-align", "flex-start") as "flex-start",
                    gap: t.pick<number>("--subnav-icon-gap", "--space-2", 8),
                    paddingVertical: t.size("--space-2", 8), paddingHorizontal: t.size("--space-3", 12),
                    borderLeftWidth: indicator, borderLeftColor: active ? t.pick<string>("--subnav-indicator-color", "--primary") : "transparent",
                    borderRadius: t.pick<number>("--radius-default", 6),
                    backgroundColor: active ? t.pick<string>("--subnav-active-background", "--surface") : pressed ? t.mix(ink1, 10, "transparent") : "transparent",
                    boxShadow: active ? activeShadow : undefined,
                  })}
                >
                  {item.icon != null && <View style={{ marginTop: 1 }}><IconSlot size={iconSize} color={active ? t.pick<string>("--primary-ink") : ink3}>{item.icon}</IconSlot></View>}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ color: active ? t.pick<string>("--subnav-active-color", "--ink-1") : ink2, fontSize: sm, ...t.font("--font-body", active ? activeWeight : "--weight-regular") }}>{item.label}</Text>
                    {item.description != null && <Text style={{ marginTop: 2, color: active ? ink2 : ink3, fontSize: t.pick<number>("--text-2xs", 11), ...t.font("--font-body", "--weight-regular") }}>{item.description}</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
