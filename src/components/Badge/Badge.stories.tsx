import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";
import { ThemeProvider } from "../../lib/ThemeProvider";

const meta = {
  id: "components-atoms-badge",
  title: "Components/Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { tone: "success", children: "Paid", dot: false },
  argTypes: {
    tone: { control: "inline-radio", options: ["success", "info", "warn", "danger", "neutral"] },
    dot: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof Badge>;

export const Success: Story = {};
export const ComDot: Story = { name: "With dot", args: { dot: true, children: "Active" } };

export const Todos: Story = { name: "All",
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="success">Paid</Badge>
      <Badge tone="info">Agency plan</Badge>
      <Badge tone="warn">Pending</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="neutral">Archived</Badge>
    </div>
  ),
};

/** Height, inline padding and radius come from `--badge-height`, `--badge-padding-inline` and `--badge-radius`. */
export const Medidas: Story = { name: "Measures",
  render: () => (
    <ThemeProvider theme={{ name: "Badge measures", tokens: { "--badge-height": "24px", "--badge-padding-inline": "8px", "--badge-radius": "4px" } }}>
      <Badge tone="neutral" data-testid="badge-measures">New</Badge>
    </ThemeProvider>
  ),
};
