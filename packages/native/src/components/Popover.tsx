import { cloneElement, isValidElement, useRef } from "react";
import type { ReactElement } from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { PopoverAlign, PopoverCoreProps, PopoverSide } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { AnchoredLayer, panelSurface } from "../overlay";
import { renderText } from "../primitives";

export type { PopoverAlign, PopoverSide };
export interface PopoverProps extends PopoverCoreProps {
  /** Só no nativo: estilo da caixa que envolve o gatilho. */
  style?: StyleProp<ViewStyle>;
}

/**
 * Painel interativo ancorado ao gatilho (filtros, formulário curto). Controlado, como na web.
 * Fecha no toque fora, no voltar do Android e no escape do VoiceOver.
 */
export function Popover({ open, onOpenChange, content, children, side = "bottom", align = "start", label, style }: PopoverProps) {
  const t = useRefy();
  const anchor = useRef<View>(null);
  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<{ accessibilityState?: object }>, { accessibilityState: { ...(children as ReactElement<{ accessibilityState?: object }>).props.accessibilityState, expanded: open } })
    : children;
  const sm = t.pick<number>("--text-sm", 13);
  return (
    <>
      <View ref={anchor} collapsable={false} style={[{ alignSelf: "flex-start" }, style]}>{trigger}</View>
      <AnchoredLayer
        open={open}
        onClose={() => onOpenChange(false)}
        anchorRef={anchor}
        side={side}
        align={align}
        gap={8}
        label={label}
        panelStyle={[panelSurface(t), { minWidth: 220, paddingVertical: 14, paddingHorizontal: 16 }]}
      >
        {renderText(content, { color: t.pick<string>("--ink-1", "--on-surface"), fontSize: sm, ...t.font("--font-body", "--weight-regular") })}
      </AnchoredLayer>
    </>
  );
}
