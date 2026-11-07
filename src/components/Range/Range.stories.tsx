import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Range, type RangeValue } from "./Range";

// distribuição fictícia p/ o histograma (fixa, para render estável)
const DIST = [3, 5, 9, 14, 18, 24, 30, 34, 30, 26, 22, 18, 15, 12, 10, 8, 6, 5, 3, 2];

/**
 * `Range` — slider de intervalo com dois handles. Clique na track teleporta
 * o handle mais próximo; o mínimo nunca cruza o máximo.
 */
const meta = {
  id: "components-atoms-range",
  title: "Components/Atoms/Range",
  component: Range,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Two `role=\"slider\"` (Minimum/Maximum) with `aria-valuemin/max/now/text`, drag with pointer capture, ←/→ by `step` (Shift = 10×), Home/End to the available limit. `fixedMinimum` pins the origin and exposes a single handle for radii/limits. Controlled via `value`/`onChange` or uncontrolled via `defaultValue`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 460 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    label: { control: "text" },
    showValue: { control: "boolean" },
    fixedMinimum: { control: "boolean" },
    disabled: { control: "boolean" },
    formatValue: { control: false },
    ticks: { control: false },
    histogram: { control: false },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Range>;
export default meta;

type Story = StoryObj<typeof Range>;

/** Playground: Domain Authority range with ticks. */
export const Playground: Story = {
  args: {
    label: "Value range",
    defaultValue: [30, 80],
    ticks: ["0", "25", "50", "75", "100"],
  },
};

/** With histogram: bars inside the range light up. */
export const ComHistograma: Story = {
  name: "With histogram",
  args: {
    label: "Value range",
    defaultValue: [30, 80],
    histogram: DIST,
    ticks: ["0", "25", "50", "75", "100"],
  },
};

/** Formatted values (monthly search volume). */
export const Formatado: Story = {
  name: "With formatting",
  args: {
    label: "Search volume (monthly)",
    min: 0,
    max: 100_000,
    step: 1000,
    defaultValue: [10_000, 60_000],
    formatValue: (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)),
    ticks: ["0", "25k", "50k", "75k", "100k"],
  },
};

/** Controlled: the range lives in the parent. */
export const Controlled: Story = {
  name: "Controlled",
  args: { label: "Value range" },
  render: (args) => {
    const [range, setRange] = useState<RangeValue>([20, 60]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Range {...args} value={range} onChange={setRange} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          [{range[0]}, {range[1]}]
        </code>
      </div>
    );
  },
};

/** Fixed origin: a single handle for radius/cumulative limit. */
export const MinimoFixo: Story = { name: "Fixed minimum",
  args: {
    label: "Surrounding radius",
    min: 0,
    max: 5,
    step: 0.5,
    fixedMinimum: true,
    defaultValue: [0, 2],
    formatValue: (value: number) => `${value} km`,
    ticks: ["0", "1", "2", "3", "4", "5 km"],
  },
};

/** Disabled. */
export const Disabled: Story = {
  args: {
    label: "Value range",
    defaultValue: [30, 80],
    disabled: true,
  },
};
