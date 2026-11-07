// Contratos do Combobox e do Multiselect: o que a web e o nativo implementam igual.
// Eventos do DOM (onKeyDown, onClick do input) ficam só na web.
import type { ReactNode } from "react";

/** Avatar de uma opção "pessoa ou equipe". */
export interface ComboboxOptionAvatar {
  name: string;
  src?: string;
  color?: string;
}

/** Uma opção sugerida pelo Combobox. */
export interface ComboboxOption {
  value: string;
  label: string;
  lead?: string;
  meta?: string;
  avatar?: ComboboxOptionAvatar;
  description?: string;
  group?: string;
  disabled?: boolean;
}

/** Props for the Combobox field. */
export interface ComboboxCoreProps {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (option: ComboboxOption | null) => void;
  inputValue?: string;
  onInputValueChange?: (text: string) => void;
  label?: string;
  filter?: boolean | ((option: ComboboxOption, query: string) => boolean);
  icon?: ReactNode;
  emptyMessage?: string;
  defaultOpen?: boolean;
  clearable?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface MultiselectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/** Props for the Multiselect field. */
export interface MultiselectCoreProps {
  options: MultiselectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  maxVisibleChips?: number;
  listPlacement?: "inline" | "overlay";
  emptyMessage?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}
