import type { Meta, StoryObj } from "@storybook/react";
import { photos } from "../../blocks/photos";
import { Quote } from "./Quote";

const meta = {
  id: "components-molecules-quote",
  title: "Components/Molecules/Quote",
  component: Quote,
  tags: ["autodocs"],
  args: {
    children: "We changed the theme file on a Friday and the whole app followed, buttons, charts and emails included.",
    author: "Ana Ribeiro",
    source: "Product lead, Horizon",
  },
} satisfies Meta<typeof Quote>;
export default meta;
type Story = StoryObj<typeof Quote>;

export const Bloco: Story = { name: "In the text" };
export const Destaque: Story = {
  name: "Testimonial",
  args: {
    variant: "pull",
    avatar: photos.personAna,
    children: "Support answered in four minutes and solved it on the first reply.",
    author: "Ana Ribeiro",
    source: "Customer since 2021",
  },
};
export const SemFoto: Story = {
  name: "Testimonial without photo",
  args: { variant: "pull", children: "The best coffee in the neighborhood, and the staff remembers your order.", author: "Bruno Lima", source: "Review on the app" },
};
