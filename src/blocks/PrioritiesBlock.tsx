"use client";
import { useState } from "react";
import { Avatar, Badge, Button, Item, Matrix2x2, PageHeader, ScoreGauge } from "../index";
import type { MatrixPoint } from "../index";
import { photos } from "./photos";
import styles from "./PrioritiesBlock.module.css";

type Idea = MatrixPoint & { owner: string; face: string; weeks: number; confidence: number; why: string };

const people = { ana: ["Ana", photos.personAna], bruno: ["Bruno", photos.personBruno], clara: ["Clara", photos.personClara] } as const;
const idea = (id: string, label: string, x: number, y: number, who: keyof typeof people, weeks: number, confidence: number, why: string, prioritized = false): Idea => ({
  id, label, x, y, prioritized, owner: people[who][0], face: people[who][1], weeks, confidence, why,
});
// A matriz numera pela ordem da lista: mais impacto por semana vem primeiro.
const start: Idea[] = [
  idea("pix", "Pix payment for subscriptions", 30, 88, "bruno", 2, 86, "A third of cancellations happen on a declined card.", true),
  idea("onboarding", "Three-step onboarding", 42, 74, "ana", 3, 72, "Half of new accounts never reach their first project.", true),
  idea("export", "Export report as PDF", 22, 46, "clara", 1, 90, "Requested by 14 customers last month.", true),
  idea("app", "Mobile app", 88, 82, "bruno", 12, 54, "Mobile usage grew, but it is still 18% of the total."),
  idea("sso", "Sign in with a company account", 64, 60, "clara", 5, 68, "Blocks three large deals in negotiation."),
  idea("themes", "Dark theme", 36, 22, "ana", 2, 80, "Frequent request, little effect on retention."),
  idea("api", "Public API", 78, 40, "bruno", 8, 45, "Two partners asked, none signed a letter of intent."),
].sort((a, b) => b.y / b.weeks - a.y / a.weeks);

export function PrioritiesBlock() {
  const [ideas, setIdeas] = useState(start);
  const [selectedId, setSelectedId] = useState<string | null>("sso");
  const selected = ideas.find((row) => row.id === selectedId) ?? null;
  const picked = ideas.filter((row) => row.prioritized);
  const weeks = picked.reduce((sum, row) => sum + row.weeks, 0);
  const toggle = (id: string) => setIdeas((rows) => rows.map((row) => (row.id === id ? { ...row, prioritized: !row.prioritized } : row)));
  return (
    <div className={styles.page}>
      <PageHeader title="Quarter priorities" lead="Seven ideas, twelve team weeks. Tap a point to see the reason and decide whether it goes in." actions={<Badge tone={weeks > 12 ? "danger" : "info"}>{weeks} of 12 weeks</Badge>} />
      <div className={styles.layout}>
        <section className={styles.matrix} aria-label="Impact and effort">
          <Matrix2x2
            points={ideas}
            selectedId={selectedId}
            onPointClick={(point) => setSelectedId(point?.id ?? null)}
            quadrants={{ topLeft: "Do now", topRight: "Plan", bottomLeft: "Fit in", bottomRight: "Avoid" }}
          />
          <section className={styles.picked} aria-label="All ideas, in order">
            <h2>Ordered by impact per week</h2>
            <ol>
              {ideas.map((row, index) => (
                <li key={row.id}>
                  <Item
                    title={`${index + 1}. ${row.label}`}
                    description={`${row.owner} · ${row.weeks} ${row.weeks === 1 ? "week" : "weeks"}`}
                    media={<Avatar size="sm" src={row.face} alt="" initials={row.owner.slice(0, 2)} />}
                    actions={row.prioritized ? <Badge tone="success">In the quarter</Badge> : undefined}
                    onClick={() => setSelectedId(row.id)}
                    selected={row.id === selectedId}
                  />
                </li>
              ))}
            </ol>
          </section>
        </section>
        <aside className={styles.aside}>
          {selected ? (
            <section className={styles.detail} aria-live="polite">
              <div className={styles.detailHead}>
                <ScoreGauge value={selected.confidence} size="md" label="Confidence" okAt={70} warnAt={50} />
                <div>
                  <h2>{selected.label}</h2>
                  <p>{selected.why}</p>
                </div>
              </div>
              <dl className={styles.facts}>
                <div><dt>Impact</dt><dd>{selected.y}</dd></div>
                <div><dt>Effort</dt><dd>{selected.weeks} {selected.weeks === 1 ? "week" : "weeks"}</dd></div>
                <div>
                  <dt>Owner</dt>
                  <dd className={styles.owner}><Avatar size="sm" src={selected.face} alt="" initials={selected.owner.slice(0, 2)} />{selected.owner}</dd>
                </div>
              </dl>
              <Button variant={selected.prioritized ? "secondary" : "primary"} onClick={() => toggle(selected.id)}>
                {selected.prioritized ? "Remove from the quarter" : "Add to the quarter"}
              </Button>
            </section>
          ) : (
            <p className={styles.hint}>Pick a point in the matrix.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
