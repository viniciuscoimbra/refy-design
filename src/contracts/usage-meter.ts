// Contrato de props do UsageMeter: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

/** Props for the UsageMeter component. */
export interface UsageMeterCoreProps {
  label: ReactNode;
  used: number;
  limit: number;
  unit?: ReactNode;
  meta?: ReactNode;
  formatValue?: (value: number) => string;
  /** Percentual a partir do qual o tom vira aviso. Padrão 80. */
  warnAt?: number;
  /** Percentual a partir do qual o tom vira crítico. Padrão 100. */
  criticalAt?: number;
  size?: "sm" | "md";
}

/** Props for the UsageMeterGroup list. */
export interface UsageMeterGroupCoreProps {
  children: ReactNode;
}
