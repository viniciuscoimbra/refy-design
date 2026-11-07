import { useState } from "react";
import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { ButtonStatus } from "@refy-design/web/contracts";
import type { PropertyAction, PropertyActionGroupCoreProps, PropertyActionGroupState } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Button } from "./Button";

export type { PropertyAction, PropertyActionGroupState };
export interface PropertyActionGroupProps extends PropertyActionGroupCoreProps {
  style?: StyleProp<ViewStyle>;
}

export const decisionLabels: Record<PropertyAction, string> = { reject: "Descartar", save: "Salvar", visit: "Selecionar" };
const paths: Record<PropertyAction, string> = { reject: "M18 6 6 18M6 6l12 12", save: "M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z", visit: "m5 12 4 4L19 6" };

/** Mensagem de estado igual à da web. */
export function propertyActionMessage(state: PropertyActionGroupState, activeAction: PropertyAction | undefined, labels: Record<PropertyAction, string>) {
  if (state === "processing" && activeAction) return `${labels[activeAction]}: processando…`;
  if (state === "completed" && activeAction) return `${labels[activeAction]}: concluído.`;
  if (state === "unavailable") return "As ações deste item estão indisponíveis.";
  return "Escolha o que deseja fazer com este item.";
}

/** Decisões sobre um item (descartar, salvar, selecionar). Empilha em 360 pt ou menos, como a web. */
export function PropertyActionGroup({ state = "idle", activeAction, onAction, orientation = "auto", disabledActions = [], statusMessage, labels: overrides, style }: PropertyActionGroupProps) {
  const t = useRefy();
  const [width, setWidth] = useState(0);
  const labels = { ...decisionLabels, ...Object.fromEntries(Object.entries(overrides ?? {}).filter(([, v]) => v !== undefined)) } as Record<PropertyAction, string>;
  const actions: PropertyAction[] = ["reject", "save", "visit"];
  const unavailable = state === "unavailable";
  const vertical = orientation === "vertical" || (orientation === "auto" && width > 0 && width <= 360);
  const gap = t.size("--space-2", 8);
  const status = (action: PropertyAction): ButtonStatus => activeAction !== action ? "idle" : state === "processing" ? "loading" : state === "completed" ? "success" : "idle";
  const xs = t.pick<number>("--text-xs", 12);
  const message = statusMessage ?? propertyActionMessage(state, activeAction, labels);
  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[{ width: "100%", gap }, style]}>
      <View role="group" accessibilityLabel="Decisões sobre o item" style={{ flexDirection: vertical ? "column" : "row", gap }}>
        {actions.map((action) => {
          const isActive = action === activeAction;
          const fg = action === "visit" ? t.pick<string>("--button-primary-foreground", "--on-primary") : t.pick<string>("--button-secondary-foreground", "--ink-1");
          return (
            <View key={action} style={[{ flex: vertical ? undefined : 1, minWidth: 0 }, isActive ? { margin: -3, padding: 2, borderWidth: t.pick<number>("--control-border-width", 1), borderColor: t.pick<string>("--ink-1"), borderRadius: t.pick<number>("--control-radius", "--radius-default", 6) + 3 } : null]}>
              <Button
                block
                variant={action === "visit" ? "primary" : "secondary"}
                status={status(action)}
                interactionState={isActive && state === "idle" ? "pressed" : undefined}
                loadingLabel={labels[action]}
                leadingIcon={<Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d={paths[action]} /></Svg>}
                disabled={unavailable || disabledActions.includes(action) || (state !== "idle" && !isActive)}
                aria-selected={isActive}
                onPress={() => onAction?.(action)}
              >
                {labels[action]}
              </Button>
            </View>
          );
        })}
      </View>
      <View role="status" accessibilityLiveRegion="polite">
        {renderText(message, { color: t.pick<string>("--ink-3"), fontSize: xs, lineHeight: Math.round(xs * 1.5), textAlign: "center", ...t.font("--font-body", "--weight-regular") })}
      </View>
    </View>
  );
}
