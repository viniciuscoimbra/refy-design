import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FollowUp } from "./FollowUp";

const meta = {
  id: "components-molecules-followup",
  title: "Components/Molecules/FollowUp",
  component: FollowUp,
  tags: ["autodocs"],
  args: {
    suggestions: ["Compare with last month", "Show only paid orders", { label: "Export as a table", message: "Export these orders as a table" }],
    onSelect: () => {},
  },
} satisfies Meta<typeof FollowUp>;
export default meta;
type Story = StoryObj<typeof FollowUp>;

export const Padrao: Story = {
  name: "Default",
  render: (args) => {
    const [sent, setSent] = useState<string>();
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: 520 }}>
        <FollowUp {...args} onSelect={setSent} />
        <p>Sent: {sent ?? "nothing yet"}</p>
      </div>
    );
  },
};
export const Empilhado: Story = { name: "Stacked", args: { layout: "stack" }, decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>] };
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true } };
