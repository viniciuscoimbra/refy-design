import type { Meta, StoryObj } from "@storybook/react";
import { photos } from "../../blocks/photos";
import { ImageGallery } from "./ImageGallery";

const homes = [
  { src: photos.homeBalcony, alt: "Building facade with plants on every balcony", caption: "Building" },
  { src: photos.homeQuiet, alt: "Living room with large windows facing the trees", caption: "Living room" },
  { src: photos.homeStudio, alt: "Living room with a gray sofa and a large plant", caption: "Lounge" },
  { src: photos.homePenthouse, alt: "Balcony overlooking the sea and a coastal town", caption: "Balcony" },
  { src: photos.coverSunday, alt: "Open window next to plants", caption: "Bedroom window" },
  { src: photos.coverPlateau, alt: "Green field near the building", caption: "Park nearby" },
];

const meta = {
  id: "components-molecules-imagegallery",
  title: "Components/Molecules/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs"],
  args: { images: homes, label: "Apartment photos" },
  decorators: [(Story) => <div style={{ maxWidth: 640 }}><Story /></div>],
} satisfies Meta<typeof ImageGallery>;
export default meta;
type Story = StoryObj<typeof ImageGallery>;

export const Padrao: Story = { name: "Default" };
export const Destaque: Story = { name: "Featured", args: { layout: "featured" } };
export const DuasColunas: Story = { name: "Two columns, square", args: { columns: 2, aspectRatio: 1, images: homes.slice(0, 4) } };
export const SemAmpliar: Story = { name: "Without viewer", args: { viewer: false, columns: 4 } };
