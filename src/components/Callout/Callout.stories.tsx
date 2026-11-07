import type { Meta, StoryObj } from "@storybook/react";
import { Callout } from "./Callout";
import { Button } from "../Button";

const iconInfo = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
);
const iconWarn = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);
const iconLock = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const meta = {
  id: "components-molecules-callout",
  title: "Components/Molecules/Callout",
  component: Callout,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "STATIC inline banner: context that belongs to the page and renders with it. Tones `info` (first-run hint), `note` (neutral explanatory note), `success` (quiet confirmation: plain surface and success icon), `warn` (limit/attention warning), `danger` (persistent failure) and `upsell` (feature locked by plan, with CTA). `dismissible` leaves with a transition (motion tokens) and calls `onDismiss`; persisting \"don't show again\" is up to the app.\n\n" +
          "**Boundary with Toast/Snackbar:** `Callout` is NOT transient: it does not appear in response to an action and does not go away on its own. Action feedback (saved, failed, undo) is `Toast`/`Snackbar`, which floats and expires. If the information is still true after reloading the page, it is a `Callout`; if it describes something that just happened, it is a `Toast`.\n\n" +
          "**Where to use:** first-run hint on the dashboard, explanatory note in Settings, approaching-limit warning, plan lock banner in Connectors.\n\n" +
          "**Where NOT to use:** action feedback (Toast/Snackbar); form field error (`error` prop of `Input`); empty list state (that is `EmptyState`); destructive confirmation (that is `Modal`).",
      },
    },
  },
  argTypes: {
    tone: { control: "inline-radio", options: ["info", "note", "success", "warn", "danger", "upsell"] },
    icon: { control: false },
    action: { control: false },
  },
} satisfies Meta<typeof Callout>;
export default meta;

type Story = StoryObj<typeof Callout>;

export const Info: Story = {
  name: "Info (first-run hint)",
  args: {
    tone: "info",
    icon: iconInfo,
    title: "Your collection is being prepared",
    children: "The files are being organized. You can keep working and you will be notified when the collection is ready.",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const Nota: Story = {
  name: "Note (explanatory note)",
  args: {
    tone: "note",
    title: "Shortcuts work on every screen",
    children: "Search (⌘K) and keyboard navigation work across the whole app, including inside modals.",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const Aviso: Story = {
  name: "Warn (limit close)",
  args: {
    tone: "warn",
    icon: iconWarn,
    title: "Cycle credits almost gone",
    children: "120 of 2,500 credits left. New analyses pause when the balance runs out.",
    action: <Button size="sm" variant="secondary">View usage</Button>,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const ErroPersistente: Story = {
  name: "Danger (persistent failure)",
  args: {
    tone: "danger",
    icon: iconWarn,
    title: "Could not access the microphone",
    children: "Check the browser permission or continue with the keyboard.",
    action: <Button size="sm" variant="secondary">Try again</Button>,
    role: "alert",
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

export const Upsell: Story = {
  name: "Upsell (plan lock banner)",
  args: {
    tone: "upsell",
    icon: iconLock,
    title: "Advanced connectors are on the Business plan",
    children: "GitHub, GA4 and BigQuery become available when you upgrade. Your current data is kept.",
    action: <Button size="sm">Upgrade</Button>,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};

/** Closes with a transition (motion token) and unmounts; `onDismiss` notifies the app. */
export const Dispensavel: Story = {
  name: "Dismissible",
  args: {
    tone: "info",
    icon: iconInfo,
    title: "Tip: drag columns to reorder",
    children: "This notice fades out when closed; reload the story to see it again.",
    dismissible: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 560 }}>
      <Callout {...args} />
    </div>
  ),
};
