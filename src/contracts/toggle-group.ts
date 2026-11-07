// Contrato de props do ToggleGroup: o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export interface ToggleOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Props for the multi-select ToggleGroup. */
export interface ToggleGroupCoreProps {
  options: ToggleOption[];
  /** Valores ligados (controlado). */
  value?: string[];
  /** Estado inicial (não-controlado). */
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  /** Rótulo acessível do grupo. */
  label?: string;
  disabled?: boolean;
}
