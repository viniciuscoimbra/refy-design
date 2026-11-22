import type { Meta, StoryObj } from "@storybook/react";
import { media } from "../../blocks/media";
import { photos } from "../../blocks/photos";
import { AudioPlayer } from "./AudioPlayer";

const meta = {
  id: "components-molecules-audioplayer",
  title: "Components/Molecules/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
  args: { src: media.tones, title: "Four tones", description: "Sound check · 10 s", artwork: photos.coverPlaylist, duration: 10 },
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
} satisfies Meta<typeof AudioPlayer>;
export default meta;
type Story = StoryObj<typeof AudioPlayer>;

export const Padrao: Story = { name: "Default" };
export const SemCapa: Story = { name: "Without artwork", args: { artwork: undefined, description: "Voice note from Bruno" } };
