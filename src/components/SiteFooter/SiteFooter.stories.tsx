import type { Meta, StoryObj } from "@storybook/react";
import { BrandLogo } from "../BrandLogo";
import { SiteFooter } from "./SiteFooter";
import { ThemeProvider } from "../../lib/ThemeProvider";

/** `SiteFooter` — rodapé de site com marca, colunas de links e créditos. */
const meta = {
  id: "components-organisms-sitefooter",
  title: "Components/Organisms/SiteFooter",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "`brand` and `tagline` on the left; each item in `columns` becomes a navigation with a title; `credits` and `legal` close the last row. Links with `external` open in another tab and show ↗.",
          "",
          "**Where to use:** end of public and documentation pages. **Where NOT to use:** inside application panels (use the application navigation).",
        ].join("\n"),
      },
    },
  },
  argTypes: { columns: { control: false }, brand: { control: false } },
} satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    brand: <BrandLogo size="sm" symbol aria-label="Refy" />,
    tagline: "Ready components, themes made of tokens and rules the AI reads before building the screen.",
    columns: [
      { title: "Product", links: [{ label: "Docs", href: "#docs" }, { label: "Components", href: "#components" }] },
      { title: "Project", links: [{ label: "Repository", href: "https://example.com/refy", external: true }] },
    ],
    credits: "Created by Vinícius Coimbra.",
    legal: "© 2026 refy · MIT License",
  },
};

/** Four equal columns, title weight and link gap come from `--site-footer-columns`, `--site-footer-heading-weight` and `--site-footer-link-gap`. */
export const QuatroColunas: Story = { name: "Four equal columns",
  args: Playground.args,
  render: (args) => (
    <ThemeProvider theme={{ name: "Footer", tokens: { "--site-footer-columns": "repeat(4, minmax(0, 1fr))", "--site-footer-heading-weight": "500", "--site-footer-link-gap": "8px" } }}>
      <SiteFooter
        {...args}
        data-testid="footer-four"
        columns={[
          { title: "Marketplace", links: [{ label: "Browse", href: "#browse" }, { label: "Sell", href: "#sell" }, { label: "Prices", href: "#prices" }] },
          { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers", href: "#careers" }] },
          { title: "Help", links: [{ label: "Support", href: "#support" }, { label: "Safety", href: "#safety" }] },
        ]}
      />
    </ThemeProvider>
  ),
};
