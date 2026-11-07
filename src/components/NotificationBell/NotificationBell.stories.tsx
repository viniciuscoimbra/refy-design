import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { NotificationBell, type NotificationItem } from "./NotificationBell";

const items: NotificationItem[] = [
  { id: "n1", title: "Review complete", description: "refy.com.br: 84 pages, 12 critical.", time: "5 min ago", unread: true },
  { id: "n2", title: "Project moved ahead 4 steps", description: "Aurora project in the current cycle.", time: "2h ago", unread: true },
  { id: "n3", title: "Credits running low", description: "300 credits left this cycle.", time: "1d ago", unread: true },
  { id: "n4", title: "Invite accepted", description: "Ana Costa joined the workspace.", time: "3d ago" },
  { id: "n5", title: "Weekly report available", description: "Summary for June 12–18.", time: "5d ago" },
];

/**
 * `NotificationBell` — sino com contador de não lidas + painel de notificações.
 */
const meta = {
  id: "components-molecules-notificationbell",
  title: "Components/Molecules/NotificationBell",
  component: NotificationBell,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Red badge over the bell with the `unread` count (9+ truncates); panel with title/description/time and a green dot on unread items. State belongs to the app: `onItemClick` and `onMarkAllRead` emit events; in the 'Full flow' story, clicking a notification marks it as read. Esc/outside click close.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 400, minHeight: 440, display: "flex", justifyContent: "flex-end", paddingTop: 8 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    items: { control: false },
    title: { control: "text" },
    emptyMessage: { control: "text" },
    onItemClick: { action: "item" },
    onMarkAllRead: { action: "mark-all" },
  },
} satisfies Meta<typeof NotificationBell>;
export default meta;

type Story = StoryObj<typeof NotificationBell>;

/** 3 unread + 2 read: note the green dot and the title weight. */
export const Playground: Story = {
  args: { items },
};

/**
 * Full flow: clicking a notification marks it as read (the dot goes away, the badge decreases); "Mark all as read" clears the badge.
 */
export const FluxoCompleto: Story = {
  name: "Full flow",
  args: { items },
  render: (args) => {
    const [list, setList] = useState(items);
    return (
      <NotificationBell
        {...args}
        items={list}
        onItemClick={(item) =>
          setList((l) => l.map((n) => (n.id === item.id ? { ...n, unread: false } : n)))
        }
        onMarkAllRead={() => setList((l) => l.map((n) => ({ ...n, unread: false })))}
      />
    );
  },
};

/** All read: no badge, no mark action. */
export const TodasLidas: Story = {
  name: "All read",
  args: { items: items.map((n) => ({ ...n, unread: false })) },
};

/** More than 9 unread: the badge truncates to "9+". */
export const MuitasNaoLidas: Story = {
  name: "9+ unread",
  args: {
    items: Array.from({ length: 12 }, (_, i) => ({
      id: `m-${i}`,
      title: `Notification ${i + 1}`,
      time: `${i + 1}h ago`,
      unread: true,
    })),
  },
};

/** Empty. */
export const Empty: Story = {
  name: "No notifications",
  args: { items: [] },
};
