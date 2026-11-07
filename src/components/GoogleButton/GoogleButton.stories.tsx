import type { Meta, StoryObj } from "@storybook/react";
import { GoogleButton } from "./GoogleButton";

const meta = {
  id: "components-atoms-googlebutton",
  title: "Components/Atoms/GoogleButton",
  component: GoogleButton,
  tags: ["autodocs"],
  args: { children: "Continue with Google" },
} satisfies Meta<typeof GoogleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Continuar: Story = { name: "Continue",};
export const Entrar: Story = { name: "Sign in", args: { children: "Sign in with Google" } };
export const CriarConta: Story = { name: "Create account", args: { children: "Sign up with Google" } };
export const Carregando: Story = { name: "Loading", args: { loading: true, loadingLabel: "Connecting to Google" } };
export const Desabilitado: Story = { name: "Disabled", args: { disabled: true } };
export const LarguraTotal: Story = { name: "Full width", args: { block: true }, decorators: [(Story) => <div style={{ width: "100%", maxWidth: 360 }}><Story /></div>] };

/** Explicit public state; it does not call external services. */
export const Erro: Story = { name: "Error", args: { status: "error", children: "Try connecting to Google again" } };
