import { useEffect, useRef } from "react";
import { Animated, LayoutAnimation, Pressable, View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { AccordionCoreProps, AccordionItem } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import type { RefyContext } from "../theme";
import { useControllable, useReducedMotion } from "../hooks";
import { baseText, hitSlopFor, lineHeight, paddingFrom, renderText } from "../primitives";

export type { AccordionItem };
export interface AccordionProps extends AccordionCoreProps, Omit<ViewProps, "children"> {}

/** Abre e fecha o conteúdo com a mesma transição de altura nos dois sentidos, e respeita movimento reduzido. */
export function animateDisclosure(t: RefyContext, reduced: boolean) {
  if (reduced) return;
  LayoutAnimation.configureNext(LayoutAnimation.create(t.pick<number>("--motion-context-duration", 180), "easeInEaseOut", "opacity"));
}

function Chevron({ open, color, size, path, to, reduced }: { open: boolean; color: string; size: number; path: string; to: string; reduced: boolean }) {
  const t = useRefy();
  const turn = useRef(new Animated.Value(open ? 1 : 0)).current;
  useEffect(() => {
    const anim = Animated.timing(turn, { toValue: open ? 1 : 0, duration: reduced ? 0 : t.pick<number>("--motion-context-duration", 180), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [open, reduced, t, turn]);
  const rotate = turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", to] });
  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d={path} /></Svg>
    </Animated.View>
  );
}

/** Seções que abrem e fecham. `single` mantém uma aberta; `multiple` permite várias. */
export function Accordion({ items, type = "single", value, defaultValue = [], onChange, variant = "default", size = "default", leadingIndicator = false, indentContent = false, style, ...rest }: AccordionProps) {
  const t = useRefy();
  const reduced = useReducedMotion(t.pick<number>("--motion-reduced", 0) === 1);
  const [open, setOpen] = useControllable(value, defaultValue, onChange);
  const small = size === "sm";
  const plain = variant === "plain";
  const joined = variant === "joined";
  const line = t.pick<string>("--line");
  const triggerPad = small
    ? paddingFrom(t, "--accordion-sm-trigger-padding", [t.pick<number>("--space-2", 8), t.pick<number>("--space-3", 12)])
    : paddingFrom(t, "--accordion-trigger-padding", [t.pick<number>("--space-3", 12), t.pick<number>("--space-4", 16)]);
  const contentPad = small
    ? paddingFrom(t, "--accordion-sm-content-padding", [0, t.pick<number>("--space-3", 12), t.pick<number>("--space-2", 8)])
    : paddingFrom(t, "--accordion-content-padding", [0, t.pick<number>("--space-4", 16), t.pick<number>("--space-3", 12)]);
  if (plain) { triggerPad.paddingLeft = 0; triggerPad.paddingRight = 0; contentPad.paddingLeft = 0; contentPad.paddingRight = 0; }
  const titleSize = small ? t.pick<number>("--accordion-sm-trigger-size", "--text-sm", 13) : t.pick<number>("--accordion-trigger-size", "--text-base", 14);
  const contentSize = small ? t.pick<number>("--accordion-sm-content-size", "--text-xs", 12) : t.pick<number>("--accordion-content-size", "--text-sm", 13);
  const leadGap = t.pick<number>("--accordion-lead-gap", 10);
  const rowHeight = titleSize * 1.4 + triggerPad.paddingTop + triggerPad.paddingBottom;
  const toggle = (id: string) => {
    animateDisclosure(t, reduced);
    const isOpen = open.includes(id);
    setOpen(type === "single" ? (isOpen ? [] : [id]) : isOpen ? open.filter((x) => x !== id) : [...open, id]);
  };
  return (
    <View
      {...rest}
      style={[{
        gap: joined ? 0 : t.pick<number>("--accordion-gap", 0), overflow: "hidden",
        ...(plain ? {} : {
          borderWidth: joined ? t.pick<number>("--surface-border-width", 1) : t.pick<number>("--accordion-border-width", "--surface-border-width", 1),
          borderColor: line, borderRadius: t.pick<number>("--radius-md", 10), backgroundColor: t.pick<string>("--accordion-surface", "--surface"),
        }),
      }, style]}
    >
      {items.map((item, index) => {
        const isOpen = open.includes(item.id);
        const itemBorder = joined || plain ? 0 : t.pick<number>("--accordion-item-border-width", 0);
        return (
          <View key={item.id} style={{
            overflow: "hidden", borderColor: line, borderWidth: itemBorder, borderRadius: joined || plain ? 0 : t.pick<number>("--accordion-item-radius", 0),
            ...(index > 0 ? { borderTopWidth: t.pick<number>("--accordion-divider-width", 1) } : {}),
            backgroundColor: isOpen ? (joined ? t.pick<string>("--accordion-joined-open-background", "transparent") : t.pick<string>("--accordion-open-background", "transparent")) : "transparent",
          }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={typeof item.title === "string" ? item.title : undefined}
              accessibilityState={{ expanded: isOpen, disabled: Boolean(item.disabled) }}
              disabled={item.disabled}
              hitSlop={hitSlopFor(rowHeight)}
              onPress={() => toggle(item.id)}
              style={({ pressed }) => ({
                minHeight: rowHeight, ...triggerPad, flexDirection: "row", alignItems: "center", gap: 12,
                backgroundColor: pressed && !isOpen ? t.pick<string>("--legacy-surface-hover") : "transparent",
              })}
            >
              {leadingIndicator && <Chevron open={isOpen} color={t.pick<string>("--ink-2")} size={14} path="m9 6 6 6-6 6" to="90deg" reduced={reduced} />}
              <View style={{ flex: 1, minWidth: 0, marginLeft: leadingIndicator ? leadGap : 0 }}>
                {renderText(item.title, {
                  fontSize: titleSize, lineHeight: small ? lineHeight(titleSize, t.pick<number>("--accordion-sm-leading", 1.4)) : undefined,
                  color: item.disabled ? t.pick<string>("--ink-4") : t.pick<string>("--ink-1"), ...t.font(["--accordion-trigger-font", "--font-body"], 600),
                })}
              </View>
              <Chevron open={isOpen} color={t.pick<string>("--ink-3")} size={16} path="m6 9 6 6 6-6" to="180deg" reduced={reduced} />
            </Pressable>
            {isOpen && (
              <View accessibilityLabel={typeof item.title === "string" ? item.title : undefined} style={{ ...contentPad, ...(leadingIndicator && indentContent ? { paddingLeft: contentPad.paddingLeft + 14 + 12 + leadGap } : {}) }}>
                {renderText(item.content, { ...baseText(t, { size: contentSize }), lineHeight: lineHeight(contentSize, 1.55) })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
