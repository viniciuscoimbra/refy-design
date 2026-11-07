import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../Card";
import { Section } from "./Section";

/** `Section` — bloco de página com texto e prova; `reverse` alterna o lado. */
const meta = {
  id: "components-organisms-section",
  title: "Components/Organisms/Section",
  component: Section,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "`split` puts text and proof side by side; `reverse` puts the proof first on wide screens (zigzag) and the text comes first again on the phone. `stacked` puts the text on top. `columns` spreads the children over the theme grid (`--section-columns`) and in the theme order (`--section-order-1..4`).",
          "",
          "**Where to use:** sections of a landing or documentation page. **Where NOT to use:** a grid of application cards with data (use the application layout grid).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["split", "stacked", "columns"] },
    reverse: { control: "boolean" },
    wide: { control: "boolean" },
    aside: { control: false },
  },
} satisfies Meta<typeof Section>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    layout: "split",
    reverse: false,
    children: <div><h2>Build new components from the ones that exist.</h2><p>Combine atoms into a new molecule.</p></div>,
    aside: <Card>Proof</Card>,
  },
};
export const Invertida: Story = { name: "Inverted", args: { ...Playground.args, reverse: true } };
export const Colunas: Story = { name: "Columns",
  args: { layout: "columns", children: [<Card key="a">First</Card>, <Card key="b">Second</Card>, <Card key="c">Third</Card>] },
};
