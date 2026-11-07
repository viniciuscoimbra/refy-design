import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta = {
  id: "components-atoms-select",
  title: "Components/Atoms/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { label: "Role", block: true },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    block: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: false },
  },
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof Select>;

export const SelectPadrao: Story = { name: "Default select",
  render: (args) => (
    <Select {...args}>
      <option>Member</option>
      <option>Admin</option>
      <option>Viewer</option>
    </Select>
  ),
};

export const SelectComGrupos: Story = { name: "Select with groups",
  render: (args) => (
    <Select {...args} label="Invitee role">
      <optgroup label="Built-in">
        <option>Member</option>
        <option>Admin</option>
        <option>Viewer</option>
      </optgroup>
      <optgroup label="Custom">
        <option>External researcher</option>
        <option>Client (read-only)</option>
      </optgroup>
    </Select>
  ),
};

export const SelectComHint: Story = { name: "Select with hint",
  render: (args) => (
    <Select
      {...args}
      label="Default market"
      hint="Applied to every new analysis."
    >
      <option>Brazil · pt-BR</option>
      <option>Portugal · pt-PT</option>
      <option>USA · en-US</option>
    </Select>
  ),
};

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled",
  render: (args) => (
    <Select {...args} disabled defaultValue="Member">
      <option>Member</option>
      <option>Admin</option>
    </Select>
  ),
};
export const ComErro: Story = { name: "With error",
  render: (args) => (
    <Select {...args} error="Select an available role." defaultValue="">
      <option value="">Select a role</option>
      <option>Member</option>
    </Select>
  ),
};

/** Descriptions from the consumer are kept with the field's help and validation. */
export const DescricoesAssociadas: Story = { name: "Linked descriptions",
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      <p id="select-context">
        Set the invitee's access permissions.
      </p>
      <Select
        id="select-role"
        label="Role"
        aria-describedby="select-context"
        aria-invalid={false}
        error="Select an available role."
        defaultValue=""
      >
        <option value="">Select a role</option>
        <option>Member</option>
        <option>Admin</option>
      </Select>
      <Select
        id="select-market"
        label="Market"
        aria-describedby="select-context"
        hint="Applied to every new analysis."
        defaultValue="Brazil"
      >
        <option>Brazil</option>
        <option>Portugal</option>
      </Select>
    </div>
  ),
};
