import { Image, Linking, Pressable, Text, View } from "react-native";
import type { PressableProps } from "react-native";
import type { LinkCardCoreProps, LinkCardLayout } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";
import { domainOf } from "./domain";

export type { LinkCardLayout };
export interface LinkCardProps extends LinkCardCoreProps, Omit<PressableProps, "children"> {}

/** Ícone do site; sem endereço, a inicial do domínio. Nada é buscado fora. */
export function SiteMark({ favicon, site }: { favicon?: string; site: string }) {
  const t = useRefy();
  return favicon ? (
    <Image source={{ uri: favicon }} style={{ width: 16, height: 16, borderRadius: 3 }} />
  ) : (
    <View style={{ width: 16, height: 16, borderRadius: 3, alignItems: "center", justifyContent: "center", backgroundColor: t.pick<string>("--primary-soft") }}>
      <Text style={{ color: t.pick<string>("--primary-ink"), fontSize: 10, ...t.font("--font-body", "--weight-bold") }}>{site.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

/** Prévia de endereço: site, título, descrição e miniatura; o cartão inteiro abre o link. */
export function LinkCard({ href, title, description, image, favicon, siteName, layout = "horizontal", onPress, style, ...rest }: LinkCardProps) {
  const t = useRefy();
  const site = siteName ?? domainOf(href);
  const vertical = layout === "vertical";
  const xs = t.pick<number>("--text-xs", 12);
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={typeof title === "string" ? `${title}, ${site}` : undefined}
      accessibilityHint="Abre no navegador"
      onPress={(e) => (onPress ? onPress(e) : void Linking.openURL(href))}
      {...rest}
      style={(state) => [
        { flexDirection: vertical ? "column" : "row-reverse", minHeight: 72, overflow: "hidden", borderWidth: 1, borderColor: t.pick<string>(state.pressed ? "--line" : "--line-soft"), borderRadius: t.pick<number>("--card-radius", "--radius-lg"), backgroundColor: t.pick<string>(state.pressed ? "--surface-2" : "--card-background", "--surface") },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {image && <Image source={{ uri: image }} accessibilityIgnoresInvertColors style={vertical ? { width: "100%", aspectRatio: 1.91 } : { width: 96, alignSelf: "stretch", minHeight: 88 }} resizeMode="cover" />}
      <View style={{ flex: 1, gap: 4, paddingVertical: 12, paddingHorizontal: 16, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <SiteMark favicon={favicon} site={site} />
          <Text numberOfLines={1} style={baseText(t, { size: xs, color: "--ink-3" })}>{site}</Text>
        </View>
        {renderText(title, baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-1", weight: "--weight-semi", leading: "--leading-snug" }), { numberOfLines: 2 })}
        {description != null && renderText(description, baseText(t, { size: xs, color: "--ink-3", leading: "--leading-snug" }), { numberOfLines: 2 })}
      </View>
    </Pressable>
  );
}
