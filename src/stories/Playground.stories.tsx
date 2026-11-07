import { useThemeConfiguration } from "./useThemeConfiguration";
import type { Meta, StoryObj } from "@storybook/react";
import { PlaygroundPage } from "../pages/PlaygroundPage/PlaygroundPage";
import type { PlaygroundView } from "../pages/PlaygroundPage/PlaygroundPage";

const meta = {
  id: "fundamentos-playground",
  title: "Playground",
  parameters: { refyFullPage: true },
} satisfies Meta;
export default meta;
function renderWorkbench(view: PlaygroundView) {
  const [config, update] = useThemeConfiguration();
  return (
    <PlaygroundPage config={config} onChange={update} initialView={view} />
  );
}
export const Tema: StoryObj = {
  name: "Tema",
  render: () => renderWorkbench("theme"),
};
export const Aplicacao: StoryObj = {
  name: "Componentes",
  render: () => renderWorkbench("components"),
};
export const Pagina: StoryObj = {
  name: "Demonstração",
  render: () => renderWorkbench("application"),
};
export const Blocks: StoryObj = {
  name: "Templates",
  render: () => renderWorkbench("blocks"),
};
export const Charts: StoryObj = {
  name: "Charts",
  render: () => renderWorkbench("charts"),
};
export const Blog: StoryObj = {
  name: "Tipografia",
  render: () => renderWorkbench("blog"),
};

// Direct URLs remain available for existing links and regression fixtures only.
export const Acesso: StoryObj = {
  tags: ["refy-internal"],
  name: "Acesso",
  render: () => renderWorkbench("access"),
};
export const Setup: StoryObj = {
  tags: ["refy-internal"],
  name: "Setup",
  render: () => renderWorkbench("setup"),
};
export const ChartsD3: StoryObj = {
  tags: ["refy-internal"],
  name: "Charts · D3",
  render: () => renderWorkbench("charts-d3"),
};
export const ChartsComparacao: StoryObj = {
  tags: ["refy-internal"],
  name: "Charts · comparação",
  render: () => renderWorkbench("chart-comparison"),
};
