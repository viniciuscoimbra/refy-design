import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";
import { ThemeProvider } from "../../lib/ThemeProvider";

const Search = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const meta = {
  id: "components-atoms-iconbutton",
  title: "Components/Atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: { "aria-label": "Search", icon: Search, variant: "ghost", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "outline", "solid"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof IconButton>;
export default meta;

type Story = StoryObj<typeof IconButton>;

export const GhostIcon: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Solid: Story = { args: { variant: "solid" } };

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true } };

/** Icon size per size comes from `--icon-button-icon-md` and `--icon-button-icon-lg`. */
export const TamanhoDoIcone: Story = { name: "Icon size",
  render: (args) => (
    <ThemeProvider theme={{ name: "Icon size", tokens: { "--icon-button-lg": "36px", "--icon-button-icon-lg": "20px" } }}>
      <IconButton {...args} size="lg" data-testid="iconbutton-lg" />
    </ThemeProvider>
  ),
};
