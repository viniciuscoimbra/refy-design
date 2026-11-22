import type { Meta, StoryObj } from "@storybook/react";
import { ComparisonTable } from "./ComparisonTable";

const meta = {
  id: "components-organisms-comparisontable",
  title: "Components/Organisms/ComparisonTable",
  component: ComparisonTable,
  tags: ["autodocs"],
  args: {
    caption: "Plan comparison",
    options: ["Starter", "Team", "Business"],
    highlight: 1,
    rows: [
      { feature: "Price per month", values: ["Free", "$ 12", "$ 29"] },
      { feature: "Projects", values: ["3", "Unlimited", "Unlimited"] },
      { feature: "Custom theme", values: [false, true, true] },
      { feature: "Single sign-on", hint: "SAML and OIDC", values: [false, false, true] },
      { feature: "Support", values: ["Community", "Email", "Priority"] },
    ],
  },
} satisfies Meta<typeof ComparisonTable>;
export default meta;
type Story = StoryObj<typeof ComparisonTable>;

export const Padrao: Story = { name: "Default" };
export const SemDestaque: Story = { name: "Without recommendation", args: { highlight: undefined } };
export const Estreita: Story = {
  name: "Narrow screen",
  decorators: [(Story) => <div style={{ maxWidth: 340 }}><Story /></div>],
};
