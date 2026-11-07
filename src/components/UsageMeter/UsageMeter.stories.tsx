import type { Meta, StoryObj } from "@storybook/react";
import { UsageMeter, UsageMeterGroup } from "./UsageMeter";
import { Card, CardHeader } from "../Card";
import { Button } from "../Button";

const meta = {
  id: "components-molecules-usagemeter",
  title: "Components/Molecules/UsageMeter",
  component: UsageMeter,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Usage vs limit: label, formatted values (pt-BR) and bar, composed on `ProgressBar`. The tone changes by threshold: ok → attention (≥ `warnAt`, default 80%) → critical (≥ `criticalAt`, default 100%). `UsageMeterGroup` stacks several meters with dividers (usage per project, API limits).\n\n" +
          "**Where to use:** Usage and Billing pages (cycle credits, members, projects), API limits on the Developer page, and any resource with a known numeric cap.\n\n" +
          "**Where NOT to use:** not for task/step progress (that is plain `ProgressBar` or a stepper); not without a known limit (a loose number is not a meter); not as a time-series chart (that is `Charts`); do not stack loose meters without `UsageMeterGroup` inside one card.",
      },
    },
  },
  argTypes: {
    used: { control: { type: "number", min: 0 } },
    limit: { control: { type: "number", min: 0 } },
    warnAt: { control: { type: "number", min: 0, max: 100 } },
    criticalAt: { control: { type: "number", min: 0, max: 200 } },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  render: (args) => (
    <div style={{ width: "min(100%, 360px)" }}>
      <UsageMeter {...args} />
    </div>
  ),
} satisfies Meta<typeof UsageMeter>;
export default meta;

type Story = StoryObj<typeof UsageMeter>;

export const Saudavel: Story = {
  name: "Healthy",
  args: {
    label: "Cycle credits",
    used: 800,
    limit: 2500,
    unit: "credits",
    meta: "8 standard analyses · 0 deep syntheses",
  },
};

export const Atencao: Story = {
  name: "Warning (≥80%)",
  args: {
    label: "Projects",
    used: 17,
    limit: 20,
    meta: "3 available",
  },
};

export const Critico: Story = {
  name: "Critical (limit reached)",
  args: {
    label: "Members",
    used: 3,
    limit: 3,
    meta: "Pro plan limit reached",
  },
};

/** List of meters with dividers, as in "Usage by project" on the Usage screen. */
export const ListaPorProjeto: Story = {
  name: "List (UsageMeterGroup)",
  args: { label: "-", used: 0, limit: 1 },
  render: () => (
    <Card style={{ maxWidth: 480 }}>
      <CardHeader
        title="Usage by project"
        count="800 / 2.500"
        action={<Button variant="ghost" size="sm">Export</Button>}
      />
      <UsageMeterGroup>
        <UsageMeter
          label="Globo · Aurora project desk"
          used={600}
          limit={700}
          size="sm"
          meta="3 analyses · 1 deep synthesis"
        />
        <UsageMeter label="Quem · Celebrities & Origin project" used={200} limit={700} size="sm" meta="2 analyses" />
        <UsageMeter
          label="Origin team · Decor"
          used={0}
          limit={700}
          size="sm"
          meta="0 analyses · monitoring on"
        />
      </UsageMeterGroup>
    </Card>
  ),
};
