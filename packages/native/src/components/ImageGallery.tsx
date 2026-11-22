import { useRef, useState } from "react";
import { Image, Modal as RNModal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import type { ViewProps } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { GalleryImage, ImageGalleryCoreProps } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { baseText, renderText } from "../primitives";
import { IconButton } from "./IconButton";
import { useIconStyle } from "../icon";

export type { GalleryImage };
export interface ImageGalleryProps extends ImageGalleryCoreProps, Omit<ViewProps, "children"> {}

function Glyph({ d }: { d: string }) {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d={d} /></Svg>;
}

/** Grade de fotos com legenda; o toque abre a foto em tela cheia, com deslize entre elas. */
export function ImageGallery({ images, label, columns = 3, aspectRatio = 4 / 3, viewer = true, layout = "grid", style, ...rest }: ImageGalleryProps) {
  const t = useRefy();
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const screen = useWindowDimensions();
  const pager = useRef<ScrollView>(null);
  const gap = t.pick<number>("--space-3", 12);
  const cols = width && width < 560 ? Math.min(2, columns) : columns;
  const cell = width ? (width - gap * (cols - 1)) / cols : 0;
  const radius = t.pick<number>("--radius-md", 10);
  const caption = baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3", leading: "--leading-snug" });
  const total = images.length;
  const featuredGap = t.pick<number>("--space-2", 8);
  const featuredCell = width ? (width - featuredGap * 2) / 3 : 0;
  const tile = (image: GalleryImage, index: number, w: number, h: number) => {
    const thumb = <Image source={{ uri: image.src }} accessibilityIgnoresInvertColors style={{ width: w, height: h, borderRadius: radius, backgroundColor: t.pick<string>("--surface-2", "--surface-container-low") }} resizeMode="cover" />;
    return viewer ? (
      <Pressable accessibilityRole="imagebutton" accessibilityLabel={`Abrir foto ${index + 1} de ${total}: ${image.alt}`} onPress={() => setOpen(index)}>{thumb}</Pressable>
    ) : (
      <View accessible accessibilityRole="image" accessibilityLabel={image.alt}>{thumb}</View>
    );
  };
  const overlay = (image: GalleryImage, index: number, size: number) => (
    <View key={`${image.src}${index}`} style={{ width: size, height: size }}>
      {tile(image, index, size, size)}
      {image.caption != null && (
        <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 8, paddingVertical: 6 }}>
          <View style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, borderBottomLeftRadius: radius, borderBottomRightRadius: radius, backgroundColor: t.pick<string>("--ink-1"), opacity: 0.55 }} />
          {renderText(image.caption, baseText(t, { size: t.pick<number>("--text-2xs", 10), color: "--bg", weight: "--weight-semi" }), { numberOfLines: 1 })}
        </View>
      )}
    </View>
  );
  const go = (index: number) => {
    const next = (index + total) % total;
    setOpen(next);
    pager.current?.scrollTo({ x: next * screen.width, animated: true });
  };
  return (
    <View accessibilityLabel={label} {...rest} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[{ flexDirection: "row", flexWrap: "wrap", gap }, style]}>
      {cell > 0 && layout !== "featured" && images.map((image, index) => (
        <View key={`${image.src}${index}`} style={{ width: cell, gap: 4 }}>
          {tile(image, index, cell, cell / aspectRatio)}
          {image.caption != null && renderText(image.caption, caption)}
        </View>
      ))}
      {featuredCell > 0 && layout === "featured" && (
        // Destaque: três colunas, fotos quadradas, a primeira em dois por dois com as duas
        // seguintes ao lado; o resto segue a grade. Legendas sobre as fotos, como na web.
        <View style={{ width, gap: featuredGap }}>
          <View style={{ flexDirection: "row", gap: featuredGap }}>
            {images[0] && overlay(images[0], 0, featuredCell * 2 + featuredGap)}
            <View style={{ gap: featuredGap }}>
              {images.slice(1, 3).map((image, i) => overlay(image, i + 1, featuredCell))}
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: featuredGap }}>
            {images.slice(3).map((image, i) => overlay(image, i + 3, featuredCell))}
          </View>
        </View>
      )}
      {viewer && open !== null && (
        <RNModal visible animationType="fade" onRequestClose={() => setOpen(null)} statusBarTranslucent>
          <View accessibilityViewIsModal style={{ flex: 1, backgroundColor: t.pick<string>("--bg", "--surface"), paddingTop: 48, paddingBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 }}>
              <Text accessibilityLiveRegion="polite" style={{ ...baseText(t, { size: t.pick<number>("--text-xs", 12), color: "--ink-3", family: ["--interface-detail-font", "--font-mono"] }), fontVariant: ["tabular-nums"] }}>{`${open + 1} de ${total}`}</Text>
              <IconButton variant="ghost" accessibilityLabel="Fechar" onPress={() => setOpen(null)} icon={<Glyph d="M18 6 6 18M6 6l12 12" />} />
            </View>
            <ScrollView
              ref={pager}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: open * screen.width, y: 0 }}
              onMomentumScrollEnd={(e) => setOpen(Math.round(e.nativeEvent.contentOffset.x / screen.width))}
              style={{ flex: 1 }}
            >
              {images.map((image, index) => (
                <View key={`${image.src}${index}`} style={{ width: screen.width, paddingHorizontal: 16, gap: 12, justifyContent: "center" }}>
                  <Image source={{ uri: image.src }} accessibilityLabel={image.alt} accessibilityIgnoresInvertColors style={{ width: "100%", flex: 1, borderRadius: radius }} resizeMode="contain" />
                  {image.caption != null && renderText(image.caption, baseText(t, { size: t.pick<number>("--text-sm", 13), color: "--ink-2" }))}
                </View>
              ))}
            </ScrollView>
            {total > 1 && (
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8, paddingHorizontal: 16, paddingTop: 12 }}>
                <IconButton variant="outline" accessibilityLabel="Foto anterior" onPress={() => go(open - 1)} icon={<Glyph d="M15 18l-6-6 6-6" />} />
                <IconButton variant="outline" accessibilityLabel="Próxima foto" onPress={() => go(open + 1)} icon={<Glyph d="M9 18l6-6-6-6" />} />
              </View>
            )}
          </View>
        </RNModal>
      )}
    </View>
  );
}
