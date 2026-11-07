import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Multiselect, type MultiselectOption } from "./Multiselect";

/**
 * `Multiselect` — seleção múltipla com chips removíveis dentro do campo.
 * Chips inteiros conforme o espaço disponível e contador `+N`; opções inline ou sobrepostas.
 */
const meta = {
  id: "components-molecules-multiselect",
  title: "Components/Molecules/Multiselect",
  component: Multiselect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Type to filter, Enter/click toggles the option, Backspace with an empty input removes the last chip. ARIA combobox + `aria-multiselectable` listbox pattern, navigation with arrows/Home/End and `aria-activedescendant`. Controlled via `value`/`onChange` or uncontrolled via `defaultValue`.",
      },
    },
  },
  // Largura fixa: o campo não cresce conforme chips são adicionados.
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 460 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    options: { control: false, description: "Available options."},
    maxVisibleChips: { control: "number", description: "Optional cap; chips that do not fit also go into the +N counter."},
    label: { control: "text" },
    placeholder: { control: "text" },
    emptyMessage: { control: "text" },
    error: { control: "text" },
    hint: { control: "text" },
    disabled: { control: "boolean" },
    onChange: { action: "changed" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Multiselect>;
export default meta;

type Story = StoryObj<typeof Multiselect>;

const areas: MultiselectOption[] = [
  { value: "design", label: "Documentation" },
  { value: "content", label: "Content" },
  { value: "links", label: "Files" },
  { value: "perf", label: "Performance" },
  { value: "a11y", label: "Accessibility" },
  { value: "schema", label: "Schema · JSON-LD" },
  { value: "intl", label: "Internationalization" },
  { value: "mobile", label: "Mobile UX" },
  { value: "social", label: "Open Graph · Cards" },
  { value: "index", label: "Indexing" },
];

/** Playground: type to filter, Backspace removes the last chip. */
export const Playground: Story = {
  args: {
    label: "Work areas",
    placeholder: "Add areas…",
    options: areas,
    defaultValue: ["design", "content", "links", "perf", "a11y", "schema"],
  },
};

/** Three selected: they fit on the line, no fade. */
export const Selected: Story = {
  name: "With selection",
  args: {
    label: "Work areas",
    options: areas,
    defaultValue: ["design", "content", "links"],
    hint: "Click × to remove, or press Backspace with the input empty.",
  },
};

/** Seven selected: the visible count depends on the available space. */
export const OverflowScroll: Story = {
  name: "Overflow · automatic counter",
  args: {
    label: "Work areas",
    options: areas,
    defaultValue: ["design", "content", "links", "perf", "a11y", "schema", "intl"],
    hint: "Resize the preview: only whole chips show; the rest goes into the counter.",
  },
};

/** Chips beyond 2 collapse into a +N counter. */
export const OverflowCounter: Story = {
  name: "Overflow · +N counter",
  args: {
    label: "Work areas",
    options: areas,
    defaultValue: ["design", "content", "links", "perf", "a11y"],
    maxVisibleChips: 2,
  },
};

/** Controlled: the state lives in the parent and shows below. */
export const Controlled: Story = {
  name: "Controlled",
  args: { label: "Work areas", options: areas },
  render: (args) => {
    const [values, setValues] = useState<string[]>(["design"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Multiselect {...args} value={values} onChange={setValues} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          [{values.join(", ") || "empty"}]
        </code>
      </div>
    );
  },
};

/** Error state with a message. */
export const WithError: Story = {
  name: "With error",
  args: {
    label: "Work areas",
    options: areas,
    defaultValue: ["design"],
    error: "Select at least two areas.",
  },
};

/** Disabled field. */
export const Disabled: Story = {
  args: {
    label: "Work areas",
    options: areas,
    defaultValue: ["design", "content"],
    disabled: true,
  },
};

/** Overlaid list, without pushing the content below. */
export const Sobreposto: Story = { name: "Overlaid", args: { label: "Materials", options: areas, defaultValue: ["design", "content"], listPlacement: "overlay" } };
