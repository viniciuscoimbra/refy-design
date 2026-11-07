import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../Button";
import { Drawer } from "./Drawer";

/**
 * `Drawer` — painel lateral deslizante; `side="bottom"` usa a variação inferior com alça.
 */
const meta = {
  id: "components-organisms-drawer",
  title: "Components/Organisms/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Scrim behind (click closes), Esc closes, × in the header, scrollable body and optional fixed footer. `side`: `left`/`right` (320px) or `bottom` (bottom sheet, 20px corners + handle). Controlled by `open`/`onOpenChange`.",
      },
    },
  },
  argTypes: {
    side: { control: "inline-radio", options: ["left", "right", "bottom"] },
    open: { control: false },
    onOpenChange: { control: false },
    title: { control: "text" },
    footer: { control: false },
    children: { control: false },
    hideClose: { control: "boolean" },
  },
} satisfies Meta<typeof Drawer>;
export default meta;

type Story = StoryObj<typeof Drawer>;

const body = (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <p style={{ margin: 0 }}>
      Domain analysis details: 84 pages crawled, 12 critical issues and 31 warnings.
    </p>
    <p style={{ margin: 0 }}>
      The drawer body scrolls on its own when the content is taller than the available space.
    </p>
    {Array.from({ length: 18 }, (_, i) => (
      <p key={i} style={{ margin: 0, color: "var(--ink-3)" }}>
        Content item {i + 1} — filler text to show the inner scroll.
      </p>
    ))}
  </div>
);

const footer = (close?: () => void) => (
  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
    <span style={{ marginRight: "auto", color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      12 items · Esc to cancel
    </span>
    <Button variant="ghost" onClick={close}>Cancel</Button>
    <Button variant="primary" onClick={close}>Apply</Button>
  </div>
);

function DrawerDemo({ side }: { side: "left" | "right" | "bottom" }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ minHeight: 420, padding: 24 }}>
      <Button onClick={() => setOpen(true)}>Open {side === "bottom" ? "bottom panel" : `drawer ${side}`}</Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side={side}
        title="Analysis details"
        footer={footer(() => setOpen(false))}
      >
        {body}
      </Drawer>
    </div>
  );
}

/** Drawer on the right (default) with an actions footer. */
export const Direita: Story = { name: "Right",
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => <DrawerDemo side="right" />,
};

/** Drawer on the left. */
export const Esquerda: Story = { name: "Left",
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => <DrawerDemo side="left" />,
};

/** Bottom sheet with a handle. */
export const PainelInferior: Story = { name: "Bottom panel",
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => <DrawerDemo side="bottom" />,
};

/** Bottom sheet open to inspect the handle, scrolling and fixed footer in the active theme. */
export const PainelInferiorAberto: Story = { name: "Bottom panel open",
  args: {
    open: true,
    onOpenChange: () => {},
    side: "bottom",
    title: "Move 12 clients",
    footer: footer(),
    children: body,
  },
};
