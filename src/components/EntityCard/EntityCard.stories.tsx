import type { Meta, StoryObj } from "@storybook/react";
import { photos } from "../../blocks/photos";
import { EntityCard } from "./EntityCard";

const meta = {
  id: "components-organisms-entitycard",
  title: "Components/Organisms/EntityCard",
  component: EntityCard,
  tags: ["autodocs"],
  args: {
    title: "Cast iron teapot",
    subtitle: "Kitchen · 1.2 liters",
    image: photos.shopTeapot,
    imageAlt: "Black teapot on a wooden table",
    price: "$ 89",
    meta: "Ships in 2 days",
    badge: "New",
    badgeTone: "info",
    rating: { value: 4.7, count: 212 },
    actions: [{ label: "Add to cart" }, { label: "Details" }],
  },
} satisfies Meta<typeof EntityCard>;
export default meta;
type Story = StoryObj<typeof EntityCard>;

const narrow: Story["decorators"] = [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>];

export const Produto: Story = { name: "Product", decorators: narrow };
export const Horizontal: Story = {
  name: "Horizontal",
  args: {
    layout: "horizontal",
    title: "Quiet two-bedroom",
    subtitle: "Savassi, Belo Horizonte",
    image: photos.homeQuiet,
    imageAlt: "Living room with large windows facing the trees",
    price: "$ 1,450 / month",
    meta: "2 bedrooms · 64 m²",
    badge: undefined,
    rating: undefined,
    description: "Bright corner unit, two blocks from the park.",
    actions: [{ label: "Schedule a visit" }, { label: "Save" }],
  },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
};
export const Compacto: Story = {
  name: "Compact, no photo",
  args: {
    category: "Teapots",
    badge: "In stock",
    badgeTone: "success",
    title: "Cast iron teapot 1.2 L",
    subtitle: undefined,
    image: undefined,
    rating: { value: 4.6, count: 312 },
    description: "Enamelled inside, with a steel infuser and a wooden handle.",
    price: "$ 89",
    meta: undefined,
    actions: [],
  },
};
export const Pessoa: Story = {
  name: "Person",
  args: {
    title: "Clara Mendes",
    subtitle: "Design engineer",
    image: photos.personClara,
    imageAlt: "",
    price: undefined,
    meta: "Lisbon · Available in December",
    badge: undefined,
    rating: undefined,
    description: "Builds design systems and the tooling around them.",
    actions: [{ label: "Message" }],
  },
  decorators: narrow,
};
