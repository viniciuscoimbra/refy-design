"use client";
import { useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Drawer,
  Input,
  KanbanBoard,
  Modal,
  PageHeader,
  Segmented,
  Select,
} from "../index";
import type { KanbanColumnItem } from "../index";
import { photos } from "./photos";
import styles from "./TaskBoardBlock.module.css";

const searchIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
type Priority = "High" | "Normal";
interface Task {
  id: string;
  title: string;
  description: string;
  owner: string;
  priority: Priority;
  due: string;
}
const people: Record<string, string> = { AL: "Ana Lima", BR: "Bruno Reis", CD: "Clara Dias" };
const faces: Record<string, string> = { AL: photos.personAna, BR: photos.personBruno, CD: photos.personClara };
const initialTasks: Record<string, Task> = {
  copy: { id: "copy", title: "Review the home page copy", description: "Check titles and calls to action with the brand team.", owner: "CD", priority: "High", due: "Nov 8" },
  hero: { id: "hero", title: "Hero images", description: "Export the three versions of the main illustration.", owner: "BR", priority: "Normal", due: "Nov 11" },
  pricing: { id: "pricing", title: "Pricing table", description: "Build the comparison between the three plans.", owner: "AL", priority: "High", due: "Nov 7" },
  forms: { id: "forms", title: "Contact form", description: "Validate fields and the error message.", owner: "BR", priority: "Normal", due: "Nov 9" },
  seo: { id: "seo", title: "Titles and descriptions", description: "Write the title and description for each page.", owner: "CD", priority: "Normal", due: "Nov 12" },
  domain: { id: "domain", title: "Point the domain", description: "Set up DNS and certificate.", owner: "AL", priority: "Normal", due: "Nov 4" },
};
const layout: Array<{ id: string; title: string; color: string; ids: string[] }> = [
  { id: "todo", title: "To do", color: "var(--outline)", ids: ["seo", "hero"] },
  { id: "doing", title: "Doing", color: "var(--info)", ids: ["pricing", "forms"] },
  { id: "review", title: "In review", color: "var(--weak)", ids: ["copy"] },
  { id: "done", title: "Done", color: "var(--good)", ids: ["domain"] },
];

export function TaskBoardBlock() {
  const [tasks, setTasks] = useState(initialTasks),
    [order, setOrder] = useState(() => Object.fromEntries(layout.map((column) => [column.id, column.ids]))),
    [scope, setScope] = useState("all"),
    [query, setQuery] = useState(""),
    [open, setOpen] = useState<string>(),
    [creating, setCreating] = useState<string>(),
    [draft, setDraft] = useState({ title: "", owner: "AL", priority: "Normal" as Priority });
  const card = (task: Task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    meta: (
      <>
        <Badge tone={task.priority === "High" ? "warn" : "neutral"}>{task.priority}</Badge>
        <span>{task.due}</span>
      </>
    ),
    footer: (
      <span className={styles.owner}>
        <Avatar size="xs" src={faces[task.owner]} initials={task.owner} alt="" />
        {people[task.owner].split(" ")[0]}
      </span>
    ),
  });
  const columns: KanbanColumnItem[] = layout.map((column) => ({
    id: column.id,
    title: column.title,
    color: column.color,
    items: order[column.id].map((id) => card(tasks[id])),
  }));
  const selected = open ? tasks[open] : undefined;
  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Project"
        title="Site launch"
        lead="Six tasks until publishing, due November 12."
        actions={
          <div className={styles.headerActions}>
            <AvatarGroup items={Object.entries(people).map(([initials, name]) => ({ name, initials, src: faces[initials] }))} />
            <Button variant="primary" onClick={() => setCreating("todo")}>
              New task
            </Button>
          </div>
        }
      />
      <KanbanBoard
        ariaLabel="Launch tasks"
        instructions="hidden"
        columns={columns}
        onColumnsChange={(next) => setOrder(Object.fromEntries(next.map((column) => [column.id, column.items.map((item) => item.id)])))}
        onCardClick={(item) => setOpen(item.id)}
        onAddCard={(column) => setCreating(column.id)}
        filter={(item) => {
          const task = tasks[item.id];
          return (scope === "all" || task.owner === "AL") && task.title.toLocaleLowerCase().includes(query.toLocaleLowerCase());
        }}
        toolbar={
          <div className={styles.toolbar}>
            <Input aria-label="Search task" prefix={searchIcon} placeholder="Search task…" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Segmented label="Show" value={scope} onChange={setScope} options={[{ value: "all", label: "All" }, { value: "mine", label: "Mine" }]} />
          </div>
        }
      />
      <Drawer open={Boolean(selected)} onOpenChange={(value) => !value && setOpen(undefined)} title={selected?.title}>
        {selected && (
          <dl className={styles.details}>
            <dt>Owner</dt>
            <dd>{people[selected.owner]}</dd>
            <dt>Priority</dt>
            <dd>{selected.priority}</dd>
            <dt>Due date</dt>
            <dd>{selected.due}</dd>
            <dt>Description</dt>
            <dd>{selected.description}</dd>
          </dl>
        )}
      </Drawer>
      <Modal open={Boolean(creating)} onClose={() => setCreating(undefined)} title="New task">
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            const title = draft.title.trim();
            if (!title || !creating) return;
            const id = `task-${Object.keys(tasks).length + 1}`;
            setTasks((rows) => ({ ...rows, [id]: { id, title, description: "Created just now.", owner: draft.owner, priority: draft.priority, due: "No deadline" } }));
            setOrder((rows) => ({ ...rows, [creating]: [...rows[creating], id] }));
            setDraft({ title: "", owner: "AL", priority: "Normal" });
            setCreating(undefined);
          }}
        >
          <Input label="Title" value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} required block />
          <Select label="Owner" value={draft.owner} onChange={(event) => setDraft((value) => ({ ...value, owner: event.target.value }))}>
            {Object.entries(people).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Segmented label="Priority" value={draft.priority} onChange={(value) => setDraft((current) => ({ ...current, priority: value as Priority }))} options={[{ value: "Normal", label: "Normal" }, { value: "High", label: "High" }]} />
          <Button type="submit" variant="primary">
            Create task
          </Button>
        </form>
      </Modal>
    </div>
  );
}
