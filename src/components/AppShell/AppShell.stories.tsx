import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useCommandShortcut } from "../../_demo/shortcuts";
import { AppShell } from "./AppShell";
import { Card } from "../Card";
import { Button } from "../Button";
import { Command, type CommandItem } from "../Command";
import { HelpMenu } from "../HelpMenu";
import { NotificationBell, type NotificationItem } from "../NotificationBell";
import { UserMenu } from "../UserMenu";
import type { Workspace } from "../WorkspaceSwitcher";
import { Icons } from "../../_demo/icons";

const workspaces: Workspace[] = [
  {
    id: "horizonte",
    name: "Horizon team",
    role: "Team · Pro",
    initials: "HI",
  },
  { id: "coimbra", name: "Ana Silva", role: "Professional", initials: "VC" },
  {
    id: "pampulha",
    name: "South team",
    role: "Team · Starter",
    initials: "PL",
  },
];

const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "New content saved",
    description: "Marina saved an item to the collection.",
    time: "5 min ago",
    unread: true,
  },
  {
    id: "n2",
    title: "Review requested",
    description: "Three time slots were sent for confirmation.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "n3",
    title: "New member",
    description: "Ana Costa joined the team.",
    time: "3d ago",
  },
];

const commands: CommandItem[] = [
  { id: "new", label: "Add person", group: "Actions", shortcut: "⌘N" },
  {
    id: "visit",
    label: "See upcoming activity",
    group: "Actions",
    shortcut: "⌘V",
  },
  {
    id: "property",
    label: "Collection · References",
    group: "Recent content",
    lead: "IT",
  },
];

const user = { name: "João Mendes", email: "joao@example.com", initials: "JM" };

const sidebar = {
  brand: "refy",
  defaultActiveId: "dashboard",
  workspaces,
  account: user,
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
        {
          id: "notifications",
          label: "Notifications",
          icon: Icons.bell,
          badge: 3,
        },
        { id: "settings", label: "Settings", icon: Icons.settings },
      ],
    },
  ],
};

const meta = {
  id: "components-organisms-appshell",
  title: "Components/Organisms/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", refyFullPage: true },
  argTypes: {
    sidebar: { control: false },
    topbar: { control: false },
    contentMaxWidth: { control: "number" },
    children: { control: false },
  },
} satisfies Meta<typeof AppShell>;
export default meta;

type Story = StoryObj<typeof AppShell>;

/**
 * Full layout of the signed-in app, built purely from the real components: Sidebar (WorkspaceSwitcher + UserMenu), Topbar (Breadcrumb + Command trigger), NotificationBell, HelpMenu and a working ⌘K palette.
 */
export const Completo: Story = { name: "Complete",
  render: () => {
    const [activeId, setActiveId] = useState("dashboard");
    const activeLabel =
      sidebar.groups
        .flatMap((group) => group.items)
        .find((item) => item.id === activeId)?.label ?? "Overview";
    const [commandOpen, setCommandOpen] = useState(false);
    const [items, setItems] = useState(notifications);
    useCommandShortcut(() => setCommandOpen(true));
    return (
      <>
        <AppShell
          responsiveSidebar
          sidebar={{
            ...sidebar,
            activeId,
            onNavigate: (item) => setActiveId(item.id),
          }}
          topbar={{
            crumbs: [
              { label: "Horizon team", href: "#" },
              { label: activeLabel },
            ],
            onSearchClick: () => setCommandOpen(true),
            actions: (
              <>
                <NotificationBell
                  items={items}
                  onMarkAllRead={() =>
                    setItems((l) => l.map((n) => ({ ...n, unread: false })))
                  }
                />
                <HelpMenu />
                <UserMenu user={user} compact />
              </>
            ),
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".16em",
              color: "var(--ink-3)",
              margin: "0 0 8px",
            }}
          >
            Organization · Horizon team
          </p>
          <h1
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-.025em",
              color: "var(--ink-1)",
              margin: "0 0 20px",
            }}
          >
            {activeLabel}
          </h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <Card>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  color: "var(--ink-3)",
                }}
              >
                Active clients
              </div>
              <div
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  marginTop: 6,
                }}
              >
                128
              </div>
            </Card>
            <Card>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  color: "var(--ink-3)",
                }}
              >
                Activity · week
              </div>
              <div
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  marginTop: 6,
                }}
              >
                24
              </div>
            </Card>
            <Card>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  color: "var(--ink-3)",
                }}
              >
                Active content
              </div>
              <div
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--ink-1)",
                  marginTop: 6,
                }}
              >
                386
              </div>
            </Card>
          </div>
          <Card>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--ink-1)",
                    fontSize: 14,
                  }}
                >
                  New client
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-3)",
                    marginTop: 2,
                  }}
                >
                  Add content and organize your projects.
                </div>
              </div>
              <Button variant="primary" leadingIcon={Icons.plus}>
                Add person
              </Button>
            </div>
          </Card>
        </AppShell>
        <Command
          open={commandOpen}
          onOpenChange={setCommandOpen}
          items={commands}
        />
      </>
    );
  },
};
