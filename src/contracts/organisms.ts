// Contratos de organismos: AlertDialog, Drawer, Timeline, EventTimeline, PropertyCard, Matrix2x2.
// Ficam só na web: `width` do Drawer (aceita texto de CSS), `href` do autor da atividade,
// `mediaProps` e `actions` do PropertyCard (carregam atributos de HTML) e `className`.
import type { ReactNode } from "react";
import type { ActivityActorCore } from "./activity-item";
import type { BadgeTone } from "./badge";
import type { StatusDotTone } from "./status-dot";

/** Props for the AlertDialog component. */
export interface AlertDialogCoreProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
}

export type DrawerSide = "left" | "right" | "bottom" | "full";

/** Props for the Drawer component. */
export interface DrawerCoreProps {
  modal?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  hideClose?: boolean;
}

export interface TimelineMilestone {
  id: string;
  timestamp: Date | string;
  title: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  action?: ReactNode;
  status?: "completed" | "current" | "upcoming";
}

/** Props for the Timeline (marcos de uma jornada). */
export interface TimelineCoreProps {
  items: TimelineMilestone[];
  title?: ReactNode;
  description?: ReactNode;
  orientation?: "vertical" | "horizontal";
  locale?: string;
  timezone?: string;
  emptyMessage?: ReactNode;
}

export interface TimelineEventCore {
  id: string;
  timestamp: Date | string;
  title: ReactNode;
  description?: ReactNode;
  actor?: ActivityActorCore;
  icon?: ReactNode;
  metadata?: ReactNode;
  status?: { label: ReactNode; tone?: StatusDotTone; pulse?: boolean };
  badge?: { label: ReactNode; tone?: BadgeTone };
  action?: ReactNode;
}

/** Props for the EventTimeline (histórico de atividades), sem a lista de eventos. */
export interface EventTimelineCoreProps {
  title?: ReactNode;
  context?: ReactNode;
  locale?: string;
  timezone?: string;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: ReactNode;
  emptyMessage?: ReactNode;
  density?: "default" | "compact";
  showHeader?: boolean;
  groupByDate?: boolean;
}

export type PropertyCardLayout = "grid" | "list" | "deck";
export interface PropertyCardBadge { label: ReactNode; tone?: BadgeTone }
export interface PropertyCardFact { label: string; value: ReactNode }

/** Props for the PropertyCard component, sem `mediaProps` e `actions`. */
export interface PropertyCardCoreProps {
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  valueSuffix?: ReactNode;
  address?: ReactNode;
  price?: ReactNode;
  priceSuffix?: ReactNode;
  media: { src: string; alt: string }[];
  layout?: PropertyCardLayout;
  matchScore?: number;
  badges?: PropertyCardBadge[];
  facts?: PropertyCardFact[];
  summary?: ReactNode;
  headerAction?: ReactNode;
  detailsAction?: ReactNode;
}

export interface MatrixPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  prioritized?: boolean;
}

/** Props for the Matrix2x2 component. */
export interface Matrix2x2CoreProps {
  points: MatrixPoint[];
  xLabel?: string;
  yLabel?: string;
  quadrants?: { topLeft?: ReactNode; topRight?: ReactNode; bottomLeft?: ReactNode; bottomRight?: ReactNode };
  legend?: [string, string];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onPointClick?: (point: MatrixPoint | null) => void;
}
