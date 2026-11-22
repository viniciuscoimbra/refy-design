import { Image, Linking, Text, View } from "react-native";
import type { ViewProps } from "react-native";
import type { EntityCardAction, EntityCardBadgeTone, EntityCardCoreProps, EntityCardLayout } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Rating } from "./Rating";

export type { EntityCardAction, EntityCardBadgeTone, EntityCardLayout };
export interface EntityCardProps extends EntityCardCoreProps, Omit<ViewProps, "children"> {}

/** Produto, lugar, pessoa ou anúncio num cartão: foto, selo, nota, preço e até três ações. */
export function EntityCard({ title, subtitle, category, description, image, imageAlt = "", price, meta, badge, badgeTone = "neutral", rating, actions = [], layout = "vertical", style, ...rest }: EntityCardProps) {
  const t = useRefy();
  const row = layout === "horizontal";
  // Sem foto: cartão compacto, como na web.
  const compact = !image;
  const sm = t.pick<number>("--text-sm", 13);
  const pad = t.pick<number>("--card-padding", "--space-4");
  const press = (action: EntityCardAction) => () => {
    if (action.onClick) action.onClick();
    else if (action.href) void Linking.openURL(action.href);
  };
  return (
    <View
      {...rest}
      style={[{ flexDirection: row ? "row" : "column", overflow: "hidden", borderWidth: 1, borderColor: t.pick<string>("--line-soft"), borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>("--card-background", "--surface") }, style]}
    >
      {image && (
        <View style={row ? { width: "38%", maxWidth: 220, minHeight: 140 } : { aspectRatio: 4 / 3 }}>
          <Image source={{ uri: image }} accessibilityLabel={imageAlt || undefined} accessibilityIgnoresInvertColors style={{ width: "100%", height: "100%", backgroundColor: t.pick<string>("--surface-2", "--surface-container-low") }} resizeMode="cover" />
          {badge && <Badge tone={badgeTone} style={{ position: "absolute", top: 12, left: 12 }}>{badge}</Badge>}
        </View>
      )}
      <View style={{ flex: row ? 1 : undefined, gap: compact ? 4 : 8, padding: compact ? 12 : pad, paddingHorizontal: pad, minWidth: 0 }}>
        {(category != null || (!image && badge)) && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {category != null && renderText(category, baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3" }))}
            {!image && badge && <Badge tone={badgeTone}>{badge}</Badge>}
          </View>
        )}
        {renderText(title, { ...baseText(t, { size: compact ? t.pick<number>("--text-base", 14) : t.pick<number>("--card-title-size", "--text-md"), color: "--ink-1", family: "--font-headline", weight: "--weight-semi", leading: "--leading-snug" }) })}
        {subtitle != null && renderText(subtitle, baseText(t, { size: sm, color: "--ink-3" }))}
        {rating && <Rating readOnly size="sm" label="Nota" value={rating.value} count={rating.count} />}
        {description != null && renderText(description, baseText(t, { size: sm, color: "--ink-2" }))}
        {(price != null || meta != null) && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 12, rowGap: 4 }}>
            {price != null && <Text style={{ ...baseText(t, { size: compact ? sm : t.pick<number>("--text-lg", 18), color: "--ink-1", family: "--font-headline", weight: "--weight-semi" }), fontVariant: ["tabular-nums"] }}>{price}</Text>}
            {meta != null && renderText(meta, baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3" }))}
          </View>
        )}
        {actions.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8 }}>
            {actions.slice(0, 3).map((action, index) => (
              <Button key={action.label} size="sm" variant={index === 0 ? "primary" : index === 1 ? "secondary" : "ghost"} onPress={press(action)}>{action.label}</Button>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
