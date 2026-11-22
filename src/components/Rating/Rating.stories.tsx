import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Rating } from "./Rating";

const meta = {
  id: "components-atoms-rating",
  title: "Components/Atoms/Rating",
  component: Rating,
  tags: ["autodocs"],
  args: { label: "Restaurant rating", value: 4.5, readOnly: true, count: 128 },
} satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof Rating>;

export const Leitura: Story = { name: "Read only" };
export const ComRotulo: Story = { name: "With visible label", args: { label: "Customer rating", value: 4.6, count: 1284, showLabel: true } };
export const Escolha: Story = {
  name: "Pick a rating",
  render: () => {
    const [value, setValue] = useState(3);
    return (
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <Rating label="Your rating" value={value} onChange={setValue} size="lg" />
        <p>Value: {value}</p>
      </div>
    );
  },
};
export const Tamanhos: Story = {
  name: "Sizes",
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <Rating label="Small" size="sm" readOnly value={3.5} count={42} />
      <Rating label="Medium" size="md" readOnly value={4.2} count={1280} />
      <Rating label="Large" size="lg" readOnly value={5} />
    </div>
  ),
};
export const Desabilitado: Story = { name: "Disabled", args: { label: "Locked rating", readOnly: false, value: 2, disabled: true, count: undefined } };
