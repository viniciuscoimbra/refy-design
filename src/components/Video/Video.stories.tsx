import type { Meta, StoryObj } from "@storybook/react";
import { media } from "../../blocks/media";
import { Video } from "./Video";

const meta = {
  id: "components-molecules-video",
  title: "Components/Molecules/Video",
  component: Video,
  tags: ["autodocs"],
  args: { src: media.gradient, poster: media.gradientPoster, title: "Theme colors in motion", description: "Six seconds, no sound." },
  decorators: [(Story) => <div style={{ maxWidth: 560 }}><Story /></div>],
} satisfies Meta<typeof Video>;
export default meta;
type Story = StoryObj<typeof Video>;

export const Arquivo: Story = { name: "Video file" };
export const YouTube: Story = {
  name: "YouTube link",
  args: { src: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", poster: undefined, title: "Open movie on YouTube", description: "The player loads only after the click, without cookies." },
};
export const Quadrado: Story = { name: "Square", args: { aspectRatio: 1, description: undefined } };
