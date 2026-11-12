import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { useCommandShortcut } from "../../_demo/shortcuts";
import { Button } from "../Button";
import { Command, type CommandItem } from "./Command";

const PlusIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const RerunIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const items: CommandItem[] = [
  {
    id: "new",
    label: "Create new project",
    group: "Actions",
    icon: PlusIcon,
    shortcut: "⌘N",
    keywords: "create start",
  },
  {
    id: "rerun",
    label: "Re-run last update",
    group: "Actions",
    icon: RerunIcon,
    shortcut: "⌘R",
    keywords: "repeat refresh",
  },
  {
    id: "rd",
    label: "aurora.example.com",
    group: "Recent projects",
    lead: "RD",
  },
  {
    id: "rr",
    label: "horizonte.example.com",
    group: "Recent projects",
    lead: "RR",
  },
  {
    id: "settings",
    label: "Open settings",
    group: "Actions",
    shortcut: "⌘,",
  },
];

/**
 * `Command` — paleta de comandos (⌘K) com busca global, grupos e atalhos.
 */
const meta = {
  id: "components-organisms-command",
  title: "Components/Organisms/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Search with term highlighting, grouping by `group`, shortcuts in `kbd`, ↑/↓ + Enter + Esc, `aria-activedescendant`. Overlay controlled by `open`/`onOpenChange` (no global state): register the ⌘K shortcut in the app and open the palette. 560px card, list with 360px max-height.",
      },
    },
  },
  argTypes: {
    open: { control: false },
    onOpenChange: { control: false },
    items: { control: false },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof Command>;
export default meta;

type Story = StoryObj<typeof Command>;

/** Open by default: type "análise" to see filtering + highlight. */
export const Aberta: Story = { name: "Open",
  args: { open: true, onOpenChange: () => {}, items },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: 480 }}>
        {!open && (
          <div style={{ padding: 24 }}>
            <Button onClick={() => setOpen(true)}>Reopen palette</Button>
          </div>
        )}
        <Command {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};

/** Real flow: ⌘K (or Ctrl+K) opens, Esc closes. Click the area and use the shortcut. */
export const ComAtalho: Story = {
  name: "With ⌘K shortcut",
  args: { open: false, onOpenChange: () => {}, items },
  render: (args) => {
    const [open, setOpen] = useState(false);
    useCommandShortcut(() => setOpen(true));
    return (
      <div
        style={{
          minHeight: 480,
          padding: 24,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Button onClick={() => setOpen(true)}>Open palette</Button>
        <code
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--ink-3)",
          }}
        >
          ou pressione ⌘K / Ctrl+K
        </code>
        <Command {...args} open={open} onOpenChange={setOpen} />
      </div>
    );
  },
};

export const ComDescricoes: Story = { name: "With descriptions",
  args: { open: false, onOpenChange: () => {}, items: [] },
  render: () => {
    const [open, setOpen] = useState(false);
    const [chosen, setChosen] = useState("No component selected");
    return (
      <>
        <Button onClick={() => setOpen(true)}>Search components</Button>
        <p role="status">{chosen}</p>
        <Command
          open={open}
          onOpenChange={setOpen}
          width={760}
          onSelect={(item) => setChosen(item.label)}
          items={[
            {
              id: "themes",
              label: "Themes",
              description: "Settings you can export to your product.",
            },
            {
              id: "components",
              label: "Components",
              description: "Atoms, molecules and organisms from the library.",
            },
          ]}
        />
      </>
    );
  },
};

/** `search` replaces the built-in filter: here a word must match a keyword exactly, in any of the three languages. */
export const BuscaPropria: Story = { name: "Own search",
  args: { open: false, onOpenChange: () => {}, items: [] },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Search by keyword</Button>
        <Command
          open={open}
          onOpenChange={setOpen}
          search={(list, query) => list.filter((item) => item.keywords?.split(" ").includes(query.toLowerCase()))}
          items={[
            { id: "button", label: "Button", keywords: "button botão botón" },
            { id: "table", label: "Table", keywords: "table tabela tabla" },
            { id: "input", label: "Input", keywords: "input campo" },
          ]}
        />
      </>
    );
  },
};
