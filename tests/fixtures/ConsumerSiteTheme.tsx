import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Accordion,
  Button,
  Card,
  CardHeader,
  Chip,
  Combobox,
  Drawer,
  Input,
  Item,
  Menu,
  Modal,
  Segmented,
  ThemeProvider,
  refySiteTheme,
} from "@refy-design/web";
import type { RefyTheme, ThemeMode } from "@refy-design/web";
import importedTheme from "./site-theme.json";
import "@refy-design/web/tokens.css";
import "@refy-design/web/fonts.css";

const identities: Record<string, RefyTheme> = {
  preset: refySiteTheme,
  imported: importedTheme,
  renamed: { ...importedTheme, name: "Identidade independente" },
  original: { name: "Refy original" },
};
const people = [
  { value: "ana", label: "Ana Lima" },
  { value: "clara", label: "Clara Dias" },
];
function App() {
  const [identity, setIdentity] = useState("preset");
  const [mode, setMode] = useState<ThemeMode>("light");
  const [name, setName] = useState("Projeto preservado");
  const [surface, setSurface] = useState<"modal" | "drawer" | null>(null);
  const [menu, setMenu] = useState(false);
  const [status, setStatus] = useState("Nenhuma ação");
  const detail = (
    <>
      <Combobox label="Pessoa revisora do tema" options={people} />
      <Menu
        open={menu}
        onOpenChange={setMenu}
        ariaLabel="Ações do tema portátil"
        entries={[
          {
            id: "confirm",
            label: "Confirmar tema",
            onSelect: () => setStatus("Tema confirmado"),
          },
        ]}
      >
        <Button onClick={() => setMenu(!menu)}>Abrir ações do tema</Button>
      </Menu>
      <p role="status">{status}</p>
    </>
  );
  return (
    <ThemeProvider
      theme={identities[identity]}
      mode={mode}
      data-testid="site-consumer"
    >
      <Segmented
        label="Configuração portátil"
        value={identity}
        onChange={setIdentity}
        options={[
          { value: "preset", label: "Preset público" },
          { value: "imported", label: "JSON reimportado" },
          { value: "renamed", label: "Nome independente" },
          { value: "original", label: "Refy original" },
        ]}
      />
      <Segmented
        label="Modo do consumidor Site"
        value={mode}
        onChange={(value) => setMode(value as ThemeMode)}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />
      <Card data-testid="site-card">
        <CardHeader
          title="Configuração transportável"
          description="Mesmos componentes, sem CSS do Storybook."
          icon={<span>R</span>}
        />
        <Input
          label="Projeto do tema"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button variant="primary" onClick={() => setStatus("Ação confirmada")}>
          Ação portátil
        </Button>
        <Chip selected>Selecionado</Chip>
        <Item
          title="Arquivo do projeto"
          description="Conteúdo preservado"
          media={<span>R</span>}
          variant="plain"
        />
        <Accordion
          variant="joined"
          size="sm"
          defaultValue={["first"]}
          items={[
            {
              id: "first",
              title: "Como o tema funciona?",
              content: <p>A aparência acompanha a configuração pública.</p>,
            },
            {
              id: "second",
              title: "O estado é preservado?",
              content: <p>O projeto continua preenchido.</p>,
            },
          ]}
        />
        <Button onClick={() => setSurface("modal")}>
          Abrir modal portátil
        </Button>
        <Button onClick={() => setSurface("drawer")}>
          Abrir drawer portátil
        </Button>
      </Card>
      <Modal
        open={surface === "modal"}
        onClose={() => setSurface(null)}
        title="Modal do tema portátil"
      >
        {detail}
      </Modal>
      <Drawer
        open={surface === "drawer"}
        onOpenChange={(open) => {
          if (!open) setSurface(null);
        }}
        title="Drawer do tema portátil"
      >
        {detail}
      </Drawer>
    </ThemeProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
