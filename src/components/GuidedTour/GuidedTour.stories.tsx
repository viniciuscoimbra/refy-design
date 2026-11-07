import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Button } from "../Button";
import { Chip } from "../Chip";
import { Segmented } from "../Segmented";
import { GuidedTour, GuidedTourAnchor } from "./GuidedTour";
import type { GuidedTourStep } from "./GuidedTour";

const meta = {
  id: "components-organisms-guidedtour",
  title: "Components/Organisms/GuidedTour",
  component: GuidedTour,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Multi-step tour anchored to the real controls through `GuidedTourAnchor`. Composes `Popover`, `ProgressBar`, `Button` and `IconButton`; applies spotlight, initial focus, Escape and focus restoration. The step action calls the same state as the control it explains, not a separate simulation.",
      },
    },
  },
  argTypes: {
    steps: { control: false }, children: { control: false }, open: { control: false }, currentStep: { control: false },
    onOpenChange: { action: "open" }, onStepChange: { action: "step" }, onComplete: { action: "complete" },
  },
} satisfies Meta<typeof GuidedTour>;
export default meta;

type Story = StoryObj<typeof GuidedTour>;

function TourDemo({ startStep = "operation", initiallyOpen = true }: { startStep?: string; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [current, setCurrent] = useState(startStep);
  const [operation, setOperation] = useState("create");
  const [types, setTypes] = useState(["document"]);
  const [message, setMessage] = useState("Tour started.");

  const steps = useMemo<GuidedTourStep[]>(() => [
    {
      id: "operation",
      title: "Create or organize?",
      description: "Start with the operation. You can change this choice later.",
      side: "bottom",
      align: "start",
    },
    {
      id: "types",
      title: "Choose more than one type",
      description: "Documents and images can go together in the same search.",
      side: "bottom",
      action: {
        label: types.includes("image") ? "Image already selected" : "Select Image now",
        onAction: () => {
          setTypes((value) => value.includes("image") ? value : [...value, "image"]);
          setMessage("The tour action selected Image in the real control.");
        },
      },
    },
    {
      id: "continue",
      title: "Continue when it makes sense",
      description: "The request stays editable in the next wizard steps.",
      side: "top",
      align: "end",
    },
  ], [types]);

  return (
    <div style={{ minHeight: 480, display: "grid", alignContent: "start", gap: 28, maxWidth: 760, padding: "28px 12px 180px" }}>
      <Button
        size="sm"
        variant="secondary"
        style={{ justifySelf: "start" }}
        onClick={() => { setCurrent("operation"); setOpen(true); setMessage("Tour restarted."); }}
      >
        Restart tour
      </Button>
      <GuidedTour
        steps={steps}
        open={open}
        currentStep={current}
        onOpenChange={setOpen}
        onStepChange={setCurrent}
        onComplete={() => setMessage("Tour finished.")}
      >
        <div style={{ display: "grid", gap: 24 }}>
          <GuidedTourAnchor stepId="operation">
            <Segmented
              label="Operation"
              value={operation}
              onChange={setOperation}
              options={[{ value: "create", label: "Create" }, { value: "organize", label: "Organize" }]}
            />
          </GuidedTourAnchor>

          <GuidedTourAnchor stepId="types" block>
            <div role="group" aria-label="Content formats" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["document", "image", "video"].map((type) => (
                <Chip
                  key={type}
                  selected={types.includes(type)}
                  showCheck
                  onClick={() => setTypes((value) => value.includes(type) ? value.filter((item) => item !== type) : [...value, type])}
                >
                  {type[0].toUpperCase() + type.slice(1)}
                </Chip>
              ))}
            </div>
          </GuidedTourAnchor>

          <GuidedTourAnchor stepId="continue">
            <Button variant="primary" onClick={() => setMessage("The real control would move on to the wizard.")}>Continue</Button>
          </GuidedTourAnchor>
        </div>
      </GuidedTour>
      <p role="status" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>{message}</p>
    </div>
  );
}

/** Three real anchors, forward/back, focus, Escape and completion. */
export const MultiEtapas: Story = { name: "Multiple steps", render: () => <TourDemo /> };

/** Starts at the step whose action selects Image on the same Chip shown on screen. */
export const AcaoNoControle: Story = { name: "Action in the control", render: () => <TourDemo startStep="types" /> };

/** Closed state; Restart tour opens and positions the first step. */
export const Fechado: Story = { name: "Closed", render: () => <TourDemo initiallyOpen={false} /> };
