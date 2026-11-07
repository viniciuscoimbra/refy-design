import { FabMenuExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Icons } from "../../_demo/icons";
import { FabMenu, type FabMenuAction } from "./FabMenu";

const actions: FabMenuAction[] = [
  { id: "client", label: "New client", icon: Icons.plus },
  { id: "search", label: "Search content", icon: Icons.search },
  { id: "import", label: "Import contact", icon: Icons.download },
  { id: "help", label: "Ask for help", icon: Icons.help },
];

const meta = {
  id: "components-molecules-fabmenu",
  title: "Components/Molecules/FabMenu",
  component: FabMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Composes the canonical Fab and Menu. Opens upward with a scrim, three to five actions and staggered animation; arrows, Enter, Escape and outside click come from Menu.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 240, boxSizing: "border-box", display: "grid", placeItems: "end", padding: 32, background: "var(--surface-2)" }}>
        <Story />
      </div>
    ),
  ],
  args: { actions, label: "Open actions" },
  argTypes: {
    actions: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    onSelect: { control: false },
  },
} satisfies Meta<typeof FabMenu>;

export default meta;
type Story = StoryObj<typeof FabMenu>;

export const Fechado: Story = { name: "Closed",};

export const Aberto: Story = { name: "Open",
  args: { defaultOpen: true },
};

export const Interativo: Story = { name: "Interactive",
  render: (args) => {
    const [selection, setSelection] = useState("No action run yet.");
    return (
      <div>
        <FabMenu {...args} onSelect={(id) => setSelection(`Action run: ${id}.`)} />
        <p role="status" aria-live="polite" style={{ margin: "16px 0 0", color: "var(--ink-2)" }}>
          {selection}
        </p>
      </div>
    );
  },
};

export const FluxoLocal = { name: "Local flow", render: () => <FabMenuExample /> };

/** Explicit public state; it does not call external services. */
export const ComAcaoDesabilitada: Story = { name: "With disabled action", args: { defaultOpen: true, actions: actions.map(action => ({ ...action, disabled: action.id === "import" })) } };
