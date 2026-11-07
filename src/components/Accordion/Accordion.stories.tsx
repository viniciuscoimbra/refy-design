import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";
import { accordionItems } from "../../_demo/accordion";

const meta = {
  id: "components-molecules-accordion",
  title: "Components/Molecules/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    items: accordionItems,
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    items: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
  },
} satisfies Meta<typeof Accordion>;
export default meta;

type Story = StoryObj<typeof Accordion>;

/** One open at a time (default). */
export const AccordionSingle: Story = {
  name: "Single",
  args: { type: "single", defaultValue: ["files"] },
};

/** Several open at the same time. */
export const AccordionMultiple: Story = {
  name: "Multiple",
  args: { type: "multiple", defaultValue: ["files", "archive"] },
};

/** With one disabled item. */
export const AccordionDesabilitado: Story = {
  name: "With disabled",
  args: {
    items: [
      { id: "a", title: "Active item", content: <p>Regular content.</p> },
      {
        id: "b",
        title: "Disabled item",
        content: <p>Does not open.</p>,
        disabled: true,
      },
    ],
  },
};

/** Shared surface at a compact scale, configured by the same theme. */
export const Compacto: Story = { name: "Compact", args: {variant: "joined", size: "sm", defaultValue: ["files"]} };
