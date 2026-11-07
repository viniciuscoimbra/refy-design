import { forwardRef } from "react";
import { ScrollView } from "react-native";
import type { DimensionValue, ScrollViewProps } from "react-native";
import type { ScrollAreaCoreProps } from "@refy-design/web/contracts";

export interface ScrollAreaProps extends ScrollAreaCoreProps, ScrollViewProps {}

/** A web aceita qualquer comprimento CSS; o RN só entende número e porcentagem. "240px" vira 240. */
export function toDimension(value: number | string): DimensionValue | undefined {
  if (typeof value === "number") return value;
  if (/^\d+(\.\d+)?%$/.test(value)) return value as DimensionValue;
  const px = /^(\d+(?:\.\d+)?)(px)?$/.exec(value.trim());
  return px ? Number(px[1]) : undefined;
}

/** Área rolável com altura máxima, padrão 240 como na web. */
export const ScrollArea = forwardRef<ScrollView, ScrollAreaProps>(function ScrollArea({ maxHeight = 240, style, ...rest }, ref) {
  return <ScrollView ref={ref} nestedScrollEnabled {...rest} style={[{ maxHeight: toDimension(maxHeight), minWidth: 0, flexGrow: 0 }, style]} />;
});
