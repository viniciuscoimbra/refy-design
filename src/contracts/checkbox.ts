// Contrato de props do Checkbox: o que a web e o nativo implementam igual.
// A mudança de estado é do ambiente: `onChange` do input na web, `onCheckedChange` no nativo.
import type { ReactNode } from "react";

/** Props for the accessible Checkbox control. */
export interface CheckboxCoreProps {
  /** Rótulo à direita da caixa. */
  label?: ReactNode;
  /** Texto de apoio abaixo do rótulo. */
  description?: ReactNode;
  /** Etiqueta inline após o rótulo (ex.: um Badge). */
  tag?: ReactNode;
  /** Meta mono à direita da linha. */
  meta?: ReactNode;
  /** Linha com borda selecionável. */
  boxed?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
}
