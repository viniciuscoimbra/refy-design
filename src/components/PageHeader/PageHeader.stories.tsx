import { PageHeaderExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "../Breadcrumb";
import { Button } from "../Button";
import { SplitButton } from "../SplitButton";
import { PageHeader } from "./PageHeader";

/**
 * `PageHeader` — cabeçalho de página do app: eyebrow mono + `<h1>` + lead +
 * ações à direita, com slot de `Breadcrumb` em cima.
 */
const meta = {
  id: "components-molecules-pageheader",
  title: "Components/Molecules/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Page header (the `.ph`/`.shell-page-*` pattern of the reference screens). Optional mono uppercase `eyebrow`, `title` becomes the page `<h1>`, `lead` is the description (max. 62ch) and `actions` takes `Button`/`SplitButton` aligned to the right. The `breadcrumb` slot takes the `Breadcrumb` atom. Product rule: the breadcrumb always lives in the header and always leads back to the parent (every previous level has an `href`).",
          "",
          "**Where to use:** at the top of EVERY routed page of the app: dashboard, entity lists, each settings screen. It is the only place for the `<h1>`.",
          "",
          "**Where NOT to use:** section titles inside the page (use `SectionHeader`); a card header (use `Card` with `title`); a modal/drawer header (`Modal`/`Drawer` already have their own); the app top bar (use `Topbar`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    eyebrow: { control: "text", description: "Mono uppercase eyebrow above the title."},
    title: { control: "text", description: "Page title (`<h1>`)."},
    lead: { control: "text", description: "Description under the title (max. 62ch)."},
    actions: { control: false, description: "Actions slot (`Button`/`SplitButton`)."},
    breadcrumb: { control: false, description: "Slot for the `Breadcrumb` atom (on top)."},
  },
} satisfies Meta<typeof PageHeader>;
export default meta;

type Story = StoryObj<typeof PageHeader>;

/** Playground: eyebrow + title + lead + actions (dashboard pattern). */
export const Playground: Story = {
  args: {
    eyebrow: "Workspace · last updated 14 min ago",
    title: "Overview",
    lead: "3 projects · 12 analyses this month · 8 pending tasks",
    actions: (
      <>
        <Button variant="secondary">Export</Button>
        <Button variant="primary">New project</Button>
      </>
    ),
  },
};

/** With breadcrumb: trail on top, with a way back to the parent. */
export const ComBreadcrumb: Story = {
  name: "With breadcrumb",
  args: {
    breadcrumb: (
      <Breadcrumb
        items={[
          { label: "Settings", href: "#config" },
          { label: "Personal", href: "#personal" },
          { label: "Account" },
        ]}
      />
    ),
    title: "Account",
    lead: "Your profile, sign-in providers and active sessions in this workspace.",
    actions: <Button variant="secondary">Save changes</Button>,
  },
};

/** Title only: a simple page, without eyebrow/lead/actions. */
export const SoTitulo: Story = {
  name: "Title only",
  args: { title: "Preferences" },
};

/** With SplitButton: main action + menu of variations (e.g. export). */
export const ComSplitButton: Story = {
  name: "With SplitButton",
  args: {
    eyebrow: "Project · example.com",
    title: "Reports",
    lead: "The project's combined analyses, ready to export.",
    actions: (
      <SplitButton
        label="Export PDF"
        options={[
          { label: "Export CSV", hint: ".csv", onSelect: () => {} },
          { label: "Export JSON", hint: ".json", onSelect: () => {} },
        ]}
        onClick={() => {}}
      />
    ),
  },
};

export const Interativo: Story = { name: "Interactive", render: () => <PageHeaderExample /> };
