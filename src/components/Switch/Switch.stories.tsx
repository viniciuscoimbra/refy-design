import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

const meta = {
  id: "components-atoms-switch",
  title: "Components/Atoms/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { "aria-label": "Turn on auto top-up", defaultChecked: false },
  argTypes: {
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { control: false },
  },
} satisfies Meta<typeof Switch>;
export default meta;

type Story = StoryObj<typeof Switch>;

export const Desligado: Story = { name: "Off",};
export const Ligado: Story = { name: "On", args: { defaultChecked: true } };
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true, defaultChecked: true } };
