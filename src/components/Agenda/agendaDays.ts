import type { AgendaEvent } from "../../contracts/display";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export interface AgendaDay {
  key: string;
  date: Date;
  events: { event: AgendaEvent; allDay: boolean; start: Date; end?: Date }[];
}

/** Chave AAAA-MM-DD de um instante no fuso pedido. */
export function dayKey(date: Date, timeZone?: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Agrupa por dia no fuso pedido e ordena: dia todo antes, depois por hora de início.
 * Data sem hora vale o dia escrito, sem conversão de fuso. `from` e `to` (AAAA-MM-DD) incluem
 * os dias vazios do intervalo.
 */
export function groupAgenda(events: AgendaEvent[], timeZone?: string, from?: string, to?: string): AgendaDay[] {
  const days = new Map<string, AgendaDay>();
  // Com from e to, cada dia do intervalo aparece, mesmo sem compromisso (no máximo 62 dias).
  if (from && to && DATE_ONLY.test(from) && DATE_ONLY.test(to)) {
    const cursor = new Date(`${from}T12:00:00Z`);
    const last = new Date(`${to}T12:00:00Z`).getTime();
    for (let n = 0; n < 62 && cursor.getTime() <= last; n++) {
      const key = cursor.toISOString().slice(0, 10);
      days.set(key, { key, date: new Date(cursor), events: [] });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  for (const event of events) {
    const dateOnly = typeof event.start === "string" && DATE_ONLY.test(event.start);
    // Meio-dia UTC: o dia escrito não muda em nenhum fuso entre -12 e +12.
    const start = dateOnly ? new Date(`${event.start}T12:00:00Z`) : new Date(event.start);
    if (Number.isNaN(start.getTime())) continue;
    const key = dateOnly ? (event.start as string) : dayKey(start, timeZone);
    const end = event.end === undefined ? undefined : new Date(event.end);
    const day = days.get(key) ?? { key, date: new Date(`${key}T12:00:00Z`), events: [] };
    day.events.push({ event, allDay: dateOnly || Boolean(event.allDay), start, end: end && !Number.isNaN(end.getTime()) ? end : undefined });
    days.set(key, day);
  }
  return [...days.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((day) => ({
      ...day,
      events: day.events.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime()),
    }));
}
