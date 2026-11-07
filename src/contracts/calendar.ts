// Contratos do Calendar e do DatePicker: o que a web e o nativo implementam igual.

export type CalendarMode = "single" | "range";

/** Intervalo de datas (modo `range`). */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/** Props for the Calendar date picker. */
export interface CalendarCoreProps {
  mode?: CalendarMode;
  value?: Date | null | DateRange;
  defaultValue?: Date | null | DateRange;
  onChange?: (value: Date | DateRange) => void;
  numberOfMonths?: 1 | 2;
  fixedWeeks?: boolean;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  min?: Date;
  max?: Date;
  weekStartsOn?: 0 | 1;
  locale?: string;
  monthLabelStyle?: "long" | "compact";
}

/** Props for the DatePicker field. */
export interface DatePickerCoreProps {
  label: string;
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
}
