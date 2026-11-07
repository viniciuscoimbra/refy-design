import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { HelpField } from "./HelpField";
import { Input } from "../Input";
import { Select } from "../Select";
import { Drawer } from "../Drawer";

/**
 * `HelpField` — padrão para campo técnico inevitável.
 */
const meta = {
  id: "components-molecules-helpfield",
  title: "Components/Molecules/HelpField",
  component: HelpField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Form row with a plain label + help icon (`IconButton` sm). On hover/focus, a `Tooltip` with the `helpText` and a \"Learn more\" link that calls `onLearnMore`: the app opens the help Drawer (the component only brings the hook, never the Drawer). The field (children) gets `aria-describedby` linked to the help text.",
          "",
          "### Where to use",
          "- An unavoidable technical field that needs a plain name + explanation: capacity allocation (never expose a raw `share_pct`: label \"Capacity allocation\" + help), API keys, processing limits.",
          "- Whenever the explanation does not fit a one-line `hint` and longer docs exist (\"Learn more\" → the app's help Drawer).",
          "",
          "### Where NOT to use",
          "- A self-explanatory field (\"Name\", \"Email\"): the Input's own `label`/`hint` is enough.",
          "- As a generic tooltip outside a form: use the `Tooltip` atom.",
          "- For validation/errors: the error belongs to the field (the Input `error`), not to the help.",
          "- Never use the internal database name as the `label`: plain user vocabulary in the UI.",
        ].join("\n"),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "100%", maxWidth: 380, paddingTop: 96 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    helpText: { control: "text" },
    learnMoreLabel: { control: "text" },
    side: { control: "radio", options: ["top", "bottom", "left", "right"] },
    children: { control: false },
    onLearnMore: { control: false, description: "Hook for \"Learn more\": the app opens the help Drawer."},
    htmlFor: { control: false },
  },
} satisfies Meta<typeof HelpField>;
export default meta;

type Story = StoryObj<typeof HelpField>;

/** Guide case: capacity allocation, a plain name + help, never a raw `share_pct`. */
export const Playground: Story = {
  args: {
    label: "Capacity allocation",
    helpText:
      "Percentage reserved for the owning team. The rest follows the project settings.",
    htmlFor: "share-input",
    onLearnMore: () => console.log("open help Drawer"),
    children: <Input id="share-input" placeholder="E.g. 40" suffix="%" />,
  },
};

/** Without `onLearnMore`: tooltip with text only (no link). */
export const SemSaberMais: Story = {
  name: "Without \"Learn more\"",
  args: {
    label: "Distribution queue",
    helpText: "Order in which new tasks are assigned to owners.",
    htmlFor: "queue-select",
    children: (
      <Select id="queue-select">
        <option value="rr">Round robin</option>
        <option value="top">Best performance</option>
      </Select>
    ),
  },
};

/** Full integration: "Learn more" opens the APP's help Drawer (the Drawer is not part of HelpField). */
export const ComDrawerDoApp: Story = {
  name: "With the app's Drawer",
  args: {
    label: "Capacity allocation",
    helpText: "Percentage reserved for the owning team.",
    children: <Input id="share-drawer" placeholder="E.g. 40" suffix="%" />,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <HelpField {...args} onLearnMore={() => setOpen(true)} />
        <Drawer open={open} onOpenChange={setOpen} side="right" title="Capacity allocation">
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Long in-app help: how the settings assign tasks between person and team, with examples and rules.
          </p>
        </Drawer>
      </>
    );
  },
};
