"use client";
import { useState } from "react";
import { Badge, Button, Calendar, EmptyState, Input, Item, Modal, PageHeader, Segmented, useLocale } from "../index";
import styles from "./AgendaBlock.module.css";

type Kind = "meeting" | "focus" | "personal";
interface Appointment {
  id: string;
  day: number;
  start: string;
  end: string;
  title: string;
  place: string;
  kind: Kind;
}
const month = (day: number) => new Date(2026, 10, day);
const initial: Appointment[] = [
  { id: "a1", day: 5, start: "09:00", end: "09:30", title: "Quick team chat", place: "Garden Room", kind: "meeting" },
  { id: "a2", day: 5, start: "10:00", end: "12:00", title: "Write the proposal", place: "No interruptions", kind: "focus" },
  { id: "a3", day: 5, start: "14:30", end: "15:30", title: "Review with Clara", place: "Video call", kind: "meeting" },
  { id: "a4", day: 5, start: "18:30", end: "19:30", title: "Run in the park", place: "Ibirapuera", kind: "personal" },
  { id: "a5", day: 6, start: "11:00", end: "12:00", title: "Client presentation", place: "Lookout Room", kind: "meeting" },
  { id: "a6", day: 9, start: "08:30", end: "10:30", title: "Plan the week", place: "No interruptions", kind: "focus" },
];
const kinds: { id: Kind; label: string; tone: "info" | "success" | "neutral" }[] = [
  { id: "meeting", label: "Meeting", tone: "info" },
  { id: "focus", label: "Focus", tone: "success" },
  { id: "personal", label: "Personal", tone: "neutral" },
];
const kindOf = (id: Kind) => kinds.find((kind) => kind.id === id)!;
const minutes = (time: string) => {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};
const firstHour = 8;
const lastHour = 20;
const hourHeight = 52;
const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i);

export function AgendaBlock() {
  const [items, setItems] = useState(initial),
    [day, setDay] = useState(5),
    [creating, setCreating] = useState(false),
    [draft, setDraft] = useState({ title: "", start: "16:00", end: "17:00", kind: "meeting" as Kind });
  const locale = useLocale();
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" });
  const shortDay = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric" });
  const dayAndMonth = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const today = items.filter((item) => item.day === day).sort((a, b) => a.start.localeCompare(b.start));
  const busy = today.reduce((sum, item) => sum + minutes(item.end) - minutes(item.start), 0);
  const upcoming = items.filter((item) => item.day > day).sort((a, b) => a.day - b.day || a.start.localeCompare(b.start)).slice(0, 3);
  return (
    <div className={styles.page}>
      <PageHeader
        title="Calendar"
        lead={`${weekday.format(month(day))} · ${today.length} ${today.length === 1 ? "event" : "events"} · ${Math.floor(busy / 60)}h${busy % 60 ? String(busy % 60).padStart(2, "0") : ""} booked`}
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            New event
          </Button>
        }
      />
      <div className={styles.layout}>
        <aside className={styles.aside}>
          <Calendar
            value={month(day)}
            defaultMonth={month(1)}
            onChange={(value) => value instanceof Date && setDay(value.getDate())}
            min={month(1)}
            max={month(30)}
            weekStartsOn={0}
          />
          <section className={styles.upcoming} aria-label="Next days">
            <h2>Next days</h2>
            {upcoming.length === 0 ? (
              <p className={styles.muted}>Nothing scheduled after this day.</p>
            ) : (
              upcoming.map((item) => (
                <Item
                  key={item.id}
                  title={item.title}
                  description={`${shortDay.format(month(item.day))} · ${item.start}`}
                  onClick={() => setDay(item.day)}
                  actions={<Badge tone={kindOf(item.kind).tone}>{kindOf(item.kind).label}</Badge>}
                />
              ))
            )}
          </section>
        </aside>
        <section className={styles.day} aria-label="Events of the day">
          <div className={styles.legend}>
            {kinds.map((kind) => (
              <Badge key={kind.id} tone={kind.tone} dot>
                {kind.label}: {today.filter((item) => item.kind === kind.id).length}
              </Badge>
            ))}
          </div>
          {today.length === 0 ? (
            <EmptyState bordered title="Free day" message="No events on this day." action={<Button onClick={() => setCreating(true)}>Schedule event</Button>} />
          ) : (
            <div className={styles.timeline}>
              <ol className={styles.hours} aria-hidden="true">
                {hours.map((hour) => (
                  <li key={hour}>{String(hour).padStart(2, "0")}:00</li>
                ))}
              </ol>
              <ol className={styles.events}>
                {today.map((item) => {
                  const top = ((minutes(item.start) - firstHour * 60) / 60) * hourHeight;
                  const height = Math.max(((minutes(item.end) - minutes(item.start)) / 60) * hourHeight - 4, 28);
                  return (
                    <li key={item.id} className={`${styles.event} ${styles[item.kind]} ${minutes(item.end) - minutes(item.start) <= 60 ? styles.compact : ""}`} style={{ top, height }}>
                      <strong>{item.title}</strong>
                      <span>
                        {item.start}–{item.end} · {item.place}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </section>
      </div>
      <Modal open={creating} onClose={() => setCreating(false)} title="New event">
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            const title = draft.title.trim();
            if (!title || draft.end <= draft.start) return;
            setItems((rows) => [...rows, { id: `a${rows.length + 1}`, day, place: "To be decided", ...draft, title }]);
            setDraft({ title: "", start: "16:00", end: "17:00", kind: "meeting" });
            setCreating(false);
          }}
        >
          <Input label="What" value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} required block />
          <div className={styles.two}>
            <Input label="Starts" type="time" value={draft.start} onChange={(event) => setDraft((value) => ({ ...value, start: event.target.value }))} required />
            <Input label="Ends" type="time" value={draft.end} onChange={(event) => setDraft((value) => ({ ...value, end: event.target.value }))} required />
          </div>
          <Segmented label="Type" value={draft.kind} onChange={(value) => setDraft((current) => ({ ...current, kind: value as Kind }))} options={kinds.map((kind) => ({ value: kind.id, label: kind.label }))} />
          <Button type="submit" variant="primary">
            Schedule on {dayAndMonth.format(month(day))}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
