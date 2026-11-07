// Contrato de props do StatusDot: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export type StatusDotTone = "good" | "ok" | "warn" | "critical" | "info" | "neutral";

/** Props for the StatusDot indicator. */
export interface StatusDotCoreProps {
  /** Tom semântico do estado. Default `good`. */
  tone?: StatusDotTone;
  /** Pulso "ao vivo" (halo animado). Desligado com movimento reduzido. */
  pulse?: boolean;
  /** Rótulo mono em caixa alta à direita do ponto. */
  children?: ReactNode;
}
