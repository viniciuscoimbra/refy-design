import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "./BrandLogo";
const meta = { id: "components-atoms-brandlogo",
  title: "Components/Atoms/BrandLogo", component: BrandLogo, tags: ["autodocs"], args: { size: "md" } } satisfies Meta<typeof BrandLogo>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Assinatura: Story = { name: "Signature",};
export const Simbolo: Story = { name: "Symbol", args: { markOnly: true } };
export const SemAnimacao: Story = { name: "No animation", args: { animated: false } };
/** Symbol only, for narrow spaces like the closed side bar. The color comes from `--brand-mark`. */
export const SoSimbolo: Story = { name: "Symbol only", args: { symbol: true, markOnly: true } };
