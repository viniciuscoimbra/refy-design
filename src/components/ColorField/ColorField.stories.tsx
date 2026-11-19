import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ColorField } from "./ColorField";

const meta = {
  id: "components-molecules-colorfield",
  title: "Components/Molecules/ColorField",
  component: ColorField,
  tags: ["autodocs"],
  args: { label: "Brand color", defaultValue: "#2163ad" },
} satisfies Meta<typeof ColorField>;
export default meta;
type Story = StoryObj<typeof ColorField>;

export const Padrao: Story = { name: "Default" };
export const Controlado: Story = { name: "Controlled",
  render: () => {
    const [color, setColor] = useState("#0f7b5f");
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: 320 }}>
        <ColorField label="Primary" value={color} onChange={setColor} hint="Used on buttons and links." />
        <p>Value: {color}</p>
      </div>
    );
  },
};
export const ComPaleta: Story = { name: "With theme colors",
  render: () => {
    const [color, setColor] = useState("#c2410c");
    return <ColorField label="Accent" value={color} onChange={setColor} presets={["#2163ad", "#0f7b5f", "#c2410c", "#7c3aed", "#111827"]} />;
  },
};
export const Paleta: Story = { name: "Swatch palette",
  render: () => {
    const [colors, setColors] = useState(["#2163ad", "#0f7b5f", "#c2410c", "#7c3aed"]);
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "var(--space-2)", maxWidth: 360 }}>
        {colors.map((color, index) => (
          <ColorField key={index} appearance="swatch" label={`Chart color ${index + 1}`} value={color} onChange={(next) => setColors(colors.map((c, i) => (i === index ? next : c)))} />
        ))}
      </div>
    );
  },
};
export const Desabilitado: Story = { name: "Disabled", args: { label: "Locked color", defaultValue: "#6b7280", disabled: true } };
