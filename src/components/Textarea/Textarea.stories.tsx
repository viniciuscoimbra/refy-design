import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta = {
  id: "components-atoms-textarea",
  title: "Components/Atoms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    label: "Role description",
    placeholder: "What is this role for?",
    block: true,
    rows: 3,
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
    rows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;
export default meta;

type Story = StoryObj<typeof Textarea>;

export const TextareaPadrao: Story = { name: "Default textarea",};
export const TextareaComHint: Story = { name: "Textarea with hint",
  args: { hint: "Shows in the team's role list.", defaultValue: "Runs analyses but does not publish." },
};
export const TextareaComErro: Story = { name: "Textarea with error", args: { error: "Up to 280 characters." } };

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true, defaultValue: "Content available read-only." } };
