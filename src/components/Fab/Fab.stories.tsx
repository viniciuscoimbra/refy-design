import type { Meta, StoryObj } from "@storybook/react";
import { Fab } from "./Fab";
import { Icons } from "../../_demo/icons";

const meta = {
  id: "components-atoms-fab",
  title: "Components/Atoms/Fab",
  component: Fab,
  tags: ["autodocs"],
  args: { icon: Icons.plus, label: "New project" },
  argTypes: {
    size: { control: "inline-radio", options: ["md", "lg"] },
    variant: { control: "inline-radio", options: ["primary", "surface"] },
  },
} satisfies Meta<typeof Fab>;
export default meta;

type Story = StoryObj<typeof Fab>;

/** Round, icon only (the label becomes aria-label). */
export const FabPadrao: Story = { name: "Default" };

/** Extended: pill with text. */
export const FabEstendido: Story = { name: "Extended", args: { extended: true } };

/** Surface variant (white). */
export const FabSurface: Story = { name: "Surface", args: { variant: "surface" } };

/** Medium size. */
export const FabMedio: Story = { name: "Medium", args: { size: "md" } };

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true } };
