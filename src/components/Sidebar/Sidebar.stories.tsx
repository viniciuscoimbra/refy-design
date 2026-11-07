import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar } from "./Sidebar";
import { Icons } from "../../_demo/icons";

const meta = {
  id: "components-organisms-sidebar",
  title: "Components/Organisms/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Live composition: the workspace is a `WorkspaceSwitcher`, the CTA is a `Button`, counters are `Badge` and the account is a `UserMenu` that opens upward. Clicking an item changes the active one (`defaultActiveId`). When collapsed, workspace/account become avatars that EXPAND the sidebar before opening.",
      },
    },
  },
  argTypes: {
    defaultCollapsed: { control: "boolean" },
    defaultMode: { control: "inline-radio", options: ["expanded", "rail", "compact"] },
    defaultActiveId: { control: "text" },
    workspaces: { control: false },
    account: { control: false },
    cta: { control: false },
    groups: { control: false },
  },
  args: {
    brand: "refy",
    defaultActiveId: "dashboard",
    workspaces: [
      { id: "horizonte", name: "Horizon team", role: "Team · Pro", initials: "HI" },
      { id: "coimbra", name: "Ana Silva", role: "Professional", initials: "VC" },
      { id: "pampulha", name: "South team", role: "Team · Starter", initials: "PL" },
    ],
    account: { name: "João Mendes", email: "joao@example.com", initials: "JM" },
    cta: { label: "New client", icon: Icons.plus },
    groups: [
      {
        section: "Work",
        items: [
          { id: "dashboard", label: "Overview", icon: Icons.dashboard },
          { id: "projects", label: "Content", icon: Icons.projects },
          { id: "backlog", label: "Clients", icon: Icons.backlog, badge: 12 },
          { id: "monitor", label: "Activity", icon: Icons.monitor },
          { id: "competitors", label: "People", icon: Icons.competitors },
        ],
      },
      {
        section: "System",
        items: [
          { id: "notifications", label: "Notifications", icon: Icons.bell, badge: 3 },
          { id: "settings", label: "Settings", icon: Icons.settings },
        ],
      },
    ],
  },
} satisfies Meta<typeof Sidebar>;
export default meta;

type Story = StoryObj<typeof Sidebar>;

/** Working workspace switcher + user menu: click them. */
export const Expandida: Story = { name: "Expanded",};

/** Rail (72px): icons and short labels, with the same items and badges. */
export const Rail: Story = { args: { defaultMode: "rail" } };

/** Compact (56px): icons only; labels stay in the accessible name and tooltip. */
export const Compacta: Story = { name: "Compact", args: { defaultMode: "compact" } };
