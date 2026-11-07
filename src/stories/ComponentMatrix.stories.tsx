import { useThemeConfiguration } from "./useThemeConfiguration";
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentMatrix } from "../_demo/ComponentMatrix";
import { PlaygroundPage } from "../pages/PlaygroundPage/PlaygroundPage";

const meta = {
  id: "verification-component-matrix",
  title: "Verificacao/Matriz de componentes",
  parameters: { refyFullPage: true },
} satisfies Meta;
export default meta;
export const Matriz: StoryObj = {
  render: function Matrix() {
    const [config, update] = useThemeConfiguration();
    return (
      <PlaygroundPage
        config={config}
        onChange={update}
        componentPreview={<ComponentMatrix />}
      />
    );
  },
};
