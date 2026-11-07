import { cloneElement, isValidElement, useRef } from "react";
import type { ReactElement } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { GestureResponderEvent } from "react-native";
import type { TooltipCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable } from "../hooks";
import { AnchoredLayer } from "../overlay";

export interface TooltipProps extends TooltipCoreProps {}

type TriggerProps = { onLongPress?: (e: GestureResponderEvent) => void; accessibilityHint?: string };

/**
 * Dica curta sobre um controle. Sem ponteiro no toque, abre no toque longo e fecha no toque
 * seguinte. O texto também vai para o `accessibilityHint` do gatilho, que o leitor de tela lê
 * sem precisar abrir a bolha.
 */
export function Tooltip({ label, description, side = "top", open, defaultOpen = false, onOpenChange, children }: TooltipProps) {
  const t = useRefy();
  const anchor = useRef<View>(null);
  const { width } = useWindowDimensions();
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const hint = description ? `${label}. ${description}` : label;
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<TriggerProps>, {
        accessibilityHint: hint,
        onLongPress: (e: GestureResponderEvent) => {
          (children as ReactElement<TriggerProps>).props.onLongPress?.(e);
          setOpen(true);
        },
      })
    : children;
  const ink = t.pick<string>("--ink-1");
  const surface = t.pick<string>("--surface");
  const xs = t.pick<number>("--text-2xs", 11);
  return (
    <>
      <View ref={anchor} collapsable={false} style={{ alignSelf: "flex-start" }}>{trigger}</View>
      <AnchoredLayer
        open={isOpen}
        onClose={() => setOpen(false)}
        anchorRef={anchor}
        side={side}
        align="center"
        gap={10}
        panelStyle={{
          maxWidth: Math.min(280, width - 16),
          paddingVertical: 7,
          paddingHorizontal: 10,
          borderRadius: t.pick<number>("--radius-md", 8),
          backgroundColor: ink,
          boxShadow: t.pick<string>("--elev-3", "") || undefined,
        }}
      >
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={{ color: surface, fontSize: xs, lineHeight: Math.round(xs * 1.4), letterSpacing: xs * 0.02, ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") }}>{label}</Text>
          {description ? <Text style={{ maxWidth: 230, color: t.mix(surface, 72, "transparent"), fontSize: xs, lineHeight: Math.round(xs * 1.4), ...t.font("--font-body", "--weight-regular") }}>{description}</Text> : null}
        </View>
      </AnchoredLayer>
    </>
  );
}
