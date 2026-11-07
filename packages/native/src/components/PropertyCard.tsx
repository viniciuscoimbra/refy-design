import { Text, View, useWindowDimensions } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import type { PropertyCardBadge, PropertyCardCoreProps, PropertyCardFact, PropertyCardLayout } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { renderText } from "../primitives";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { PropertyActionGroup } from "./PropertyActionGroup";
import type { PropertyActionGroupProps } from "./PropertyActionGroup";
import { PropertyMedia } from "./PropertyMedia";
import type { PropertyMediaProps } from "./PropertyMedia";
import { ScoreGauge } from "./ScoreGauge";

export type { PropertyCardBadge, PropertyCardFact, PropertyCardLayout };
export interface PropertyCardProps extends PropertyCardCoreProps {
  mediaProps?: Omit<PropertyMediaProps, "items">;
  actions?: PropertyActionGroupProps | false;
  style?: StyleProp<ViewStyle>;
}

/**
 * Cartão com galeria, título, valor, fatos e decisões. O `layout` muda a composição, nunca
 * duplica mídia ou ações. Até 768 pt de largura `list` empilha como `grid`, igual à web.
 */
export function PropertyCard({ title, subtitle, value, valueSuffix, address, price, priceSuffix, media, mediaProps, layout = "grid", matchScore, badges = [], facts = [], summary, actions, headerAction, detailsAction, style }: PropertyCardProps) {
  const t = useRefy();
  const { width: screen } = useWindowDimensions();
  const compact = screen <= 768;
  const row = layout === "list" && !compact;
  const deck = layout === "deck";
  const showActions = actions !== false && (deck || actions != null);
  const pad = compact ? t.size("--space-4", 16) : layout === "grid" ? t.size("--space-5", 20) : t.size("--space-6", 24);
  const space3 = t.size("--space-3", 12);
  const titleSize = deck && !compact ? t.size("--text-h3", 24) : t.size("--text-h4", 20);
  const h3 = t.size("--text-h3", 24);
  const sm = t.size("--text-sm", 13);
  const xs = t.size("--text-xs", 12);
  const shownValue = value ?? price;
  const shownSuffix = valueSuffix ?? priceSuffix;
  const shownSubtitle = subtitle ?? address;
  const maxWidth = layout === "grid" ? 448 : deck ? 832 : 1120;

  const mediaBlock = (
    <View style={{ position: "relative", minWidth: 0, ...(row ? { width: "42%", minWidth: 272 } : null) }}>
      <PropertyMedia {...mediaProps} items={media} aspectRatio={mediaProps?.aspectRatio ?? (deck ? 16 / 10 : 4 / 3)} style={[{ borderWidth: 0, borderRadius: 0 }, row ? { flex: 1, aspectRatio: undefined } : null, mediaProps?.style]} />
      {badges.length > 0 && (
        <View accessibilityLabel="Destaques do conteúdo" style={{ position: "absolute", zIndex: 4, top: space3, left: space3, right: space3, flexDirection: "row", flexWrap: "wrap", gap: t.size("--space-2", 8) }}>
          {badges.map((badge, i) => <Badge key={i} tone={badge.tone}>{badge.label}</Badge>)}
        </View>
      )}
    </View>
  );
  const content = (
    <View style={{ flex: row ? 1 : undefined, minWidth: 0, gap: space3, padding: pad }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: space3, minWidth: 0 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View accessibilityRole="header">{renderText(title, { color: t.pick<string>("--ink-1"), fontSize: titleSize, lineHeight: Math.round(titleSize * 1.2), ...t.font("--font-headline", "--weight-bold") })}</View>
          {shownSubtitle != null && <View style={{ marginTop: t.size("--space-1", 4) }}>{renderText(shownSubtitle, { color: t.pick<string>("--ink-3"), fontSize: sm, lineHeight: Math.round(sm * 1.5), ...t.font("--font-body", "--weight-regular") })}</View>}
        </View>
        {matchScore != null && (
          <View accessible accessibilityLabel={`Índice de compatibilidade: ${Math.round(matchScore)}%`} style={{ alignItems: "center", gap: 2 }}>
            <ScoreGauge value={matchScore} label="compat." size={deck ? "md" : "sm"} accessible={false} />
            <Text style={{ color: t.pick<string>("--ink-3"), fontSize: 10, ...t.font("--font-body", 650) }}>compatibilidade</Text>
          </View>
        )}
        {headerAction != null && <View>{headerAction}</View>}
      </View>
      {shownValue != null && (
        <Text style={{ color: t.pick<string>("--ink-1"), fontSize: h3, ...t.font("--font-headline", "--weight-bold") }}>
          {shownValue}
          {shownSuffix != null && <Text style={{ color: t.pick<string>("--ink-3"), fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{" "}{shownSuffix}</Text>}
        </Text>
      )}
      {facts.length > 0 && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.size("--space-2", 8) }}>
          {facts.map((fact, i) => (
            <View key={`${fact.label}-${i}`} accessible accessibilityLabel={`${fact.label}: ${typeof fact.value === "string" || typeof fact.value === "number" ? fact.value : ""}`} style={{ flexDirection: "row", gap: t.size("--space-1", 4), paddingVertical: 6, paddingHorizontal: 9, borderWidth: t.pick<number>("--surface-border-width", 1), borderColor: t.pick<string>("--line-soft"), borderRadius: 999, backgroundColor: t.pick<string>("--surface-2") }}>
              <Text style={{ color: t.pick<string>("--ink-3"), fontSize: xs, ...t.font("--font-body", "--weight-regular") }}>{fact.label}</Text>
              {renderText(fact.value, { color: t.pick<string>("--ink-1"), fontSize: xs, ...t.font("--font-body", 650) })}
            </View>
          ))}
        </View>
      )}
      {summary != null && <View>{renderText(summary, { color: t.pick<string>("--ink-2"), fontSize: sm, lineHeight: Math.round(sm * 1.65), ...t.font("--font-body", "--weight-regular") }, { numberOfLines: layout === "grid" ? 2 : 3 })}</View>}
      {detailsAction != null && <View style={{ flexDirection: "row", alignItems: "center" }}>{detailsAction}</View>}
    </View>
  );
  return (
    <Card role="article" padding="none" elevation={deck ? 3 : 1} style={[{ width: "100%", maxWidth, minWidth: 0, overflow: "hidden", backgroundColor: t.pick<string>("--surface") }, style]}>
      {row ? <View style={{ flexDirection: "row", alignItems: "stretch" }}>{mediaBlock}{content}</View> : <>{mediaBlock}{content}</>}
      {showActions && <PropertyActionGroup {...(actions || {})} style={[{ paddingHorizontal: pad, paddingBottom: pad }, actions ? actions.style : null]} />}
    </Card>
  );
}
