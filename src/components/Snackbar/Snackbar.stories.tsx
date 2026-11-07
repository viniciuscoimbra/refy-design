import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Snackbar } from "./Snackbar";

/**
 * `Snackbar` — toast minimalista de uma linha com ação inline.
 */
const meta = {
  id: "components-molecules-snackbar",
  title: "Components/Molecules/Snackbar",
  component: Snackbar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Confirms reversible actions in a single line (\"Issue moved · Undo\"). Presentational element: position it yourself, or use `Toast`/`ToastRegion` for a stack with auto-dismiss.",
      },
    },
  },
  argTypes: {
    children: { control: "text" },
    action: { control: false },
  },
} satisfies Meta<typeof Snackbar>;
export default meta;

type Story = StoryObj<typeof Snackbar>;

/** With an undo action. */
export const Desfazer: Story = { name: "Undo",
  render: () => {
    const [moved, setMoved] = useState(true);
    return <Snackbar action={{ label: moved ? "Undo" : "Move again", onClick: () => setMoved(!moved) }}>{moved ? "Item moved to Tasks" : "Move undone"}</Snackbar>;
  },
};

/** With a navigate action. */
export const Ver: Story = { name: "View",
  args: { children: "3 analyses archived", action: { label: "See", onClick: () => {} } },
};

/** Message only. */
export const Simples: Story = { name: "Simple",
  args: { children: "Link copied" },
};
