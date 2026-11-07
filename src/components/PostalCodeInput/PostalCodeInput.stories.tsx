import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button";
import { PostalCodeInput, type PostalCodeAddress } from "./PostalCodeInput";

const meta = {
  id: "components-molecules-postalcodeinput",
  title: "Components/Molecules/PostalCodeInput",
  component: PostalCodeInput,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Use in address forms that look up a postal code. The data source belongs to the product. Do not use as a generic search field.",
      },
    },
  },
} satisfies Meta<typeof PostalCodeInput>;

export default meta;
type Story = StoryObj<typeof PostalCodeInput>;

function AddressLookup() {
  const [value, setValue] = useState("30140-091");
  const [address, setAddress] = useState("");

  return (
    <div>
      <PostalCodeInput
        value={value}
        onChange={(event) => setValue(event.target.value)}
        lookup={async (postalCode) => {
          await new Promise((resolve) => window.setTimeout(resolve, 600));
          return postalCode === "30140091"
            ? { postalCode: "30140-091", street: "Rua Gonçalves Dias", neighborhood: "Employees", city: "Belo Horizonte", state: "MG" }
            : null;
        }}
        onAddressFound={(next) => setAddress(`${next.street}, ${next.neighborhood}, ${next.city}, ${next.state}`)}
      />
      {address && <p>{address}</p>}
    </div>
  );
}

export const Padrao: Story = { name: "Default",
  render: () => <AddressLookup />,
};

export const Desabilitado: Story = { name: "Disabled", render: () => <PostalCodeInput value="30140-091" onChange={() => {}} lookup={async () => null} onAddressFound={() => {}} disabled /> };
export const ComErro: Story = { name: "With error", render: () => <PostalCodeInput value="30140" onChange={() => {}} lookup={async () => null} onAddressFound={() => {}} error="Enter a postal code with 8 digits." /> };
/** Local lookup pending until explicit confirmation; it does not depend on network or timers. */
export const ConsultaPendente: Story = { name: "Pending lookup",
  render: () => {
    const [value, setValue] = useState("30140-091");
    const [pending, setPending] = useState(false);
    const complete = useRef<(() => void) | null>(null);
    return <div>
      <PostalCodeInput value={value} onChange={event => setValue(event.target.value)}
        lookup={() => new Promise<PostalCodeAddress | null>(resolve => {
          setPending(true);
          complete.current = () => { resolve({ postalCode: "30140-091", street: "Sample Street", neighborhood: "Downtown", city: "Belo Horizonte", state: "MG" }); setPending(false); complete.current = null; };
        })}
        onAddressFound={() => {}} />
      <Button disabled={!pending} onClick={() => complete.current?.()}>Finish simulated lookup</Button>
    </div>;
  },
};
