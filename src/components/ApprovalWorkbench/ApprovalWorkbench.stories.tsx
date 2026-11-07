import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../Card";
import { EmptyState } from "../EmptyState";
import { SectionHeader } from "../SectionHeader";
import { Skeleton } from "../Skeleton";
import {
  ApprovalWorkbench,
  type ApprovalWorkbenchItem,
} from "./ApprovalWorkbench";

const items: ApprovalWorkbenchItem[] = [
  { id: "company", label: "Company details", meta: "3 of 3 reviewed", state: "complete" },
  { id: "address", label: "Address", meta: "1 of 3 reviewed", state: "in-progress" },
  { id: "registration", label: "Professional license", meta: "0 of 3 reviewed", state: "not-started" },
];

const meta = {
  id: "components-organisms-approvalworkbench",
  title: "Components/Organisms/ApprovalWorkbench",
  component: ApprovalWorkbench,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Organizes a manual review into a queue of items and an active editor. Use it for records that go through approval. The organism does not decide outcomes or create pending items: the page supplies the items, the content and the actions.",
      },
    },
  },
  argTypes: {
    items: { control: false },
    activeId: { control: false },
    onActiveChange: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ApprovalWorkbench>;

export default meta;
type Story = StoryObj<typeof ApprovalWorkbench>;

export const EmAnalise: Story = {
  name: "Under review",
  render: () => {
    const [active, setActive] = useState("address");
    const item = items.find((entry) => entry.id === active) ?? items[0];
    return (
      <ApprovalWorkbench items={items} activeId={active} onActiveChange={setActive}>
        <Card>
          <SectionHeader
            title={item.label}
            sub="Check the sources and record the result of each criterion."
          />
        </Card>
      </ApprovalWorkbench>
    );
  },
};

export const Concluida: Story = {
  name: "Completed",
  args: {
    items: items.map((item) => ({ ...item, meta: "3 of 3 reviewed", state: "complete" })),
    activeId: "company",
    onActiveChange: () => undefined,
    children: (
      <EmptyState
        title="Review complete"
        message="Every item has a result and a note."
      />
    ),
  },
};

export const Carregando: Story = { name: "Loading",
  args: {
    items,
    activeId: "address",
    onActiveChange: () => undefined,
    children: (
      <Card aria-busy="true">
        <div style={{ display: "grid", gap: 16 }}>
          <Skeleton width="38%" height={20} />
          <Skeleton />
          <Skeleton />
          <Skeleton width="72%" />
        </div>
      </Card>
    ),
  },
};
