import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { WizardStepper } from "./WizardStepper";
import type { WizardStep } from "./WizardStepper";

const steps: WizardStep[] = [
  { id: "order", label: "Goal" },
  { id: "about", label: "Details" },
  { id: "types", label: "Format" },
  { id: "team", label: "Team" },
  { id: "permissions", label: "Permissions" },
  { id: "preferences", label: "Preferences" },
  { id: "review", label: "Review" },
];

const meta = {
  id: "components-molecules-wizardstepper",
  title: "Components/Molecules/WizardStepper",
  component: WizardStepper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Wizard progress, unrelated to loading. Derives completed/current/future steps, only allows going back to what is already completed and composes `ProgressBar` + `IconButton`. Arrows move focus between navigable steps; Enter or Space open the focused step.",
      },
    },
  },
  argTypes: {
    steps: { control: false }, current: { control: false }, onStepChange: { action: "step-change" },
    onBack: { action: "back" }, label: { control: "text" }, variant: { control: "select", options: ["auto", "horizontal", "compact"] },
    allowFutureNavigation: { control: "boolean" },
  },
} satisfies Meta<typeof WizardStepper>;
export default meta;

type Story = StoryObj<typeof WizardStepper>;

/** A real journey: Request → About you → other criteria → Review. */
export const Horizontal: Story = {
  render: (args) => {
    const [current, setCurrent] = useState("team");
    const index = steps.findIndex((step) => step.id === current);
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 980 }}>
        <WizardStepper
          {...args}
          steps={steps}
          current={current}
          variant="horizontal"
          label="Setting up your project"
          onStepChange={setCurrent}
          onBack={() => setCurrent(steps[Math.max(index - 1, 0)].id)}
        />
        <p aria-live="polite" style={{ margin: 0, color: "var(--ink-3)", fontSize: "var(--text-xs)" }}>
          Open step: {steps.find((step) => step.id === current)?.label}.
        </p>
      </div>
    );
  },
};

/** Mobile/narrow containers: keeps context, back and progress without squeezing seven labels. */
export const Compacto: Story = { name: "Compact",
  render: (args) => {
    const [current, setCurrent] = useState("about");
    const index = steps.findIndex((step) => step.id === current);
    return (
      <div style={{ maxWidth: 390 }}>
        <WizardStepper
          {...args}
          steps={steps}
          current={current}
          variant="compact"
          label="Setting up your project"
          onStepChange={setCurrent}
          onBack={() => setCurrent(steps[Math.max(index - 1, 0)].id)}
        />
      </div>
    );
  },
};

/** Done, current, upcoming and unavailable upcoming in the same composition. */
export const Estados: Story = { name: "States",
  args: {
    steps: steps.map((step) => step.id === "permissions" ? { ...step, disabled: true } : step),
    current: "types",
    variant: "horizontal",
    label: "Step states",
    onStepChange: () => {},
  },
};

/** At the end, every earlier step stays reviewable. */
export const Concluido: Story = { name: "Done",
  args: {
    steps,
    current: "review",
    variant: "auto",
    label: "Profile ready for review",
    onStepChange: () => {},
  },
};
