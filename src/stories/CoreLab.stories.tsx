import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ThemeProvider,
  Button,
  Input,
  Menu,
  Modal,
  Drawer,
  Tooltip,
  ToastRegion,
  DecisionDeck,
  DatePicker,
  Popover,
  AreaChart,
  LineChart,
  Combobox,
  Multiselect,
} from "../index";
import type { ThemeMode } from "../index";

function CoreLab({
  mode = "light",
  surface = "modal",
  before = true,
  portalled = true,
}: {
  mode?: ThemeMode;
  surface?: "modal" | "drawer";
  before?: boolean;
  portalled?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [nested, setNested] = useState(false),
    [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState(before),
    [actions, setActions] = useState(0),
    [selected, setSelected] = useState(0);
  const [value, setValue] = useState("Preservar valor"),
    [clicks, setClicks] = useState(0);
  function changeMenu(next: boolean) {
    setMenu(next);
    if (next && !before) window.setTimeout(() => setNotice(true), 0);
  }
  const content = (
    <>
      <Input
        label="Nome repetido"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error="Erro de exemplo"
        aria-describedby="external-description"
      />
      <p id="external-description">Descrição fornecida pela aplicação.</p>
      <Input label="Nome repetido" hint="Segundo campo com outro ID" />
      <Button onClick={() => setNested(true)}>Segundo diálogo</Button>
      <div style={{ position: "fixed", bottom: 210, right: 24 }}>
        <Menu
          open={menu}
          onOpenChange={changeMenu}
          entries={[
            { id: "disabled", label: "Indisponível", disabled: true },
            {
              id: "confirm",
              label: "Confirmar",
              onSelect: () => setSelected((n) => n + 1),
            },
            {
              id: "archive",
              label: "Arquivar",
              onSelect: () => setSelected((n) => n + 1),
            },
          ]}
        >
          <Button onClick={() => changeMenu(!menu)}>Ações do fluxo</Button>
        </Menu>
      </div>
      <div style={{ position: "fixed", bottom: 160, right: 240 }}>
        <Tooltip
          label="Ajuda contextual para conferir a prioridade e a quebra de texto sobre as outras superfícies abertas"
          side="bottom"
          portalled={portalled}
          delayMs={0}
        >
          <Button>Ajuda do fluxo</Button>
        </Tooltip>
      </div>
      <p>Seleções: {selected}</p>
      <Modal
        open={nested}
        onClose={() => setNested(false)}
        title="Diálogo interno"
      >
        <Button onClick={() => setNested(false)}>Voltar ao diálogo</Button>
      </Modal>
    </>
  );
  return (
    <ThemeProvider
      mode={mode}
      data-testid="core-lab"
      style={{ minHeight: 900, padding: 16 }}
    >
      <Button onClick={() => setOpen(true)}>Abrir fluxo</Button>
      <Button disabled onClick={() => setClicks((n) => n + 1)}>
        Desabilitado
      </Button>
      <Button loading onClick={() => setClicks((n) => n + 1)}>
        Carregando
      </Button>
      <Button onClick={() => setClicks((n) => n + 1)}>Contar ação</Button>
      <p>Cliques: {clicks}</p>
      <p>Ações do aviso: {actions}</p>
      <ToastRegion
        toasts={
          notice
            ? [
                {
                  id: "global",
                  title: "Aviso global persistente",
                  description:
                    "Este aviso deve continuar acima do menu e abaixo da ajuda, antes e depois da abertura.",
                  action: {
                    label: "Desfazer",
                    onClick: () => setActions((n) => n + 1),
                  },
                  duration: null,
                },
              ]
            : []
        }
        onDismiss={() => setNotice(false)}
      />
      {surface === "modal" ? (
        <Modal open={open} onClose={() => setOpen(false)} title="Fluxo modal">
          {content}
        </Modal>
      ) : (
        <Drawer open={open} onOpenChange={setOpen} title="Fluxo drawer">
          {content}
        </Drawer>
      )}
    </ThemeProvider>
  );
}
const meta = {
  title: "Verificacao/Contratos essenciais",
  component: CoreLab,
  args: { mode: "light", surface: "modal", before: true, portalled: true },
} satisfies Meta<typeof CoreLab>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Camadas: Story = {};
function TimerLab() {
  const [visible, setVisible] = useState(true),
    [updates, setUpdates] = useState(0);
  return (
    <ThemeProvider>
      <Button onClick={() => setUpdates((n) => n + 1)}>
        Atualizar contador
      </Button>
      <p>Atualizações: {updates}</p>
      <ToastRegion
        toasts={
          visible
            ? [
                {
                  id: "timed",
                  title: "Aviso temporizado",
                  duration: 1000,
                  action: {
                    label: "Ação temporizada",
                    onClick: () => setVisible(false),
                  },
                },
              ]
            : []
        }
        onDismiss={() => setVisible(false)}
      />
    </ThemeProvider>
  );
}
export const Temporizador: Story = { render: () => <TimerLab /> };
function InitialHelp() {
  const [open, setOpen] = useState(true);
  return (
    <ThemeProvider mode="dark">
      <Tooltip
        label="Ajuda controlada inicial"
        open={open}
        onOpenChange={setOpen}
        portalled
      >
        <Button>Ajuda controlada</Button>
      </Tooltip>
      <Tooltip label="Ajuda padrão inicial" defaultOpen portalled>
        <Button>Ajuda padrão</Button>
      </Tooltip>
    </ThemeProvider>
  );
}
export const AjudaInicial: Story = { render: () => <InitialHelp /> };

function ControlledDeck() {
  const [index, setIndex] = useState(0),
    [events, setEvents] = useState(0);
  return (
    <>
      <DecisionDeck
        items={[
          { id: "same", title: "Primeiro conteúdo", media: [] },
          { id: "same", title: "Segundo conteúdo", media: [] },
        ]}
        index={index}
        onIndexChange={setIndex}
        onAction={() => setEvents((n) => n + 1)}
      />
      <p>Eventos: {events}</p>
    </>
  );
}
export const DeckControlado: Story = { render: () => <ControlledDeck /> };

function AdoptionLayers({
  surface = "modal",
}: {
  surface?: "modal" | "drawer";
}) {
  const [open, setOpen] = useState(false),
    [popover, setPopover] = useState(false),
    [value, setValue] = useState("");
  const options = Array.from({ length: 12 }, (_, index) => ({
    value: `p${index + 1}`,
    label: `Pessoa ${index + 1}`,
  }));
  const [owner, setOwner] = useState(""),
    [members, setMembers] = useState<string[]>([]);
  const content = (
    <>
      <Combobox
        label="Responsável da composição"
        options={options}
        value={owner}
        onChange={(option) => {
          if (option) setOwner(option.value);
        }}
      />
      <Multiselect
        label="Participantes da composição"
        options={options}
        value={members}
        onChange={setMembers}
      />
      <p role="status">Participantes: {members.join(", ")}</p>
      <DatePicker label="Data do material" />
      <Popover
        open={popover}
        onOpenChange={setPopover}
        label="Edição rápida"
        content={
          <Input
            label="Título rápido"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        }
      >
        <Button onClick={() => setPopover(!popover)}>Edição rápida</Button>
      </Popover>
      <p>Título: {value}</p>
    </>
  );
  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir composição</Button>
      {surface === "modal" ? (
        <Modal open={open} onClose={() => setOpen(false)} title="Composição">
          {content}
        </Modal>
      ) : (
        <Drawer open={open} onOpenChange={setOpen} title="Composição">
          {content}
        </Drawer>
      )}
    </>
  );
}
export const ComposicaoFlutuante = {
  render: (args: { surface?: "modal" | "drawer" }) => (
    <AdoptionLayers surface={args.surface} />
  ),
};
export const LimitesDeGraficos = {
  render: () => (
    <>
      <AreaChart title="Vazio" label="Vazio" data={[]} />
      <AreaChart title="Ponto único" label="Ponto único" data={[0]} />
      <LineChart title="Série zero" label="Série zero" data={[0, 0, 0]} />
      <AreaChart
        title="Negativos e inválidos"
        label="Negativos e inválidos"
        data={[-10, NaN, 20, Infinity]}
      />
    </>
  ),
};

function MotionLifecycleLab() {
  const [modal, setModal] = useState(false), [drawer, setDrawer] = useState(false), [menu, setMenu] = useState(false), [help, setHelp] = useState(false);
  const reopen = (setOpen: (value: boolean) => void) => {
    setOpen(false);
    window.setTimeout(() => setOpen(true), 30);
  };
  return <div style={{display:'grid',gap:16,padding:24}}>
    <Button onClick={()=>setModal(true)}>Abrir modal de movimento</Button>
    <Button onClick={()=>setDrawer(true)}>Abrir drawer de movimento</Button>
    <Menu open={menu} onOpenChange={setMenu} entries={[{id:'apply',label:'Aplicar seleção'}]}>
      <Button onClick={()=>setMenu(value=>!value)}>Menu de movimento</Button>
    </Menu>
    <Tooltip label="Ajuda de movimento" open={help} onOpenChange={setHelp}>
      <Button onClick={()=>setHelp(value=>!value)}>Ver ajuda de movimento</Button>
    </Tooltip>
    <Button onClick={()=>setHelp(false)}>Fechar ajuda de movimento</Button>
    <Modal open={modal} onClose={()=>setModal(false)} title="Modal de movimento">
      <Input label="Texto preservado" defaultValue="Continuar daqui" />
      <Multiselect label="Materiais" listPlacement="overlay" defaultValue={["documento", "imagem"]} options={[{value:"documento",label:"Documento"},{value:"imagem",label:"Imagem"},{value:"video",label:"Vídeo"}]} />
      <Button onClick={()=>reopen(setModal)}>Fechar e reabrir modal</Button>
    </Modal>
    <Drawer open={drawer} onOpenChange={setDrawer} title="Drawer de movimento">
      <Input label="Texto preservado" defaultValue="Continuar daqui" />
      <Multiselect label="Materiais" listPlacement="overlay" defaultValue={["documento", "imagem"]} options={[{value:"documento",label:"Documento"},{value:"imagem",label:"Imagem"},{value:"video",label:"Vídeo"}]} />
      <Button onClick={()=>reopen(setDrawer)}>Fechar e reabrir drawer</Button>
    </Drawer>
  </div>;
}
export const Movimento: Story = { render: ()=><MotionLifecycleLab /> };
