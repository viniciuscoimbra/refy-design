import type { Meta, StoryObj } from "@storybook/react";
import { PersonCell } from "./PersonCell";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";

/** `PersonCell` — célula padrão de pessoa/entidade em tabelas e listas. */
const meta = {
  id: "components-molecules-personcell",
  title: "Components/Molecules/PersonCell",
  component: PersonCell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Display cell: `Avatar` (slot) + name + secondary line. `tag` adds an inline suffix (\"you\", role). Entity variant = same component with `Avatar shape=\"square\"` (project, workspace, organization).",
          "",
          "**Where to use:** member/owner columns in `Table` (team, projects), lists of people, account menu headers. Every person/team appears with an avatar: this is the standard.",
          "",
          "**Where NOT to use:** a whole clickable item that navigates (use `NavCard` with `leading`); a group of several avatars (use `AvatarGroup`); a text-only cell (use plain text in the `Table`).",
        ].join("\n"),
      },
    },
  },
  args: {
    name: "Marina Salgado",
    secondary: "marina@example.com",
    size: "md",
  },
  argTypes: {
    name: { control: "text" },
    secondary: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    avatar: { control: false, description: "Slot: pass the `Avatar` atom." },
    tag: { control: false, description: "Inline suffix after the name." },
  },
} satisfies Meta<typeof PersonCell>;
export default meta;

type Story = StoryObj<typeof PersonCell>;

export const Pessoa: Story = { name: "Person",
  render: (args) => (
    <PersonCell {...args} avatar={<Avatar size="md" initials="MS" seed="Marina Salgado" />} />
  ),
};

export const VoceComTag: Story = {
  name: "With tag (you)",
  render: () => (
    <PersonCell
      avatar={<Avatar size="md" initials="JM" seed="João Mendes" />}
      name="João Mendes"
      tag="you"
      secondary="joao@example.com"
    />
  ),
};

export const ComBadgeDePapel: Story = { name: "With role badge",
  render: () => (
    <PersonCell
      avatar={<Avatar size="md" initials="RC" seed="Rafael Costa" />}
      name="Rafael Costa"
      tag={<Badge tone="neutral">Member</Badge>}
      secondary="rafael@example.com"
    />
  ),
};

export const Entidade: Story = {
  name: "Entity (square Avatar)",
  render: () => (
    <PersonCell
      avatar={<Avatar shape="square" size="md" initials="CV" seed="Origin team" />}
      name="Origin team"
      secondary="editorial coverage · 128 pages"
    />
  ),
};

export const CompactaEmTabela: Story = {
  name: "Compact (sm, table cell)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 260 }}>
      <PersonCell
        size="sm"
        avatar={<Avatar size="xs" initials="JM" seed="João Mendes" />}
        name="João Mendes"
        secondary="owner"
      />
      <PersonCell
        size="sm"
        avatar={<Avatar size="xs" initials="MS" seed="Marina Salgado" />}
        name="Marina Salgado"
        secondary="dona"
      />
    </div>
  ),
};
