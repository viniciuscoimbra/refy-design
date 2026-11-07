import type { Meta, StoryObj } from "@storybook/react";
import { RefySitePage } from "./RefySitePage";
import { useThemeConfiguration } from "../../stories/useThemeConfiguration";

const meta = {
  title: "Componentes/Páginas/Refy Site",
  id: "refy-site",
  component: RefySitePage,
  parameters: { refyFullPage: true, layout: "fullscreen" },
  render: function Render(args, context) {
    const [config, update] = useThemeConfiguration();
    // As telas de aparelho são esta mesma story num iframe. Escrever nos globals do Storybook a partir
    // delas devolve à página o tema antigo; elas recebem o tema da página por mensagem.
    const deviceFrame = typeof window !== "undefined" && window.frameElement?.hasAttribute("data-refy-device-frame");
    if (deviceFrame) return <RefySitePage key={context.id} {...args} />;
    return (
      <RefySitePage
        key={context.id}
        {...args}
        configuration={config}
        onConfigurationChange={update}
      />
    );
  },
} satisfies Meta<typeof RefySitePage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Inicio: Story = {
  name: "01 · Início",
  args: { initialPage: "home" },
};
export const Instalacao: Story = {
  name: "02 · Instalação",
  args: { initialPage: "docs" },
};
export const Componentes: Story = {
  name: "03 · Catálogo de componentes",
  args: { initialPage: "components" },
};
export const Accordion: Story = {
  name: "04 · Accordion",
  args: { initialPage: "accordion" },
};
export const Blocks: Story = {
  name: "05 · Templates (Blocks)",
  args: { initialPage: "blocks" },
};
export const Charts: Story = {
  name: "06 · Charts",
  args: { initialPage: "charts" },
};
export const Temas: Story = {
  name: "07 · Temas",
  args: { initialPage: "themes" },
};
export const ParaIAs: Story = {
  name: "08 · Para IAs",
  args: { initialPage: "ai" },
};
export const Escuro: Story = {
  name: "09 · Modo escuro",
  args: { initialPage: "accordion", initialMode: "dark" },
};
const mobile = {
  viewport: {
    defaultViewport: "refyMobile",
    viewports: {
      refyMobile: {
        name: "Refy · 390px",
        styles: { width: "390px", height: "844px" },
      },
    },
  },
};
export const MobileInicio: Story = {
  name: "10a · Mobile · início",
  args: { initialPage: "home" },
  parameters: mobile,
};
export const MobileMenu: Story = {
  name: "10b · Mobile · navegação",
  args: { initialPage: "accordion", initialMenuOpen: true },
  parameters: mobile,
};
export const MobileAccordion: Story = {
  name: "10c · Mobile · Accordion",
  args: { initialPage: "accordion" },
  parameters: mobile,
};
export const Busca: Story = {
  name: "11 · Busca global",
  args: { initialPage: "accordion", initialSearchOpen: true },
};
export const Tipografia: Story = {
  name: "12 · Tipografia",
  args: { initialPage: "typography" },
};
export const Playground: Story = {
  name: "13 · Playground de criação",
  args: { initialPage: "playground" },
};
