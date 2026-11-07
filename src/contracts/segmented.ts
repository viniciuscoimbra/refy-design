// Contrato de props do Segmented: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export interface SegmentedOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

/** Props for the single-select segmented control. */
export interface SegmentedCoreProps {
  options: SegmentedOption[];
  /** Valor selecionado (controlado). */
  value?: string;
  /** Seleção inicial (não-controlado). Padrão: primeira opção. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Rótulo acessível do grupo. */
  label?: string;
  disabled?: boolean;
  sliding?: boolean;
  /** Só ícones; rótulos textuais viram nomes acessíveis e tooltips. */
  iconOnly?: boolean;
}
