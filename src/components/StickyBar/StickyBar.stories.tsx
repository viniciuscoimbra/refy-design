import { StickyBarExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { StickyBar } from "./StickyBar";

const meta = {
  id: "components-molecules-stickybar",
  title: "Components/Molecules/StickyBar",
  component: StickyBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "Horizon Business",
    meta: "TNT-002",
    status: <Badge tone="warn" dot>Under review</Badge>,
    actions: <Button variant="primary" size="sm">Approve organization</Button>,
  },
} satisfies Meta<typeof StickyBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = {
  name: "Default",
};

export const Interativo: Story = { name: "Interactive", render: () => <StickyBarExample /> };
