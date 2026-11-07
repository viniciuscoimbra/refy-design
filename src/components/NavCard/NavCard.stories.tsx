import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Avatar } from "../Avatar";
import { NavCard } from "./NavCard";

/**
 * `NavCard` — card de navegação clicável com chevron ">" (padrão do
 * workspace picker). O card inteiro é o alvo de clique/teclado.
 */
const meta = {
  id: "components-molecules-navcard",
  title: "Components/Molecules/NavCard",
  component: NavCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Clickable navigation card with a \">\" chevron on the right. With `href` it becomes `<a>` (real navigation); without `href` it becomes `<button>` (action via `onClick`). `leading` takes an `Avatar` or icon; `meta` takes a pill/counter; `current` marks the current destination; `variant=\"dashed\"` is the creation variant (\"create new…\").",
          "",
          "**Where to use:** lists of destinations where the whole item navigates, including account origin, links to people or organizations, workspace choice, project choice, settings hub and \"create new X\" at the end of an entity list.",
          "",
          "**Where NOT to use:** setting or action inside the current page (use `SettingRow`); data rows with several actions per row (use `Table`); persistent side navigation (use `Sidebar` or `SettingsSubnav`); informational card without navigation (use `Card`); a simple one-off action (use `Button`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Linha principal." },
    description: { control: "text", description: "Optional secondary line." },
    href: { control: "text", description: "Com href vira `<a>`; sem, `<button>`." },
    disabled: { control: "boolean" },
    current: { control: "boolean", description: "Current destination (primary border/background)." },
    variant: { control: "inline-radio", options: ["solid", "dashed"] },
    showChevron: { control: "boolean" },
    onClick: { action: "clicked" },
    leading: { control: false },
    meta: { control: false },
  },
} satisfies Meta<typeof NavCard>;
export default meta;

type Story = StoryObj<typeof NavCard>;

/** Playground: button (no href), with avatar and meta. */
export const Playground: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return <div><NavCard {...args} current={selected} onClick={() => setSelected(true)} /><p role="status">{selected ? 'Example team selected in this example.' : 'Select the team to try it.'}</p></div>;
  },
  args: {
    title: "Example team",
    description: "example.com · Refy Pro · 4 members",
    leading: <Avatar initials="GE" size="lg" />,
    meta: <span>Admin</span>,
  },
};

/** As a link: renders `<a href>`; native keyboard navigation. */
export const ComoLink: Story = {
  name: "As a link (href)",
  args: {
    title: "Flora Bem-Estar",
    description: "florabemestar.com.br · Refy Starter",
    leading: <Avatar initials="FB" size="lg" />,
    href: "#flora",
  },
};

/** Current destination: `current` turns on primary border/background + `aria-current`. */
export const Atual: Story = { name: "Current",
  args: {
    title: "Example team",
    description: "Workspace you are in now",
    leading: <Avatar initials="GE" size="lg" />,
    current: true,
    href: "#current",
  },
};

/** Disabled: no click and no Tab focus (link) / `disabled` (button). */
export const Desabilitado: Story = { name: "Disabled",
  args: {
    title: "Paper Studio",
    description: "Invite pending. Wait for the admin's approval",
    leading: <Avatar initials="EP" size="lg" />,
    disabled: true,
  },
};

/** Dashed variant: a create action at the end of a list. */
export const CriarNovo: Story = {
  name: "Create new (dashed)",
  args: {
    title: "Create new workspace",
    description: "For a new site, client or brand. Separate plan and billing.",
    variant: "dashed",
    leading: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
};

/** Full list, the same composition as the `workspace_picker` screen. */
export const ListaDeWorkspaces: Story = {
  name: "Environment list",
  args: { title: "" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 560 }}>
      <NavCard
        title="Example team"
        description="example.com · Refy Pro · 4 members · 3 projects"
        leading={<Avatar initials="GE" size="lg" />}
        meta={<span>Admin · owner</span>}
        current
        href="#globo"
      />
      <NavCard
        title="Flora Bem-Estar"
        description="florabemestar.com.br · Refy Starter · 1 member"
        leading={<Avatar initials="FB" size="lg" />}
        meta={<span>Admin</span>}
        href="#flora"
      />
      <NavCard
        title="Create new workspace"
        description="For a new site, client or brand."
        variant="dashed"
        leading={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        }
      />
    </div>
  ),
};

/** Previous and next: footer of a documentation page. */
export const PreviousNext: Story = {
  render: () => (
    <nav aria-label="Pages" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 560 }}>
      <NavCard direction="back" eyebrow="Previous" title="Installation" href="#installation" />
      <NavCard direction="forward" eyebrow="Next" title="Theme from a file" href="#theme" />
    </nav>
  ),
};
