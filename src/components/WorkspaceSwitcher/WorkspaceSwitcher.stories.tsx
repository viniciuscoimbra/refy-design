import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { WorkspaceSwitcher, type Workspace } from "./WorkspaceSwitcher";

const workspaces: Workspace[] = [
  { id: "globo", name: "Example team", role: "Workspace · Pro", initials: "GE" },
  { id: "refy", name: "Refy Labs", role: "Workspace · Interno", initials: "RL" },
  { id: "acme", name: "Acme Marketing", role: "Workspace · Starter", initials: "AM" },
  { id: "nexus", name: "North team", role: "Workspace · Pro", initials: "NI" },
  { id: "vertex", name: "Vertex Consulting", role: "Workspace · Trial", initials: "VC" },
];

/**
 * `WorkspaceSwitcher` — seletor de workspace estilo combobox.
 */
const meta = {
  id: "components-molecules-workspaceswitcher",
  title: "Components/Molecules/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Trigger with avatar + name + role + double caret; opens a panel with search (from 5 workspaces) and a check on the current one. ↑/↓ + Enter; Esc/outside click close. `compact` for the collapsed sidebar. Controlled via `value`/`onChange` or uncontrolled.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 260, minHeight: 380 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    workspaces: { control: false },
    compact: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof WorkspaceSwitcher>;
export default meta;

type Story = StoryObj<typeof WorkspaceSwitcher>;

/** 5 workspaces: opens with search. */
export const Playground: Story = {
  args: { workspaces },
};

/** Controlled: the selection lives in the parent. */
export const Controlled: Story = {
  name: "Controlled",
  args: { workspaces },
  render: (args) => {
    const [id, setId] = useState("globo");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <WorkspaceSwitcher {...args} value={id} onChange={(w) => setId(w.id)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{id}</code>
      </div>
    );
  },
};

/** Few workspaces: no search. */
export const SemBusca: Story = {
  name: "No search (< 5)",
  args: { workspaces: workspaces.slice(0, 3) },
};
