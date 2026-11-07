// Contrato de props do Fab: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type FabSize = "md" | "lg";
export type FabVariant = "primary" | "surface";

/** Props for the floating action button. */
export interface FabCoreProps {
  /** Ícone (obrigatório — é o sujeito do FAB). */
  icon: ReactNode;
  /** Se presente e `extended`, vira FAB estendido com texto. */
  label?: string;
  extended?: boolean;
  size?: FabSize;
  variant?: FabVariant;
}
