import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar, type DateRange } from "./Calendar";

/**
 * `Calendar` — molécula de date picker. Modo `single` (uma data) ou `range`
 * (início → fim, ex.: ida e volta). Isolada, acessível (grid + teclado) e
 * baseada em tokens. Esta página cobre todos os estados possíveis.
 */
const meta = {
  id: "components-molecules-calendar",
  title: "Components/Molecules/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Working date picker. `mode=\"single\"` selects a day; `mode=\"range\"` selects a range with hover preview. Month navigation (buttons + PageUp/Down), keyboard (arrows + Enter) and `min`/`max` limits. Controlled via `value`/`onChange` or uncontrolled via `defaultValue`.",
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"], description: "Selection type."},
    numberOfMonths: { control: "inline-radio", options: [1, 2], description: "Meses lado a lado." },
    weekStartsOn: { control: "inline-radio", options: [0, 1], description: "0 = domingo, 1 = segunda." },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
    month: { control: false },
    defaultMonth: { control: false },
  },
} satisfies Meta<typeof Calendar>;
export default meta;

type Story = StoryObj<typeof Calendar>;

/** Playground: change `mode`, `numberOfMonths` and `weekStartsOn` in the controls. */
export const Playground: Story = {
  args: { mode: "single", numberOfMonths: 1, weekStartsOn: 0, defaultValue: new Date() },
};

/** One date, uncontrolled. Click a day and it selects itself. */
export const SingleDefault: Story = {
  name: "Single · default",
  args: { mode: "single", defaultValue: new Date() },
};

/** One date, controlled: the state lives in the parent and shows below. */
export const SingleControlled: Story = {
  name: "Single · controlled",
  render: (args) => {
    const [date, setDate] = useState<Date | null>(new Date());
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Calendar {...args} mode="single" value={date} onChange={(v) => setDate(v as Date)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
          {date ? date.toISOString().slice(0, 10) : "no date"}
        </code>
      </div>
    );
  },
};

/** A range across two months, the round-trip case for a journey. */
export const RangeDualMonth: Story = {
  name: "Range · round trip",
  render: (args) => {
    const [range, setRange] = useState<DateRange>({ start: null, end: null });
    const fmt = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "—");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Calendar {...args} mode="range" numberOfMonths={2} value={range} onChange={(v) => setRange(v as DateRange)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-2)" }}>
          {fmt(range.start)} → {fmt(range.end)}
        </code>
      </div>
    );
  },
};

/** A range within a single month. */
export const RangeSingleMonth: Story = {
  name: "Range · 1 month",
  args: { mode: "range", numberOfMonths: 1 },
};

/** Only allows picking from today on (past days disabled). */
export const MinLimit: Story = {
  name: "With minimum limit",
  args: { mode: "single", min: new Date() },
};

/** Week starting on Monday. */
export const WeekStartsMonday: Story = {
  name: "Week starts Monday",
  args: { mode: "single", weekStartsOn: 1, defaultValue: new Date() },
};
