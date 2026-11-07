import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { CalendarCoreProps, CalendarMode, DateRange } from "@refy-design/web/contracts";
import { useRefy } from "../theme";
import { hitSlopFor } from "../primitives";

export type { CalendarMode, DateRange };
export interface CalendarProps extends CalendarCoreProps {
  style?: StyleProp<ViewStyle>;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const isRange = (v: unknown): v is DateRange => !!v && typeof v === "object" && "start" in (v as object);

/** Rótulo do mês igual ao da web: "Outubro de 2026" (long) ou "Outubro 2026" (compact). */
export function calendarMonthLabel(base: Date, locale: string, style: "long" | "compact") {
  const format = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const s = style === "compact"
    ? format.formatToParts(base).filter((part) => part.type === "month" || part.type === "year").map((part) => part.value).join(" ")
    : format.format(base);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Dias da grade do mês, começando no domingo ou na segunda, como na web. */
export function calendarCells(base: Date, weekStartsOn: 0 | 1, fixedWeeks: boolean) {
  const first = firstOfMonth(base);
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  const daysInMonth = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const count = fixedWeeks ? 42 : Math.ceil((offset + daysInMonth) / 7) * 7;
  return Array.from({ length: count }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
}

/** Seleção de range igual à da web: 1º toque fixa o início, 2º toque (≥ início) fixa o fim. */
export function nextRange(range: DateRange, day: Date): DateRange {
  if (!range.start || range.end) return { start: day, end: null };
  if (day < range.start) return { start: day, end: null };
  return { start: range.start, end: day };
}

const Chevron = ({ d, color }: { d: string; color: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d={d} /></Svg>
);

/**
 * Calendário de um dia ou de um intervalo. Mesmo contrato e mesmas regras da web; no toque
 * cada dia é um alvo de 44 pt (a web usa 36), então o mês ocupa 308 pt em vez de 252.
 */
export function Calendar({ mode = "single", value, defaultValue, onChange, numberOfMonths = 1, fixedWeeks = true, month, defaultMonth, onMonthChange, min, max, weekStartsOn = 0, locale = "pt-BR", monthLabelStyle = "long", style }: CalendarProps) {
  const t = useRefy();
  const [singleInternal, setSingleInternal] = useState<Date | null>(mode === "single" && defaultValue instanceof Date ? defaultValue : null);
  const [rangeInternal, setRangeInternal] = useState<DateRange>(mode === "range" && isRange(defaultValue) ? defaultValue : { start: null, end: null });
  const single = value !== undefined && value instanceof Date ? value : value === null ? null : singleInternal;
  const range = value !== undefined && isRange(value) ? value : rangeInternal;
  const anchor = mode === "range" ? range.start : single;
  const [viewInternal, setViewInternal] = useState(firstOfMonth(defaultMonth ?? anchor ?? new Date()));
  const view = month ? firstOfMonth(month) : viewInternal;
  const today = startOfDay(new Date());
  const minD = min ? startOfDay(min) : null;
  const maxD = max ? startOfDay(max) : null;
  const isDisabled = (d: Date) => (minD && d < minD) || (maxD && d > maxD) || false;

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + ((i + weekStartsOn) % 7));
      return new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(d);
    });
  }, [locale, weekStartsOn]);
  const dayName = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), [locale]);

  const setView = (next: Date) => { if (!month) setViewInternal(next); onMonthChange?.(next); };
  const select = (d: Date) => {
    if (isDisabled(d)) return;
    const day = startOfDay(d);
    if (mode === "single") { if (value === undefined) setSingleInternal(day); onChange?.(day); return; }
    const next = nextRange(range, day);
    if (value === undefined) setRangeInternal(next);
    onChange?.(next);
  };
  const dayState = (d: Date) => {
    if (mode === "single") return { isSel: sameDay(d, single), isStart: false, isEnd: false, inBand: false };
    const isStart = sameDay(d, range.start);
    const isEnd = sameDay(d, range.end);
    const inBand = !!range.start && !!range.end && d > startOfDay(range.start) && d < startOfDay(range.end);
    return { isSel: isStart || isEnd, isStart, isEnd: isEnd && !!range.end, inBand };
  };

  const ink1 = t.pick<string>("--ink-1");
  const navSize = t.pick<number>("--calendar-nav-size", 30);
  const daySize = t.pick<number>("--calendar-day-size", 30);
  const cell = 44;
  const sm = t.pick<number>("--text-sm", 13);
  const soft = t.pick<string>("--primary-soft");
  const line = t.pick<string>("--line");

  const nav = (label: string, d: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={hitSlopFor(navSize, navSize)}
      style={({ pressed }) => ({
        width: navSize, height: navSize, alignItems: "center", justifyContent: "center",
        borderWidth: t.pick<number>("--calendar-nav-border-width", "--surface-border-width", 1),
        borderColor: pressed ? t.pick<string>("--legacy-line-strong", "--line") : line,
        borderRadius: t.pick<number>("--calendar-control-radius", 7),
        backgroundColor: pressed ? t.pick<string>("--legacy-surface-hover", "--surface-2") : t.pick<string>("--surface"),
        boxShadow: t.pick<string>("--control-shadow", "none") === "none" ? undefined : t.pick<string>("--control-shadow"),
      })}
    >
      <Chevron d={d} color={t.pick<string>("--ink-2")} />
    </Pressable>
  );

  const renderMonth = (base: Date, mi: number) => (
    <View key={mi} style={{ width: 7 * cell, maxWidth: "100%" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        {mi === 0 ? nav("Mês anterior", "m15 18-6-6 6-6", () => setView(addMonths(view, -1))) : <View style={{ width: navSize, height: navSize }} />}
        <Text accessibilityRole="header" style={{ flex: 1, textAlign: t.pick<string>("--calendar-label-align", "center") as "center", color: ink1, fontSize: t.pick<number>("--calendar-month-size", "--text-base", 14), letterSpacing: -0.01 * 14, ...t.font("--font-body", 600) }}>
          {calendarMonthLabel(base, locale, monthLabelStyle)}
        </Text>
        {mi === numberOfMonths - 1 ? nav("Próximo mês", "m9 18 6-6-6-6", () => setView(addMonths(view, 1))) : <View style={{ width: navSize, height: navSize }} />}
      </View>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: "row", marginBottom: 4 }}>
        {weekdays.map((w, i) => {
          const size = t.pick<number>("--calendar-weekday-size", 10);
          return <Text key={i} style={{ flex: 1, textAlign: "center", paddingVertical: 4, color: t.pick<string>("--ink-3"), fontSize: size, letterSpacing: 0.06 * size, textTransform: t.pick<string>("--interface-label-transform", "uppercase") as "uppercase", ...t.font(["--calendar-weekday-font", "--font-mono"], 500) }}>{w}</Text>;
        })}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {calendarCells(base, weekStartsOn, fixedWeeks).map((d) => {
          const outside = d.getMonth() !== base.getMonth();
          const disabled = isDisabled(d);
          const isToday = sameDay(d, today);
          const { isSel, isStart, isEnd, inBand } = dayState(d);
          const color = disabled ? t.pick<string>("--legacy-line", "--line") : isSel ? t.pick<string>("--button-primary-foreground", "--on-primary") : inBand || isToday ? t.pick<string>("--primary-ink") : outside ? t.pick<string>("--ink-4") : ink1;
          return (
            <Pressable
              key={d.toISOString()}
              accessibilityRole="button"
              accessibilityLabel={dayName.format(d)}
              accessibilityState={{ selected: isSel, disabled }}
              disabled={disabled}
              onPress={() => select(d)}
              style={{ width: `${100 / 7}%`, height: cell, alignItems: "center", justifyContent: "center" }}
            >
              {({ pressed }) => (<>
                {(inBand || (isStart && !!range.end) || isEnd) && !(isStart && isEnd) && (
                  <View style={{ position: "absolute", top: (cell - daySize) / 2, bottom: (cell - daySize) / 2, left: isStart ? "50%" : 0, right: isEnd ? "50%" : 0, backgroundColor: soft }} />
                )}
                <View style={{
                  width: daySize, height: daySize, alignItems: "center", justifyContent: "center",
                  borderRadius: t.pick<number>("--calendar-day-radius", "--radius-pill"),
                  backgroundColor: isSel ? (pressed ? t.pick<string>("--button-primary-background-hover", "--primary-hover") : t.pick<string>("--button-primary-background", "--primary")) : pressed && !disabled ? t.pick<string>("--legacy-neutral-soft", "--surface-2") : "transparent",
                  boxShadow: isToday && !isSel ? `inset 0 0 0 1px ${t.pick<string>("--primary")}` : undefined,
                }}>
                  <Text style={{ color, fontSize: sm, fontVariant: ["tabular-nums"], ...t.font("--font-body", isSel || isToday ? 600 : "--weight-regular") }}>{d.getDate()}</Text>
                </View>
              </>)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[{
      alignSelf: "flex-start", maxWidth: "100%", flexDirection: "row", flexWrap: "wrap", gap: 20,
      backgroundColor: t.pick<string>("--surface"),
      borderWidth: t.pick<number>("--calendar-border-width", "--surface-border-width", 1), borderColor: line,
      borderRadius: t.pick<number>("--radius-md", 10), padding: t.pick<number>("--calendar-padding", 14),
    }, style]}>
      {Array.from({ length: numberOfMonths }, (_, i) => renderMonth(addMonths(view, i), i))}
    </View>
  );
}
