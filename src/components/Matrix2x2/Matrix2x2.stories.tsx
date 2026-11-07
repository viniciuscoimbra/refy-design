import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Matrix2x2, type MatrixPoint } from "./Matrix2x2";

const points: MatrixPoint[] = [
  { id: "p1", label: "\"How the scheme worked\" block", x: 55, y: 88, prioritized: true },
  { id: "p2", label: "Investigation timeline", x: 18, y: 66 },
  { id: "p3", label: "Answer real questions", x: 22, y: 78 },
  { id: "p4", label: "Title with an explanatory promise", x: 18, y: 34 },
  { id: "p5", label: "Context FAQ", x: 30, y: 82 },
  { id: "p6", label: "Context links", x: 24, y: 32 },
  { id: "p7", label: "Rewrite meta description", x: 62, y: 55 },
  { id: "p8", label: "Merge duplicate pages", x: 74, y: 70 },
  { id: "p9", label: "Move to SSR", x: 88, y: 60 },
  { id: "p10", label: "Fix alt text", x: 40, y: 20 },
];

/**
 * `Matrix2x2` — matriz impacto × esforço com pontos numerados por prioridade.
 */
const meta = {
  id: "components-organisms-matrix2x2",
  title: "Components/Organisms/Matrix2x2",
  component: Matrix2x2,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Points placed by `x`/`y` (0–100) and colored on a continuous scale from `--critical` (first in the list) to `--info` (last) via `color-mix`. Center crosshair, dotted grid, labeled quadrants and axes, legend with the scale. Each point is a focusable button with a tooltip.",
      },
    },
  },
  argTypes: {
    points: { control: false },
    selectedId: { control: false },
    defaultSelectedId: { control: false },
    quadrants: { control: false },
    legend: { control: false },
    xLabel: { control: "text" },
    yLabel: { control: "text" },
    onPointClick: { action: "point" },
  },
} satisfies Meta<typeof Matrix2x2>;
export default meta;

type Story = StoryObj<typeof Matrix2x2>;

/** Prioritizing improvements: impact × effort. */
export const Playground: Story = {
  args: {
    points,
    xLabel: "Effort →",
    yLabel: "Impact →",
    quadrants: {
      topLeft: (
        <>
          <b>Do it now</b>High impact, low effort.
        </>
      ),
      topRight: (
        <>
          <b>Foundation</b>High impact, needs planning.
        </>
      ),
      bottomLeft: (
        <>
          <b>Fine-tune</b>Quick, marginal gain.
        </>
      ),
      bottomRight: (
        <>
          <b>Reassess</b>High cost, low return.
        </>
      ),
    },
  },
};

/** Controlled selection: click a point and see the item below. */
export const Selecionavel: Story = {
  name: "With selection",
  args: { points },
  render: (args) => {
    const [selected, setSelected] = useState<MatrixPoint | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Matrix2x2
          {...args}
          selectedId={selected?.id ?? null}
          onPointClick={setSelected}
        />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          selected: {selected ? selected.label : "no selection"}
        </code>
      </div>
    );
  },
};
