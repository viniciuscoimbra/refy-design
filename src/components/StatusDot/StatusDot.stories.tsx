import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "./StatusDot";

/** `StatusDot` — dot de estado com halo + rótulo mono uppercase opcional. */
const meta = {
  id: "components-atoms-statusdot",
  title: "Components/Atoms/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "6px colored dot with a halo and an optional mono uppercase label. `pulse` animates the halo (\"live\") and respects `prefers-reduced-motion`. Without a visible label, pass `aria-label` on the component itself.",
          "",
          "**Where to use:** live state in the page header (\"monitoring\"), OAuth connection status (\"Connected · primary\"), presence/activity in lists: anywhere a round colored `<span>` gets improvised today.",
          "",
          "**Where NOT to use:** counters or category text (use `Badge`/`Chip`); status inside a `Badge` that already has its own `dot`; a progress indicator (use `ProgressBar`/`Skeleton`).",
        ].join("\n"),
      },
    },
  },
  args: { tone: "good", pulse: false, children: "Connected" },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["good", "ok", "warn", "critical", "info", "neutral"],
    },
    pulse: { control: "boolean" },
    children: { control: "text", description: "Optional mono uppercase label." },
  },
} satisfies Meta<typeof StatusDot>;
export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Padrao: Story = { name: "Default",};

export const AoVivo: Story = {
  name: "Live (pulse)",
  args: { pulse: true, children: "Activity running" },
};

export const SemRotulo: Story = {
  name: "Dot only (with aria-label)",
  args: { children: undefined, "aria-label": "Connected" },
};

export const Tons: Story = { name: "Tones",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <StatusDot tone="good">Connected · primary</StatusDot>
      <StatusDot tone="ok">Synced</StatusDot>
      <StatusDot tone="warn">Warning</StatusDot>
      <StatusDot tone="critical">Connection failed</StatusDot>
      <StatusDot tone="info">Under review</StatusDot>
      <StatusDot tone="neutral">Inactive</StatusDot>
    </div>
  ),
};
