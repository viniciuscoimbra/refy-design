import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Kbd } from "../Kbd";
import { Icons } from "../../_demo/icons";
import { Tooltip } from "./Tooltip";

const meta = {
  id: "components-molecules-tooltip",
  title: "Components/Molecules/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    shortcut: { control: "text" },
    side: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    delayMs: { control: { type: "range", min: 0, max: 1000, step: 50 } },
    open: { control: false },
    defaultOpen: { control: false },
    onOpenChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const NoBotao: Story = { name: "On the button",
  args: { label: "Credits roll over", side: "top", delayMs: 350 },
  render: (args) => <Tooltip {...args}><Button variant="secondary">Credits</Button></Tooltip>,
};

export const ComAtalho: Story = { name: "With shortcut",
  args: { label: "Run analysis", shortcut: "⌘ Enter", defaultOpen: true },
  render: (args) => <Tooltip {...args}><Button variant="primary">Analyze</Button></Tooltip>,
};

export const ComDescricao: Story = { name: "With description",
  args: {
    label: "Content relevance",
    description: "Calculated from the profile and confirmed preferences.",
    defaultOpen: true,
  },
  render: (args) => <Tooltip {...args}><IconButton aria-label="Understand the score" icon={Icons.help} /></Tooltip>,
};

export const Lados: Story = { name: "Sides",
  decorators: [(Story) => <div style={{ padding: "100px 16px", width: "100%" }}><Story /></div>],
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 120px))", gap: "80px 24px", placeItems: "center" }}>
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <Tooltip key={side} label={`Side ${side}`} side={side} defaultOpen delayMs={0}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Gatilhos: Story = { name: "Triggers",
  decorators: [(Story) => <div style={{ padding: "80px 16px" }}><Story /></div>],
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
      <Tooltip label="Overall score" delayMs={0}><IconButton aria-label="Information" icon={Icons.help} /></Tooltip>
      <Tooltip label="Main shortcut" shortcut="⌘ Enter" delayMs={0}><Button variant="primary">Analyze</Button></Tooltip>
      <Tooltip label="CSV, JSON or PDF" delayMs={0}><Button variant="ghost">Export</Button></Tooltip>
      <Tooltip label="Open documentation" delayMs={0}><a href="#docs">example.com/docs</a></Tooltip>
      <Tooltip label="Command palette" delayMs={0}><span tabIndex={0}><Kbd>⌘K</Kbd></span></Tooltip>
      <Tooltip label="Last update" side="bottom" delayMs={0}><span tabIndex={0}>?</span></Tooltip>
    </div>
  ),
};
