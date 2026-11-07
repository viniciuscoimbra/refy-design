import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useCommandShortcut } from "../../_demo/shortcuts";
import { Topbar } from "./Topbar";
import { Command, type CommandItem } from "../Command";
import { HelpMenu } from "../HelpMenu";
import { NotificationBell, type NotificationItem } from "../NotificationBell";
import { UserMenu } from "../UserMenu";

const notifications: NotificationItem[] = [
  { id: "n1", title: "Review complete", description: "refy.com.br: 84 pages, 12 critical.", time: "5 min ago", unread: true },
  { id: "n2", title: "Project moved ahead 4 steps", description: "Aurora project in the current cycle.", time: "2h ago", unread: true },
  { id: "n3", title: "Invite accepted", description: "Ana Costa joined the workspace.", time: "3d ago" },
];

const commands: CommandItem[] = [
  { id: "new", label: "Create new project", group: "Actions", shortcut: "⌘N" },
  { id: "rerun", label: "Re-run last update", group: "Actions", shortcut: "⌘R" },
  { id: "rd", label: "aurora.example.com", group: "Recent projects", lead: "RD" },
];

/**
 * `Topbar` — barra superior global. Composição pura: `Breadcrumb` à esquerda,
 * a busca é o trigger do `Command` (⌘K) e as ações compõem `NotificationBell`,
 * `HelpMenu` e `UserMenu`.
 */
const meta = {
  id: "components-organisms-topbar",
  title: "Components/Organisms/Topbar",
  component: Topbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Everything works in this story: click the search (or ⌘K) to open the `Command` palette; the bell opens the notification panel (clicking one marks it as read); the \"?\" opens the `HelpMenu`; the avatar opens the `UserMenu`.",
      },
    },
  },
  argTypes: {
    crumbs: { control: false },
    brand: { control: "inline-radio", options: ["refy", "refy"] },
    composition: { control: "inline-radio", options: ["search", "tabs", "dense"] },
    searchPlaceholder: { control: "text" },
    onSearchClick: { control: false },
    tabs: { control: false },
    segments: { control: false },
    actions: { control: false },
  },
} satisfies Meta<typeof Topbar>;
export default meta;

type Story = StoryObj<typeof Topbar>;

/** Live Topbar: all components integrated and working together. */
export const Padrao: Story = { name: "Default",
  render: () => {
    const [commandOpen, setCommandOpen] = useState(false);
    const [items, setItems] = useState(notifications);
    useCommandShortcut(() => setCommandOpen(true));
    return (
      <div style={{ minHeight: 480 }}>
        <Topbar
          brand="refy"
          crumbs={[{ label: "Example team", href: "#" }, { label: "Overview" }]}
          onSearchClick={() => setCommandOpen(true)}
          actions={
            <>
              <NotificationBell
                items={items}
                onItemClick={(item) =>
                  setItems((l) => l.map((n) => (n.id === item.id ? { ...n, unread: false } : n)))
                }
                onMarkAllRead={() => setItems((l) => l.map((n) => ({ ...n, unread: false })))}
              />
              <HelpMenu />
              <UserMenu user={{ name: "João Mendes", email: "joao@example.com", initials: "JM" }} compact />
            </>
          }
        />
        <p style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          Click search or press ⌘K · bell, help and avatar open too.
        </p>
        <Command open={commandOpen} onOpenChange={setCommandOpen} items={commands} />
      </div>
    );
  },
};

const appTabs = [
  { id: "view", label: "Overview" },
  { id: "clients", label: "Clients", badge: 18 },
  { id: "contents", label: "Content" },
  { id: "activities", label: "Activity", badge: 4 },
];

/** Composition with canonical pill Tabs and real navigation. */
export const TabsPill: Story = {
  render: () => {
    const [tab, setTab] = useState("view");
    return (
      <div style={{ minHeight: 360 }}>
        <Topbar
          brand="refy"
          composition="tabs"
          crumbs={[{ label: "Portfolio" }, { label: "Overview" }]}
          tabs={appTabs}
          tabValue={tab}
          onTabChange={setTab}
          actions={<UserMenu user={{ name: "Ana Silva", email: "ana@example.com", initials: "AS" }} compact />}
        />
        <p role="status" style={{ padding: 24, color: "var(--ink-2)" }}>Active area: {tab}.</p>
      </div>
    );
  },
};

/** Dense composition with canonical Segmented. */
export const DensaSegmentada: Story = { name: "Dense segmented",
  render: () => {
    const [view, setView] = useState("list");
    return (
      <div style={{ minHeight: 360 }}>
        <Topbar
          brand="refy"
          composition="dense"
          crumbs={[{ label: "Clients" }, { label: "18 active" }]}
          segments={[
            { value: "list", label: "List" },
            { value: "kanban", label: "Kanban" },
            { value: "matrix", label: "Matrix" },
          ]}
          segmentValue={view}
          onSegmentChange={setView}
          actions={<UserMenu user={{ name: "Ana Silva", email: "ana@example.com", initials: "AS" }} compact />}
        />
        <p role="status" style={{ padding: 24, color: "var(--ink-2)" }}>View: {view}.</p>
      </div>
    );
  },
};

/** A narrow container proves the Topbar's local response, without depending on the documentation viewport. */
export const Responsiva: Story = { name: "Responsive",
  decorators: [(Story) => <div style={{ width: 390, maxWidth: "100%", borderRight: "1px solid var(--line)" }}><Story /></div>],
  render: () => (
    <div style={{ minHeight: 320 }}>
      <Topbar
        brand="refy"
        crumbs={[{ label: "Portfolio" }, { label: "Activities scheduled this week" }]}
        onSearchClick={() => {}}
        actions={<UserMenu user={{ name: "Ana Silva", email: "ana@example.com", initials: "AS" }} compact />}
      />
    </div>
  ),
};
