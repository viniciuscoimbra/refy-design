import type { Meta, StoryObj } from "@storybook/react";
import { KeyValueList } from "./KeyValueList";

const order = [
  { label: "Placed on", value: "Nov 21, 2026" },
  { label: "Delivery", value: "Standard", hint: "3 to 5 business days" },
  { label: "Payment", value: "Card ending in 4821" },
  { label: "Total", value: "$ 184.90" },
];

const meta = {
  id: "components-molecules-keyvaluelist",
  title: "Components/Molecules/KeyValueList",
  component: KeyValueList,
  tags: ["autodocs"],
  args: { items: order, title: "Order #48213" },
} satisfies Meta<typeof KeyValueList>;
export default meta;
type Story = StoryObj<typeof KeyValueList>;

export const Linhas: Story = { name: "Rows" };
export const Colunas: Story = {
  name: "Columns",
  args: {
    layout: "columns",
    title: undefined,
    items: [
      { label: "Area", value: "64 m²" },
      { label: "Bedrooms", value: "2" },
      { label: "Parking", value: "1 spot" },
      { label: "Floor", value: "7th" },
      { label: "Condo fee", value: "$ 210", hint: "per month" },
      { label: "Built", value: "2019" },
    ],
  },
};
export const SemLinhas: Story = { name: "Without dividers", args: { dividers: false, title: undefined } };
