// Contratos de KanbanBoard e SwipeDeck. `className` fica só na web; o item do SwipeDeck
// usa o contrato do PropertyCard (sem `mediaProps` e `actions`, que carregam HTML).
import type { ReactNode } from "react";
import type { KanbanCardItem } from "./account";
import type { MenuEntry } from "./overlay";
import type { PropertyAction } from "./account";
import type { PropertyCardCoreProps } from "./organisms";

export interface KanbanColumnItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  items: KanbanCardItem[];
  wipLimit?: number;
  color?: string;
}

/** Props for the KanbanBoard component. */
export interface KanbanBoardCoreProps {
  columns: KanbanColumnItem[];
  onColumnsChange?: (columns: KanbanColumnItem[]) => void;
  onCardClick?: (card: KanbanCardItem, column: KanbanColumnItem) => void;
  wipLimit?: number;
  allowedTransitions?: Record<string, readonly string[]>;
  toolbar?: ReactNode;
  filter?: (card: KanbanCardItem, column: KanbanColumnItem) => boolean;
  onAddCard?: (column: KanbanColumnItem) => void;
  columnActions?: (column: KanbanColumnItem) => MenuEntry[];
  ariaLabel?: string;
  instructions?: "visible" | "hidden";
}

export interface SwipeDeckItemCore extends PropertyCardCoreProps {
  id: string;
}

/** Props for the SwipeDeck component, sem a lista (o item nativo usa o PropertyCard nativo). */
export interface SwipeDeckCoreProps {
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  onReset?: () => void;
  gestureEnabled?: boolean;
  motion?: "auto" | "reduced";
  title?: ReactNode;
  instructions?: "visible" | "hidden";
}
export type { PropertyAction };
