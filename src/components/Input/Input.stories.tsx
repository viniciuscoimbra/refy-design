import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { ThemeProvider } from "../../lib/ThemeProvider";

const meta = {
  id: "components-atoms-input",
  title: "Components/Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Workspace name", placeholder: "Example team", block: true },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    prefix: { control: "text" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Input>;
export default meta;

type Story = StoryObj<typeof Input>;

export const InputPadrao: Story = { name: "Default input",};
export const InputComHint: Story = { name: "Input with hint",
  args: { label: "Billing email", hint: "Receives the invoices.", placeholder: "billing@company.com" },
};
export const InputComErro: Story = { name: "Input with error",
  args: { label: "URL", error: "Enter a valid URL.", defaultValue: "globo" },
};
export const InputComPrefixo: Story = { name: "Input with prefix",
  render: (args) => <Input {...args} label="Workspace URL" prefix="example.com/" defaultValue="globo-editorial" />,
};
export const InputDesabilitado: Story = { name: "Disabled input", args: { label: "Plan", defaultValue: "Pro Yearly", disabled: true } };

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
/** Prefix color and field font come from `--input-prefix-color` and `--field-font-family`. */
export const PrefixoEFonte: Story = { name: "Prefix and font",
  render: (args) => (
    <ThemeProvider theme={{ name: "Search field", tokens: { "--input-prefix-color": "var(--ink-4)", "--field-font-family": "system-ui, sans-serif" } }}>
      <div data-testid="input-measures">
        <Input {...args} label="Search" prefix={SearchIcon} placeholder="Bikes, sofas, phones" />
      </div>
    </ThemeProvider>
  ),
};
