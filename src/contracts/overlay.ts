// Contratos das camadas sobrepostas (Popover, Tooltip, Menu, ContextMenu, Snackbar,
// SplitButton, FabMenu): o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverAlign = "start" | "center" | "end";

/** Props for the Popover component. */
export interface PopoverCoreProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ReactNode;
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  /** Nome acessível do painel. */
  label?: string;
}

/** Props for the Tooltip component. `shortcut`, `delayMs` e `portalled` são de teclado e mouse e ficam só na web. */
export interface TooltipCoreProps {
  label: string;
  description?: string;
  side?: "top" | "bottom" | "left" | "right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export type MenuEntry =
  | {
      type?: "item";
      id: string;
      label: ReactNode;
      icon?: ReactNode;
      shortcut?: string;
      meta?: ReactNode;
      danger?: boolean;
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: "separator" }
  | { type: "label"; label: ReactNode };

/** Props for the Menu component. */
export interface MenuCoreProps {
  /** Ponto da tela onde o menu abre (menu de contexto). */
  anchorPoint?: { x: number; y: number };
  /** Menu com a largura do gatilho. */
  matchWidth?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: MenuEntry[];
  onSelect?: (id: string) => void;
  children: ReactNode;
  align?: "start" | "end";
  side?: "top" | "bottom";
  ariaLabel?: string;
}

/** Props for the ContextMenu component. */
export interface ContextMenuCoreProps {
  children: ReactNode;
  entries: MenuEntry[];
  label?: string;
  onSelect?: (id: string) => void;
}

/** Props for the Snackbar component. */
export interface SnackbarCoreProps {
  children: ReactNode;
  action?: { label: string; onClick: () => void };
}

export interface SplitButtonOption {
  id?: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}
export type SplitButtonVariant = "primary" | "secondary";

/** Props for the SplitButton component. */
export interface SplitButtonCoreProps {
  label: string;
  variant?: SplitButtonVariant;
  menuAlign?: "start" | "end";
  leadingIcon?: ReactNode;
  onClick?: () => void;
  onSelect?: (id: string) => void;
  options: SplitButtonOption[];
  size?: "sm" | "md";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOptionId?: string;
}

export interface FabMenuAction {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onSelect?: () => void;
}

/** Props for the FabMenu component. */
export interface FabMenuCoreProps {
  actions: FabMenuAction[];
  label?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (id: string) => void;
  align?: "start" | "end";
}
