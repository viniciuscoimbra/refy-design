import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";
import { ThemeProvider } from "../../lib/ThemeProvider";

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

/** Thumb inset and off track color come from `--switch-thumb-inset` and `--switch-track-off`. */
export const PolegarETrilho: Story = { name: "Thumb and track",
  render: (args) => (
    <ThemeProvider theme={{ name: "Switch measures", tokens: { "--switch-height": "24px", "--switch-width": "40px", "--switch-thumb-size": "16px", "--switch-thumb-inset": "4px", "--switch-track-off": "var(--line)" } }}>
      <div data-testid="switch-measures" style={{ display: "flex", gap: "var(--space-3)" }}>
        <Switch {...args} aria-label="Off" />
        <Switch {...args} aria-label="On" defaultChecked />
      </div>
    </ThemeProvider>
  ),
};
