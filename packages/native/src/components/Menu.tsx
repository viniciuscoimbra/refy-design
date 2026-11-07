import { useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { MenuCoreProps, MenuEntry } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { AnchoredLayer, panelSurface } from "../overlay";
import { IconSlot } from "../icon";
import { renderText } from "../primitives";

export type { MenuEntry };
export interface MenuProps extends MenuCoreProps {
  /** Só no nativo: estilo da caixa que envolve o gatilho. */
  style?: StyleProp<ViewStyle>;
  /** Só no nativo: cor do fundo atrás do menu (o FabMenu escurece a tela). */
  scrim?: string;
}

type Item = Extract<MenuEntry, { id: string }>;

/**
 * Menu de ações ancorado ao gatilho. Controlado por `open`/`onOpenChange`, como na web.
 * Fecha ao escolher, no toque fora, no voltar do Android e no escape do VoiceOver.
 * Atalho de teclado (`shortcut`) não aparece no toque.
 */
export function Menu({ anchorPoint, matchWidth = false, open, onOpenChange, entries, onSelect, children, align = "start", side = "bottom", ariaLabel = "Ações", style, scrim }: MenuProps) {
  const t = useRefy();
  const anchor = useRef<View>(null);
  const close = () => onOpenChange(false);
  const choose = (item: Item) => {
    if (item.disabled) return;
    item.onSelect?.();
    onSelect?.(item.id);
    close();
  };
  const ink1 = t.pick<string>("--ink-1", "--on-surface");
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const critical = t.pick<string>("--critical", "--error");
  const surface = t.pick<string>("--surface", "--surface-container");
  const sm = t.pick<number>("--text-sm", 13);
  const mono = t.font(["--interface-detail-font", "--font-mono"], "--weight-regular");
  return (
    <>
      <View ref={anchor} collapsable={false} style={[{ alignSelf: "flex-start" }, style]}>{children}</View>
      <AnchoredLayer
        open={open}
        onClose={close}
        anchorRef={anchor}
        anchorPoint={anchorPoint}
        side={side}
        align={align === "end" ? "end" : "start"}
        matchWidth={matchWidth}
        label={ariaLabel}
        role="menu"
        scrim={scrim}
        panelStyle={[panelSurface(t), { minWidth: 200, padding: 6 }]}
      >
        <ScrollView style={{ flexGrow: 0 }} bounces={false}>
          {entries.map((entry, i) => {
            if (entry.type === "separator") return <View key={`sep-${i}`} role="separator" style={{ height: 1, marginVertical: 6, backgroundColor: t.pick<string>("--line-soft", "--surface-container-high") }} />;
            if (entry.type === "label") {
              const eyebrow = t.pick<number>("--text-eyebrow", 11);
              return (
                <View key={`label-${i}`} accessibilityRole="header" style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
                  {renderText(entry.label, { color: ink3, fontSize: eyebrow, letterSpacing: eyebrow * 0.14, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...mono })}
                </View>
              );
            }
            const color = entry.danger ? critical : ink1;
            return (
              <Pressable
                key={entry.id}
                role="menuitem"
                accessibilityState={{ disabled: Boolean(entry.disabled) }}
                accessibilityLabel={typeof entry.label === "string" ? entry.label : undefined}
                disabled={entry.disabled}
                onPress={() => choose(entry)}
                style={({ pressed }) => ({
                  minHeight: 44,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: t.size("--space-2", 8),
                  paddingHorizontal: 10,
                  borderRadius: t.pick<number>("--radius-sm", 4),
                  opacity: entry.disabled ? 0.45 : 1,
                  backgroundColor: pressed && !entry.disabled ? t.mix(ink1, 8, surface) : "transparent",
                })}
              >
                {entry.icon != null && <IconSlot size={14} color={color}>{entry.icon}</IconSlot>}
                <View style={{ flex: 1, minWidth: 0 }}>{renderText(entry.label, { color, fontSize: sm, ...t.font("--font-body", "--weight-regular") })}</View>
                {entry.meta != null && (typeof entry.meta === "string" || typeof entry.meta === "number"
                  ? <Text style={{ color: ink3, fontSize: 10.5, ...mono }}>{entry.meta}</Text>
                  : entry.meta)}
              </Pressable>
            );
          })}
        </ScrollView>
      </AnchoredLayer>
    </>
  );
}
