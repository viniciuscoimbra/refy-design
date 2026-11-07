import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Segmented } from "./Segmented";

/**
 * `Segmented` — seleção única em pílula (switch de visões).
 */
const meta = {
  id: "components-atoms-segmented",
  title: "Components/Atoms/Segmented",
  component: Segmented,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Recessed track; the active segment gets a raised surface. `radiogroup` semantics with ←/→ moving the selection. Controlled via `value`/`onChange` or uncontrolled. For multiple choice use `ToggleGroup`.",
      },
    },
  },
  argTypes: {
    options: { control: false },
    label: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Segmented>;
export default meta;

type Story = StoryObj<typeof Segmented>;

const views = [
  { value: "list", label: "List" },
  { value: "kanban", label: "Kanban" },
  { value: "timeline", label: "Timeline" },
];

/** Three views: click or use ←/→. */
export const Playground: Story = {
  args: { options: views, label: "Overview", defaultValue: "list" },
};

/** Controlled. */
export const Controlled: Story = {
  name: "Controlled",
  args: { options: views, label: "Overview" },
  render: (args) => {
    const [view, setView] = useState("kanban");
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <Segmented {...args} value={view} onChange={setView} />
        <code
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-3)",
          }}
        >
          {view}
        </code>
      </div>
    );
  },
};

/** With a disabled option. */
export const ComDisabled: Story = {
  name: "Disabled option",
  args: {
    label: "Overview",
    options: [
      ...views.slice(0, 2),
      { value: "map", label: "Map", disabled: true },
    ],
  },
};

/** Icons with tooltip and arrow navigation. */
export const Icones: Story = {
  name: "Icons and tooltips",
  args: {
    label: "Device",
    iconOnly: true,
    sliding: true,
    defaultValue: "desktop",
    options: [
      {
        value: "desktop",
        label: "Desktop",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 21h8M12 16v5" />
          </svg>
        ),
      },
      {
        value: "tablet",
        label: "Tablet",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M11 17h2" />
          </svg>
        ),
      },
      {
        value: "mobile",
        label: "Phone",
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="6" y="2" width="12" height="20" rx="2" />
            <path d="M11 18h2" />
          </svg>
        ),
      },
    ],
  },
};
