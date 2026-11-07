import { tr } from "../RefySitePage/i18n";
import { ConversationExample } from "../../_demo/ConversationExample";
import conversationExample from "../../_demo/ConversationExample.tsx?raw";
import conversationExampleCSS from "../../_demo/ConversationExample.module.css?raw";
import conversationBlock from "../../blocks/ConversationBlock.tsx?raw";
import conversationCSS from "../../blocks/ConversationBlock.module.css?raw";
import type { ComponentType } from "react";
import {
  AccessBlock,
  SetupBlock,
} from "../../index";
import { AccessPage } from "../../blocks/AccessPage";
import { NavigationBlock } from "../../blocks/NavigationBlock";
import { TextArticleBlock } from "../../blocks/TextArticleBlock";
import { PlaylistBlock } from "../../blocks/PlaylistBlock";
import { SwipeBlock } from "../../blocks/SwipeBlock";
import { TaskBoardBlock } from "../../blocks/TaskBoardBlock";
import { AgendaBlock } from "../../blocks/AgendaBlock";
import { StoreBlock } from "../../blocks/StoreBlock";
import { AreaSearchBlock } from "../../blocks/AreaSearchBlock";
import { PrioritiesBlock } from "../../blocks/PrioritiesBlock";
import priorities from "../../blocks/PrioritiesBlock.tsx?raw";
import prioritiesCSS from "../../blocks/PrioritiesBlock.module.css?raw";
import { VisitBlock } from "../../blocks/VisitBlock";
import visit from "../../blocks/VisitBlock.tsx?raw";
import visitCSS from "../../blocks/VisitBlock.module.css?raw";
import { OrderBlock } from "../../blocks/OrderBlock";
import order from "../../blocks/OrderBlock.tsx?raw";
import orderCSS from "../../blocks/OrderBlock.module.css?raw";
import { AssistantSearchBlock } from "../../blocks/AssistantSearchBlock";
import assistant from "../../blocks/AssistantSearchBlock.tsx?raw";
import assistantCSS from "../../blocks/AssistantSearchBlock.module.css?raw";
import areaSearch from "../../blocks/AreaSearchBlock.tsx?raw";
import areaSearchCSS from "../../blocks/AreaSearchBlock.module.css?raw";
import neighborhoods from "../../blocks/neighborhoods.geojson.ts?raw";
import photoIndex from "../../blocks/photos/index.ts?raw";
import taskBoard from "../../blocks/TaskBoardBlock.tsx?raw";
import taskBoardCSS from "../../blocks/TaskBoardBlock.module.css?raw";
import agenda from "../../blocks/AgendaBlock.tsx?raw";
import agendaCSS from "../../blocks/AgendaBlock.module.css?raw";
import store from "../../blocks/StoreBlock.tsx?raw";
import storeCSS from "../../blocks/StoreBlock.module.css?raw";
import playlist from "../../blocks/PlaylistBlock.tsx?raw";
import playlistCSS from "../../blocks/PlaylistBlock.module.css?raw";
import swipe from "../../blocks/SwipeBlock.tsx?raw";
import swipeCSS from "../../blocks/SwipeBlock.module.css?raw";
import dashboard from "../../blocks/DashboardBlock.tsx?raw";
import charts from "../../blocks/ChartExplorer.tsx?raw";
import library from "../../blocks/LibraryBlock.tsx?raw";
import settings from "../../blocks/SettingsBlock.tsx?raw";
import access from "../../blocks/AccessBlock.tsx?raw";
import accessPage from "../../blocks/AccessPage.tsx?raw";
import accessCSS from "../../blocks/AccessPage.module.css?raw";
import navigation from "../../blocks/NavigationBlock.tsx?raw";
import article from "../../blocks/TextArticleBlock.tsx?raw";
import articleCSS from "../../blocks/TextArticleBlock.module.css?raw";
import setup from "../../blocks/SetupBlock.tsx?raw";
import css from "../../blocks/blocks.module.css?raw";

