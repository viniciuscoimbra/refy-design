// Contrato de props do Divider: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerSpacing = "none" | "sm" | "md" | "lg";

/** Props for the Divider component. */
export interface DividerCoreProps {
  /** Direção do separador (padrão: horizontal). */
  orientation?: DividerOrientation;
  /** Rótulo central opcional (ex.: "ou"). Só vale na horizontal. */
  label?: ReactNode;
  /** Margem externa no eixo do fluxo (padrão: "md"). */
  spacing?: DividerSpacing;
}
