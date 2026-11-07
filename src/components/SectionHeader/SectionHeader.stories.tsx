import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { SectionHeader } from "./SectionHeader";

/**
 * `SectionHeader` — cabeçalho de seção dentro de uma página: `<h2>` + sub +
 * count (`Badge`) + ação inline, com `id` de âncora para o `TableOfContents`.
 */
const meta = {
  id: "components-molecules-sectionheader",
  title: "Components/Molecules/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Section header (the `.shell-section-h`/`.section-h` pattern of the reference screens). `title` becomes `<h2>`, `sub` is the description, `count` renders a neutral `Badge` next to the title and `action` sits on the right. The `id` is the section anchor: pass the same `id` to `TableOfContents` for the scrollspy to work (the component already applies `scroll-margin-top`). `rule` turns on the compact dashboard variant: 12px uppercase title + a rule to the edge.",
          "",
          "**Where to use:** to split a page into sections: each block of a settings screen (Connections, Active sessions…), groups of cards on the dashboard. Whenever the section appears in the `TableOfContents`, give it an `id`.",
          "",
          "**Where NOT to use:** the page title (use `PageHeader`: the `<h1>` is its job); a title inside a `Card` (use the Card's own `title`); a form field label (use the `Input` `label`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Section title (`<h2>`)."},
    sub: { control: "text", description: "Optional subtitle/description."},
    count: { control: "text", description: "Contador: vira `Badge` neutro." },
    action: { control: false, description: "Inline action on the right."},
    id: { control: "text", description: "Âncora p/ `TableOfContents`." },
    rule: {
      control: "boolean",
      description: "Variant with a rule to the edge (dashboard).",
    },
  },
} satisfies Meta<typeof SectionHeader>;
export default meta;

type Story = StoryObj<typeof SectionHeader>;

/** Playground: title + sub (settings pattern). */
export const Playground: Story = {
  args: {
    title: "Active sessions",
    sub: "Devices signed in to your account. End any suspicious session.",
    id: "sessions",
  },
};

/** With count and action: neutral Badge next to the title, action on the right. */
export const ComCountEAcao: Story = {
  name: "With count and action",
  args: {
    title: "Connections",
    sub: "Sign-in providers connected to your account.",
    count: "3",
    action: (
      <Button size="sm" variant="ghost">
        Add provider
      </Button>
    ),
    id: "connections",
  },
};

/** rule variant: compact uppercase title + rule to the edge (dashboard). */
export const ComRegua: Story = {
  name: "With rule",
  args: {
    title: "Projects",
    count: "3 projects · 2 active",
    rule: true,
    action: (
      <a href="#projects" style={{ font: "inherit" }}>
        Manage →
      </a>
    ),
    id: "projects",
  },
};

/** TOC anchor: sections with `id` match `TableOfContents` (scrollspy). */
export const AncoraToc: Story = {
  name: "Anchor for TableOfContents",
  args: { title: "" },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        maxWidth: 640,
      }}
    >
      <SectionHeader
        id="anchor-profile"
        title="Profile"
        sub="Name, email and avatar shown to the team."
      />
      <SectionHeader
        id="anchor-connections"
        title="Connections"
        count="3"
        sub="Sign-in providers connected to your account."
      />
      <SectionHeader
        id="anchor-sessions"
        title="Active sessions"
        count="2"
        sub="Each `id` above is the anchor the TableOfContents watches."
      />
    </div>
  ),
};
