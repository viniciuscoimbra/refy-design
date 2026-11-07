import { Text } from "react-native";
import type { TextProps } from "react-native";
import { useRefy } from "../theme";

export type MarkerProps = TextProps;

/** Trecho realçado dentro de um texto, como o <mark> da web. Use dentro de um <Text>. */
export function Marker({ style, ...rest }: MarkerProps) {
  const t = useRefy();
  // Texto aninhado no RN não aceita padding nem borderRadius; o realce fica no fundo e na cor.
  return <Text {...rest} style={[{ backgroundColor: t.pick<string>("--primary-soft"), color: t.pick<string>("--primary-ink") }, style]} />;
}
