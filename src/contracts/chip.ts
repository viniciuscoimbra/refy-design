// Contrato de props do Chip: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.
import type { ReactNode } from "react";

export type ChipTone = "neutral" | "critical" | "warning" | "success" | "info";
export type ChipSelectionMode = "toggle" | "radio";

/** Props for the selectable Chip control. */
export interface ChipCoreProps {
  /** Seleção compacta embutida em campos; filtro preserva o padrão. */
  variant?: "filter" | "selection";
  /** Estado selecionado (filtro ativo). */
  selected?: boolean;
  /** Contador à direita (ex.: número de itens no filtro). */
  count?: number;
  /** Ponto semântico opcional para filtros de severidade/status. */
  tone?: ChipTone;
  /** Toggle usa `aria-pressed`; radio usa `role=radio` + `aria-checked`. */
  selectionMode?: ChipSelectionMode;
  /** Revela o check animado quando selecionado. */
  showCheck?: boolean;
  /** Ícone de fechar — dispara onRemove. */
  removable?: boolean;
  onRemove?: () => void;
  leadingIcon?: ReactNode;
  children: ReactNode;
}
