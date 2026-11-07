import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Combobox, type ComboboxOption } from "./Combobox";

/**
 * `Combobox` — input com sugestões ancoradas. O popover compartilha a borda
 * e o fundo do input: uma única superfície que expande, sem gap.
 */
const meta = {
  id: "components-molecules-combobox",
  title: "Components/Molecules/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "ARIA 1.2 combobox pattern: filter with the typed part highlighted, sections by `group`, full keyboard (arrows, Enter, Escape, Home/End) and `aria-activedescendant`. Controlled via `value`/`onChange` or uncontrolled via `defaultValue`; the text can also be controlled (`inputValue`) for async suggestions with `filter={false}`.",
          "",
          "\"People\" variant: options with `avatar` (photo/initials through the `Avatar` atom) and `description` (secondary meta, e.g. team). The selected value also shows the avatar in the input.",
          "",
          "### Where to use",
          "- Choosing ONE entity from a searchable list: page, domain, content.",
          "- The `avatar` + `description` variant whenever the option is a person/team: choosing an owner, transferring items (source/target), assigning an owner.",
          "",
          "### Where NOT to use",
          "- Multiple selection: use `Multiselect`.",
          "- Few fixed options (≤ ~7) without search: use the native `Select`.",
          "- Global navigation/command: use `Command` (⌘K).",
          "- Never build a parallel \"people combobox\": it is this variant (optional option fields), not another component.",
        ].join("\n"),
      },
    },
  },
  // Largura fixa para o campo não variar entre estados.
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    options: { control: false, description: "Suggested options."},
    filter: { control: false, description: "`true` (default), a custom function or `false` (list already filtered)."},
    icon: { control: false, description: "Left icon (default: magnifier)."},
    clearable: { control: "boolean", description: "Clear button when there is text."},
    label: { control: "text" },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    error: { control: "text" },
    hint: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    onInputValueChange: { action: "input" },
    value: { control: false },
    defaultValue: { control: false },
    inputValue: { control: false },
  },
} satisfies Meta<typeof Combobox>;
export default meta;

type Story = StoryObj<typeof Combobox>;

const projects: ComboboxOption[] = [
  { value: "aurora", label: "aurora.example.com", lead: "RS", meta: "12 tasks", group: "Suggestions" },
  { value: "horizonte", label: "horizonte.example.com", lead: "RS", meta: "8 tasks", group: "Suggestions" },
  { value: "origin", label: "origem.example.com", lead: "RR", meta: "5 tasks", group: "Suggestions" },
  { value: "atlas", label: "atlas.example.com", lead: "RD", meta: "4 tasks", group: "Suggestions" },
  { value: "north", label: "north.example.com", lead: "RB", meta: "6 tasks", group: "Suggestions" },
];

const pages: ComboboxOption[] = [
  { value: "/checkout/confirmacao", label: "/checkout/confirmacao", lead: "/", meta: "2.3k/mo", group: "Recent" },
  { value: "/checkout/pix", label: "/checkout/pix", lead: "/", meta: "980/mo", group: "Recent" },
  { value: "/planos", label: "/planos", lead: "/", meta: "5.1k/mo", group: "Most visited" },
  { value: "/guias/primeiros-passos", label: "/guias/primeiros-passos", lead: "/", meta: "3.4k/mo", group: "Most visited" },
  { value: "/precos", label: "/precos", lead: "/", meta: "1.9k/mo", group: "Most visited" },
];

/** Playground: type "aurora" to see filtering + highlight. */
export const Playground: Story = {
  args: {
    label: "Project",
    placeholder: "Search projects…",
    options: projects,
  },
};

/** Uncontrolled with an initial selection. */
export const Default: Story = {
  name: "Default · uncontrolled",
  args: {
    label: "Project",
    placeholder: "Search projects…",
    options: projects,
    defaultValue: "aurora",
  },
};

/** Controlled: the selection lives in the parent and shows below. */
export const Controlled: Story = {
  name: "Controlled",
  args: { label: "Project", options: projects },
  render: (args) => {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Combobox
          {...args}
          value={selected}
          onChange={(option) => setSelected(option?.value ?? null)}
        />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          selected: {selected ?? "—"}
        </code>
      </div>
    );
  },
};

/** Multiple sections via `group`: Recent + Most visited. */
export const Grouped: Story = {
  name: "With sections",
  args: {
    label: "Search page",
    placeholder: "Type a path…",
    options: pages,
  },
};

/** No results for the search. */
export const Empty: Story = {
  name: "No results",
  args: {
    label: "Project",
    options: projects,
    inputValue: "zzz",
    emptyMessage: "No domain found",
  },
};

/** Error state with a message. */
export const WithError: Story = {
  name: "With error",
  args: {
    label: "Project",
    options: projects,
    error: "Select a valid project.",
  },
};

const people: ComboboxOption[] = [
  { value: "joana", label: "Joana Martins", avatar: { name: "Joana Martins" }, description: "Design · Aurora team" },
  { value: "marcos", label: "Marcos Silva", avatar: { name: "Marcos Silva", color: "var(--legacy-ink-2)" }, description: "Product · Aurora team" },
  { value: "renata", label: "Renata Costa", avatar: { name: "Renata Costa" }, description: "Content · Horizon team" },
  { value: "paulo", label: "Paulo Braga", avatar: { name: "Paulo Braga", color: "var(--legacy-ink-3)" }, description: "Design · Horizon team" },
  { value: "ana", label: "Ana Lúcia Prado", avatar: { name: "Ana Lúcia Prado" }, description: "Operations · Origin team" },
];

/**
 * Guide case, transferring ownership: SOURCE owner (selected, avatar in the input) on top; TARGET below. Each option shows Avatar + name + team.
 */
export const ComAvatar: Story = {
  name: "With avatar (people)",
  args: { options: people },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Combobox
        label="Source owner"
        placeholder="Search people…"
        options={people}
        defaultValue="joana"
      />
      <Combobox
        label="Destination owner"
        placeholder="Search people…"
        options={people.filter((c) => c.value !== "joana")}
      />
    </div>
  ),
};

/** Disabled field. */
export const Disabled: Story = {
  args: {
    label: "Project",
    options: projects,
    disabled: true,
    placeholder: "Unavailable",
  },
};
