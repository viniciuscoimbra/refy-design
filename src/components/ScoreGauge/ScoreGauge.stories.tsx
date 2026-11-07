import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ScoreGauge } from "./ScoreGauge";
import { Button } from "../Button";

const meta = {
  id: "components-molecules-scoregauge",
  title: "Components/Molecules/ScoreGauge",
  component: ScoreGauge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Circular score meter (0–100): SVG arc with animated progress on mount and on value change (motion tokens; `prefers-reduced-motion` turns it off), color by threshold band (ok at ≥ `okAt`, default 70; warn at ≥ `warnAt`, default 40; critical below) and a center label (value + label). Accessible as `role=\"meter\"` with valuemin/max/now.\n\n" +
          "**Where to use:** project score on the dashboard (cards and recent rows), score in the analysis detail, any single 0–100 indicator with quality bands.\n\n" +
          "**Where NOT to use:** task/upload progress (that is `ProgressBar`: progress has no quality band); usage vs limit (that is `UsageMeter`); proportions of a whole (that is the Charts `DonutChart`); a number without a known 0–100 scale (that is `Stat`).",
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    okAt: { control: { type: "number", min: 0, max: 100 } },
    warnAt: { control: { type: "number", min: 0, max: 100 } },
  },
} satisfies Meta<typeof ScoreGauge>;
export default meta;

type Story = StoryObj<typeof ScoreGauge>;

export const Basico: Story = {
  name: "Basic (ok band)",
  args: { value: 74, label: "Score" },
};

export const Bandas: Story = {
  name: "Threshold bands",
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
      <ScoreGauge value={86} label="good" aria-label="Score 86, good band" />
      <ScoreGauge value={54} label="median" aria-label="Score 54, average band" />
      <ScoreGauge value={23} label="weak" aria-label="Score 23, weak band" />
    </div>
  ),
};

export const Tamanhos: Story = { name: "Sizes",
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center" }}>
      <ScoreGauge size="sm" value={74} aria-label="Score 74" />
      <ScoreGauge size="md" value={74} label="Score" />
      <ScoreGauge size="lg" value={74} label="Overall" />
    </div>
  ),
};

/** The arc transitions smoothly when the value changes (and the color changes band with it). */
export const ValorVivo: Story = {
  name: "Animation on value change",
  args: { value: 74 },
  render: function Render() {
    const [value, setValue] = useState(30);
    return (
      <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center" }}>
        <ScoreGauge size="lg" value={value} label="Score" />
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          {[23, 54, 86].map((v) => (
            <Button key={v} size="sm" variant={value === v ? "primary" : "secondary"} onClick={() => setValue(v)}>
              {v}
            </Button>
          ))}
        </div>
      </div>
    );
  },
};
