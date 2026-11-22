import { View } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { QuoteCoreProps, QuoteVariant } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";
import { Avatar } from "./Avatar";

export type { QuoteVariant };
export interface QuoteProps extends QuoteCoreProps, Omit<ViewProps, "children"> {}

function initialsOf(author: unknown) {
  if (typeof author !== "string") return undefined;
  return author.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || undefined;
}

/** Citação com autoria: "block" no corpo do texto, "pull" como depoimento em destaque. */
export function Quote({ children, author, source, avatar, variant = "block", style, ...rest }: QuoteProps) {
  const t = useRefy();
  const pull = variant === "pull";
  const initials = initialsOf(author);
  const quoteText = pull
    ? { ...baseText(t, { size: t.pick<number>("--text-h4", 20), color: "--ink-1", family: "--font-headline", leading: "--leading-snug" }) }
    : baseText(t, { size: t.pick<number>("--text-md", 16), color: "--ink-1", leading: "--leading-relaxed" });
  const sm = t.pick<number>("--text-sm", 13);
  return (
    <View
      {...rest}
      style={[
        { gap: 12, minWidth: 0 },
        pull
          ? { padding: t.pick<number>("--space-6", 24), borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>("--surface-2", "--surface-container-low") }
          : { paddingLeft: t.pick<number>("--space-4", 16), borderLeftWidth: 3, borderLeftColor: t.pick<string>("--primary") },
        style,
      ]}
    >
      {pull && (
        <Svg width={28} height={21} viewBox="0 0 32 24" accessibilityElementsHidden importantForAccessibility="no">
          <Path fill={t.pick<string>("--primary")} d="M0 24V14.4C0 6.1 4.4 1.3 12.2 0l1.4 3.4C9 4.6 6.9 7.3 6.7 11H13v13H0zm18.4 0V14.4C18.4 6.1 22.8 1.3 30.6 0L32 3.4c-4.6 1.2-6.7 3.9-6.9 7.6h6.3v13h-13z" />
        </Svg>
      )}
      {renderText(children, quoteText)}
      {(author != null || source != null) && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {pull && (avatar || initials) && <Avatar size="sm" src={avatar} initials={initials} seed={typeof author === "string" ? author : undefined} />}
          <View style={{ flexShrink: 1 }}>
            {author != null && renderText(author, { ...baseText(t, { size: sm, color: "--ink-1", weight: "--weight-semi" }) })}
            {source != null && renderText(source, baseText(t, { size: sm, color: "--ink-3" }))}
          </View>
        </View>
      )}
    </View>
  );
}
