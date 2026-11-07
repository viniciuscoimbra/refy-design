import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";
import { Button } from "../Button";

const meta = {
  id: "components-atoms-divider",
  title: "Components/Atoms/Divider",
  component: Divider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Visual separator between blocks: a horizontal line (with an optional centered label, like the \"or\" in the workspace picker) or a vertical one between inline items. `spacing` controls the outer margin along the flow axis. Always `role=\"separator\"`.\n\n" +
          "**Where to use:** separating alternatives in flows (\"or\" between joining a workspace and creating a new one), separating loose sections inside a card, separating inline action groups (vertical in toolbars).\n\n" +
          "**Where NOT to use:** between list/setting rows (the divider there belongs to the container: `UsageMeterGroup`, `Table` and similar bring their own); as a section title (that is a section header, gap L2); do not use a hand-styled `<hr>`: this atom exists to replace that improvisation.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
  },
} satisfies Meta<typeof Divider>;
export default meta;

type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <p style={{ margin: 0 }}>Top block</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Bottom block</p>
    </div>
  ),
};

export const ComRotulo: Story = {
  name: "With a center label",
  args: { label: "or" },
  render: (args) => (
    <div style={{ maxWidth: 420, display: "flex", flexDirection: "column" }}>
      <Button variant="secondary">Join a workspace</Button>
      <Divider {...args} />
      <Button variant="ghost">Create a new workspace</Button>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical", spacing: "sm" },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <Button variant="ghost" size="sm">Export</Button>
      <Divider {...args} />
      <Button variant="ghost" size="sm">Duplicate</Button>
      <Divider {...args} />
      <Button variant="ghost" size="sm">Archive</Button>
    </div>
  ),
};

export const Espacamentos: Story = {
  name: "Spacing",
  render: () => (
    <div style={{ maxWidth: 420 }}>
      {(["none", "sm", "md", "lg"] as const).map((spacing) => (
        <div key={spacing}>
          <code style={{ fontSize: "var(--text-2xs)" }}>spacing="{spacing}"</code>
          <Divider spacing={spacing} />
        </div>
      ))}
    </div>
  ),
};
