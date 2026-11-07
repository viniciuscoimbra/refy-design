// Contrato de props do IconButton. O nome acessível obrigatório é `aria-label` na web e
// `accessibilityLabel` no nativo; por isso ele fica fora do contrato e cada lado o exige.
import type { ReactNode } from "react";

export type IconButtonVariant = "ghost" | "outline" | "solid";
export type IconButtonSize = "sm" | "md" | "lg";

/** Props for icon-only buttons. */
export interface IconButtonCoreProps {
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}
