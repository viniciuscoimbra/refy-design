import { EmptyStateExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { EmptyState } from "./EmptyState";

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

/**
 * `EmptyState` — estado de "nada aqui" com ícone, título, copy e CTA opcional.
 */
const meta = {
  id: "components-molecules-emptystate",
  title: "Components/Molecules/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dashed border around it to signal absence (`bordered={false}` when the container already has a frame). Icon via prop, headline title, copy limited to ~36ch.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    bordered: { control: "boolean" },
    icon: { control: false },
    action: { control: false },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof EmptyState>;

/** Search with no results, with a CTA. */
export const Playground: Story = {
  args: {
    icon: SearchIcon,
    title: "No items found",
    message: "Try removing filters or changing the search. You have 12 items in total.",
    action: <Button size="sm">Clear filters</Button>,
  },
};

/** No border (inside a card that already has a frame). */
export const SemBorda: Story = {
  name: "No border",
  args: {
    icon: SearchIcon,
    title: "No analyses yet",
    message: "Run your first analysis to see the results here.",
    bordered: false,
  },
};

export const Interativo: Story = { name: "Interactive", render: () => <EmptyStateExample /> };
