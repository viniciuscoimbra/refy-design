import type { Meta, StoryObj } from "@storybook/react";
import { PlaygroundStudio } from "../pages/PlaygroundPage/PlaygroundStudio";

// Rascunho da proposta do Playground: componente vivo, seletor compacto e painel de personalização.
const meta = {
  id: "fundamentos-playground-proposta",
  title: "Playground/Proposta",
  tags: ["refy-internal"],
  parameters: { refyFullPage: true },
} satisfies Meta;
export default meta;

export const Button: StoryObj = { render: () => <PlaygroundStudio initialComponent="Button" /> };
export const Modal: StoryObj = { render: () => <PlaygroundStudio initialComponent="Modal" /> };
