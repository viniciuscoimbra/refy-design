import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";
import { Badge } from "../Badge";

const meta = {
  id: "components-atoms-checkbox",
  title: "Components/Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Checkbox with a custom check over a native input. Also covers the \"checkbox field\" pattern: `description` (supporting text), `tag` (inline label, e.g. a \"destructive\" `Badge` on a dangerous permission), `meta` (mono on the right) and `boxed` (selectable bordered row: available items, choices in a modal).",
          "",
          "**Where to use:** multiple choice in forms, permission lists, selecting properties/items in modals (`boxed`).",
          "",
          "**Where NOT to use:** single choice (use `RadioGroup` or `ChoiceCard`); an immediate on/off preference (use `Switch`); a rich option with preview/price (use `ChoiceCard`).",
        ].join("\n"),
      },
    },
  },
  args: { label: "Auto top-up", defaultChecked: true },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    tag: { control: false, description: "Inline label after the label text (slot, e.g. Badge)." },
    meta: { control: "text", description: "Mono meta on the right of the row."},
    boxed: { control: "boolean", description: "Selectable bordered row."},
    checked: { control: false },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    onChange: { control: false },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const CheckboxPadrao: Story = { name: "Default checkbox",};
export const CheckboxComDescricao: Story = { name: "Checkbox with description",
  args: {
    label: "analyses:create",
    description: "Runs new analyses (uses workspace credits).",
  },
};
export const CheckboxDesabilitado: Story = { name: "Disabled checkbox",
  args: { label: "billing", description: "Views and changes the plan.", disabled: true, defaultChecked: false },
};
export const CheckboxComTagDestrutiva: Story = {
  name: "With destructive tag",
  args: {
    label: "analyses:delete",
    description: "Deletes analyses permanently.",
    tag: <Badge tone="danger">destructive</Badge>,
    defaultChecked: false,
  },
};
export const CheckboxBoxed: Story = {
  name: "Boxed (selectable row)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 440 }}>
      <Checkbox boxed label="sc-domain:example.com" meta="42 mil cliques / 28d" defaultChecked />
      <Checkbox boxed label="sc-domain:design.example.com" meta="8 mil cliques / 28d" defaultChecked />
      <Checkbox boxed label="sc-domain:colecao.example.com" meta="3 mil cliques / 28d" />
    </div>
  ),
};
export const CheckboxGrupo: Story = { name: "Checkbox group",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
      <Checkbox label="analyses:read" description="Reads workspace analyses." defaultChecked />
      <Checkbox label="analyses:create" description="Runs new analyses." defaultChecked />
      <Checkbox label="analyses:publish" description="Publishes to Viewers." />
      <Checkbox
        label="analyses:delete"
        description="Deletes analyses permanently."
        tag={<Badge tone="danger">destructive</Badge>}
      />
    </div>
  ),
};
