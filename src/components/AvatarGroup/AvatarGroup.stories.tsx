import { useState } from "react";
import { AvatarGroupExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { AvatarGroup, type AvatarGroupItem } from "./AvatarGroup";

/**
 * `AvatarGroup` — avatares empilhados com sobreposição e overflow "+N".
 */
const meta = {
  id: "components-molecules-avatargroup",
  title: "Components/Molecules/AvatarGroup",
  component: AvatarGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Composed on the `Avatar` atom: each person is an Avatar with a surface ring; the overflow (`items.length - max`) becomes a \"+N\" chip whose tooltip lists the remaining names. Stable order (first person on top). With `onItemClick`/`onOverflowClick` the items become real buttons (Tab, Enter/Space, visible focus).",
          "",
          "### Where to use",
          "- Compact summary of who takes part in something: team members (ref. `settings_team`), members of a group, owners of a piece of content/project.",
          "- Table cell or card header where the full list does not fit.",
          "- With `onOverflowClick` leading to the full list (page or the app's Drawer).",
          "",
          "### Where NOT to use",
          "- A single person: use the `Avatar` atom directly.",
          "- When each person's name must be visible (use a list/`Table` with an avatar + name cell).",
          "- As a people picker: to choose, use `Combobox` (avatar variant) or `Multiselect`.",
          "- Never rebuild the stacking by hand in screens: this component is the standard.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    items: { control: false, description: "People in display order."},
    max: {
      control: { type: "number", min: 1 },
      description: 'Maximum visible before "+N".',
    },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    onItemClick: {
      control: false,
      description: "When present, each avatar becomes a button.",
    },
    onOverflowClick: {
      control: false,
      description: 'When present, "+N" becomes a button.',
    },
  },
} satisfies Meta<typeof AvatarGroup>;
export default meta;

type Story = StoryObj<typeof AvatarGroup>;

const team: AvatarGroupItem[] = [
  { name: "Joana Martins" },
  { name: "Marcos Silva", color: "var(--legacy-ink-2)" },
  { name: "Renata Costa" },
  { name: "Paulo Braga", color: "var(--legacy-ink-2)" },
  { name: "Ana Lúcia Prado" },
  { name: "Caio Fernandes" },
  { name: "Duda Rocha" },
];

/** Playground: 7 people, `max=4` makes the "+3" chip (hover shows the names). */
export const Playground: Story = {
  args: { items: team, max: 4 },
};

/** All visible (items ≤ max): no "+N" chip. */
export const SemOverflow: Story = {
  name: "No overflow",
  args: { items: team.slice(0, 3), max: 4 },
};

/** Sizes inherited from the Avatar atom. */
export const Tamanhos: Story = { name: "Sizes",
  args: { items: team, max: 4 },
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      <AvatarGroup {...args} size="sm" />
      <AvatarGroup {...args} size="md" />
      <AvatarGroup {...args} size="lg" />
    </div>
  ),
};

/** Clickable: avatars and "+N" become buttons (Tab + Enter/Space, visible focus). */
export const Clicavel: Story = {
  name: "Clickable",
  args: {
    items: team,
    max: 4,
  },
  render: (args) => {
    const [selected, setSelected] = useState("Select a person.");
    return (
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <AvatarGroup
          {...args}
          onItemClick={(item) =>
            setSelected(`Selected person: ${item.name}`)
          }
          onOverflowClick={() =>
            setSelected(
              `Other members: ${args.items
                .slice(args.max ?? 4)
                .map((item) => item.name)
                .join(", ")}`,
            )
          }
        />
        <p role="status">{selected}</p>
      </div>
    );
  },
};

export const Interativo: Story = { name: "Interactive", render: () => <AvatarGroupExample /> };
