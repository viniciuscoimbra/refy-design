import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OAuthButton, oauthProviders } from "./OAuthButton";
const meta = {
  id: "components-molecules-oauthbutton",
  title: "Components/Molecules/OAuthButton",
  component: OAuthButton,
  args: { provider: "github" },
  tags: ["autodocs"],
} satisfies Meta<typeof OAuthButton>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Provedores: Story = { name: "Providers",
  render: () => {
    const [selected, setSelected] = useState("");
    return (
      <div
        style={{
          display: "grid",
          gap: "var(--space-4)",
          maxWidth: 420,
          width: "100%",
        }}
      >
        {(Object.keys(oauthProviders) as (keyof typeof oauthProviders)[]).map(
          (provider) => (
            <OAuthButton
              key={provider}
              provider={provider}
              block
              onClick={() => setSelected(oauthProviders[provider])}
            />
          ),
        )}
        <p role="status">
          {selected
            ? `${selected} selected. Connect the callback to your project's OAuth flow.`
            : "Choose a provider. Local demo."}
        </p>
      </div>
    );
  },
};
export const Carregando: Story = { name: "Loading",
  args: {
    provider: "github",
    loading: true,
    loadingLabel: "Connecting to GitHub",
  },
};
export const Desabilitado: Story = { name: "Disabled",
  args: { provider: "apple", disabled: true },
};

/** Explicit public state; it does not call external services. */
export const Erro: Story = { name: "Error", args: { provider: "github", status: "error", children: "Try connecting to GitHub again" } };
