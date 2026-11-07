import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { KanbanCard } from "./KanbanCard";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { Modal } from "../Modal";
const meta = { id: "components-molecules-kanbancard", title: "Components/Molecules/KanbanCard", component: KanbanCard, tags: ["autodocs"], parameters: { docs: { source: { type: "code" } } }, args: { item: { id: "review", title: "Review documentation", description: "Check the guidelines and share the review with the team.", meta: <><Badge tone="warn">High priority</Badge><span>Oct 23</span></>, footer: <><span>2 attachments · 5 comments</span><Avatar size="xs" initials="AS" alt="Ana Silva" /></> } } } satisfies Meta<typeof KanbanCard>;
export default meta;
type Story = StoryObj<typeof KanbanCard>;
export const Completo: Story = { name: "Complete", render: (args) => {
  const [open, setOpen] = useState(false);
  return <><KanbanCard {...args} style={{ maxWidth: 320 }} onOpen={() => setOpen(true)} /><Modal open={open} onClose={() => setOpen(false)} title={args.item.title}>{args.item.description}</Modal></>;
} };
export const SemMetadados: Story = { name: "No metadata", args: { item: { id: "simple", title: "Organize references", description: "Set the next step." } } };
