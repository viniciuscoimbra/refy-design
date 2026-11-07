// Contratos de conta, navegação e decisões (UserMenu, HelpMenu, NotificationBell,
// WorkspaceSwitcher, SettingsSubnav, KanbanCard, PropertyActionGroup, PropertyMedia).
// Ficam só na web: aria-describedby, renderLink (link do DOM/router) e aspectRatio do CSS.
import type { ReactNode } from "react";
import type { MenuEntry } from "./overlay";

export interface UserMenuUser {
  name: string;
  email?: string;
  initials: string;
  seed?: string;
  src?: string;
}

/** Props for the UserMenu component. */
export interface UserMenuCoreProps {
  user: UserMenuUser;
  entries?: MenuEntry[];
  onSelect?: (id: string) => void;
  compact?: boolean;
  side?: "top" | "bottom";
  align?: "start" | "end";
}

/** Props for the HelpMenu component. */
export interface HelpMenuCoreProps {
  entries?: MenuEntry[];
  onSelect?: (id: string) => void;
  label?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  unread?: boolean;
}

/** Props for the notification bell menu. */
export interface NotificationBellCoreProps {
  items: NotificationItem[];
  onItemClick?: (item: NotificationItem) => void;
  onMarkAllRead?: () => void;
  title?: string;
  emptyMessage?: string;
}

export interface Workspace {
  id: string;
  name: string;
  role?: string;
  initials: string;
}

/** Props for the workspace switcher. */
export interface WorkspaceSwitcherCoreProps {
  workspaces: Workspace[];
  value?: string;
  defaultValue?: string;
  onChange?: (workspace: Workspace) => void;
  compact?: boolean;
}

export interface SettingsSubnavItem {
  href: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

export interface SettingsSubnavGroup {
  title?: string;
  items: SettingsSubnavItem[];
}

/** Props for the SettingsSubnav secondary menu. */
export interface SettingsSubnavCoreProps {
  items?: SettingsSubnavItem[];
  groups?: SettingsSubnavGroup[];
  activeHref?: string;
  label?: string;
  onNavigate?: (item: SettingsSubnavItem) => void;
}

export interface KanbanCardItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  footer?: ReactNode;
}

/** Props for the KanbanCard component. */
export interface KanbanCardCoreProps {
  item: KanbanCardItem;
  onOpen?: () => void;
  dragHandle?: ReactNode;
  actions?: ReactNode;
}

export type PropertyAction = "reject" | "save" | "visit";
export type PropertyActionGroupState = "idle" | "processing" | "completed" | "unavailable";

/** Props for the PropertyActionGroup component. */
export interface PropertyActionGroupCoreProps {
  state?: PropertyActionGroupState;
  activeAction?: PropertyAction;
  onAction?: (action: PropertyAction) => void;
  orientation?: "auto" | "horizontal" | "vertical";
  disabledActions?: PropertyAction[];
  statusMessage?: ReactNode;
  labels?: Partial<Record<PropertyAction, string>>;
}

export interface PropertyMediaItem {
  src: string;
  alt: string;
}

/** Props for the PropertyMedia gallery. */
export interface PropertyMediaCoreProps {
  items: PropertyMediaItem[];
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  fit?: "cover" | "contain";
  loading?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}
