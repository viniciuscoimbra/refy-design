import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Input } from "../Input";
import { Menu } from "../Menu";
import { Modal } from "../Modal";
import { Select } from "../Select";
import { KanbanBoard } from "./KanbanBoard";
import { Icons } from "../../_demo/icons";
const meta = {
  id: "components-organisms-kanbanboard", title: "Components/Organisms/KanbanBoard", component: KanbanBoard, tags: ["autodocs"],
  parameters: { layout: "padded", docs: { source: { type: "code" }, description: { component: "Global/per-column WIP, colors and allowed transitions. The handle drags; the three dots open actions. Search and filters keep hidden data and the real WIP count."} } },
  args: { wipLimit: 4, columns: [
    { id: "backlog", title: "Backlog", color: "var(--outline)", items: [
      { id: "brief", title: "Prepare new project", description: "Align goals and organize the starting materials.", meta: <><Badge tone="neutral">Normal</Badge><span>Oct 26</span></>, footer: <><span>2 attachments · 3 comments</span><Avatar size="xs" initials="CL" alt="Camila Lima" /></> },
      { id: "research", title: "Gather references", description: "Research approaches for the next review.", meta: <Badge tone="neutral">Normal</Badge>, footer: <><span>1 attachment</span><Avatar size="xs" initials="BC" alt="Bruno Costa" /></> },
    ] },
    { id: "review", title: "To do", color: "var(--info)", items: [
      { id: "agency-1", title: "Review documentation", description: "Documents and owner under review.", meta: <><Badge tone="warn">High</Badge><span>Oct 23</span></>, footer: <><span>2 attachments · 5 comments</span><Avatar size="xs" initials="AS" alt="Ana Silva" /></> },
    ] },
    { id: "waiting", title: "In progress", color: "var(--weak)", items: [
      { id: "agency-2", title: "Organize references", description: "Check the materials the team shared.", meta: <><Badge tone="info">Normal</Badge><span>Oct 24</span></>, footer: <><span>3 attachments · 1 comment</span><Avatar size="xs" initials="BC" alt="Bruno Costa" /></> },
    ] },
    { id: "done", title: "In review", color: "var(--good)", items: [] },
  ] },
} satisfies Meta<typeof KanbanBoard>;
export default meta;
type Story = StoryObj<typeof KanbanBoard>;
export const Padrao: Story = { name: "Default", render: (args) => {
  const [columns, setColumns] = useState(args.columns);
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [addTo, setAddTo] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  useEffect(() => setColumns(args.columns), [args.columns]);
  function sortColumn(id?: string, reverse = false) {
    setColumns(before => before.map(column => !id || id === column.id ? { ...column, items: [...column.items].sort((a, b) => String(a.title).localeCompare(String(b.title)) * (reverse ? -1 : 1)) } : column));
  }
  return <>
    <KanbanBoard {...args} columns={columns} onColumnsChange={setColumns}
      filter={item => String(item.title).toLowerCase().includes(query.toLowerCase()) && (!mine || item.id === "agency-1" || item.id === "brief")}
      onAddCard={column => { setTitle(""); setError(""); setAddTo(column.id); }}
      columnActions={column => [{ id: "sort", label: "Sort stage by title", onSelect: () => sortColumn(column.id) }]}
      toolbar={<>
        <Button variant="primary" leadingIcon={Icons.plus} onClick={() => { setTitle(""); setError(""); setAddTo(columns[0]?.id ?? null); }}>New card</Button>
        <Input aria-label="Search cards" placeholder="Search cards" value={query} onChange={event => setQuery(event.target.value)} style={{ minWidth: 160 }} block={false} />
        <Menu open={filterOpen} onOpenChange={setFilterOpen} ariaLabel="Filter cards" entries={[{ id: "all", label: "All cards", onSelect: () => setMine(false) }, { id: "mine", label: "My cards", onSelect: () => setMine(true) }]}><Button aria-pressed={mine} onClick={() => setFilterOpen(!filterOpen)}>{mine ? "My cards" : "Filter"}</Button></Menu>
        <Menu open={orderOpen} onOpenChange={setOrderOpen} ariaLabel="Sort cards" entries={[{ id: "az", label: "Title A–Z", onSelect: () => sortColumn() }, { id: "za", label: "Title Z–A", onSelect: () => sortColumn(undefined, true) }]}><Button onClick={() => setOrderOpen(!orderOpen)}>Sort</Button></Menu>
      </>} />
    <Modal open={addTo !== null} onClose={() => setAddTo(null)} title="New card"><form style={{ display: "grid", gap: "var(--space-4)" }} onSubmit={event => {
      event.preventDefault();
      const column = columns.find(column => column.id === addTo);
      if (!column || !title.trim()) return;
      const limit = column.wipLimit ?? args.wipLimit;
      if (limit !== undefined && column.items.length >= limit) { setError(`WIP limit of ${limit} reached.`); return; }
      setColumns(before => before.map(c => c.id === addTo ? { ...c, items: [...c.items, { id: `new-${Date.now()}`, title: title.trim() }] } : c));
      setAddTo(null);
    }}>
      <Input label="Card title" value={title} onChange={event => setTitle(event.target.value)} error={error || undefined} required />
      <Select label="Stage" value={addTo ?? ""} onChange={event => { setAddTo(event.target.value); setError(""); }}>{columns.map(column => <option key={column.id} value={column.id}>{column.title}</option>)}</Select>
      <Button type="submit" variant="primary">Create card</Button>
    </form></Modal>
  </>;
} };
export const ComRegras: Story = { name: "With rules", args: {
  wipLimit: 2,
  columns: [
    { id: "todo", title: "To do", color: "var(--info)", items: [{ id: "a", title: "Review proposal" }, { id: "b", title: "Check content" }] },
    { id: "doing", title: "In progress", color: "var(--weak)", wipLimit: 1, items: [{ id: "c", title: "Validate references" }] },
    { id: "review", title: "In review", color: "var(--good)", items: [] },
    { id: "closed", title: "Completed", color: "var(--outline)", wipLimit: 0, items: [] },
  ],
  allowedTransitions: { todo: ["doing", "review"], doing: ["review"], review: [] },
} };
export const SemLimite: Story = { name: "No limit", args: { wipLimit: undefined } };
