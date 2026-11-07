import { useThemeConfiguration } from "./useThemeConfiguration";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  PageHeader,
  Card,
  CardHeader,
  Input,
  Select,
  Switch,
  SettingRow,
  SettingRowGroup,
  Button,
  ToastRegion,
  ThemeProvider,
} from "../index";
import { skins } from "./skins";
import { fontSets, type FontSet } from "../lib/fontSets";
import type { ThemeMode } from "../index";
import styles from "./VisualSystem.module.css";
function Settings({ mode, fonts }: { mode: ThemeMode; fonts: FontSet }) {
  const [name, setName] = useState("Ana Silva");
  const [email, setEmail] = useState("ana@example.com");
  const [notifications, setNotifications] = useState(true);
  const [skin, setSkin] = useState<keyof typeof skins>("refy-site");
  const [notice, setNotice] = useState(false);
  return (
    <ThemeProvider
      mode={mode}
      theme={{
        ...skins[skin].theme,
        name: skins[skin].theme?.name ?? "refy",
        tokens: { ...skins[skin].theme?.tokens, ...fontSets[fonts].tokens },
      }}
    >
      <main className={styles.page}>
        <PageHeader
          eyebrow="Conta"
          title="Configurações"
          lead="Gerencie seu perfil, suas preferências e a aparência deste ambiente."
        />
        <form
          className={styles.form}
          style={{ marginTop: 32, maxWidth: 760 }}
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(true);
          }}
        >
          <Card>
            <CardHeader title="Perfil" />
            <div className={styles.form}>
              <Input
                id="settings-name"
                label="Nome completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                block
              />
              <Input
                id="settings-email"
                type="email"
                label="E-mail"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                block
              />
            </div>
          </Card>
          <Card>
            <CardHeader title="Preferências" />
            <SettingRowGroup>
              <SettingRow
                title="Notificações por e-mail"
                description="Receba atualizações dos projetos que você acompanha."
                actions={
                  <Switch
                    aria-label="Notificações por e-mail"
                    checked={notifications}
                    onChange={(event) => setNotifications(event.target.checked)}
                  />
                }
              />
              <SettingRow
                title="Identidade visual"
                description="Veja a mesma tela em três configurações de aparência."
                actions={
                  <Select
                    id="settings-skin"
                    aria-label="Identidade visual"
                    value={skin}
                    onChange={(event) =>
                      setSkin(event.target.value as keyof typeof skins)
                    }
                  >
                    {Object.entries(skins).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </Select>
                }
              />
            </SettingRowGroup>
          </Card>
          <div className={styles.formFooter}>
            <Button
              type="button"
              onClick={() => {
                setName("Ana Silva");
                setEmail("ana@example.com");
                setNotifications(true);
              }}
            >
              Restaurar
            </Button>
            <Button type="submit" variant="primary">
              Salvar preferências
            </Button>
          </div>
        </form>
        <ToastRegion
          toasts={
            notice
              ? [
                  {
                    id: "saved",
                    title: "Preferências salvas",
                    description:
                      "Seu perfil foi atualizado nesta demonstração.",
                    duration: null,
                  },
                ]
              : []
          }
          onDismiss={() => setNotice(false)}
        />
      </main>
    </ThemeProvider>
  );
}
const meta = {
  id: "exemplos-configuracoes",
  title: "Exemplos/Configurações",
  parameters: { refyFullPage: true },
} satisfies Meta;
export default meta;
export const Perfil: StoryObj = {
  render: function Render() {
    const [config] = useThemeConfiguration();
    return <Settings mode={config.theme} fonts={config.fonts} />;
  },
};
