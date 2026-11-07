import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

/**
 * `Slider` — controle contínuo arrastável. Clique na track teleporta o thumb,
 * setas ←/→ ajustam por step (Shift = 10×). Suporta steps discretos com `marks`.
 */
const meta = {
  id: "components-atoms-slider",
  title: "Components/Atoms/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Drag the thumb (pointer capture), click the track to jump, ←/→ by `step` (Shift = 10×), Home/End for the ends. `marks` makes it a discrete slider with dots and labels. `role=\"slider\"` with `aria-valuemin/max/now/text`. Controlled via `value`/`onChange` or uncontrolled via `defaultValue`.",
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
    disabled: { control: "boolean" },
    formatValue: { control: false },
    ticks: { control: false },
    marks: { control: false },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Slider>;
export default meta;

type Story = StoryObj<typeof Slider>;

/** Playground: continuous 0–100 with a % readout. */
export const Playground: Story = {
  args: {
    label: "Detail level",
    defaultValue: 35,
    formatValue: (v: number) => `${v}%`,
    ticks: ["Shallow", "Deep"],
  },
};

/** Decimal step (0.1), threshold from 0 to 10. */
export const Decimal: Story = {
  name: "Decimal step",
  args: {
    label: "Priority threshold",
    min: 0,
    max: 10,
    step: 0.1,
    defaultValue: 7,
    formatValue: (v: number) => v.toFixed(1),
    ticks: ["0", "10"],
  },
};

/** Discrete with `marks`: points on the track and a label per step. */
export const Discreto: Story = {
  name: "Discrete · marks",
  args: {
    label: "Monitoring frequency",
    min: 0,
    max: 4,
    step: 1,
    defaultValue: 2,
    marks: ["Hourly", "Daily", "Weekly", "Biweekly", "Monthly"],
    formatValue: (v: number) => ["Hourly", "Daily", "Weekly", "Biweekly", "Monthly"][v],
  },
};

/** Controlled: the value lives in the parent. */
export const Controlled: Story = {
  name: "Controlled",
  args: { label: "Depth" },
  render: (args) => {
    const [v, setV] = useState(50);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Slider {...args} value={v} onChange={setV} formatValue={(x) => `${x}%`} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          value: {v}
        </code>
      </div>
    );
  },
};

/** Disabled. */
export const Disabled: Story = {
  args: {
    label: "Detail level",
    defaultValue: 35,
    formatValue: (v: number) => `${v}%`,
    disabled: true,
  },
};
