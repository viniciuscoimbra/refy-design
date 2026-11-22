import type { Meta, StoryObj } from "@storybook/react";
import { photos } from "../../blocks/photos";
import { LinkCard } from "./LinkCard";

const meta = {
  id: "components-molecules-linkcard",
  title: "Components/Molecules/LinkCard",
  component: LinkCard,
  tags: ["autodocs"],
  args: {
    href: "https://refy.design/docs",
    title: "Getting started with refy",
    description: "Install the package, wrap the app in the provider and change the whole look with one theme file.",
    image: photos.coverNeon,
  },
  decorators: [(Story) => <div style={{ maxWidth: 520 }}><Story /></div>],
} satisfies Meta<typeof LinkCard>;
export default meta;
type Story = StoryObj<typeof LinkCard>;

export const Horizontal: Story = { name: "Horizontal" };
export const Vertical: Story = { name: "Vertical", args: { layout: "vertical" }, decorators: [(Story) => <div style={{ maxWidth: 320 }}><Story /></div>] };
export const SemImagem: Story = { name: "Without image", args: { image: undefined, href: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl", title: "The description list element", siteName: "MDN Web Docs" } };
