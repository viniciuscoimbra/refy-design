import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  id: "components-molecules-buttongroup",
  title: "Components/Molecules/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  args: { orientation: "horizontal", label: "File actions" },
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
  parameters: {
    docs: {
      description: {
        component: "Single selection in one continuous border: clicking an option activates it and deactivates the previous one. For multiple selection, use ToggleGroup.",
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

function SelectionDemo({ orientation = "horizontal", labels }: { orientation?: "horizontal" | "vertical"; labels: string[] }) {
  return (
      <ButtonGroup orientation={orientation} label="View format" defaultActiveIndex={0}>
        {labels.map((label) => <Button key={label}>{label}</Button>)}
      </ButtonGroup>
  );
}

export const Horizontal: Story = {
  render: () => <SelectionDemo labels={["List", "Map", "Gallery"]} />,
};

export const Estados: Story = { name: "States",
  render: (args) => <ButtonGroup {...args}><Button>First</Button><Button>Second</Button><Button disabled>Unavailable</Button></ButtonGroup>,
};

export const Vertical: Story = {
  args: { orientation: "vertical", label: "Client actions" },
  render: () => <SelectionDemo orientation="vertical" labels={["Compact", "Comfortable", "Wide"]} />,
};
