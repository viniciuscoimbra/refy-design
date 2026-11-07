// Contrato de props do BrandLogo: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type BrandLogoBrand = "refy";

export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface BrandLogoCoreProps {
  brand?: BrandLogoBrand;
  size?: BrandLogoSize;
  tone?: "default" | "inverse";
  animated?: boolean;
  markOnly?: boolean;
  /** Marca fornecida pelo consumidor. Não inclui assets de terceiros no Refy. */
  children?: ReactNode;
}
