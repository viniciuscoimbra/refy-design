import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider, refySiteTheme } from "../index";
import { ComponentExample } from "../pages/PlaygroundPage/ComponentArea";
import { componentCatalog } from "../pages/PlaygroundPage/catalog";
import { useThemeConfiguration } from "./useThemeConfiguration";
import {
  defaultConfig,
  resolveTheme,
  type PlaygroundConfig,
} from "../pages/PlaygroundPage/themeConfig";
import site from "../pages/RefySitePage/RefySitePage.module.css";
import docs from "../pages/PlaygroundPage/ComponentDocumentation.module.css";

interface Props {
  family: string;
  specimenWidth: number;
  story?: string;
  reducedMotion?: boolean;
  environment: "consumer" | "story" | "playground" | "site";
  configuration?: PlaygroundConfig;
}

// Verification fixture only. Equal available width is an input, never a production override.
function Specimen({
  family,
  story,
  reducedMotion = false,
  specimenWidth,
  environment,
  configuration = defaultConfig,
}: Props) {
  const config = configuration;
  const entry = componentCatalog.find((item) => item.id === family);
  if (!entry) return <p role="alert">Família desconhecida: {family}</p>;
  const exported = JSON.parse(JSON.stringify(refySiteTheme));
  exported.name = "Tema reimportado sem identidade especial";
  const identity = environment === "consumer" ? exported : resolveTheme(config);
  const theme = reducedMotion
    ? { ...identity, tokens: { ...identity.tokens, "--motion-reduced": "1" } }
    : identity;
  const sample = (
    <div
      data-refy-specimen={family}
      style={{
        width: specimenWidth,
        position: "fixed",
        left: 0,
        top: 0,
        background: "var(--bg)",
        minHeight: "100vh",
      }}
    >
      <ComponentExample
        id={family}
        story={story || undefined}
        withDecorators={false}
      />
    </div>
  );
  const scope =
    environment === "site"
      ? site.site
      : environment === "story"
        ? "refy-canvas"
        : undefined;
  return (
    <ThemeProvider theme={theme} mode={config.theme} className={scope}>
      <div data-harness-context={environment} data-harness-family={family}>
        {environment === "playground" ? (
          <article className={docs.document}>
            <section className={docs.section}>
              <div data-example="theme-contract">{sample}</div>
            </section>
          </article>
        ) : environment === "site" ? (
          <article className={site.article}>
            <section className={site.firstSection}>{sample}</section>
          </article>
        ) : (
          sample
        )}
      </div>
    </ThemeProvider>
  );
}

const meta = {
  id: "verification-refy-theme",
  title: "Verificacao/Contrato do tema Refy Site",
  component: Specimen,
  render: function Render(args) {
    const [configuration] = useThemeConfiguration();
    return <Specimen {...args} configuration={configuration} />;
  },
  tags: ["refy-internal"],
  parameters: { refyFullPage: true, layout: "fullscreen" },
  args: {
    family: "Accordion",
    specimenWidth: 800,
    environment: "consumer",
    story: "",
    reducedMotion: false,
  },
  argTypes: {
    story: { control: "text" },
    reducedMotion: { control: "boolean" },
    family: {
      control: "select",
      options: componentCatalog.map((item) => item.id),
    },
    environment: {
      control: "select",
      options: ["consumer", "story", "playground", "site"],
    },
  },
} satisfies Meta<typeof Specimen>;
export default meta;
export const Family: StoryObj<typeof meta> = {};
