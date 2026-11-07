import { HelpMenuExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { HelpMenu } from "./HelpMenu";

/**
 * `HelpMenu` — botão "?" que abre o menu de ajuda (compõe Menu).
 */
const meta = {
  id: "components-molecules-helpmenu",
  title: "Components/Molecules/HelpMenu",
  component: HelpMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Default items: Documentation, Keyboard shortcuts (⌘K) and Contact support, customizable via `entries` (same API as `Menu`). Menu aligned to the end, for the topbar corner.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 260, paddingLeft: 200, paddingTop: 8 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    entries: { control: false },
    label: { control: "text" },
    onSelect: { action: "selected" },
  },
} satisfies Meta<typeof HelpMenu>;
export default meta;

type Story = StoryObj<typeof HelpMenu>;

/** Click the "?" to open. */
export const Playground: Story = {};

export const Interativo: Story = { name: "Interactive", render: () => <HelpMenuExample /> };
