// Contrato de props do ChoiceCard: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type ChoiceCardMode = "single" | "multiple";

/** Props for the ChoiceCardGroup container. */
export interface ChoiceCardGroupCoreProps {
  /** `single` = semântica de radio (default); `multiple` = checkboxes. */
  mode?: ChoiceCardMode;
  /** Valor controlado: string (single) ou string[] (multiple). */
  value?: string | string[];
  /** Valor inicial não-controlado. */
  defaultValue?: string | string[];
  /** Callback: recebe string (single) ou string[] (multiple). */
  onChange?: (value: string | string[]) => void;
  /** Rótulo acessível do grupo (obrigatório sem label visível externo). */
  label?: string;
  /** Colunas do grid (default 3; 1 = lista empilhada). */
  columns?: number;
  children: ReactNode;
}

/** Props for a selectable ChoiceCard. */
export interface ChoiceCardCoreProps {
  /** Valor único dentro do grupo. */
  value: string;
  /** Título da opção. */
  title: ReactNode;
  /** Descrição curta abaixo do título. */
  description?: ReactNode;
  /** Ícone pequeno inline antes do título (slot). */
  icon?: ReactNode;
  /** Preview grande acima do texto (slot — ex.: amostra de tema). */
  preview?: ReactNode;
  /** Meta/preço (mono) abaixo ou à direita do texto. */
  meta?: ReactNode;
  disabled?: boolean;
}
