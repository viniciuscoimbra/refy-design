import { PopoverExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Popover } from "./Popover";

/**
 * `Popover` — conteúdo flutuante interativo ancorado a um trigger.
 * Diferente do Tooltip: aceita interação (form curto, filtros).
 */
const meta = {
  id: "components-molecules-popover",
  title: "Components/Molecules/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Controlled by `open`/`onOpenChange` (overlays have no global state). Closes on Esc or outside click. Position by `side` (top/bottom/left/right) + `align` (start/center/end). Min-width 220px, elevation 3.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 280, display: "flex", alignItems: "flex-start", paddingTop: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    open: { control: false },
    onOpenChange: { control: false },
    content: { control: false },
    children: { control: false },
    label: { control: "text" },
  },
} satisfies Meta<typeof Popover>;
export default meta;

type Story = StoryObj<typeof Popover>;

function StageFilter() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-eyebrow)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-uppercase)",
          color: "var(--ink-3)",
          marginBottom: 6,
        }}
      >
        Filter by stage
      </span>
      <Checkbox label="Diagnosis" defaultChecked />
      <Checkbox label="Tasks" />
      <Checkbox label="In progress" />
      <Checkbox label="Resolved" />
    </div>
  );
}

/** Filters in a popover: click the button to open/close. */
export const Playground: Story = {
  args: { open: false, onOpenChange: () => {}, content: null, children: null, label: "Filters" },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <Popover {...args} open={open} onOpenChange={setOpen} content={<StageFilter />}>
        <Button onClick={() => setOpen(!open)}>Filter</Button>
      </Popover>
    );
  },
};

/** Aligned to the end, opening upward. */
export const TopEnd: Story = {
  name: "Top · end",
  decorators: [
    (Story) => (
      <div style={{ minHeight: 280, display: "flex", alignItems: "flex-end", paddingBottom: 16 }}>
        <Story />
      </div>
    ),
  ],
  args: { open: false, onOpenChange: () => {}, content: null, children: null, side: "top", align: "end" },
  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <Popover {...args} open={open} onOpenChange={setOpen} content={<StageFilter />}>
        <Button onClick={() => setOpen(!open)}>Filter</Button>
      </Popover>
    );
  },
};

export const Interativo: Story = { name: "Interactive", render: () => <PopoverExample /> };
