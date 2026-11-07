import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup } from "./RadioGroup";

const meta = {
  id: "components-atoms-radiogroup",
  title: "Components/Atoms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    name: { control: "text" },
    label: { control: "text" },
    options: { control: false },
    value: { control: false },
    defaultValue: { control: "text" },
    onChange: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;
export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const CicloDeCobranca: Story = { name: "Billing cycle",
  args: {
    name: "cycle",
    label: "Billing cycle",
    defaultValue: "yearly",
    options: [
      { value: "monthly", label: "Monthly", hint: "R$ 249/mo, cancel anytime" },
      { value: "yearly", label: "Yearly", hint: "R$ 199/mo billed once, save 20%" },
    ],
  },
  render: (args) => <div style={{ maxWidth: 420 }}><RadioGroup {...args} /></div>,
};

/** Explicit public state; it does not call external services. */
export const ComOpcaoDesabilitada: Story = { name: "With disabled option", args: { name: "permission", label: "Permission", defaultValue: "reading", options: [{ value: "reading", label: "Reading" }, { value: "editing", label: "Editing unavailable", disabled: true }] } };
