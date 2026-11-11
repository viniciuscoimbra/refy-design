import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { ThemeProvider } from "../../lib/ThemeProvider";
import { Hero } from "./Hero";

/** `Hero` — primeira dobra; a composição vem dos tokens `--hero-*` do tema. */
const meta = {
  id: "components-organisms-hero",
  title: "Components/Organisms/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "First fold of a page: `title` becomes `<h1>`, `accent` takes the theme highlight color, `lead` is the supporting sentence, `actions` the main actions, `top` the strip above the title and `children` the content below.",
          "",
          "**Composition through the theme:** alignment, columns and areas (`--hero-align`, `--hero-columns`, `--hero-areas`), title (`--hero-title-size|weight|tracking|leading|case|color|fill|margin`), accent (`--hero-accent`), lead (`--hero-lead-size|weight|leading|tracking|color|margin`) and actions (`--hero-actions-justify|margin`). Swapping the theme file swaps the arrangement, without code.",
          "",
          "**Where to use:** top of a product or marketing page. **Where NOT to use:** an application page title (use `PageHeader`).",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    accent: { control: "text" },
    lead: { control: "text" },
    actions: { control: false },
    top: { control: false },
    transitionNames: { control: "boolean" },
  },
} satisfies Meta<typeof Hero>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: "Your design, your way",
    accent: ".",
    lead: "Build extensible UIs with native AI.",
    actions: (
      <>
        <Button variant="primary" size="lg">Open in Playground →</Button>
        <Button size="lg" href="#docs">Read the docs</Button>
      </>
    ),
  },
};

/** Margin under the title, lead line height and alignment come from the theme at any width. */
export const LayoutHooks: Story = {
  name: "Layout hooks",
  args: { title: "Find what you need nearby" },
  render: () => (
    <ThemeProvider
      theme={{
        name: "Hero layout",
        tokens: {
          "--hero-title-margin": "0 0 24px",
          "--hero-lead-margin": "0 0 40px",
          "--hero-lead-size": "18px",
          "--hero-lead-leading": "1.625",
          "--hero-align": "center",
        },
      }}
    >
      <Hero
        title="Find what you need nearby"
        lead="Buy and sell with people around you. Every listing shows the seller, the distance and the price before you open it."
        actions={<Button variant="primary">Start selling</Button>}
      />
    </ThemeProvider>
  ),
};
