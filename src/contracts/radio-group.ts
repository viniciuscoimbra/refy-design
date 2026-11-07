// Contrato de props do RadioGroup: o que a web e o nativo implementam igual.
// `name` e `inputProps` são do formulário HTML e ficam só na web.

export interface RadioOption {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
}

/** Props for the RadioGroup control. */
export interface RadioGroupCoreProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Rótulo mono em caixa alta acima do grupo. */
  label?: string;
}
