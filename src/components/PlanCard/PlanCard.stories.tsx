import { PlanCardExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { PlanCard } from "./PlanCard";
import { Button } from "../Button";
import { ThemeProvider } from "../../lib/ThemeProvider";

const meta = {
  id: "components-molecules-plancard",
  title: "Components/Molecules/PlanCard",
  component: PlanCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Plan card (pricing): name, price/period, feature list with checks and CTA. `current` marks the active plan (tag + disabled CTA); `highlighted` emphasizes the recommended one.\n\n" +
          "**Where to use:** in the \"Change plan\" modal/page (Billing settings) and on upgrade screens, always in a grid of 2 to 4 plans side by side (the grid belongs to the consumer, see the \"Plan grid\" story).\n\n" +
          "**Where NOT to use:** not for showing the active plan with usage/renewal (that is the plan summary on the Billing page, with `BillingCard`/`UsageMeter`); not for one-off credit packs (they have their own selection pattern); not as a generic navigation card (that is `NavCard`/`Card`); never a single PlanCard outside a comparison.",
      },
    },
  },
  argTypes: {
    current: { control: "boolean" },
    highlighted: { control: "boolean" },
    currentLabel: { control: "text" },
    highlightLabel: { control: "text" },
  },
} satisfies Meta<typeof PlanCard>;
export default meta;

type Story = StoryObj<typeof PlanCard>;

const starterFeatures = [
  <span key="1"><strong>800 credits</strong> per month</span>,
  "1 member · 5 projects",
  "Standard analysis, rerun, recommendations",
  "Basic activity history",
];
const proFeatures = [
  <span key="1"><strong>2,500 credits</strong> per month</span>,
  "3 members · 20 projects",
  "Everything in Starter +",
  "Full activity history",
  "API/MCP completos",
];
const agencyFeatures = [
  <span key="1"><strong>8,000 credits</strong> per month</span>,
  "10 members · 75 projects",
  "Everything in Pro +",
  "Priority support",
];
const enterpriseFeatures = [
  <span key="1"><strong>Custom credits</strong></span>,
  "Members and projects on demand",
  "SSO and custom contracts",
  "SLA and a dedicated manager",
];

export const Padrao: Story = {
  name: "Default",
  args: {
    name: "Starter",
    price: "R$ 79",
    period: "/mo",
    priceNote: "R$ 948 billed yearly",
    features: starterFeatures,
    cta: (
      <Button variant="secondary" block>
        Switch to Starter
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 260 }}>
      <PlanCard {...args} />
    </div>
  ),
};

export const PlanoAtual: Story = { name: "Current plan",
  args: {
    name: "Pro",
    price: "R$ 199",
    period: "/mo",
    priceNote: "R$ 2,388 billed yearly",
    features: proFeatures,
    current: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 260, paddingTop: 12 }}>
      <PlanCard {...args} />
    </div>
  ),
};

export const Recomendado: Story = { name: "Recommended",
  args: {
    name: "Agency",
    price: "R$ 479",
    period: "/mo",
    priceNote: "R$ 5,748 billed yearly",
    features: agencyFeatures,
    highlighted: true,
    cta: (
      <Button variant="primary" block>
        Upgrade to Agency
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 260, paddingTop: 12 }}>
      <PlanCard {...args} />
    </div>
  ),
};

/** Responsive grid of 2–4 columns; the container belongs to the consumer. */
export const GradeDePlanos: Story = {
  name: "Plan grid",
  args: { name: "-", price: "-" },
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
        paddingTop: 12,
        maxWidth: 1080,
      }}
    >
      <PlanCard
        name="Starter"
        price="R$ 79"
        period="/mo"
        priceNote="R$ 948 billed yearly"
        features={starterFeatures}
        cta={<Button variant="secondary" block>Switch to Starter</Button>}
      />
      <PlanCard
        name="Pro"
        price="R$ 199"
        period="/mo"
        priceNote="R$ 2,388 billed yearly"
        features={proFeatures}
        current
        highlighted
        currentLabel="Your plan"
      />
      <PlanCard
        name="Agency"
        price="R$ 479"
        period="/mo"
        priceNote="R$ 5,748 billed yearly"
        features={agencyFeatures}
        cta={<Button variant="primary" block>Upgrade to Agency</Button>}
      />
      <PlanCard
        name="Enterprise"
        price="On request"
        priceNote="custom billing and cycle"
        features={enterpriseFeatures}
        cta={<Button variant="secondary" block>Talk to sales</Button>}
      />
    </div>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <PlanCardExample /> };

/** `description` under the name, `ctaPosition="bottom"` puts the button last, the tag goes right through `--plan-card-tag-inset-inline`, and the highlighted plan is a dark nested scope. */
export const BotaoNoFim: Story = { name: "Button at the bottom",
  args: { name: "Pro", price: "$ 29" },
  render: () => (
    <ThemeProvider theme={{ name: "Pricing", tokens: { "--plan-card-tag-inset-inline": "auto var(--space-5)" } }}>
      <div data-testid="plans-bottom" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)", paddingTop: "var(--space-3)" }}>
        <PlanCard name="Starter" description="For one seller testing the market." price="$ 0" period="/month" features={["10 listings", "Chat with buyers"]} ctaPosition="bottom" cta={<Button variant="secondary" block>Start free</Button>} />
        <ThemeProvider mode="dark">
          <PlanCard highlighted name="Pro" description="For shops with weekly listings." price="$ 29" period="/month" features={["Unlimited listings", "Featured placement", "Sales report"]} ctaPosition="bottom" cta={<Button variant="primary" block>Choose Pro</Button>} />
        </ThemeProvider>
        <PlanCard name="Business" description="For teams with several stores." price="$ 99" period="/month" features={["Everything in Pro", "5 members"]} ctaPosition="bottom" cta={<Button variant="secondary" block>Talk to sales</Button>} />
      </div>
    </ThemeProvider>
  ),
};
