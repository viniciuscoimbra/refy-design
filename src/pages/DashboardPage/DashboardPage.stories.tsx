import type { Meta, StoryObj } from "@storybook/react";
import { DashboardPage } from "./DashboardPage";

const dashboardMeta: Meta<typeof DashboardPage> = {
  id: "páginas-dashboard",
  title: "Exemplos/Painel de projetos",
  component: DashboardPage,
  parameters: { layout: "fullscreen", refyFullPage: true },
};
export default dashboardMeta;

type Story = StoryObj<typeof DashboardPage>;

/** Tela real montada só com componentes do @refy-design/web. */
export const VisaoGeral: Story = {};
