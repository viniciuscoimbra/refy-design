// Contrato de props do Badge: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type BadgeTone = "success" | "info" | "warn" | "danger" | "neutral";

/** Props for the Badge status label. */
export interface BadgeCoreProps {
  tone?: BadgeTone;
  /** Ponto colorido à esquerda (status). */
  dot?: boolean;
  children: ReactNode;
}
