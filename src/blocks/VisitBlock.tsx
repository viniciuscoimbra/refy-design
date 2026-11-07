"use client";
import { useState } from "react";
import { Avatar, Badge, Button, Callout, PageHeader, PropertyMedia, VisitSchedulePicker } from "../index";
import type { VisitAvailability } from "../index";
import { photos } from "./photos";
import styles from "./VisitBlock.module.css";

const gallery = [
  { src: photos.homeQuiet, alt: "Living room with a large window onto the trees" },
  { src: photos.homeBalcony, alt: "Building front with balconies and plants" },
  { src: photos.homeStudio, alt: "Bright bedroom with rug and lamp" },
];
const busy: VisitAvailability = { "2026-11-12": ["09:00", "09:30", "14:00"], "2026-11-13": ["10:00", "10:30"] };

export function VisitBlock() {
  const [times, setTimes] = useState<VisitAvailability>({ "2026-11-12": ["18:00", "18:30"], "2026-11-14": ["10:00", "10:30", "11:00"] });
  const [sent, setSent] = useState(false);
  const days = Object.entries(times).filter(([, slots]) => slots.length).sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className={styles.page}>
      <PageHeader title="When can you visit?" lead="Mark every time you can go. Ana, who manages this home, picks one and confirms by message." />
      <div className={styles.layout}>
        <section className={styles.picker} aria-label="Your times">
          <VisitSchedulePicker
            value={times}
            onChange={(next) => { setTimes(next); setSent(false); }}
            defaultActiveDate={new Date(2026, 10, 12)}
            minDate={new Date(2026, 10, 6)}
            maxDate={new Date(2026, 11, 20)}
            unavailable={busy}
            disabled={sent}
          />
        </section>
        <aside className={styles.aside}>
          <article className={styles.home}>
            <PropertyMedia items={gallery} aspectRatio="4 / 3" />
            <div className={styles.homeBody}>
              <Badge tone="success">Pets allowed</Badge>
              <h2>Back-facing, no noise</h2>
              <p>Rua Cardoso de Almeida, Perdizes · 2 bedrooms · 72 m²</p>
              <strong>R$ 3.100 <span>/mo</span></strong>
            </div>
          </article>
          <section className={styles.summary} aria-label="Times summary">
            <div className={styles.host}>
              <Avatar size="md" src={photos.personAna} alt="" initials="AN" />
              <div>
                <strong>Ana Moreira</strong>
                <span>Usually replies in about 2 hours</span>
              </div>
            </div>
            <p className={styles.note}>
              {days.length ? `${days.reduce((sum, [, slots]) => sum + slots.length, 0)} time slots on ${days.length} ${days.length === 1 ? "day" : "days"}. The more options, the faster she confirms.` : "Mark at least one time on the calendar."}
            </p>
            {sent ? (
              <Callout tone="success" title="Times sent">
                Ana will pick one and let you know. You can change them until she confirms.
              </Callout>
            ) : null}
            {sent ? (
              <Button variant="secondary" onClick={() => setSent(false)}>Change times</Button>
            ) : (
              <Button variant="primary" disabled={!days.length} onClick={() => setSent(true)}>
                Send times to Ana
              </Button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
