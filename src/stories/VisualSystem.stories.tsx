import { useState } from "react";
import { useThemeConfiguration } from "./useThemeConfiguration";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BrandLogo,
  Badge,
  Button,
  Input,
  Select,
  Checkbox,
  Card,
  CardHeader,
  Segmented,
  CodeBlock,
  ThemeProvider,
  Modal,
  Menu,
  ToastRegion,
} from "../index";
import { fontSets, type FontSet } from "../lib/fontSets";
import { TypographySample } from "./TypographySample";
import type { ThemeMode } from "../index";
import { skins } from "./skins";
import styles from "./VisualSystem.module.css";

function Intro({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className={styles.header}>
        <BrandLogo />
        <Badge tone="neutral">Biblioteca React</Badge>
      </header>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Design que se adapta ao seu produto</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{children}</p>
      </div>
    </>
  );
}
function Overview({
  fonts,
  onFontsChange,
}: {
  fonts: FontSet;
  onFontsChange: (value: FontSet) => void;
}) {
  return (
    <main className={styles.page}>
      <Intro title="Refy Design System">
        Componentes reutilizáveis, uma linguagem visual consistente e liberdade
        para criar a identidade de cada aplicação.
      </Intro>
      <nav className={styles.links} aria-label="Começar">
        <a href="./?path=/story/fundamentos-refy--personalizar" target="_top">
          Personalizar a interface
        </a>
        <a
          href="./?path=/story/fundamentos-playground--aplicacao"
          target="_top"
        >
          Abrir playground completo
        </a>
        <a href="./?path=/story/fundamentos-tokens--explorar" target="_top">
          Explorar os tokens
        </a>
      </nav>
      <TypographySample value={fonts} onChange={onFontsChange} />
      <section className={styles.section}>
        <h2>Cores por responsabilidade</h2>
        <p>O tema muda os valores. O papel de cada cor permanece claro.</p>
        <div className={styles.palette}>
          {[
            ["Primária", "--primary"],
            ["Superfície", "--surface"],
            ["Texto", "--ink-1"],
            ["Informação", "--info"],
            ["Atenção", "--warn"],
            ["Erro", "--critical"],
          ].map(([label, token]) => (
            <div key={token}>
              <div
                className={styles.swatch}
                style={{ background: `var(${token})` }}
              />
              <b>{label}</b>
              <div className={styles.caption}>{token}</div>
            </div>
          ))}
        </div>
      </section>
      <section className={styles.section}>
        <h2>Do componente à tela</h2>
        <p>
          Átomos formam controles; moléculas resolvem tarefas curtas; organismos
          organizam áreas reutilizáveis. As páginas continuam sendo composições.
        </p>
        <div className={styles.row}>
          <Button variant="primary">Ação principal</Button>
          <Button>Secundária</Button>
          <Button variant="ghost">Complementar</Button>
          <Button disabled>Indisponível</Button>
        </div>
        <nav className={styles.links}>
          <a
            href="./?path=/story/components-atoms-button--todas-variantes"
            target="_top"
          >
            Átomos
          </a>
          <a
            href="./?path=/story/components-molecules-propertyactiongroup--tres-acoes"
            target="_top"
          >
            Moléculas
          </a>
          <a
            href="./?path=/story/components-organisms-propertycard--grid"
            target="_top"
          >
            Organismos
          </a>
        </nav>
      </section>
    </main>
  );
}
function Personalize({
  mode,
  fonts,
  onFontsChange,
}: {
  mode: ThemeMode;
  fonts: FontSet;
  onFontsChange: (value: FontSet) => void;
}) {
  const [skin, setSkin] = useState<keyof typeof skins>("refy-site");
  const [name, setName] = useState("Projeto Aurora");
  const [category, setCategory] = useState("design");
  const [share, setShare] = useState(true);
  const [modal, setModal] = useState(false);
  const [notice, setNotice] = useState(false);
  const [menu, setMenu] = useState(false);
  const selected = skins[skin];
  const identity = {
    ...selected.theme,
    name: selected.theme?.name ?? "refy",
    tokens: { ...selected.theme?.tokens, ...fontSets[fonts].tokens },
  };
  const snippet = `import { ThemeProvider, Button } from '@refy-design/web';\n\nconst identity = ${JSON.stringify(identity, null, 2)};\n\n<ThemeProvider theme={identity} mode="${mode}">\n  <Button variant="primary">Salvar alterações</Button>\n</ThemeProvider>`;
  return (
    <main className={styles.page}>
      <Intro title="A mesma interface. A sua identidade.">
        Mude formato, borda, superfície e estados por tokens. O formulário e seu
        comportamento continuam os mesmos.
      </Intro>
      <nav className={styles.links}>
        <a
          href="./?path=/story/fundamentos-playground--aplicacao"
          target="_top"
        >
          Personalizar uma aplicação completa →
        </a>
      </nav>
      <TypographySample value={fonts} onChange={onFontsChange} />
      <Segmented
        label="Identidade visual"
        value={skin}
        onChange={(value) => setSkin(value as keyof typeof skins)}
        options={Object.entries(skins).map(([value, item]) => ({
          value,
          label: item.label,
        }))}
      />
      <p className={styles.caption}>
        {selected.description} Modo atual:{" "}
        {mode === "dark"
          ? "escuro"
          : mode === "editorial"
            ? "editorial"
            : "claro"}
        .
      </p>
      <div className={styles.preview}>
        <ThemeProvider
          theme={identity}
          mode={mode}
          className={styles.previewScope}
          data-testid="skin-preview"
        >
          <Card>
            <CardHeader title="Detalhes do projeto" count="Rascunho" />
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault();
                setNotice(true);
              }}
            >
              <p className={styles.caption}>
                Organize as informações antes de compartilhar com a equipe.
              </p>
              <Input
                label="Nome do projeto"
                id="skin-project"
                value={name}
                onChange={(event) => setName(event.target.value)}
                block
                required
              />
              <Select
                id="skin-category"
                label="Categoria"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                block
              >
                <option value="design">Design</option>
                <option value="product">Produto</option>
                <option value="operations">Operações</option>
              </Select>
              <Checkbox
                label="Compartilhar com a equipe"
                description="Os integrantes poderão visualizar este projeto."
                checked={share}
                onChange={(event) => setShare(event.target.checked)}
              />
              <div className={styles.formFooter}>
                <Menu
                  open={menu}
                  onOpenChange={setMenu}
                  entries={[
                    {
                      id: "details",
                      label: "Ver resumo",
                      onSelect: () => setModal(true),
                    },
                    {
                      id: "reset",
                      label: "Restaurar exemplo",
                      onSelect: () => {
                        setName("Projeto Aurora");
                        setCategory("design");
                        setShare(true);
                      },
                    },
                  ]}
                >
                  <Button type="button" onClick={() => setMenu(!menu)}>
                    Mais opções
                  </Button>
                </Menu>
                <Button type="submit" variant="primary">
                  Salvar alterações
                </Button>
              </div>
            </form>
          </Card>
          <Modal
            title="Resumo do projeto"
            open={modal}
            onClose={() => setModal(false)}
            footer={
              <Button onClick={() => setModal(false)}>Fechar resumo</Button>
            }
          >
            <p>{name}</p>
            <p>{share ? "Compartilhado com a equipe" : "Somente você"}</p>
          </Modal>
          <ToastRegion
            toasts={
              notice
                ? [
                    {
                      id: "saved",
                      title: "Alterações salvas",
                      description: name,
                      duration: null,
                    },
                  ]
                : []
            }
            onDismiss={() => setNotice(false)}
          />
        </ThemeProvider>
        <ThemeProvider
          theme={identity}
          mode={mode}
          className={styles.controls}
          data-testid="skin-states"
        >
          <h2 style={{ fontFamily: "var(--font-headline)", margin: "0 0 8px" }}>
            Estados do componente
          </h2>
          <p className={styles.caption} style={{ margin: 0 }}>
            Passe o ponteiro, navegue com Tab ou mantenha o botão pressionado
            para conferir os estados.
          </p>
          <div className={styles.states}>
            {[
              [
                "Padrão",
                <Button variant="primary" key="default">
                  Continuar
                </Button>,
              ],
              ["Secundário", <Button key="secondary">Voltar</Button>],
              [
                "Carregando",
                <Button key="loading" variant="primary" loading>
                  Salvando
                </Button>,
              ],
              [
                "Desabilitado",
                <Button key="disabled" variant="primary" disabled>
                  Continuar
                </Button>,
              ],
              [
                "Concluído",
                <Button key="success" variant="primary" status="success">
                  Salvo
                </Button>,
              ],
              [
                "Erro",
                <Button key="error" variant="danger">
                  Tentar novamente
                </Button>,
              ],
            ].map(([label, button]) => (
              <div key={String(label)} className={styles.state}>
                <span>{label}</span>
                {button}
              </div>
            ))}
          </div>
        </ThemeProvider>
      </div>
      <section className={styles.section}>
        <h2>Uma configuração por aplicação</h2>
        <p>
          Este exemplo usa os componentes publicados pela biblioteca. Copie os
          tokens da identidade selecionada e ajuste os valores no seu projeto.
        </p>
        <CodeBlock
          label="Configuração da identidade"
          language="tsx"
          code={snippet}
        />
      </section>
    </main>
  );
}
const meta = {
  title: "Fundamentos/Refy",
  parameters: { refyFullPage: true },
  tags: ["autodocs"],
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const VisaoGeral: Story = {
  render: function Render() {
    const [config, update] = useThemeConfiguration();
    return (
      <Overview
        fonts={config.fonts}
        onFontsChange={(fonts) => update({ fonts })}
      />
    );
  },
};
export const Personalizar: Story = {
  render: function Render() {
    const [config, update] = useThemeConfiguration();
    return (
      <Personalize
        mode={config.theme}
        fonts={config.fonts}
        onFontsChange={(fonts) => update({ fonts })}
      />
    );
  },
};
