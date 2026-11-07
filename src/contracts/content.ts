// Contratos de conteúdo e conta (Carousel, Message, MessageScroller, CodeBlock, BillingCard,
// PlanCard, DangerZone): o que a web e o nativo implementam igual.
import type { ReactNode } from "react";

export interface CarouselItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** Props for the Carousel component. */
export interface CarouselCoreProps {
  items: CarouselItem[];
  label?: string;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
}

/** Props for the Message row. */
export interface MessageCoreProps {
  author: string;
  initials?: string;
  time?: string;
  side?: "start" | "end";
  children: ReactNode;
}

/** Props for the MessageScroller log. */
export interface MessageScrollerCoreProps {
  children: ReactNode;
  label?: string;
  maxHeight?: number;
}

/** Props for the CodeBlock component. A cópia para a área de transferência é do app no nativo. */
export interface CodeBlockCoreProps {
  code: string;
  children?: ReactNode;
  label?: ReactNode;
  language?: string;
  secret?: boolean;
  visibleChars?: number;
  copyLabel?: string;
  copiedLabel?: string;
  revealLabel?: string;
  hideLabel?: string;
  onCopy?: (code: string) => void;
  wrap?: boolean;
}

/** Props for the BillingCard component. */
export interface BillingCardCoreProps {
  brandIcon?: ReactNode;
  methodLabel: ReactNode;
  lastDigits?: string;
  methodMeta?: ReactNode;
  status?: ReactNode;
  nextChargeLabel?: ReactNode;
  nextChargeAmount?: ReactNode;
  nextChargeDate?: ReactNode;
  actions?: ReactNode;
  elevation?: 0 | 1 | 2;
}

/** Props for the PlanCard component. */
export interface PlanCardCoreProps {
  name: ReactNode;
  price: ReactNode;
  period?: ReactNode;
  priceNote?: ReactNode;
  features?: ReactNode[];
  checkIcon?: ReactNode;
  cta?: ReactNode;
  current?: boolean;
  currentLabel?: string;
  highlighted?: boolean;
  highlightLabel?: string;
}

/** Props for the DangerZone container. */
export interface DangerZoneCoreProps {
  title?: ReactNode;
  children: ReactNode;
}

/** Props for a destructive action row inside DangerZone. */
export interface DangerZoneRowCoreProps {
  title: ReactNode;
  description?: ReactNode;
  actionLabel: ReactNode;
  onConfirm?: () => void;
  disabled?: boolean;
}
