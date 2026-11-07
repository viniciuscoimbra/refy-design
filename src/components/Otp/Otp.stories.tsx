import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Otp } from "./Otp";

/**
 * `Otp` — código de verificação, um dígito por campo (48×56, mono 22px).
 */
const meta = {
  id: "components-atoms-otp",
  title: "Components/Atoms/Otp",
  component: Otp,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Typing moves focus forward, Backspace clears and goes back, ←/→ navigate, pasting spreads the whole code. `groupSize` inserts the \"—\" separator between groups and `onComplete` fires with the full code. `autocomplete=\"one-time-code\"` on the first field for SMS on mobile. Controlled via `value`/`onChange` or uncontrolled.",
      },
    },
  },
  argTypes: {
    length: { control: "number" },
    groupSize: { control: "number" },
    alphanumeric: { control: "boolean" },
    label: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    autoFocus: { control: false },
    onChange: { action: "changed" },
    onComplete: { action: "complete" },
    value: { control: false },
    defaultValue: { control: false },
  },
} satisfies Meta<typeof Otp>;
export default meta;

type Story = StoryObj<typeof Otp>;

/** Playground: 6 digits with a separator every 3. Paste "392114" to test. */
export const Playground: Story = {
  args: { length: 6, groupSize: 3 },
};

/** No separator, 4 digits (short PIN). */
export const Pin4: Story = {
  name: "4-digit PIN",
  args: { length: 4 },
};

/** Partially filled (uncontrolled). */
export const Preenchido: Story = {
  name: "Prefilled",
  args: { length: 6, groupSize: 3, defaultValue: "392" },
};

/** Controlled: fires `onComplete` on the last digit. */
export const Controlled: Story = {
  name: "Controlled",
  args: { length: 6, groupSize: 3 },
  render: (args) => {
    const [code, setCode] = useState("");
    const [done, setDone] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
        <Otp {...args} value={code} onChange={(c) => { setCode(c); setDone(false); }} onComplete={() => setDone(true)} />
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>
          code: "{code}" {done && "✓ complete"}
        </code>
      </div>
    );
  },
};

/** Wrong code. */
export const ComErro: Story = {
  name: "With error",
  args: { length: 6, groupSize: 3, defaultValue: "392114", error: "Wrong code. Try again." },
};

/** Disabled. */
export const Disabled: Story = {
  args: { length: 6, groupSize: 3, defaultValue: "392", disabled: true },
};
