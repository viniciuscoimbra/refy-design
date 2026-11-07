import type { Meta, StoryObj } from "@storybook/react";
import { Stat, StatGroup } from "./Stat";
import { Sparkline } from "../Charts";
import { Card, CardHeader } from "../Card";

const meta = {
  id: "components-molecules-stat",
  title: "Components/Molecules/Stat",
  component: Stat,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Numeric indicator: mono uppercase label + large tabular value (`font-variant-numeric: tabular-nums`) + optional delta (up/down with semantic color) and description. `StatGroup` builds the responsive tile grid. The `chart` slot takes the Charts `Sparkline` for trend. Colors come from the ancestor theme tokens; on an inverted panel (usage hero, plan summary) `data-theme=\"dark\"` on the container is enough.\n\n" +
          "**Where to use:** API limit tiles (Developer), project quota, Usage page hero, plan summary in Billing: any key number with a short label.\n\n" +
          "**Where NOT to use:** not for usage vs limit with a bar (that is `UsageMeter`); not for a circular 0–100 score (that is `ScoreGauge`); not as a chart (that is `Charts`: the `chart` here is a supporting trend, not a precise reading); not for counters inside running text (that is `Badge`).",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Stat>;
export default meta;

type Story = StoryObj<typeof Stat>;

export const Basico: Story = {
  name: "Basic",
  args: {
    label: "Rate limit",
    value: "60",
    unit: "req/min",
    description: "per API key; 429 is returned once exceeded.",
  },
};

export const ComDelta: Story = {
  name: "With delta (up/down)",
  render: () => (
    <StatGroup style={{ maxWidth: 560 }}>
      <Stat
        label="Analyses this cycle"
        value="128"
        delta={{ value: "+12%", trend: "up" }}
        description="vs previous cycle"
      />
      <Stat
        label="Average progress"
        value="74"
        delta={{ value: "-3 pts", trend: "down" }}
        description="vs previous cycle"
      />
      <Stat
        label="Cost per analysis"
        value="18"
        unit="credits"
        delta={{ value: "+2", trend: "up", sentiment: "negative" }}
        description="going up is bad here, inverted sentiment"
      />
    </StatGroup>
  ),
};

export const ComSparkline: Story = {
  name: "With Sparkline (chart slot)",
  args: {
    label: "Analyses / day",
    value: "42",
    delta: { value: "+8%", trend: "up" },
    chart: (
      <Sparkline
        data={[12, 18, 14, 22, 26, 24, 31, 29, 38, 42]}
        label="Analyses per day trend"
      />
    ),
  },
};

/** Tile grid as in "Usage limits" on the Developer page. */
export const GrupoEmGrid: Story = {
  name: "StatGroup (API limits)",
  render: () => (
    <Card style={{ maxWidth: 640 }}>
      <CardHeader title="Usage limits" />
      <StatGroup>
        <Stat size="sm" label="Rate limit" value="60" unit="req/min" description="per API key, 429 once exceeded." />
        <Stat size="sm" label="Parallel analyses" value="3" unit="concurrent" description="Pro plan · upgrading unlocks 10." />
        <Stat size="sm" label="Webhook timeout" value="10s" unit="· 5 retries" description="exponential backoff 30s → 4h." />
      </StatGroup>
    </Card>
  ),
};

/** On an inverted panel (usage hero): tokens flip via data-theme on the container. */
export const SuperficieInvertida: Story = {
  name: "Inverted surface (hero)",
  render: () => (
    <div
      data-theme="dark"
      style={{
        background: "var(--surface-container-low)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        maxWidth: 640,
      }}
    >
      <StatGroup>
        <Stat size="lg" label="Total available balance" value="3.700" unit="credits" description="2,500 from the Pro plan · 1,200 saved" />
        <Stat size="lg" label="Used this cycle" value="800" unit="/ 2.500" description="8 standard analyses · 0 syntheses" />
        <Stat size="lg" label="Extra packs" value="2.000" unit="restantes" description="2,000 cr pack · bought May 2" />
      </StatGroup>
    </div>
  ),
};
