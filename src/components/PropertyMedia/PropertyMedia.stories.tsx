import { sampleArtwork } from "../../_demo/content";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MediaGallery, type PropertyMediaItem } from "./PropertyMedia";

const artwork = (width: number, height: number, color: string, _label: string) => sampleArtwork(color, width, height);

const landscape: PropertyMediaItem[] = [
  { src: artwork(1200, 800, "#b8dcf0", "Cover"), alt: "Cover of a document collection" },
  { src: artwork(1200, 800, "#f1c99b", "Version A"), alt: "First editorial layout" },
  { src: artwork(1200, 800, "#c8d4f0", "Version B"), alt: "Second editorial layout" },
];

function Frame({ children, width = 720 }: { children: React.ReactNode; width?: number }) {
  return <div style={{ width: `min(100%, ${width}px)` }}>{children}</div>;
}

const meta = {
  id: "components-molecules-propertymedia",
  title: "Components/Molecules/MediaGallery",
  component: MediaGallery,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { items: landscape },
} satisfies Meta<typeof MediaGallery>;
export default meta;
type Story = StoryObj<typeof MediaGallery>;

export const Paisagem: Story = { name: "Landscape", render: (args) => <Frame><MediaGallery {...args} /></Frame> };
export const Retrato: Story = { name: "Portrait", render: (args) => <Frame width={520}><MediaGallery {...args} items={[{ src: artwork(600, 1000, "#c7dded", "Portrait photo"), alt: "Portrait layout" }]} fit="contain" /></Frame> };
export const Quadrada: Story = { name: "Square", render: (args) => <Frame width={560}><MediaGallery {...args} items={[{ src: artwork(800, 800, "#e0c3a5", "Square photo"), alt: "Square layout" }]} aspectRatio="1 / 1" /></Frame> };
export const Panoramica: Story = { name: "Panoramic", render: (args) => <Frame><MediaGallery {...args} items={[{ src: artwork(1800, 500, "#b7dbee", "Panoramic"), alt: "Panoramic layout" }]} aspectRatio="16 / 7" fit="contain" /></Frame> };
export const Pequena: Story = { name: "Small", render: (args) => <Frame><MediaGallery {...args} items={[{ src: artwork(240, 160, "#d3dff0", "240 × 160"), alt: "Low-resolution image" }]} /></Frame> };

export const Carregando: Story = { name: "Loading", render: (args) => <Frame><MediaGallery {...args} loading /></Frame> };

export const Erro: Story = { name: "Error",
  render: (args) => {
    const [retrying, setRetrying] = useState(false);
    return (
      <Frame>
        <MediaGallery
          {...args}
          items={retrying ? landscape : [{ src: "invalid://property-photo", alt: "Content image" }]}
          errorMessage={retrying ? undefined : "The photo source did not respond."}
          onRetry={() => setRetrying(true)}
        />
      </Frame>
    );
  },
};
