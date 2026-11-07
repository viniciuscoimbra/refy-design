import { BillingCardExample } from "../../_demo/MoleculeExamples";
import type { Meta, StoryObj } from "@storybook/react";
import { BillingCard } from "./BillingCard";
import { Badge } from "../Badge";
import { Button } from "../Button";

const meta = {
  id: "components-molecules-billingcard",
  title: "Components/Molecules/BillingCard",
  component: BillingCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Workspace billing card: payment method (brand via slot + last digits), next charge and actions. Composed on `Card`.\n\n" +
          "**Where to use:** on the Billing page (settings), one card per payment method: the primary one with next charge + actions (change card, see invoices), secondary ones (e.g. Pix) with method + status + remove action only.\n\n" +
          "**Where NOT to use:** not for choosing/comparing plans (that is `PlanCard`); not for showing credit usage (that is `UsageMeter`); not as an invoice table row (that is `Table`); not as a generic card outside billing (use `Card`).",
      },
    },
  },
  argTypes: {
    elevation: { control: "inline-radio", options: [0, 1, 2] },
    lastDigits: { control: "text" },
  },
} satisfies Meta<typeof BillingCard>;
export default meta;

type Story = StoryObj<typeof BillingCard>;

/** Bandeira de exemplo — em produção entra o logo real via slot (o DS não bundleia logos). */
const visa = <span>VISA</span>;

export const Completo: Story = { name: "Complete",
  args: {
    brandIcon: visa,
    methodLabel: "Credit card",
    lastDigits: "4242",
    methodMeta: "Expires 09/2028 · Asaas (Brazil)",
    status: (
      <Badge tone="success" dot>
        Active
      </Badge>
    ),
    nextChargeAmount: "R$ 2.388",
    nextChargeDate: "on May 2, 2027",
    actions: (
      <>
        <Button variant="ghost" size="sm">
          View invoices
        </Button>
        <Button variant="secondary" size="sm">
          Change card
        </Button>
      </>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <BillingCard {...args} />
    </div>
  ),
};

export const SoMetodo: Story = {
  name: "Method only (secondary)",
  args: {
    methodLabel: "Pix",
    methodMeta: "joao@example.com · AbacatePay",
    status: <Badge tone="neutral">Secondary</Badge>,
    actions: (
      <Button variant="ghost" size="sm">
        Remove
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <BillingCard {...args} />
    </div>
  ),
};

export const PagamentoAtrasado: Story = { name: "Late payment",
  args: {
    brandIcon: <span>MC</span>,
    methodLabel: "Credit card",
    lastDigits: "8810",
    methodMeta: "Expires 01/2027 · Asaas (Brazil)",
    status: (
      <Badge tone="danger" dot>
        Payment failed
      </Badge>
    ),
    nextChargeAmount: "R$ 199",
    nextChargeDate: "retrying in 3 days",
    actions: (
      <Button variant="primary" size="sm">
        Update payment
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <BillingCard {...args} />
    </div>
  ),
};

export const Interativo: Story = { name: "Interactive", render: () => <BillingCardExample /> };
