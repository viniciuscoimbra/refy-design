import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PhoneInput, phoneCountries } from "./PhoneInput";

const meta = {
  id: "components-molecules-phoneinput",
  title: "Components/Molecules/PhoneInput",
  component: PhoneInput,
  tags: ["autodocs"],
  args: { label: "Phone", value: "(31) 9 8123-4567", country: "BR" },
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Padrao: Story = { name: "Default",
  render: (args) => {
    const [country, setCountry] = useState(args.country);
    const [value, setValue] = useState(String(args.value));
    return (
      <PhoneInput
        {...args}
        country={country}
        value={value}
        onCountryChange={(next) => setCountry(next.code)}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  },
};

export const CodigosDisponiveis: Story = { name: "Available codes",
  args: {
    hint: phoneCountries.map((item) => `${item.flag} ${item.callingCode}`).join(" · "),
  },
};

/** Explicit public state; it does not call external services. */
export const Desabilitado: Story = { name: "Disabled", ...Padrao, args: { disabled: true } };
export const ComErro: Story = { name: "With error", ...Padrao, args: { error: "Enter a valid phone number for the selected country." } };
