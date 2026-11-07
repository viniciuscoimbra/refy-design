import { UserMenuExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { UserMenu } from "./UserMenu";

/**
 * `UserMenu` — bloco de usuário que abre o menu de conta (compõe Avatar + Menu).
 */
const meta = {
  id: "components-molecules-usermenu",
  title: "Components/Molecules/UserMenu",
  component: UserMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Avatar (+ name/email) as trigger; default items Profile/Settings/Sign out, customizable via `entries` (same API as `Menu`). `compact` shows only the avatar (topbar); `side=\"top\"` opens the menu upward (sidebar footer).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240, minHeight: 300, display: "flex", alignItems: "flex-start" }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    user: { control: false },
    entries: { control: false },
    compact: { control: "boolean" },
    side: { control: "inline-radio", options: ["bottom", "top"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof UserMenu>;
export default meta;

type Story = StoryObj<typeof UserMenu>;

const user = { name: "João Mendes", email: "joao@example.com", initials: "JM" };

/** Full block (sidebar): click to open. */
export const Playground: Story = {
  args: { user },
};

/** Compact (topbar): avatar only, menu aligned to the end. */
export const Compact: Story = {
  name: "Compact",
  args: { user, compact: true },
};

/** Opening upward (sidebar footer): menu as wide as the trigger. */
export const ParaCima: Story = {
  name: "Opening upward",
  decorators: [
    (Story) => (
      <div style={{ width: 240, minHeight: 300, display: "flex", alignItems: "flex-end" }}>
        <Story />
      </div>
    ),
  ],
  args: { user, side: "top" },
};

/** Items without icons, aligned to the start. */
export const SemIcones: Story = {
  name: "No icons",
  args: {
    user,
    align: "start",
    entries: [
      { id: "profile", label: "Profile" },
      { id: "billing", label: "Billing" },
      { id: "team", label: "Team" },
      { type: "separator" },
      { id: "logout", label: "Sign out", danger: true },
    ],
  },
};

export const Interativo: Story = { name: "Interactive", render: () => <UserMenuExample /> };
