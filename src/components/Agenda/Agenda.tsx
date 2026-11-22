import type { HTMLAttributes } from "react";
import type { AgendaCoreProps, AgendaEvent, AgendaTone } from "../../contracts/display";
import { cn } from "../../lib/cn";
import { useComponentMessages, useLocale } from "../../lib/locale";
import * as enMessages from "../../lib/messages/en";
import { groupAgenda } from "./agendaDays";
import styles from "./Agenda.module.css";

export type { AgendaEvent, AgendaTone };

/** Props for the Agenda component. */
export interface AgendaProps extends AgendaCoreProps, Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {}

/**
 * Agenda: compromissos agrupados por dia, com horário de início e fim, local e cor. Serve para
 * programação de evento, semana de trabalho ou roteiro. Para marcos sem hora, use Timeline.
 */
export function Agenda({ events, label, locale: localeProp, timezone, onEventClick, emptyMessage, title, from, to, className, ...rest }: AgendaProps) {
  const m = useComponentMessages("agenda", enMessages.agenda);
  const active = useLocale();
  const locale = localeProp ?? active;
  const days = groupAgenda(events, timezone, from, to);
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  const time = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: timezone });
  const name = label ?? (typeof title === "string" ? title : m.label);
  const DayHeading = title != null ? "h4" : "h3";
  return (
    <section aria-label={name} className={cn(styles.agenda, className)} {...rest}>
      {title != null && <h3 className={styles.heading}>{title}</h3>}
      {!days.length && <p className={styles.empty}>{emptyMessage ?? m.empty}</p>}
      {days.map((day) => {
        const dayNumber = String(day.date.getUTCDate());
        return (
          <div className={styles.day} key={day.key}>
            <DayHeading className={styles.date} aria-label={dayLabel.format(day.date)}>
              <span className={styles.weekday} aria-hidden="true">{weekday.format(day.date).replace(/\.$/, "")}</span>
              <span className={styles.dayNumber} aria-hidden="true">{dayNumber}</span>
              <span className={styles.month} aria-hidden="true">{month.format(day.date).replace(/\.$/, "")}</span>
            </DayHeading>
            {day.events.length === 0 ? (
              <p className={styles.nothing}>{m.nothing}</p>
            ) : (
              <ul className={styles.events}>
                {day.events.map(({ event, allDay, start, end }) => {
                  // Início em destaque e fim embaixo, menor; o leitor de tela ouve o intervalo inteiro.
                  const when = allDay ? (
                    <span className={styles.time}><span className={styles.start}>{m.allDay}</span></span>
                  ) : end ? (
                    <span className={styles.time}>
                      <span aria-hidden="true" className={styles.start}>{time.format(start)}</span>
                      <span aria-hidden="true" className={styles.end}>{time.format(end)}</span>
                      <span className={styles.sr}>{m.range(time.format(start), time.format(end))}</span>
                    </span>
                  ) : (
                    <span className={styles.time}><span className={styles.start}>{time.format(start)}</span></span>
                  );
                  const body = (
                    <>
                      <span className={styles.bar} aria-hidden="true" />
                      {when}
                      <span className={styles.body}>
                        <span className={styles.title}>{event.title}</span>
                        {event.location != null && (
                          <span className={styles.location}>
                            <svg className={styles.pin} viewBox="0 0 16 16" aria-hidden="true">
                              <path d="M8 14.5s4.5-4.2 4.5-7.8A4.5 4.5 0 0 0 3.5 6.7c0 3.6 4.5 7.8 4.5 7.8Z" />
                              <circle cx="8" cy="6.6" r="1.6" />
                            </svg>
                            {event.location}
                          </span>
                        )}
                        {event.description != null && <span className={styles.description}>{event.description}</span>}
                      </span>
                    </>
                  );
                  return (
                    <li key={event.id} className={cn(styles.event, styles[event.tone ?? "primary"])}>
                      {onEventClick ? (
                        <button type="button" className={styles.row} onClick={() => onEventClick(event)}>{body}</button>
                      ) : (
                        <div className={styles.row}>{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </section>
  );
}
