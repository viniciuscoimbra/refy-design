import { HoverCardExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { HoverCard } from "./HoverCard";

/**
 * `HoverCard` — preview rico ao pairar sobre uma referência (link, mention, avatar).
 */
const meta = {
  id: "components-molecules-hovercard",
  title: "Components/Molecules/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Opens with a delay (default 500ms) and closes with a 200ms tolerance, so the cursor can travel to the card. Also opens on keyboard focus. 280px card, elevation 3. For complex clickable content, use `Popover`.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 260, paddingTop: 16 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    openDelay: { control: "number" },
    closeDelay: { control: "number" },
    side: { control: "inline-radio", options: ["top", "bottom"] },
    content: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof HoverCard>;
export default meta;

type Story = StoryObj<typeof HoverCard>;

function DomainProfile() {
  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar initials="RD" />
        <div>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>aurora.example.com</div>
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--ink-3)" }}>
            Project · tracked for 12 days
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, color: "var(--ink-2)", lineHeight: "var(--leading-normal)" }}>
        12 tasks · 142 keywords in the top 10 · 23k backlinks
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <Badge tone="success">Healthy</Badge>
        <Badge tone="neutral">SaaS B2B</Badge>
      </div>
    </div>
  );
}

/** Hover the link (500ms delay). */
export const Playground: Story = {
  args: { content: null, children: null },
  render: (args) => (
    <HoverCard {...args} content={<DomainProfile />}>
      <a href="#example" style={{ color: "var(--primary-ink, var(--primary))", fontWeight: 600, fontSize: 14 }}>
        aurora.example.com
      </a>
    </HoverCard>
  ),
};

/** No delay (openDelay 0), for an immediate demo. */
export const SemDelay: Story = {
  name: "No delay",
  args: { content: null, children: null, openDelay: 0 },
  render: (args) => (
    <HoverCard {...args} content={<DomainProfile />}>
      <a href="#example" style={{ color: "var(--primary-ink, var(--primary))", fontWeight: 600, fontSize: 14 }}>
        aurora.example.com
      </a>
    </HoverCard>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <HoverCardExample /> };
