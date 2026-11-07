// Contrato de props do Card: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type CardTone = "default" | "inverted";

/** Props for the Card surface component. */
export interface CardCoreProps {
  /** Elevação da sombra (0–4). 0 = plano; 4 = overlay. */
  elevation?: 0 | 1 | 2 | 3 | 4;
  padding?: "none" | "sm" | "md";
  /**
   * Tom da superfície. `inverted` = superfície escura (tinta) com gradiente
   * radial da marca e tokens de texto invertidos no escopo do card — base dos
   * heróis de billing/uso (plan-summary, usage-hero).
   */
  tone?: CardTone;
  children: ReactNode;
}

/** Props for the optional Card header. */
export interface CardHeaderCoreProps {
  title: ReactNode;
  count?: ReactNode;
  action?: ReactNode;
  /** Mídia e descrição opcionais, com métricas configuráveis pelo tema. */
  icon?: ReactNode;
  description?: ReactNode;
  /** Hierarquia compacta para cabeçalhos secundários; md preserva o padrão. */
  size?: "sm" | "md";
}
