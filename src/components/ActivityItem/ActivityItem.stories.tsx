import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ActivityItem } from "./ActivityItem";
import { Button } from "../Button";
const meta = { id: "components-molecules-activityitem", title: "Components/Molecules/ActivityItem", component: ActivityItem, tags: ["autodocs"], args: { actor: { name: "Ana Silva", initials: "AS" }, title: "commented on the content review", timestamp: "Oct 23, 14:30", description: "The navigation is clearer. We can go ahead with this proposal.", badge: { label: "Comment", tone: "info" }, metadata: "Aurora project · References" } } satisfies Meta<typeof ActivityItem>;
export default meta;
type Story = StoryObj<typeof ActivityItem>;
export const ComAutoria: Story = { name: "With author", render: (args) => {
  const [read, setRead] = useState(false);
  return <ActivityItem {...args} action={<Button size="sm" variant="ghost" disabled={read} onClick={() => setRead(true)}>{read ? "Read" : "Mark as read"}</Button>} />;
} };
export const Compacto: Story = { name: "Compact", args: { density: "compact" } };
export const SemAutoria: Story = { name: "No author", args: { actor: undefined, title: "Sync complete", description: "The collection files are up to date." } };
