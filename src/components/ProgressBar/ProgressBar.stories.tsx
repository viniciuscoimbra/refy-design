import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { Button } from "../Button";

const meta = {
  id: "components-atoms-progressbar",
  title: "Components/Atoms/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Horizontal progress bar, without a built-in label.",
          "",
          "**Where to use:** usage vs. limit (credits, project quota, API usage),",
          "progress of a known task. `tone=\"neutral\"` (ink) is the tone of the informational",
          "quota bars on settings screens (e.g. \"5 / 20 projects\" in",
          "`settings_projects`), when the bar only reports a proportion without judging state.",
          "`primary` = healthy/active; `warn`/`critical` = approaching/exceeding the limit.",
          "",
          "`indeterminate` covers continuous loading with no known percentage",
          "(the fill slides in a loop; `aria-busy`, no `aria-valuenow`).",
          "Changes to `value` animate the fill growth (motion tokens);",
          "`prefers-reduced-motion` turns both animations off.",
          "",
          "**Where NOT to use:** loading content placeholder (use `Skeleton`); the composite",
          "number + description + bar + action (use `UsageMeter`, which wraps this bar);",
          "wizard steps (use step navigation). Labels stay OUTSIDE the bar:",
          "this atom never renders text.",
        ].join("\n"),
      },
    },
  },
  args: { value: 49, tone: "primary", size: "md" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    tone: { control: "inline-radio", options: ["primary", "neutral", "warn", "critical"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    indeterminate: { control: "boolean" },
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} />
    </div>
  ),
} satisfies Meta<typeof ProgressBar>;
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Saudavel: Story = { name: "Healthy",};
export const Atencao: Story = { name: "Warning", args: { value: 72, tone: "warn" } };
export const Critico: Story = { name: "Critical", args: { value: 94, tone: "critical" } };

/**
 * Neutral tone (ink): informative quota bar for settings screens, a ratio without judging state (e.g. "5 / 20 active projects").
 */
export const CotaNeutra: Story = { name: "Neutral quota",
  args: { value: 25, tone: "neutral" },
  render: (args) => (
    <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 8 }}>
      <ProgressBar {...args} aria-label="5 of 20 active projects" />
    </div>
  ),
};

/**
 * The fill width is animated (motion token): click the buttons and watch the bar "grow"/"shrink" to the new value instead of jumping.
 */
export const ValorAnimado: Story = {
  name: "Animated value",
  render: (args) => {
    const [value, setValue] = useState(20);
    return (
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <ProgressBar {...args} value={value} />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.max(0, v - 25))}>
            −25
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setValue((v) => Math.min(100, v + 25))}>
            +25
          </Button>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
            value = {value}
          </code>
        </div>
      </div>
    );
  },
};

/**
 * `indeterminate`: continuous loading without a known percentage; the fill slides in a loop. Accessibility: `aria-busy`, no `aria-valuenow`. With `prefers-reduced-motion`, the animation stops and the track is filled at half opacity.
 */
export const Carregando: Story = { name: "Loading",
  args: { indeterminate: true },
  render: (args) => (
    <div style={{ width: 320 }}>
      <ProgressBar {...args} aria-label="Loading" />
    </div>
  ),
};
