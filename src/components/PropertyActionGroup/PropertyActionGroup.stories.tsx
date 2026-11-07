import { DecisionActionsExample } from "../../_demo/MoleculeExamples";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DecisionActions, type DecisionAction, type PropertyActionGroupState } from "./PropertyActionGroup";

const meta = {
  id: "components-molecules-propertyactiongroup",
  title: "Components/Molecules/DecisionActions",
  component: DecisionActions,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof DecisionActions>;
export default meta;
type Story = StoryObj<typeof DecisionActions>;

function FunctionalActions() {
  const [active, setActive] = useState<DecisionAction>();
  const [state, setState] = useState<PropertyActionGroupState>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  function act(action: DecisionAction) {
    setActive(action);
    setState("processing");
    timers.current.forEach(window.clearTimeout);
    timers.current = [
      window.setTimeout(() => setState("completed"), 700),
      window.setTimeout(() => {
        setState("idle");
        setActive(undefined);
      }, 1800),
    ];
  }

  return <DecisionActions activeAction={active} state={state} onAction={act} />;
}

export const TresAcoes: Story = { name: "Three actions", render: () => <FunctionalActions /> };
export const Processando: Story = { name: "Processing", args: { state: "processing", activeAction: "select" } };
export const Concluido: Story = { name: "Done", args: { state: "completed", activeAction: "save" } };
export const Indisponivel: Story = { name: "Unavailable", args: { state: "unavailable" } };
export const Vertical: Story = { args: { orientation: "vertical" } };

export const Interativo: Story = { name: "Interactive", render: () => <DecisionActionsExample /> };
