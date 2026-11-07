import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleGroup } from "./ToggleGroup";

/**
 * `ToggleGroup` — botões liga/desliga independentes (seleção múltipla).
 */
const meta = {
  id: "components-atoms-togglegroup",
  title: "Components/Atoms/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Each toggle is an `aria-pressed` button; when on it gets primary-soft + brand ink. For single selection use `Segmented`. Controlled via `value`/`onChange` or uncontrolled.",
      },
    },
  },
  argTypes: {
    options: { control: false },
    label: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof ToggleGroup>;
export default meta;

type Story = StoryObj<typeof ToggleGroup>;

const layers = [
  { value: "critical", label: "Critical" },
  { value: "notices", label: "Warnings" },
  { value: "resolved", label: "Resolved" },
  { value: "info", label: "Info" },
];

/** Several independent toggles. */
export const Playground: Story = {
  args: { options: layers, label: "Layers", defaultValue: ["critical", "notices"] },
};

/** Controlled. */
export const Controlled: Story = {
  name: "Controlled",
  args: { options: layers, label: "Layers" },
  render: (args) => {
    const [values, setValues] = useState<string[]>(["critical"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <ToggleGroup {...args} value={values} onChange={setValues} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          [{values.join(", ") || "empty"}]
        </code>
      </div>
    );
  },
};

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", args: { options: layers, label: "Layers unavailable", defaultValue: ["critical"], disabled: true } };
