import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider, Button, Input, Card, CardHeader, Menu, Modal, Drawer, Tooltip, ToastRegion, BrandLogo } from "../index";
import type { RefyTheme, ThemeMode } from "../index";

const compact: RefyTheme = { name: "compact-demo", tokens: { "--font-body": "system-ui, sans-serif", "--font-headline": "system-ui, sans-serif", "--button-height-md": "36px", "--field-height": "40px", "--radius-default": "4px", "--radius-lg-token": "6px" }, modes: {
  light: { "--primary": "#2163ad", "--primary-hover": "#18518f", "--on-primary": "#ffffff", "--primary-container": "#123e70", "--on-primary-container": "#ffffff", "--primary-ink": "#18518f" },
  dark: { "--primary": "#a7cfff", "--primary-hover": "#c5dfff", "--on-primary": "#123050", "--primary-container": "#18518f", "--on-primary-container": "#ffffff", "--primary-ink": "#a7cfff" },
} };
const rounded: RefyTheme = { name: "rounded-demo", tokens: { "--font-body": "Georgia, serif", "--font-headline": "Georgia, serif", "--button-height-md": "44px", "--field-height": "48px", "--radius-default": "16px", "--radius-lg-token": "20px", "--space-5": "24px" }, modes: {
  light: { "--primary": "#7550a0", "--primary-hover": "#603d89", "--on-primary": "#ffffff", "--primary-container": "#503373", "--on-primary-container": "#ffffff", "--primary-ink": "#603d89" },
  dark: { "--primary": "#e2c0ff", "--primary-hover": "#eddaff", "--on-primary": "#352045", "--primary-container": "#603d89", "--on-primary-container": "#ffffff", "--primary-ink": "#e2c0ff" },
} };
function Controls({ id }: { id: string }) {
  const [menu, setMenu] = useState(false);
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState(false);
  return <>
    <Input id={`${id}-name`} label="Nome" hint="O valor deve permanecer ao trocar o modo." />
    <Menu open={menu} onOpenChange={setMenu} entries={[{ id: "disabled", label: "Indisponível", disabled: true }, { id: "save", label: "Confirmar", onSelect: () => setCount(n => n + 1) }]}>
      <Button variant="primary" onClick={() => setMenu(!menu)}>Ações</Button>
    </Menu>
    <Tooltip label="Explicação longa para validar a quebra de texto sem esconder conteúdo no celular" portalled delayMs={0}><Button variant="secondary">Ajuda</Button></Tooltip>
    <Button variant="ghost" onClick={() => setToast(true)}>Avisar</Button>
    <p>Confirmações: {count}</p>
    <ToastRegion toasts={toast ? [{ id: "saved", title: "Aviso global da instância", description: "Texto longo para verificar leitura e quebra de texto.", duration: null }] : []} onDismiss={() => setToast(false)} />
  </>;
 }
function Sample({ id, theme, mode }: { id: string; theme?: RefyTheme; mode: ThemeMode }) {
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  return <ThemeProvider theme={theme} mode={mode} data-testid={id} style={{ padding: 16 }}>
    <Card><CardHeader title="Uma composição com os mesmos componentes em identidades diferentes" />
      <BrandLogo aria-label="Marca de exemplo"><strong>Exemplo</strong></BrandLogo>
      <Controls id={id}/>
      <Button onClick={() => setModal(true)}>Abrir modal</Button>
      <Button onClick={() => setDrawer(true)}>Abrir drawer</Button>
      <Modal open={modal} onClose={() => setModal(false)} title="Modal de exemplo"><Controls id={`${id}-modal`}/></Modal>
      <Drawer open={drawer} onOpenChange={setDrawer} title="Drawer de exemplo"><Controls id={`${id}-drawer`}/></Drawer>
    </Card>
  </ThemeProvider>;
}
function Playground() {
  const [mode, setMode] = useState<ThemeMode>("light");
  return <><p>Presets sintéticos para demonstrar o contrato; não representam homologação dos produtos.</p>
    <Button onClick={() => setMode(m => m === "light" ? "dark" : "light")}>Trocar modo</Button>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
      <Sample id="compact" theme={compact} mode={mode}/><Sample id="rounded" theme={rounded} mode={mode}/>
    </div>
    <ThemeProvider theme={compact} mode={mode} data-testid="parent"><p>Escopo pai</p><Sample id="nested" theme={rounded} mode={mode}/></ThemeProvider>
  </>;
}
const meta = { id: "fundacao-temas-por-aplicacao", title: "Verificacao/Isolamento de temas", component: Playground, tags: ["autodocs"] } satisfies Meta<typeof Playground>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Instancias: Story = {};
export const Claro: Story = { render: () => <Sample id="default" mode="light"/> };
export const Escuro: Story = { render: () => <Sample id="default" mode="dark"/> };
export const Editorial: Story = { render: () => <Sample id="default" mode="editorial"/> };
