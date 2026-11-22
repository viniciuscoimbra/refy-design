// Contratos das peças de exibição que respondem a uma pergunta com dado pronto: nota, citação,
// lista de rótulo e valor, comparação, agenda e cartão de item. A web e o nativo implementam igual.
import type { ReactNode } from "react";

export type RatingSize = "sm" | "md" | "lg";

/** Props for the Rating component. */
export interface RatingCoreProps {
  /** Accessible name. E.g. "Restaurant rating" or "Your rating". */
  label: string;
  /** Controlled rating, from 0 to `max`. Read-only accepts fractions (4.5); picking uses whole stars. */
  value?: number;
  /** Initial rating (uncontrolled). */
  defaultValue?: number;
  /** Called with the chosen rating. Without it and without `readOnly`, the rating still changes internally. */
  onChange?: (value: number) => void;
  /** Number of stars. Default 5. */
  max?: number;
  /** Only shows the rating; takes no focus or taps. */
  readOnly?: boolean;
  /** Number of reviews, shown alongside (e.g. 128). */
  count?: number;
  /** Shows the rating as a number next to the stars. Default `true` when `readOnly`. */
  showValue?: boolean;
  /** Star size. Default "md". */
  size?: RatingSize;
  /** Turns off picking. */
  disabled?: boolean;
  /** Shows `label` as visible text above the stars. Default `false`: the label is only read aloud. */
  showLabel?: boolean;
}

export type QuoteVariant = "block" | "pull";

/** Props for the Quote component. */
export interface QuoteCoreProps {
  /** The quoted text, without quotation marks: the component draws the mark. */
  children: ReactNode;
  /** Who said it. */
  author?: ReactNode;
  /** Role, company or source work. E.g. "Customer since 2021". */
  source?: ReactNode;
  /** Photo of the author (URL). Without it, the initials of `author` when it is text. */
  avatar?: string;
  /** "block" for a quotation in the body text; "pull" for a testimonial in the spotlight. Default "block". */
  variant?: QuoteVariant;
}

/** One label and value row. */
export interface KeyValueItem {
  /** Stable key. Default: the position. */
  id?: string;
  label: ReactNode;
  value: ReactNode;
  /** Short note under the value. E.g. "includes shipping". */
  hint?: ReactNode;
}

export type KeyValueListLayout = "rows" | "columns";

/** Props for the KeyValueList component. */
export interface KeyValueListCoreProps {
  items: KeyValueItem[];
  /** "rows": label on the left and value on the right; "columns": grid of pairs, label on top. Default "rows". */
  layout?: KeyValueListLayout;
  /** Line between pairs. Default `true` in "rows". */
  dividers?: boolean;
  /** Heading above the pairs, which also names the list. E.g. "Order #48213". */
  title?: ReactNode;
}

/** Value of a comparison cell: true (has it), false (does not) or text. */
export type ComparisonValue = boolean | ReactNode;

/** One comparison row: the criterion and one value per option, in the order of `options`. */
export interface ComparisonRow {
  id?: string;
  feature: ReactNode;
  values: ComparisonValue[];
  /** Short explanation of the criterion, under its name. */
  hint?: ReactNode;
}

/** Props for the ComparisonTable component. */
export interface ComparisonTableCoreProps {
  /** Name of each option, in column order. */
  options: string[];
  rows: ComparisonRow[];
  /** Index of the recommended option in `options` (0 is the first). */
  highlight?: number;
  /** Badge of the recommended option. Default "Recommended", in the active language. */
  highlightLabel?: string;
  /** Accessible title of the table. */
  caption: string;
}

export type AgendaTone = "primary" | "info" | "good" | "warn" | "critical" | "neutral";

/** One agenda event. */
export interface AgendaEvent {
  id: string;
  title: ReactNode;
  /** Start, as ISO 8601 or Date. A date with no time ("2026-11-21") is all day. */
  start: string | Date;
  /** End, as ISO 8601 or Date. */
  end?: string | Date;
  /** Marks the event as all day even when `start` has a time. */
  allDay?: boolean;
  /** Place or meeting link. */
  location?: ReactNode;
  description?: ReactNode;
  /** Color of the bar on the left. Default "primary". */
  tone?: AgendaTone;
}

/** Props for the Agenda component. */
export interface AgendaCoreProps {
  events: AgendaEvent[];
  /** Accessible title of the agenda. */
  label?: string;
  /** Language of the dates. Default: the active language. */
  locale?: string;
  /** Time zone of the dates, e.g. "America/Sao_Paulo". Default: the device's zone. */
  timezone?: string;
  /** Called when an event is chosen. Without it, rows are not clickable. */
  onEventClick?: (event: AgendaEvent) => void;
  /** Text when there are no events. */
  emptyMessage?: ReactNode;
  /** Heading of the card. E.g. "This week". */
  title?: ReactNode;
  /** First day to show, "YYYY-MM-DD". With `to`, days without events show "Nothing scheduled". */
  from?: string;
  /** Last day to show, "YYYY-MM-DD". Up to 62 days after `from`. */
  to?: string;
}

export type EntityCardLayout = "vertical" | "horizontal";
export type EntityCardBadgeTone = "success" | "info" | "warn" | "danger" | "neutral";

/** One card action. The first is the main one. */
export interface EntityCardAction {
  label: string;
  onClick?: () => void;
  /** Link instead of a click handler. */
  href?: string;
}

/** Props for the EntityCard component. */
export interface EntityCardCoreProps {
  /** Name of the product, place, person or listing. */
  title: ReactNode;
  /** Line under the title. E.g. neighborhood or job title. */
  subtitle?: ReactNode;
  /** Small label above the title, next to the badge when there is no photo. E.g. "Backpacks". */
  category?: ReactNode;
  description?: ReactNode;
  /** Photo (URL). */
  image?: string;
  /** Alternative text of the photo; empty when it is only decorative. */
  imageAlt?: string;
  /** Price or value in the spotlight. E.g. "$89". */
  price?: ReactNode;
  /** Short line of details. E.g. "2 bedrooms · 690 sq ft". */
  meta?: ReactNode;
  /** Badge over the photo, or above the title when there is no photo. E.g. "New". */
  badge?: string;
  badgeTone?: EntityCardBadgeTone;
  /** Rating from 0 to 5 with the number of reviews. */
  rating?: { value: number; count?: number };
  /** Up to three actions; the first is the main one. */
  actions?: EntityCardAction[];
  /** "vertical": photo on top; "horizontal": photo on the left. Default "vertical". */
  layout?: EntityCardLayout;
}
