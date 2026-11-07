import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

/**
 * `Avatar` — pessoa (circular) ou entidade (quadrado arredondado):
 * workspace, projeto, logo de organização.
 */
const meta = {
  id: "components-atoms-avatar",
  title: "Components/Atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Avatar with initials or an image. `shape=\"circle\"` (default) for a person; `shape=\"square\"` for an entity (workspace, project, logo). `seed` generates a deterministic brand gradient per string: the same name always gets the same color, on any screen.",
          "",
          "**Where to use:** every person (professional, team member, account) and every nameable entity (workspace in the picker, project in a table, logo without an image). Sizes: `xs`/`sm` in table cells and lists; `md` in menus and headers; `lg` in the picker; `xl` (72px) only on the profile (account photo).",
          "",
          "**Where NOT to use:** an external service logo with its own SVG (WordPress, Google: use the `ConnectorCard` logo slot); an action icon (use `IconButton`); stacked groups (use `AvatarGroup`).",
        ].join("\n"),
      },
    },
  },
  args: { initials: "JM", size: "md", shape: "circle" },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    seed: { control: "text", description: "Deterministic gradient per string." },
    color: { control: "color" },
  },
} satisfies Meta<typeof Avatar>;
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Iniciais: Story = { name: "Initials",};

export const Tamanhos: Story = { name: "Sizes",
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Avatar size="xs" initials="JM" />
      <Avatar size="sm" initials="JM" />
      <Avatar size="md" initials="MC" seed="Marina Costa" />
      <Avatar size="lg" initials="PL" seed="Paulo Lima" />
      <Avatar size="xl" initials="JM" />
    </div>
  ),
};

export const QuadradoEntidade: Story = {
  name: "Square (entity)",
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Avatar shape="square" size="sm" initials="GE" seed="Example team" />
      <Avatar shape="square" size="md" initials="GE" seed="Example team" />
      <Avatar shape="square" size="lg" initials="VG" seed="Aurora team" />
      <Avatar shape="square" size="xl" initials="CV" seed="Origin team" />
    </div>
  ),
};

export const GradienteDeterministico: Story = {
  name: "Deterministic gradient (seed)",
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {["Example team", "Aurora team", "Origin team", "João Mendes", "Marina Salgado"].map(
        (name) => (
          <Avatar
            key={name}
            shape="square"
            size="lg"
            seed={name}
            initials={name
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
            title={name}
          />
        )
      )}
    </div>
  ),
};

export const PerfilXL: Story = {
  name: "Profile (xl, 72px)",
  args: { size: "xl", initials: "JM" },
};
