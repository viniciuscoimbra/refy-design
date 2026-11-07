import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ActivityTimeline, type ActivityEvent } from "./EventTimeline";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card, CardHeader } from "../Card";
import { Drawer } from "../Drawer";
import { IconButton } from "../IconButton";
import { Popover } from "../Popover";

const messageIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 5h16v12H9l-5 4V5Z" /></svg>;
const fileIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M7 3h7l4 4v14H7V3Z M14 3v5h4 M10 12h5 M10 16h5" /></svg>;
const checkIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;
const events: ActivityEvent[] = [
  { id: "1", timestamp: "2026-10-23T14:30:00-03:00", title: "commented on the references", description: "We can go with the second proposal. It makes navigation clearer and keeps the review context.", actor: { name: "Ana Silva", initials: "AS" }, icon: messageIcon, badge: { label: "Comment", tone: "info" }, metadata: "Aurora project · References" },
  { id: "2", timestamp: "2026-10-23T11:42:00-03:00", title: "finished the content review", description: "The guidelines were updated and are already available to the team.", actor: { name: "Bruno Costa", initials: "BC" }, icon: checkIcon, status: { label: "Completed", tone: "good" }, badge: { label: "Review", tone: "success" }, metadata: "Content guide" },
  { id: "3", timestamp: "2026-10-23T09:10:00-03:00", title: "added a file to the collection", description: "Navigation references.pdf · 2.4 MB", actor: { name: "Camila Lima", initials: "CL" }, icon: fileIcon, badge: { label: "File", tone: "neutral" }, metadata: "Team collection" },
  { id: "4", timestamp: "2026-10-22T16:20:00-03:00", title: "Sync complete", description: "The files in this collection are up to date.", icon: checkIcon, status: { label: "Updated", tone: "good" } },
];
const meta = {
  id: "components-organisms-eventtimeline",
  title: "Components/Organisms/ActivityTimeline",
  component: ActivityTimeline,
  tags: ["autodocs"],
  parameters: { layout: "padded", docs: { source: { type: "code" }, description: { component: "Occurrences in recent order with author, time and context. Composes ActivityItem. Use the compact density in widgets; for vertical or horizontal milestones, use Timeline. EventTimeline remains as a compatibility alias."} } },
  args: { events, title: "Team activity", context: "Comments, reviews and files in a single history." },
} satisfies Meta<typeof ActivityTimeline>;
export default meta;
type Story = StoryObj<typeof ActivityTimeline>;
export const Cronologia: Story = { name: "Chronology", render: (args) => {
  const [selected, setSelected] = useState<ActivityEvent | null>(null);
  return <>
    <ActivityTimeline {...args} events={args.events.map(event => ({ ...event, action: <Button size="sm" variant="ghost" onClick={() => setSelected(event)}>View activity</Button> }))} />
    <Drawer open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }} title="Activity details"><ActivityTimeline events={selected ? [selected] : []} showHeader={false} /></Drawer>
  </>;
} };
export const Compacto: Story = { name: "Compact", args: { density: "compact" } };
export const Agrupamento: Story = { name: "Grouping", args: { events: [...events].reverse() } };
export const Widget: Story = { args: { events: [
  { id: "import", timestamp: "2026-10-23T14:30:00-03:00", title: "Import complete", description: "The files are now available in the team collection.", icon: fileIcon },
  { id: "review", timestamp: "2026-10-23T11:42:00-03:00", title: "Review received", description: "The comments were gathered for the next step.", icon: messageIcon },
  { id: "scheduled", timestamp: "2026-10-23T09:10:00-03:00", title: "Publishing scheduled", description: "The content will be published on the date set by the team.", icon: checkIcon },
  { id: "sync", timestamp: "2026-10-22T16:20:00-03:00", title: "Sync complete", description: "All changes were saved.", icon: checkIcon },
] }, render: (args) => {
  const [open, setOpen] = useState(false);
  return <>
    <Card style={{ maxWidth: 520 }}>
      <CardHeader title="Activity" action={<Badge tone="success" dot>Updated</Badge>} />
      <ActivityTimeline {...args} density="compact" showHeader={false} groupByDate={false} />
      <Button variant="secondary" style={{ marginTop: "var(--space-5)", width: "100%" }} onClick={() => setOpen(true)}>See full history</Button>
    </Card>
    <Drawer open={open} onOpenChange={setOpen} title="Activity history"><ActivityTimeline {...args} showHeader={false} /></Drawer>
  </>;
} };
export const Notificacoes: Story = { name: "Notifications", render: (args) => {
  const [open, setOpen] = useState(false);
  return <Popover label="Recent activity" open={open} onOpenChange={setOpen} align="end" content={<div style={{ width: "min(360px, 75vw)" }}><ActivityTimeline {...args} title="Recent activity" context={undefined} density="compact" groupByDate={false} /></div>}>
    <IconButton aria-label="Open recent activity" onClick={() => setOpen(!open)} icon={messageIcon} />
  </Popover>;
} };
export const Vazio: Story = { name: "Empty", args: { events: [] } };
export const Erro: Story = { name: "Error", render: () => {
  const [error, setError] = useState("The connection to the history was lost.");
  return <ActivityTimeline events={error ? [] : events} error={error || undefined} onRetry={() => setError("")} />;
} };
export const ConteudoLongo: Story = { name: "Long content", args: { events: [{ ...events[0], id: "long", title: "updated the project references, the file organization, the responsibilities and the guidelines for the next review", description: "A long entry to check that the history keeps author, time, status and actions without hiding content, even when the event has many details that must be read inside a narrow widget." }] } };
