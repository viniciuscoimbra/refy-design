import { View } from "react-native";
import type { ViewProps } from "react-native";
import type { AspectRatioCoreProps } from "@refy-design/web/contracts";

export interface AspectRatioProps extends AspectRatioCoreProps, ViewProps {}

/** Caixa que ocupa a largura toda e tira a altura da proporção. */
export function AspectRatio({ ratio = 16 / 9, style, ...rest }: AspectRatioProps) {
  return <View {...rest} style={[{ width: "100%", aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9 }, style]} />;
}
