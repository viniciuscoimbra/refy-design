import { BreadcrumbExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumb } from "./Breadcrumb";

/**
 * `Breadcrumb` — trilha de navegação mono uppercase.
 */
const meta = {
  id: "components-molecules-breadcrumb",
  title: "Components/Molecules/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Single-line trail with an icon root, truncated links and the middle collapsed into a navigable Menu. The last item uses `aria-current=\"page\"`; the separator is customizable.",
      },
    },
  },
  argTypes: {
    items: { control: false },
    separator: { control: "text" },
  },
} satisfies Meta<typeof Breadcrumb>;
export default meta;

type Story = StoryObj<typeof Breadcrumb>;

/** Three levels with links. */
export const Playground: Story = {
  args: {
    items: [
      { label: "Projects", href: "#projects" },
      { label: "refy.com.br", href: "#refy" },
      { label: "Documentation" },
    ],
  },
};

/** Custom separator. */
export const SeparadorSeta: Story = {
  name: "› separator",
  args: {
    separator: "›",
    items: [
      { label: "Dashboard", href: "#dash" },
      { label: "Analyses", href: "#analyses" },
      { label: "84 pages" },
    ],
  },
};

export const SeteNiveis: Story = {
  name: "7 levels · navigable collapse",
  args: {
    root: { label: "Home", href: "#home" },
    items: [
      { label: "Workspaces", href: "#workspaces" },
      { label: "Horizon team", href: "#team" },
      { label: "Clients", href: "#clients" },
      { label: "Ana Silva", href: "#client" },
      { label: "Searches", href: "#searches" },
      { label: "Suggested content", href: "#contents" },
      { label: "Identity guide" },
    ],
  },
};

export const TermoLongo: Story = {
  name: "Long label · truncation",
  args: {
    root: { label: "Home", href: "#home" },
    items: [
      { label: "Content", href: "#contents" },
      { label: "Complete visual identity guide with recommendations for publishing new content" },
    ],
  },
  render: (args) => <div style={{ width: "100%", maxWidth: 420 }}><Breadcrumb {...args} /></div>,
};

export const Interativo: Story = { name: "Interactive", render: () => <BreadcrumbExample /> };
