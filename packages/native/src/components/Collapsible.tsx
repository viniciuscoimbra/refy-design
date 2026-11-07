import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { CollapsibleCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { useControllable, useReducedMotion } from "../hooks";
import { renderText, baseText } from "../primitives";
import { Button } from "./Button";
import { animateDisclosure } from "./Accordion";

export interface CollapsibleProps extends CollapsibleCoreProps, Omit<ViewProps, "children"> {}

/** Botão que mostra e esconde um bloco; o sinal muda de + para −. */
export function Collapsible({ title, children, open, defaultOpen = false, onOpenChange, disabled, style, ...rest }: CollapsibleProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const [expanded, setExpanded] = useControllable(open, defaultOpen, onOpenChange);
  return (
    <View {...rest} style={style}>
      <Button
        disabled={disabled}
        accessibilityLabel={title}
        accessibilityState={{ expanded, disabled: Boolean(disabled) }}
        onPress={() => { animateDisclosure(t, reduced); setExpanded(!expanded); }}
      >
        {`${title} ${expanded ? "−" : "+"}`}
      </Button>
      {expanded && <View style={{ paddingVertical: t.pick<number>("--space-4", 16) }}>{renderText(children, baseText(t))}</View>}
    </View>
  );
}
