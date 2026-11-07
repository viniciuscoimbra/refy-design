import { cloneElement, isValidElement, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import type { HelpFieldCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, hitSlopFor } from "../primitives";
import { IconButton } from "./IconButton";
import { Popover } from "./Popover";

export interface HelpFieldProps extends HelpFieldCoreProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Linha de formulário para campo técnico: rótulo simples e um ícone de ajuda. Sem hover no
 * toque, o ícone abre um Popover com a explicação e o "Saber mais". O campo recebe o texto de
 * ajuda como `accessibilityHint`.
 */
export function HelpField({ label, helpText, children, onLearnMore, learnMoreLabel = "Saber mais", side = "top", style }: HelpFieldProps) {
  const t = useRefy();
  const [open, setOpen] = useState(false);
  const field = isValidElement(children)
    ? cloneElement(children as ReactElement<{ accessibilityHint?: string }>, { accessibilityHint: [(children as ReactElement<{ accessibilityHint?: string }>).props.accessibilityHint, helpText].filter(Boolean).join(". ") })
    : children;
  const eyebrow = t.pick<number>("--text-eyebrow", 11);
  const ink3 = t.pick<string>("--ink-3", "--on-surface-variant");
  const xs = t.pick<number>("--text-2xs", 11);
  return (
    <View style={[{ gap: t.pick<number>("--space-2", 8), alignSelf: "stretch" }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: t.pick<number>("--space-1", 4) }}>
        <Text style={{ color: ink3, fontSize: eyebrow, letterSpacing: t.size("--interface-label-tracking", 0.14 * eyebrow, eyebrow), textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...t.font(["--interface-detail-font", "--font-mono"], "--weight-medium") }}>{label}</Text>
        <Popover
          open={open}
          onOpenChange={setOpen}
          side={side === "bottom" ? "bottom" : "top"}
          label={`Ajuda: ${label}`}
          content={
            <View style={{ gap: t.pick<number>("--space-3", 12), maxWidth: 280 }}>
              <Text style={baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-1", leading: "--leading-normal" })}>{helpText}</Text>
              {onLearnMore && (
                <Pressable accessibilityRole="link" onPress={() => { setOpen(false); onLearnMore(); }} hitSlop={hitSlopFor(xs * 1.5, 0)} style={({ pressed }) => ({ alignSelf: "flex-start", height: Math.round(xs * 1.5), justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                  <Text style={{ color: t.pick<string>("--primary-ink"), fontSize: xs, textDecorationLine: "underline", ...t.font("--font-body", "--weight-semi") }}>{learnMoreLabel}</Text>
                </Pressable>
              )}
            </View>
          }
        >
          <IconButton
            size="sm"
            accessibilityLabel={`Ajuda: ${label}`}
            onPress={() => setOpen(!open)}
            icon={
              <Svg viewBox="0 0 24 24" fill="none" stroke={ink3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx={12} cy={12} r={9} /><Path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 1.8-2.8 2.2-2.8 3.6" /><Line x1={12} y1={17} x2={12} y2={17.01} />
              </Svg>
            }
          />
        </Popover>
      </View>
      {field}
    </View>
  );
}
