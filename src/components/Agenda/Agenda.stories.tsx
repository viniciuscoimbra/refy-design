import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Agenda } from "./Agenda";
import type { AgendaEvent } from "./Agenda";

const events: AgendaEvent[] = [
  { id: "a", title: "Registration and coffee", start: "2026-11-24T08:00:00-03:00", end: "2026-11-24T09:00:00-03:00", location: "Main hall", tone: "neutral" },
  { id: "b", title: "Opening keynote", start: "2026-11-24T09:00:00-03:00", end: "2026-11-24T10:00:00-03:00", location: "Room 1", description: "Themes that change with one file" },
  { id: "c", title: "Workshop: building screens with AI", start: "2026-11-24T10:30:00-03:00", end: "2026-11-24T12:00:00-03:00", location: "Lab 2", tone: "info" },
  { id: "d", title: "Community day", start: "2026-11-25", tone: "good" },
  { id: "e", title: "Accessibility review", start: "2026-11-25T14:00:00-03:00", end: "2026-11-25T15:30:00-03:00", location: "Video call", tone: "warn" },
];

const meta = {
  id: "components-organisms-agenda",
  title: "Components/Organisms/Agenda",
  component: Agenda,
  tags: ["autodocs"],
  args: { events, title: "Conference week", label: "Conference schedule", from: "2026-11-24", to: "2026-11-26", timezone: "America/Sao_Paulo" },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof Agenda>;
export default meta;
type Story = StoryObj<typeof Agenda>;

export const Padrao: Story = { name: "Default" };
export const Clicavel: Story = {
  name: "Clickable events",
  render: (args) => {
    const [picked, setPicked] = useState<string>();
    return (
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <Agenda {...args} onEventClick={(event) => setPicked(String(event.title))} />
        <p>Picked: {picked ?? "none"}</p>
      </div>
    );
  },
};
export const Vazia: Story = { name: "Empty", args: { events: [], from: undefined, to: undefined, emptyMessage: "Nothing scheduled this week." } };
