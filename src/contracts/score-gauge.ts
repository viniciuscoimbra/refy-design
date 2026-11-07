// Contrato de props do ScoreGauge: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export type ScoreGaugeSize = "sm" | "md" | "lg";
export type ScoreBand = "ok" | "warn" | "critical";

/** Props for the ScoreGauge component. */
export interface ScoreGaugeCoreProps {
  /** 0 a 100. */
  value: number;
  label?: ReactNode;
  size?: ScoreGaugeSize;
  /** A partir daqui a faixa é boa. Padrão 70. */
  okAt?: number;
  /** A partir daqui a faixa é aviso; abaixo, crítica. Padrão 40. */
  warnAt?: number;
  formatValue?: (value: number) => ReactNode;
}
