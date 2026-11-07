import { ToastExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Button } from "../Button";
import { Toast, ToastRegion, type ToastData } from "./Toast";

/**
 * `Toast` / `ToastRegion` — notificações empilhadas num canto da tela.
 */
const meta = {
  id: "components-molecules-toast",
  title: "Components/Molecules/Toast",
  component: ToastRegion,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fully controlled stack: the app keeps the `ToastData` list and receives `onDismiss` when a toast expires (`duration`, default 5s), is closed with × or has its action clicked. `aria-live=\"polite\"`. Tones: `default`, `success`, `danger`; optional inline action (Undo).",
      },
    },
  },
  argTypes: {
    position: { control: "inline-radio", options: ["bottom-right", "bottom-left", "top-right"] },
    toasts: { control: false },
    onDismiss: { control: false },
  },
} satisfies Meta<typeof ToastRegion>;
export default meta;

type Story = StoryObj<typeof ToastRegion>;

/** Fire toasts with the buttons: auto-dismiss in 5s, × closes earlier. */
export const Playground: Story = {
  args: { toasts: [], onDismiss: () => {} },
  render: (args) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const seq = useRef(0);
    function push(toast: Omit<ToastData, "id">) {
      seq.current += 1;
      setToasts((t) => [...t, { ...toast, id: `t-${seq.current}` }]);
    }
    const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id));
    return (
      <div style={{ minHeight: 380, padding: 24, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <Button onClick={() => push({ title: "Review complete", description: "84 pages crawled, 12 critical.", tone: "success" })}>
          Success
        </Button>
        <Button onClick={() => push({ title: "Export failed", description: "The server did not respond.", tone: "danger" })}>
          Error
        </Button>
        <Button onClick={() => push({ title: "Issue moved to Tasks", action: { label: "Undo", onClick: () => {} } })}>
          With action
        </Button>
        <ToastRegion {...args} toasts={toasts} onDismiss={dismiss} />
      </div>
    );
  },
};

/** Anatomy of a single toast (no stack, no timer). */
export const Isolado: Story = {
  name: "Single toast",
  args: { toasts: [], onDismiss: () => {} },
  render: () => (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      <Toast id="a" title="Review complete" description="84 pages crawled." tone="success" duration={null} />
      <Toast id="b" title="Export failed" description="The server did not respond." tone="danger" duration={null} />
      <Toast id="c" title="Issue moved to Tasks" action={{ label: "Undo", onClick: () => {} }} duration={null} />
    </div>
  ),
};

export const FluxoLocal = { name: "Local flow", render: () => <ToastExample /> };
