import { StickyFooterExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { StickyFooter } from "./StickyFooter";

/**
 * `StickyFooter` — barra de ações de formulário fixa ao fundo.
 */
const meta = {
  id: "components-molecules-stickyfooter",
  title: "Components/Molecules/StickyFooter",
  component: StickyFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Form action bar fixed to the bottom of the container (`position=\"sticky\"`, default) or of the viewport (`position=\"fixed\"`, with an automatic spacer measured by ResizeObserver so content is not covered). `start` slot on the left (info/errors/\"unsaved changes\") and `children` on the right (Cancel/Save with `Button`). Top border + token background; respects `env(safe-area-inset-bottom)` on mobile.",
          "",
          "**Where to use:** long forms on a routed page where Save/Cancel must always be visible: settings, entity create/edit, full-page wizards.",
          "",
          "**Where NOT to use:** inside `Modal`/`Drawer` (they have their own footer); short forms that fit on screen (buttons in the flow are enough); as a bottom navigation bar (it is not a tab bar); for floating toasts/notices (use `Toast`/`Snackbar`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    position: { control: "inline-radio", options: ["sticky", "fixed"] },
    start: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof StickyFooter>;
export default meta;

type Story = StoryObj<typeof StickyFooter>;

const longForm = (
  <div style={{ padding: "24px 32px", display: "grid", gap: 16 }}>
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        style={{
          height: 72,
          borderRadius: 8,
          border: "1px solid var(--line-soft)",
          background: "var(--surface)",
          display: "grid",
          placeItems: "center",
          color: "var(--ink-4)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        field {i + 1}
      </div>
    ))}
  </div>
);

/** Sticky (default): sticks to the bottom of the scroll container, no spacer. */
export const Playground: Story = {
  render: (args) => (
    <div
      style={{
        height: 380,
        overflow: "auto",
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
      }}
    >
      {longForm}
      <StickyFooter {...args}>
        <Button variant="ghost">Cancel</Button>
        <Button>Save changes</Button>
      </StickyFooter>
    </div>
  ),
};

/** `start` slot: form state to the left of the actions. */
export const ComInfo: Story = {
  name: "With info (start)",
  render: (args) => (
    <div style={{ height: 320, overflow: "auto", background: "var(--surface-2)" }}>
      {longForm}
      <StickyFooter {...args} start={<span>Unsaved changes</span>}>
        <Button variant="ghost">Discard</Button>
        <Button>Save</Button>
      </StickyFooter>
    </div>
  ),
};

/** Errors in `start`: validation feedback always visible next to the actions. */
export const ComErro: Story = {
  name: "With error",
  render: (args) => (
    <div style={{ height: 320, overflow: "auto", background: "var(--surface-2)" }}>
      {longForm}
      <StickyFooter
        {...args}
        start={<span style={{ color: "var(--critical)" }}>2 fields with errors. Review before saving</span>}
      >
        <Button variant="ghost">Cancel</Button>
        <Button disabled>Save</Button>
      </StickyFooter>
    </div>
  ),
};

/** `position="fixed"`: fixed to the viewport; the spacer keeps it from covering content. */
export const Fixed: Story = {
  args: { position: "fixed" },
  render: (args) => (
    <div style={{ background: "var(--surface-2)" }}>
      {longForm}
      <StickyFooter {...args} start={<span>Footer fixed to the viewport</span>}>
        <Button variant="ghost">Cancel</Button>
        <Button>Save</Button>
      </StickyFooter>
    </div>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <StickyFooterExample /> };