// Grouped by what the screen is for (decision 05/11): templates are the layer above organisms.
export const blockCategories = [
  { id: "featured", label: tr("Destaques") },
  { id: "media", label: tr("Mídia") },
  { id: "discovery", label: tr("Descoberta") },
  { id: "store", label: tr("Loja") },
  { id: "productivity", label: tr("Produtividade") },
  { id: "dashboards", label: tr("Painéis") },
  { id: "conversation", label: tr("Conversa") },
  { id: "content", label: tr("Conteúdo") },
  { id: "account", label: tr("Conta e configurações") },
  { id: "access", label: tr("Entrada e cadastro") },
  { id: "navigation", label: tr("Estrutura de app") },
];
// The template photos are not part of the package. Copied code gets a photos.ts with the same keys
// and neutral sample images, so it compiles and runs before the person adds their own pictures.
const photoKeys = [...(photoIndex.match(/export const photos = \{([^}]*)\}/)?.[1] ?? "").matchAll(/(\w+)/g)].map((match) => match[1]);
const samplePhotos = `// Sample images for this template. Replace each entry with your own image URL or import.
const sample = (color: string) =>
  \`data:image/svg+xml;charset=UTF-8,\${encodeURIComponent(
    \`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="\${color}"/></svg>\`,
  )}\`;

export const photos = {
${photoKeys.map((key, index) => `  ${key}: sample("${["#c7d9ce", "#cbd4e4", "#e4d3c7", "#d9cbe4", "#d4e4cb"][index % 5]}"),`).join("\n")}
};
`;
function recipe<P extends object>(
  Component: ComponentType<P>,
  name: string,
  props: P,
  files: Record<string, string>,
) {
  const padding = [
    "NavigationBlock",
    "AccessPage",
    "TextArticleBlock",
    "PlaylistBlock",
    "SwipeBlock",
    "TaskBoardBlock",
    "AgendaBlock",
    "StoreBlock",
    "AreaSearchBlock",
    "ConversationExample",
    "PrioritiesBlock",
    "VisitBlock",
    "OrderBlock",
    "AssistantSearchBlock",
  ].includes(name)
    ? "0"
    : "var(--space-6)";
  return {
    component: () => (
      <div style={{ padding, minHeight: "100vh" }}>
        <Component {...props} />
      </div>
    ),
    files: {
      "page.tsx": `import { ${name} } from './${name}';\n\nexport default function Page() {\n  const props = ${JSON.stringify(props, null, 2)} as const;\n  return <div style={{ padding: "${padding}", minHeight: "100vh" }}><${name} {...props} /></div>;\n}`,
      ...Object.fromEntries(
        Object.entries(files).map(([file, source]) => [
          file,
          source.replace(/from ['"]\.\.\/index['"]/g, "from '@refy-design/web'"),
        ]),
      ),
      ...(Object.values(files).some((source) => /from ['"]\.\/photos['"]/.test(source)) ? { "photos.ts": samplePhotos } : {}),
    },
  };
}
// The app templates are one product: the menu opens each real page, so each one ships them all.
const workspaceFiles = {
  "NavigationBlock.tsx": navigation,
  "DashboardBlock.tsx": dashboard,
  "ChartExplorer.tsx": charts,
  "LibraryBlock.tsx": library,
  "SettingsBlock.tsx": settings,
  "blocks.module.css": css,
};
const workspace = (defaultSection: "overview" | "analytics" | "library" | "settings", defaultMode: "expanded" | "compact" = "expanded") =>
  recipe(NavigationBlock, "NavigationBlock", { defaultMode, defaultSection }, workspaceFiles);
const accessFiles = {
  "AccessPage.tsx": accessPage,
  "AccessPage.module.css": accessCSS,
  "AccessBlock.tsx": access,
  "blocks.module.css": css,
};
export const blockRegistry = [
  {
    id: "playlist-01",
    title: tr("Playlist"),
    category: "media",
    featured: true,
    description:
      tr("Capa, faixas e tocador fixo no rodapé. Tocar, pausar, pular, curtir e ajustar o volume funcionam."),
    composition: "Button · IconButton · Slider · Badge",
    ...recipe(PlaylistBlock, "PlaylistBlock", {}, {
      "PlaylistBlock.tsx": playlist,
      "PlaylistBlock.module.css": playlistCSS,
    }),
  },
  {
    id: "swipe-01",
    title: tr("Escolha por cartões"),
    category: "discovery",
    featured: true,
    description:
      tr("Um cartão por vez: arraste para a direita para marcar visita, para a esquerda para passar. As escolhas vão para as listas ao lado."),
    composition: "SwipeDeck · PageHeader · Item · Badge · EmptyState",
    ...recipe(SwipeBlock, "SwipeBlock", {}, {
      "SwipeBlock.tsx": swipe,
      "SwipeBlock.module.css": swipeCSS,
    }),
  },
  {
    id: "area-01",
    title: tr("Busca por região"),
    category: "discovery",
    featured: true,
    description:
      tr("Mapa real de bairros de Belo Horizonte. O raio sugere vizinhos, o toque no mapa decide quem entra, e a lista de imóveis responde na hora."),
    composition: "GeoAreaPicker · D3Chart (geo) · PropertyCard · Segmented · PageHeader",
    ...recipe(AreaSearchBlock, "AreaSearchBlock", {}, {
      "AreaSearchBlock.tsx": areaSearch,
      "AreaSearchBlock.module.css": areaSearchCSS,
      "neighborhoods.geojson.ts": neighborhoods,
    }),
  },
  {
    id: "assistant-01",
    title: tr("Assistente de busca"),
    category: "conversation",
    featured: true,
    description:
      tr("A pessoa pede em texto livre e a lista ao lado responde. O que o assistente entendeu aparece em etiquetas, para corrigir sem recomeçar."),
    composition: "IntentComposer · MessageScroller · Message · PropertyCard · Badge",
    ...recipe(AssistantSearchBlock, "AssistantSearchBlock", {}, {
      "AssistantSearchBlock.tsx": assistant,
      "AssistantSearchBlock.module.css": assistantCSS,
    }),
  },
  {
    id: "visit-01",
    title: tr("Agendar visita"),
    category: "discovery",
    description:
      tr("A pessoa marca todos os horários em que pode ir, e o resumo ao lado agrupa por dia antes de enviar."),
    composition: "VisitSchedulePicker · PropertyMedia · Avatar · Callout · Button",
    ...recipe(VisitBlock, "VisitBlock", {}, {
      "VisitBlock.tsx": visit,
      "VisitBlock.module.css": visitCSS,
    }),
  },
  {
    id: "store-01",
    title: tr("Loja com sacola"),
    category: "store",
    featured: true,
    description:
      tr("Vitrine com filtro por categoria e sacola lateral: quantidades, frete grátis a partir de R$ 300 e total."),
    composition: "PageHeader · Card · Drawer · Segmented · Button · IconButton · Badge · EmptyState",
    ...recipe(StoreBlock, "StoreBlock", {}, { "StoreBlock.tsx": store, "StoreBlock.module.css": storeCSS }),
  },
  {
    id: "order-01",
    title: tr("Acompanhar pedido"),
    category: "store",
    description:
      tr("Etapas da entrega no topo, histórico de cada parada e o que veio no pacote. Um toque liga o aviso de chegada."),
    composition: "WizardStepper · ActivityTimeline · Item · Callout · PageHeader",
    ...recipe(OrderBlock, "OrderBlock", {}, {
      "OrderBlock.tsx": order,
      "OrderBlock.module.css": orderCSS,
    }),
  },
  {
    id: "board-01",
    title: tr("Quadro de tarefas"),
    category: "productivity",
    featured: true,
    description:
      tr("Etapas de um projeto em colunas. Arrastar muda a etapa, clicar abre os detalhes e o modal cria tarefa."),
    composition: "KanbanBoard · PageHeader · Drawer · Modal · AvatarGroup · Segmented · Input · Select · Badge",
    ...recipe(TaskBoardBlock, "TaskBoardBlock", {}, { "TaskBoardBlock.tsx": taskBoard, "TaskBoardBlock.module.css": taskBoardCSS }),
  },
  {
    id: "priorities-01",
    title: tr("Prioridades do trimestre"),
    category: "productivity",
    description:
      tr("Ideias em impacto e esforço. Cada ponto abre o motivo, a confiança e quem puxa; o contador avisa quando o trimestre estoura."),
    composition: "Matrix2x2 · ScoreGauge · Item · Avatar · Badge · Button",
    ...recipe(PrioritiesBlock, "PrioritiesBlock", {}, {
      "PrioritiesBlock.tsx": priorities,
      "PrioritiesBlock.module.css": prioritiesCSS,
    }),
  },
  {
    id: "agenda-01",
    title: tr("Agenda do dia"),
    category: "productivity",
    featured: false,
    description:
      tr("Calendário do mês e compromissos do dia escolhido, com horas ocupadas e marcação de compromisso."),
    composition: "Calendar · PageHeader · Item · Modal · EmptyState · Segmented · Input · Badge",
    ...recipe(AgendaBlock, "AgendaBlock", {}, { "AgendaBlock.tsx": agenda, "AgendaBlock.module.css": agendaCSS }),
  },
  {
    id: "dashboard-01",
    title: tr("Painel de projetos"),
    category: "dashboards",
    featured: true,
    description:
      tr("Página inicial de um produto: menu, topo, métricas, entregas e projetos da equipe. O menu abre as outras páginas."),
    composition: "AppShell · Sidebar · Topbar · PageHeader · StatGroup · AreaChart · Table",
    ...workspace("overview"),
  },
  {
    id: "sidebar-01",
    title: tr("Menu lateral expandido"),
    category: "navigation",
    featured: true,
    description:
      tr("Menu lateral aberto com área de trabalho, conta e páginas reais. No celular, vira drawer."),
    composition: "AppShell · Sidebar · Topbar · Drawer · Modal · Input",
    ...workspace("overview", "expanded"),
  },
  {
    id: "sidebar-02",
    title: tr("Menu lateral compacto"),
    category: "navigation",
    featured: false,
    description:
      tr("O mesmo produto com o menu só em ícones. Um clique expande."),
    composition: "AppShell · Sidebar · Tooltip · Topbar · Modal",
    ...workspace("overview", "compact"),
  },
  ...(["login", "signup"] as const).flatMap((screen) =>
    (["centered", "split"] as const).map((layout, index) => ({
      id: `${screen}-0${index + 1}`,
      title: `${screen === "login" ? "Entrada" : "Cadastro"} ${layout === "centered" ? (screen === "login" ? "centralizada" : "centralizado") : "em duas colunas"}`,
      category: "access",
      featured: screen === "login" && layout === "split",
      description:
        layout === "split"
          ? "Formulário e apresentação lado a lado. No celular, foco no formulário."
          : "Formulário centralizado com recuperação e verificação no mesmo fluxo.",
      composition: "BrandLogo · Input · Checkbox · Button · Otp · Callout",
      ...recipe(
        AccessPage,
        "AccessPage",
        {
          layout,
          screen,
          ...(layout === "split" && screen === "login"
            ? { providers: ["google", "github", "apple"] as const }
            : {}),
        },
        accessFiles,
      ),
    })),
  ),
  {
    id: "recover-01",
    title: tr("Recuperação de acesso"),
    category: "access",
    featured: false,
    description:
      tr("E-mail, código e redefinição de senha com validação demonstrativa."),
    composition: "Input · Otp · Callout · Button",
    ...recipe(
      AccessBlock,
      "AccessBlock",
      { initialScreen: "recover" as const },
      { "AccessBlock.tsx": access, "blocks.module.css": css },
    ),
  },
  {
    id: "verify-01",
    title: tr("Verificação por código"),
    category: "access",
    featured: false,
    description:
      tr("Código de seis dígitos, erro e reenvio local. Use 123456 para testar."),
    composition: "Otp · Button · Callout",
    ...recipe(
      AccessBlock,
      "AccessBlock",
      { initialScreen: "otp" as const },
      { "AccessBlock.tsx": access, "blocks.module.css": css },
    ),
  },
  {
    id: "setup-01",
    title: tr("Configuração guiada"),
    category: "account",
    featured: false,
    description:
      tr("Criação do espaço, preferências de acesso e revisão em três etapas."),
    composition: "WizardStepper · ChoiceCard · Input · Card · Checkbox",
    ...recipe(
      SetupBlock,
      "SetupBlock",
      {},
      { "SetupBlock.tsx": setup, "blocks.module.css": css },
    ),
  },
  {
    id: "settings-01",
    title: tr("Perfil e preferências"),
    category: "account",
    featured: false,
    description: tr("Página de conta dentro do produto: perfil e avisos, salvos nesta sessão."),
    composition: "AppShell · Sidebar · Tabs · SettingRow · Avatar · Input · Switch",
    ...workspace("settings"),
  },
  {
    id: "library-01",
    title: tr("Biblioteca de materiais"),
    category: "content",
    featured: false,
    description:
      tr("Página de materiais dentro do produto: busca, filtro, leitura em drawer e criação em modal."),
    composition: "AppShell · Sidebar · Input · Select · Item · Drawer · Modal",
    ...workspace("library"),
  },
  {
    id: "article-01",
    title: tr("Artigo com sumário"),
    category: "content",
    featured: false,
    description:
      tr("Artigo de ajuda com sumário lateral que acompanha a leitura."),
    composition: "Prose · TableOfContents",
    ...recipe(
      TextArticleBlock,
      "TextArticleBlock",
      {},
      {
        "TextArticleBlock.tsx": article,
        "TextArticleBlock.module.css": articleCSS,
      },
    ),
  },
  {
    id: "charts-01",
    title: tr("Análise de audiência"),
    category: "dashboards",
    featured: false,
    description:
      tr("Página de análise dentro do produto: período, tipo de gráfico, séries e tabela de dados."),
    composition: "AppShell · Sidebar · AreaChart · Select · Segmented · Switch",
    ...workspace("analytics"),
  },
  ...(["inline", "drawer"] as const).map((presentation, index) => ({
    id: `conversation-0${index + 1}`,
    title: tr(presentation === "inline" ? "Perguntas sobre o projeto" : "Conversa em painel lateral"),
    category: "conversation",
    description: tr(presentation === "inline"
      ? "Conversa ao lado do contexto do projeto. Envio pode ser cancelado, e um erro preserva o rascunho para tentar de novo."
      : "A página do projeto continua visível; a conversa abre num painel lateral e devolve o foco ao botão quando fecha."),
    composition: "Message · MessageScroller · IntentComposer · Callout · Item · Badge · Drawer",
    ...recipe(ConversationExample, "ConversationExample", { presentation }, {
      "ConversationExample.tsx": conversationExample.replace(/from ['"]\.\.\/blocks\/ConversationBlock['"]/g, "from './ConversationBlock'"),
      "ConversationBlock.tsx": conversationBlock,
      "ConversationBlock.module.css": conversationCSS,
      "ConversationExample.module.css": conversationExampleCSS,
    }),
  })),
];
export type BlockEntry = (typeof blockRegistry)[number];
