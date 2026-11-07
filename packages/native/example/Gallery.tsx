// Tela de exemplo com todas as variantes de cada componente nativo. É a mesma tela que o
// teste de acessibilidade percorre e que o app Expo de example/App.tsx mostra no simulador.
import { useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  Badge, BrandLogo, Button, Card, CardHeader, ChoiceCard, ChoiceCardGroup, ConnectorCard, D3Chart, EmptyState, Input, Item, Modal,
  OAuthButton, PageHeader, ProgressBar, ScrollArea, Segmented, Select, SettingRow, SettingRowGroup, Stat, StatGroup, Tabs, Textarea,
  ToastRegion, WizardStepper, useRefy, Avatar, Chip, Fab, IconButton, useIconStyle,
  ActivityItem, NavCard, PersonCell, ScoreGauge, StickyBar, StickyFooter, UsageMeter, UsageMeterGroup,
  Accordion, AvatarGroup, ButtonGroup, Callout, Collapsible, SectionHeader,
  AspectRatio, Bubble, GoogleButton, Marker, Otp, Pagination, Range, Slider, ToggleGroup,
  Checkbox, Divider, Label, RadioGroup, Skeleton, Spinner, StatusDot, Switch,
  ContextMenu, FabMenu, Menu, Popover, Snackbar, SplitButton, Tooltip,
  Calendar, DatePicker, HelpField, PhoneInput, PostalCodeInput,
  Combobox, Multiselect,
  BillingCard, Carousel, CodeBlock, DangerZone, DangerZoneRow, Message, MessageScroller, PlanCard,
  Table, KanbanBoard, SwipeDeck, Questionnaire, GuidedTour, GuidedTourAnchor, Coverflow, ApprovalWorkbench, Trace, LineChart, AreaChart, BarChart, DonutChart, Sparkline, VisitSchedulePicker, GeoAreaPicker, IntentComposer, FileUpload, VoiceRecorder, AlertDialog, Drawer, Timeline, EventTimeline, PropertyCard, Matrix2x2, HelpMenu, KanbanCard, NotificationBell, PropertyActionGroup, PropertyMedia, SettingsSubnav, UserMenu, WorkspaceSwitcher,
} from "../src";
import type { KanbanColumnItem, NotificationItem, PropertyAction } from "../src";
import Svg, { Path } from "react-native-svg";
import type { StatusDotTone, BadgeTone, BrandLogoSize, ButtonProgressEffect, ButtonSize, ButtonVariant, OAuthProvider, ProgressTone, StatSize, ToastData } from "../src";

const dotTones: StatusDotTone[] = ["good", "ok", "warn", "critical", "info", "neutral"];
const badgeTones: BadgeTone[] = ["success", "info", "warn", "danger", "neutral"];
const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];
const sizes: ButtonSize[] = ["sm", "md"];
const effects: ButtonProgressEffect[] = ["spinner", "fill-horizontal", "top-line"];
const logoSizes: BrandLogoSize[] = ["xs", "sm", "md", "lg", "xl"];
const progressTones: ProgressTone[] = ["primary", "neutral", "warn", "critical"];
const statSizes: StatSize[] = ["sm", "md", "lg"];
const providers: OAuthProvider[] = ["google", "facebook", "linkedin", "spotify", "github", "x", "apple", "microsoft"];
const prices = [112, 119, 115, 109, 121, 104].map((y, i) => ({ x: new Date(Date.UTC(2023, 6 + i, 1)), y }));
const money = (value: unknown) => `R$ ${Number(value).toLocaleString("pt-BR")}`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  const t = useRefy();
  return (
    <View style={{ gap: 12 }}>
      <Text accessibilityRole="header" style={{ color: t.pick<string>("--ink-1"), fontSize: 15, ...t.font("--font-headline", "--weight-semi") }}>{title}</Text>
      {children}
    </View>
  );
}
// Ícone de exemplo: lê tamanho e cor do componente que o contém.
function Plus() {
  const { size, color } = useIconStyle();
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round"><Path d="M12 5v14M5 12h14" /></Svg>;
}
const Row = ({ children }: { children: ReactNode }) => <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>{children}</View>;

export function Gallery({ initialModalOpen = false, showToasts = true }: { initialModalOpen?: boolean; showToasts?: boolean }) {
  const t = useRefy();
  const [modal, setModal] = useState(initialModalOpen);
  const [notes, setNotes] = useState<NotificationItem[]>([
    { id: "n1", title: "Relatório anual foi atualizado", description: "Nova versão no seu espaço", time: "há 2h", unread: true },
    { id: "n2", title: "Marina aceitou a revisão", description: "Contrato A por contrato B", time: "há 5h", unread: true },
    { id: "n3", title: "Backup do espaço concluído", time: "ontem" },
  ]);
  const [decision, setDecision] = useState<PropertyAction | undefined>("save");
  const [subnav, setSubnav] = useState("/conta");
  const [alert, setAlert] = useState(false);
  const [drawer, setDrawer] = useState<"right" | "bottom" | null>(null);
  const [tour, setTour] = useState(false);
  const [workItem, setWorkItem] = useState("renda");
  const [kanban, setKanban] = useState<KanbanColumnItem[]>([
    { id: "fila", title: "Na fila", items: [{ id: "k1", title: "Limpar Orçamento", meta: "Capa com mofo" }, { id: "k2", title: "Fotografar Cronograma" }] },
    { id: "andamento", title: "Em andamento", color: "--info", items: [{ id: "k3", title: "Organizar pasta 4", description: "32 arquivos de design" }] },
    { id: "feito", title: "Feito", color: "--ok", items: [] },
  ]);
  const [voice, setVoice] = useState<"idle" | "listening" | "paused">("listening");
  const [popover, setPopover] = useState(false);
  const [menu, setMenu] = useState(false);
  const [phone, setPhone] = useState("31987654321");
  const [country, setCountry] = useState("BR");
  const [cep, setCep] = useState("30130-000");
  const [toasts, setToasts] = useState<ToastData[]>([
    { id: "a", title: "Arquivo adicionado ao espaço.", tone: "success", duration: null },
    { id: "b", title: "Falha ao salvar", description: "Tente de novo em instantes.", tone: "danger", action: { label: "Tentar", onClick: () => {} }, duration: null },
    { id: "c", title: "Preço atualizado", duration: null },
  ]);
  const [view, setView] = useState("grid");
  const [plan, setPlan] = useState<string | string[]>("mensal");
  const [select, setSelect] = useState<string>();
  const [step, setStep] = useState("dados");
  const [toggle, setToggle] = useState(true);
  const [ship, setShip] = useState("pac");
  const [page, setPage] = useState(4);
  return (
    <View style={{ flex: 1, backgroundColor: t.pick<string>("--bg", "--surface") }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 28 }}>
        <Section title="BrandLogo">
          <Row>{logoSizes.map((size) => <BrandLogo key={size} size={size} />)}</Row>
          <Row><BrandLogo size="md" animated /><BrandLogo size="md" markOnly /><View style={{ backgroundColor: t.pick<string>("--ink-1"), padding: 8 }}><BrandLogo size="md" tone="inverse" /></View></Row>
        </Section>
        <Section title="Chip">
          <Row>
            <Chip selected>Para você</Chip>
            <Chip>Ofertas</Chip>
            <Chip count={12}>Lojas</Chip>
            <Chip selected count={3} showCheck>Filtro</Chip>
            <Chip tone="critical">Crítico</Chip>
            <Chip tone="success" selectionMode="radio" selected>Ok</Chip>
            <Chip removable onRemove={() => {}}>Removível</Chip>
            <Chip variant="selection" removable onRemove={() => {}}>Seleção</Chip>
            <Chip leadingIcon={<Plus />} disabled>Desligado</Chip>
          </Row>
        </Section>
        <Section title="IconButton">
          <Row>
            {(["ghost", "outline", "solid"] as const).flatMap((v) => (["sm", "md", "lg"] as const).map((s) => <IconButton key={v + s} variant={v} size={s} icon={<Plus />} accessibilityLabel={`Adicionar ${v} ${s}`} />))}
          </Row>
        </Section>
        <Section title="Avatar">
          <Row>
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => <Avatar key={s} size={s} initials="AN" alt={`Ana ${s}`} />)}
            <Avatar size="lg" shape="square" seed="Refy" initials="R" />
            <Avatar size="lg" seed="Espaço" initials="AC" />
            <Avatar size="lg" color="#2b6cb0" initials="VC" />
          </Row>
        </Section>
        <Section title="Fab">
          <Row>
            <Fab icon={<Plus />} label="Adicionar" />
            <Fab icon={<Plus />} label="Adicionar" size="md" variant="surface" />
            <Fab icon={<Plus />} label="Adicionar arquivo" extended />
          </Row>
        </Section>
        <Section title="Badge">
          <Row>{badgeTones.map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</Row>
          <Row>{badgeTones.map((tone) => <Badge key={tone} tone={tone} dot>{tone}</Badge>)}</Row>
        </Section>
        <Section title="Button">
          {sizes.map((size) => <Row key={size}>{variants.map((variant) => <Button key={variant} variant={variant} size={size}>{variant}</Button>)}</Row>)}
          <Row>
            <Button disabled>Indisponível</Button>
            <Button block>Bloco</Button>
          </Row>
          <Row>{effects.map((effect) => <Button key={effect} loading progressEffect={effect} loadingLabel="Salvando">Salvar</Button>)}</Row>
          <Row><Button status="success">Salvo</Button><Button status="error" variant="danger">Erro</Button></Row>
        </Section>
        <Section title="OAuthButton">
          {providers.map((provider) => <OAuthButton key={provider} provider={provider} block />)}
        </Section>
        <Section title="Card">
          <Card><CardHeader title="Padrão" count="3" description="Descrição curta" action={<Button size="sm" variant="ghost">Ver</Button>} /><Text>Conteúdo</Text></Card>
          <Card tone="inverted" padding="sm" elevation={2}><CardHeader title="Invertido" size="sm" /><Text>Conteúdo</Text></Card>
          <Card padding="none" elevation={4}><Text>Sem padding</Text></Card>
        </Section>
        <Section title="PageHeader">
          <PageHeader eyebrow="Espaço" title="Seus arquivos" lead="Os arquivos do seu espaço." actions={<Button size="sm">Adicionar</Button>} />
        </Section>
        <Section title="EmptyState">
          <EmptyState title="Seu espaço começa com um arquivo." message="Envie o primeiro arquivo ou importe uma pasta." action={<Button size="sm">Abrir biblioteca</Button>} />
          <EmptyState bordered={false} title="Sem alertas" />
        </Section>
        <Section title="ProgressBar">
          {progressTones.map((tone) => <ProgressBar key={tone} tone={tone} value={64} accessibilityLabel={`Progresso ${tone}`} />)}
          <ProgressBar size="sm" value={30} accessibilityLabel="Progresso pequeno" />
          <ProgressBar indeterminate accessibilityLabel="Carregando" />
        </Section>
        <Section title="Stat">
          <StatGroup>{statSizes.map((size) => <Stat key={size} size={size} label="Menor preço" value="R$ 179" unit="BRL" delta={{ value: "−12%", trend: "down", sentiment: "positive" }} description="Últimos 30 dias" />)}</StatGroup>
          <Stat label="Ofertas" value="42" delta={{ value: "+3", trend: "up", sentiment: "neutral" }} />
        </Section>
        <Section title="Input / Textarea / Select">
          <Input label="Buscar na biblioteca" placeholder="Álbum ou artista" />
          <Input label="Máximo pelo arquivo entregue" prefix="R$" defaultValue="180" hint="Sem frete" />
          <Input label="Exemplo de erro" error="Informe um valor maior que zero." defaultValue="0" />
          <Input label="Desativado" editable={false} defaultValue="travado" />
          <Textarea label="Observação" placeholder="Algo sobre a versão" />
          <Textarea label="Com erro" error="Use até 200 caracteres." />
          <Select label="Loja" placeholder="Escolha uma loja" value={select} onValueChange={setSelect} options={[{ value: "imusic", label: "iMusic" }, { value: "amazon", label: "Amazon" }, { value: "x", label: "Fora do ar", disabled: true }]} />
        </Section>
        <Section title="Item / ConnectorCard">
          <Item title="Proposta · v2" description="Documento duplo" onClick={() => {}} />
          <Item title="Selecionado" selected onClick={() => {}} />
          <Item title="Plano" variant="plain" actions={<Badge tone="info">novo</Badge>} />
          <ConnectorCard name="Last.fm" description="Seu histórico de escuta" status={<Badge tone="success" dot>Sincronizado</Badge>} actions={<Button size="sm" variant="secondary">Desconectar</Button>} />
          <ConnectorCard name="Drive" description="Arquivos" locked lockHint="Disponível no plano anual" />
        </Section>
        <Section title="SettingRow">
          <SettingRowGroup>
            <SettingRow title="Histórico de versões" description="Avisar quando cair" switchProps={{ value: toggle, onValueChange: setToggle }} />
            <SettingRow title="Moeda" meta="BRL" showChevron onPress={() => {}} />
            <SettingRow title="Desativado" disabled showChevron onPress={() => {}} />
          </SettingRowGroup>
        </Section>
        <Section title="ChoiceCard">
          <ChoiceCardGroup label="Plano" value={plan} onChange={setPlan} columns={2}>
            <ChoiceCard value="mensal" title="Mensal" description="Cancela quando quiser" meta="R$ 9,90" />
            <ChoiceCard value="anual" title="Anual" description="Dois meses grátis" meta="R$ 99" />
            <ChoiceCard value="vitalicio" title="Vitalício" disabled />
          </ChoiceCardGroup>
          <ChoiceCardGroup label="Áreas" mode="multiple" defaultValue={["juridico"]} columns={1}>
            <ChoiceCard value="juridico" title="Jurídico" />
            <ChoiceCard value="design" title="Design" preview={<Text>◆</Text>} />
          </ChoiceCardGroup>
        </Section>
        <Section title="Segmented">
          <Segmented label="Visualização" value={view} onChange={setView} options={[{ value: "grid", label: "Grade" }, { value: "flow", label: "Cover Flow" }, { value: "list", label: "Lista", disabled: true }]} />
          <Segmented label="Deslizante" sliding options={[{ value: "a", label: "Semana" }, { value: "b", label: "Mês" }, { value: "c", label: "Ano" }]} />
          <Segmented label="Desativado" disabled options={[{ value: "a", label: "Um" }, { value: "b", label: "Dois" }]} />
          <Segmented label="Ícones" iconOnly options={[{ value: "a", label: "Grade", icon: <Text>▦</Text> }, { value: "b", label: "Lista", icon: <Text>≡</Text> }]} />
        </Section>
        <Section title="Tabs">
          <Tabs items={[{ id: "a", label: "Ofertas", badge: 3, content: <Text>Ofertas</Text> }, { id: "b", label: "Histórico", status: "complete" }, { id: "c", label: "Alertas", status: "warning" }, { id: "d", label: "Off", disabled: true }]} />
          <Tabs variant="pill" items={[{ id: "a", label: "Grade" }, { id: "b", label: "Lista", badge: 12 }]} />
          <Tabs orientation="vertical" items={[{ id: "a", label: "Conta", content: <Text>Conta</Text> }, { id: "b", label: "Privacidade" }]} />
          <Tabs wrap items={["Um", "Dois", "Três", "Quatro", "Cinco", "Seis"].map((label) => ({ id: label, label }))} />
        </Section>
        <Section title="WizardStepper">
          <WizardStepper label="Cadastro" current={step} onStepChange={setStep} onBack={() => {}} steps={[{ id: "conta", label: "Conta" }, { id: "dados", label: "Dados" }, { id: "fim", label: "Fim" }]} />
          <WizardStepper variant="horizontal" current="b" steps={[{ id: "a", label: "Um" }, { id: "b", label: "Dois" }, { id: "c", label: "Três", disabled: true }]} />
          <WizardStepper variant="compact" current="a" steps={[{ id: "a", label: "Único" }]} />
        </Section>
        <Section title="ScrollArea">
          <ScrollArea maxHeight={120}>{Array.from({ length: 12 }, (_, i) => <Text key={i}>Linha {i + 1}</Text>)}</ScrollArea>
        </Section>
        <Section title="D3Chart">
          <D3Chart type="line" title="Preço histórico" label="Preço do arquivo por coleta, de julho a dezembro de 2023" showTitle height={200} margin={{ left: 72, right: 20 }} series={[{ id: "min", label: "Preço mínimo", color: "var(--primary)", data: prices }]} curve="linear" dots grid="y" legend={false} yAxis={{ format: money, tickCount: 3 }} xAxis={{ format: (v) => new Date(v).toLocaleDateString("pt-BR", { month: "short" }), tickCount: 3 }} />
          <D3Chart type="area" title="Duas séries" label="Comparação entre duas lojas" height={180} curve="monotone" series={[{ id: "a", label: "iMusic", data: prices }, { id: "b", label: "Amazon", data: prices.map((p) => ({ ...p, y: p.y + 8 })) }]} />
          <D3Chart type="line" title="Erro" label="Gráfico com altura inválida" height={80} series={[{ id: "a", label: "A", data: [{ x: 0, y: 1 }] }]} />
        </Section>
        <Section title="Switch / Checkbox / RadioGroup">
          <Row><Switch accessibilityLabel="Avisos por e-mail" defaultChecked /><Switch accessibilityLabel="Modo silencioso" /><Switch accessibilityLabel="Desligado" disabled /></Row>
          <Switch label="Mostrar preço com frete" defaultChecked />
          <Switch appearance="control" label="Só disponíveis" icon={<Plus />} />
          <Checkbox label="Aceito receber ofertas" defaultChecked />
          <Checkbox label="Edição limitada" description="Versões com número na capa." meta="42 arquivos" />
          <Checkbox boxed label="Apagar histórico de preços" tag={<Badge tone="danger">destrutivo</Badge>} />
          <Checkbox label="Indisponível" disabled />
          <RadioGroup label="Entrega" value={ship} onChange={setShip} options={[{ value: "pac", label: "PAC", hint: "Até 8 dias úteis" }, { value: "sedex", label: "Sedex", hint: "Até 3 dias úteis" }, { value: "retirar", label: "Retirar na loja", disabled: true }]} />
        </Section>
        <Section title="Label / Divider / StatusDot">
          <Label>E-mail da conta</Label>
          <Divider spacing="sm" />
          <Divider label="ou" />
          <Row><Text>Lado A</Text><Divider orientation="vertical" spacing="sm" /><Text>Lado B</Text></Row>
          <Row>{dotTones.map((tone) => <StatusDot key={tone} tone={tone}>{tone}</StatusDot>)}</Row>
          <StatusDot pulse>Ao vivo</StatusDot>
        </Section>
        <Section title="Spinner / Skeleton">
          <Row><Spinner /><Spinner accessibilityLabel="Buscando preços" /></Row>
          <Row><Skeleton circle width={32} /><View style={{ flex: 1, gap: 6 }}><Skeleton width={180} /><Skeleton width="60%" height={10} /></View></Row>
        </Section>
        <Section title="Slider / Range">
          <Slider label="Volume" defaultValue={35} formatValue={(v) => `${v}%`} ticks={["Baixo", "Alto"]} />
          <Slider label="Estado do arquivo" min={0} max={3} defaultValue={2} marks={["Ruim", "Bom", "Ótimo", "Novo"]} />
          <Range label="Preço" min={0} max={500} step={10} defaultValue={[80, 260]} formatValue={(v) => `R$ ${v}`} histogram={[2, 5, 9, 14, 11, 8, 6, 3, 2, 1]} ticks={["0", "250", "500"]} />
          <Range label="Raio" min={0} max={10} fixedMinimum defaultValue={[0, 2]} formatValue={(v) => `${v} km`} />
        </Section>
        <Section title="ToggleGroup / Pagination / Otp">
          <ToggleGroup label="Formatos" defaultValue={["lp"]} options={[{ value: "lp", label: "PDF", icon: <Plus /> }, { value: "ep", label: "DOC" }, { value: "single", label: "Planilha" }, { value: "box", label: "Box", disabled: true }]} />
          <Pagination page={page} pageCount={12} onPageChange={setPage} />
          <Otp length={6} groupSize={3} defaultValue="392" />
          <Otp length={4} error="Código expirou. Peça outro." defaultValue="1234" />
        </Section>
        <Section title="Bubble / Marker / AspectRatio / GoogleButton">
          <Bubble>Tem a versão final do Relatório anual?</Bubble>
          <Bubble side="end">Tenho, com anexos e índice.</Bubble>
          <Text style={{ color: t.pick<string>("--ink-2") }}>Preço caiu para <Marker>R$ 189</Marker> hoje.</Text>
          <AspectRatio ratio={1} style={{ maxWidth: 120, backgroundColor: t.pick<string>("--surface-2"), borderRadius: 8 }} />
          <GoogleButton />
        </Section>
        <Section title="Accordion / Collapsible">
          <Accordion defaultValue={["a"]} items={[{ id: "a", title: "Como funciona a revisão?", content: "Você envia um arquivo, a outra pessoa comenta e devolve." }, { id: "b", title: "Quem pode revisar?", content: "Qualquer pessoa do espaço com acesso ao arquivo." }, { id: "c", title: "Revisão externa", content: "Ainda não.", disabled: true }]} />
          <Accordion variant="plain" size="sm" leadingIndicator indentContent items={[{ id: "x", title: "Detalhes da versão", content: "Versão 3, 2026, com anexos." }]} />
          <Collapsible title="Seções">
            <Text style={{ color: t.pick<string>("--ink-2") }}>So What · Freddie Freeloader · Blue in Green</Text>
          </Collapsible>
        </Section>
        <Section title="Callout">
          <Callout tone="info" icon={<Plus />} title="Preços atualizados toda manhã" />
          <Callout tone="warn" icon={<Plus />} title="Você está perto do limite" dismissible>Seu espaço tem 480 de 500 arquivos.</Callout>
          <Callout tone="danger" title="Falha ao sincronizar">Tente de novo em instantes.</Callout>
          <Callout tone="success" icon={<Plus />} title="Revisão confirmada" />
          <Callout tone="note" title="Dica">Toque e segure um arquivo para mover.</Callout>
          <Callout tone="upsell" icon={<Plus />} title="Espaço sem limite" action={<Button size="sm" variant="primary">Assinar</Button>} />
        </Section>
        <Section title="ButtonGroup / AvatarGroup / SectionHeader">
          <ButtonGroup label="Ordenar"><Button size="sm">Recentes</Button><Button size="sm">Preço</Button><Button size="sm">Artista</Button></ButtonGroup>
          <ButtonGroup orientation="vertical" label="Visão" defaultActiveIndex={1}><Button size="sm">Grade</Button><Button size="sm">Lista</Button></ButtonGroup>
          <AvatarGroup items={[{ name: "Ana Souza" }, { name: "Leo Lima" }, { name: "Lia Melo" }, { name: "Rui Costa" }, { name: "Bia Reis" }, { name: "Caio Dias" }]} onItemClick={() => {}} onOverflowClick={() => {}} />
          <AvatarGroup size="sm" max={3} items={[{ name: "Ana Souza" }, { name: "Leo Lima" }]} />
          <SectionHeader title="Sessões ativas" count="3" sub="Aparelhos conectados à sua conta." action={<Button size="sm" variant="ghost">Encerrar</Button>} />
          <SectionHeader rule title="Esta semana" action={<Button size="sm" variant="ghost">Ver tudo</Button>} />
        </Section>
        <Section title="ActivityItem / PersonCell / NavCard">
          <ActivityItem actor={{ name: "Ana Souza" }} title="aceitou sua revisão" timestamp="há 2 min" description="Relatório anual por Plano de lançamento." badge={{ label: "Revisão", tone: "success" }} metadata="Espaço · Design" />
          <ActivityItem density="compact" title="Preço do Plano de lançamento caiu" timestamp="09:12" />
          <PersonCell avatar={<Avatar size="md" initials="LL" />} name="Leo Lima" tag="dono" secondary="leo@exemplo.com" />
          <NavCard title="Endereço de entrega" description="Rua das Flores, 120" leading={<Plus />} onPress={() => {}} />
          <NavCard variant="dashed" title="Adicionar cartão" showChevron={false} onPress={() => {}} />
          <NavCard current title="Plano anual" meta="ativo" onPress={() => {}} />
          <NavCard disabled title="Exportar espaço" description="Disponível no plano anual." onPress={() => {}} />
        </Section>
        <Section title="UsageMeter / ScoreGauge / Sticky">
          <UsageMeterGroup>
            <UsageMeter label="Arquivos no espaço" used={320} limit={500} />
            <UsageMeter label="Histórico de versões" used={42} limit={50} meta="renova dia 1" />
            <UsageMeter label="Fotos" used={1050} limit={1000} unit="arquivos" />
          </UsageMeterGroup>
          <Row><ScoreGauge value={86} label="estado" /><ScoreGauge value={55} size="lg" label="capa" /><ScoreGauge value={22} size="sm" accessibilityLabel="Índice" /></Row>
          <StickyBar title="Relatório anual · Finanças" status={<Badge tone="success">publicado</Badge>} actions={<Button size="sm" variant="primary">Compartilhar</Button>} />
          <StickyFooter start="3 arquivos selecionados"><Button size="sm">Cancelar</Button><Button size="sm" variant="primary">Revisar</Button></StickyFooter>
        </Section>
        <Section title="Popover / Menu / Tooltip">
          <Row>
            <Popover open={popover} onOpenChange={setPopover} label="Filtros" content={<View style={{ gap: 8 }}><Checkbox defaultChecked label="Só publicado" /><Checkbox label="Com encarte" /></View>}>
              <Button size="sm" onPress={() => setPopover(!popover)}>Filtrar</Button>
            </Popover>
            <Menu open={menu} onOpenChange={setMenu} ariaLabel="Ações do arquivo" entries={[{ type: "label", label: "Arquivo" }, { id: "edit", label: "Editar", icon: <Plus /> }, { id: "move", label: "Mover para", meta: "3 pastas" }, { type: "separator" }, { id: "del", label: "Remover do espaço", danger: true }, { id: "sell", label: "Vender", disabled: true }]}>
              <Button size="sm" onPress={() => setMenu(!menu)}>Ações</Button>
            </Menu>
            <Tooltip label="Copiar link" description="Qualquer pessoa com o link vê o arquivo.">
              <Button size="sm" variant="ghost">Compartilhar</Button>
            </Tooltip>
          </Row>
          <ContextMenu label="Relatório anual" entries={[{ id: "open", label: "Abrir" }, { id: "fav", label: "Favoritar" }, { type: "separator" }, { id: "del", label: "Remover", danger: true }]}>
            <View style={{ padding: 16, borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: t.pick<string>("--line") }}>
              <Text style={{ color: t.pick<string>("--ink-2") }}>Toque e segure aqui</Text>
            </View>
          </ContextMenu>
        </Section>
        <Section title="Snackbar / SplitButton / FabMenu">
          <Snackbar action={{ label: "Desfazer", onClick: () => {} }}>Arquivo movido para Design</Snackbar>
          <Snackbar>Espaço sincronizado</Snackbar>
          <Row>
            <SplitButton label="Exportar" variant="primary" options={[{ id: "csv", label: "CSV", hint: ".csv" }, { id: "pdf", label: "PDF", hint: ".pdf" }, { id: "json", label: "JSON", hint: ".json", disabled: true }]} />
            <SplitButton label="Salvar" size="sm" options={[{ label: "rascunho" }, { label: "e publicar" }]} />
          </Row>
          <Row><FabMenu actions={[{ id: "add", label: "Adicionar arquivo", icon: <Plus /> }, { id: "scan", label: "Ler código de barras" }, { id: "wish", label: "Lista de desejos" }]} /></Row>
        </Section>
        <Section title="Calendar / DatePicker">
          <Calendar defaultValue={new Date(2026, 10, 12)} defaultMonth={new Date(2026, 10, 1)} />
          <Calendar mode="range" monthLabelStyle="compact" weekStartsOn={1} fixedWeeks={false} defaultValue={{ start: new Date(2026, 10, 9), end: new Date(2026, 10, 14) }} min={new Date(2026, 10, 3)} />
          <DatePicker label="Data da revisão" defaultValue={new Date(2026, 10, 20)} />
        </Section>
        <Section title="PhoneInput / PostalCodeInput / HelpField">
          <PhoneInput label="Celular" hint="Só para avisos de revisão." country={country} onCountryChange={(c) => setCountry(c.code)} value={phone} onChangeText={setPhone} />
          <PostalCodeInput value={cep} onChangeText={setCep} lookup={async () => ({ postalCode: "30130000", street: "Av. Afonso Pena", neighborhood: "Centro", city: "Belo Horizonte", state: "MG" })} onAddressFound={() => {}} />
          <HelpField label="Participação na comissão" helpText="Parte do valor da venda que fica com quem indicou o comprador." onLearnMore={() => {}}>
            <Input suffix="%" defaultValue="5" />
          </HelpField>
        </Section>
        <Section title="Combobox / Multiselect">
          <Combobox label="Corretor" defaultOpen inputValue="an" options={[{ value: "ana", label: "Ana Souza", description: "CRECI 34.512", avatar: { name: "Ana Souza" }, group: "Equipe" }, { value: "jan", label: "Janaína Reis", description: "CRECI 18.003", avatar: { name: "Janaína Reis" }, group: "Equipe" }, { value: "and", label: "Anderson Lima", meta: "parceiro", group: "Parceiros", lead: "AL" }, { value: "x", label: "Banco Andrade", group: "Parceiros", disabled: true }]} />
          <Combobox label="Área" defaultValue="design" options={[{ value: "design", label: "Design", meta: "1.2k" }, { value: "produto", label: "Produto", meta: "840" }]} />
          <Multiselect label="Áreas" defaultValue={["design", "produto", "dados", "vendas", "suporte"]} options={[{ value: "design", label: "Design" }, { value: "produto", label: "Produto" }, { value: "dados", label: "Dados" }, { value: "vendas", label: "Vendas" }, { value: "suporte", label: "Suporte" }, { value: "juridico", label: "Jurídico", disabled: true }]} />
          <Multiselect label="Condição" listPlacement="overlay" options={[{ value: "m", label: "Mint" }, { value: "vg", label: "Very good" }, { value: "g", label: "Good" }]} />
        </Section>
        <Section title="Carousel / Message">
          <Carousel label="Arquivos em destaque" items={["Relatório anual", "Plano de lançamento", "Manual da marca"].map((name, i) => ({ id: String(i), label: name, content: <View style={{ height: 120, borderRadius: 8, backgroundColor: t.pick<string>("--surface-2"), alignItems: "center", justifyContent: "center" }}><Text style={{ color: t.pick<string>("--ink-1"), fontSize: 16 }}>{name}</Text></View> }))} />
          <MessageScroller maxHeight={220}>
            <Message key="a" author="Ana Souza" initials="AS" time="09:12">Ainda tem o Plano de lançamento?</Message>
            <Message key="b" author="Você" initials="VC" time="09:14" side="end">Tenho, versão de março.</Message>
            <Message key="c" author="Ana Souza" initials="AS" time="09:15">Revisa o Relatório anual.</Message>
          </MessageScroller>
        </Section>
        <Section title="CodeBlock">
          <CodeBlock language="bash" label="Instalar" code="npm install @refy-design/mobile" copyToClipboard={() => {}} highlight={(code) => [{ text: "npm", type: "function" }, { text: code.slice(3) }]} />
          <CodeBlock secret label="Chave da API" code="chave-de-exemplo-0000" copyToClipboard={() => {}} />
        </Section>
        <Section title="BillingCard / PlanCard / DangerZone">
          <BillingCard brandIcon="VISA" methodLabel="Cartão de crédito" lastDigits="4242" methodMeta="Vence em 09/2028" status={<Badge tone="success" dot>Ativa</Badge>} nextChargeAmount="R$ 2.388" nextChargeDate="em 2 mai. 2027" actions={<Button size="sm">Trocar cartão</Button>} />
          <PlanCard highlighted style={{ marginTop: 10 }} name="Profissional" price="R$ 19" period="/mês" priceNote="R$ 228 cobrados por ano" features={["Espaço sem limite", "Histórico de versões", "Revisões ilimitadas"]} cta={<Button variant="primary" block>Assinar</Button>} />
          <PlanCard current style={{ marginTop: 10 }} name="Grátis" price="R$ 0" period="/mês" features={["Até 500 arquivos", "1 alerta de preço"]} />
          <DangerZone title="Zona de perigo">
            <DangerZoneRow title="Apagar espaço" description="Remove os 320 arquivos. Não dá para desfazer." actionLabel="Apagar" onConfirm={() => {}} />
            <DangerZoneRow title="Excluir conta" description="Suas revisões abertas são canceladas." actionLabel="Excluir" onConfirm={() => {}} />
          </DangerZone>
        </Section>
        <Section title="UserMenu / HelpMenu / NotificationBell">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end" }}>
            <HelpMenu />
            <NotificationBell items={notes} onMarkAllRead={() => setNotes((list) => list.map((n) => ({ ...n, unread: false })))} />
            <UserMenu compact user={{ name: "Ana Souza", initials: "AS", seed: "ana" }} />
          </View>
          <UserMenu side="bottom" user={{ name: "Ana Souza", email: "ana@example.com", initials: "AS", seed: "ana" }} />
          <WorkspaceSwitcher workspaces={[
            { id: "w1", name: "Espaço pessoal", role: "Ambiente · Pro", initials: "EP" },
            { id: "w2", name: "Estúdio BH", role: "Ambiente · Time", initials: "EB" },
            { id: "w3", name: "Time de design", role: "Ambiente · Grátis", initials: "TD" },
            { id: "w4", name: "Equipe de revisão", role: "Ambiente · Time", initials: "ER" },
            { id: "w5", name: "Arquivo da Rádio", role: "Ambiente · Pro", initials: "AR" },
          ]} />
        </Section>
        <Section title="SettingsSubnav / KanbanCard">
          <SettingsSubnav activeHref={subnav} onNavigate={(item) => setSubnav(item.href)} groups={[
            { title: "Pessoal", items: [{ href: "/conta", label: "Conta", description: "Perfil, senha e 2FA" }, { href: "/notificacoes", label: "Notificações" }] },
            { title: "Ambiente", items: [{ href: "/time", label: "Time" }, { href: "/cobranca", label: "Cobrança", description: "Plano e faturas" }] },
          ]} />
          <KanbanCard style={{ marginTop: 12 }} onOpen={() => {}} item={{ id: "k1", title: "Conferir lote de 40 arquivos do cliente", description: "Separar os que têm capa desatualizada antes de cadastrar.", meta: "Hoje · 3 de 40", footer: <Badge tone="warn">Em andamento</Badge> }} />
        </Section>
        <Section title="PropertyActionGroup / PropertyMedia">
          <PropertyMedia items={[
            { src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900", alt: "Fachada de casa com jardim" },
            { src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900", alt: "Quarto com cama de casal" },
            { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900", alt: "Casa com piscina" },
          ]} />
          <PropertyActionGroup style={{ marginTop: 12 }} activeAction={decision} onAction={setDecision} />
          <PropertyMedia style={{ marginTop: 12 }} items={[{ src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900", alt: "Fachada" }]} errorMessage="A foto não carregou." onRetry={() => {}} />
        </Section>
        <Section title="FileUpload / VoiceRecorder">
          <FileUpload multiple pickFiles={async () => [{ name: "nota-fiscal-lote-12.pdf", size: 182_400, type: "application/pdf" }]} defaultFiles={[
            { name: "capa-relatorio.jpg", size: 412_000, type: "image/jpeg", uri: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200" },
            { name: "inventario.csv", size: 9_800, type: "text/csv" },
          ]} />
          <FileUpload style={{ marginTop: 12 }} state="uploading" progress={64} defaultFiles={[{ name: "contrato-revisao.pdf", size: 240_000, type: "application/pdf" }]} />
          <VoiceRecorder style={{ marginTop: 12 }} state="idle" onStart={() => setVoice("listening")} />
          <VoiceRecorder style={{ marginTop: 12 }} state={voice} duration={47} level={62} onPause={() => setVoice("paused")} onResume={() => setVoice("listening")} onCancel={() => setVoice("idle")} onFinish={() => setVoice("idle")} />
          <VoiceRecorder style={{ marginTop: 12 }} state="error" />
        </Section>
        <Section title="AlertDialog / Drawer">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <Button variant="danger" onPress={() => setAlert(true)}>Excluir espaço</Button>
            <Button onPress={() => setDrawer("right")}>Painel lateral</Button>
            <Button onPress={() => setDrawer("bottom")}>Painel de baixo</Button>
          </View>
        </Section>
        <Section title="Timeline / EventTimeline">
          <Timeline items={[
            { id: "m1", timestamp: "2026-09-02T12:00:00Z", title: "Primeiro arquivo organizado", description: "Relatório anual, versão de 2025.", status: "completed" },
            { id: "m2", timestamp: "2026-10-15T12:00:00Z", title: "Espaço passou de 300 arquivos", status: "current" },
            { id: "m3", timestamp: "2026-12-01T12:00:00Z", title: "Primeira revisão na reunião", status: "upcoming" },
          ]} />
          <EventTimeline style={{ marginTop: 16 }} title="Atividades" context="Espaço pessoal" events={[
            { id: "e1", timestamp: "2026-11-05T18:20:00Z", title: "Marina aceitou a revisão", actor: { name: "Marina Alves", initials: "MA", seed: "marina" }, status: { label: "Concluída", tone: "good" } },
            { id: "e2", timestamp: "2026-11-05T14:05:00Z", title: "Alerta de preço disparou", description: "Relatório anual baixou para R$ 189." },
            { id: "e3", timestamp: "2026-11-04T10:00:00Z", title: "Backup do espaço concluído", badge: { label: "Automático", tone: "neutral" } },
          ]} />
        </Section>
        <Section title="PropertyCard / Matrix2x2">
          <PropertyCard title="Casa com jardim no Santa Tereza" subtitle="Rua Mármore, Belo Horizonte" value="R$ 3.200" valueSuffix="/mês" matchScore={86}
            badges={[{ label: "Novo", tone: "info" }]} facts={[{ label: "Quartos", value: "3" }, { label: "Área", value: "140 m²" }, { label: "Vagas", value: "2" }]}
            summary="Casa térrea com quintal, perto da praça Duque de Caxias e do comércio do bairro."
            media={[{ src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900", alt: "Fachada" }, { src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900", alt: "Quarto" }]}
            actions={{ onAction: () => {} }} />
          <Matrix2x2 style={{ marginTop: 16 }} height={380} quadrants={{ topLeft: "Fazer já", topRight: "Planejar", bottomLeft: "Encaixar", bottomRight: "Deixar para depois" }} points={[
            { id: "p1", label: "Corrigir busca por artista", x: 22, y: 82, prioritized: true },
            { id: "p2", label: "Importar do Drive", x: 70, y: 74 },
            { id: "p3", label: "Tema escuro", x: 30, y: 30 },
            { id: "p4", label: "Exportar PDF", x: 78, y: 22 },
          ]} defaultSelectedId="p2" />
        </Section>
        <Section title="Table">
          <Table caption="Arquivos do espaço" rowKey={(r) => r.id} searchable minTableWidth={340} pagination={{ pageSize: 4 }}
            columns={[
              { key: "titulo", header: "Arquivo", cell: (r) => r.titulo, sortable: true },
              { key: "genero", header: "Área", cell: (r) => r.genero, filterable: true, width: 110 },
              { key: "ano", header: "Ano", cell: (r) => String(r.ano), align: "num", sortable: true, sortValue: (r) => r.ano, width: 80 },
            ]}
            rows={[
              { id: "1", titulo: "Orçamento", genero: "Engenharia", ano: 2024 },
              { id: "2", titulo: "Cronograma", genero: "Engenharia", ano: 2023 },
              { id: "3", titulo: "Relatório anual", genero: "Design", ano: 2025 },
              { id: "4", titulo: "Pesquisa 2026", genero: "Marketing", ano: 2026 },
              { id: "5", titulo: "Briefing", genero: "Engenharia", ano: 2024 },
              { id: "6", titulo: "Plano de lançamento", genero: "Design", ano: 2022 },
            ]} />
        </Section>
        <Section title="KanbanBoard">
          <KanbanBoard columns={kanban} onColumnsChange={setKanban} wipLimit={3} />
        </Section>
        <Section title="SwipeDeck">
          <SwipeDeck title="Imóveis para revisar" items={[
            { id: "s1", title: "Casa com jardim no Santa Tereza", subtitle: "Rua Mármore, Belo Horizonte", value: "R$ 3.200", valueSuffix: "/mês", matchScore: 86, facts: [{ label: "Quartos", value: "3" }, { label: "Área", value: "140 m²" }], media: [{ src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900", alt: "Fachada" }] },
            { id: "s2", title: "Apartamento no Funcionários", subtitle: "Rua Antônio de Albuquerque", value: "R$ 4.100", valueSuffix: "/mês", matchScore: 72, facts: [{ label: "Quartos", value: "2" }, { label: "Área", value: "88 m²" }], media: [{ src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900", alt: "Sala" }] },
          ]} />
        </Section>
        <Section title="Coverflow">
          <Coverflow label="Arquivos em destaque" items={[
            { id: "c1", label: "Orçamento" }, { id: "c2", label: "Cronograma" }, { id: "c3", label: "Relatório anual" }, { id: "c4", label: "Briefing" },
          ]} defaultSelectedId="c2" renderItem={(item, s) => (
            <View style={{ alignItems: "center", gap: 10, paddingVertical: 20 }}>
              <Text style={{ fontSize: 28, color: t.pick<string>("--primary") }}>{String(s.index + 1).padStart(2, "0")}</Text>
              <Text style={{ fontWeight: "600", color: t.pick<string>("--ink-1") }}>{item.label}</Text>
              <Text style={{ color: t.pick<string>("--ink-3") }}>{s.selected ? "Selecionado" : "Selecionar"}</Text>
            </View>
          )} />
        </Section>
        <Section title="Questionnaire">
          <Questionnaire onSubmit={() => {}} questions={[
            { id: "q1", title: "Como você guarda os arquivos?", options: [{ value: "estante", label: "Na estante, em pé" }, { value: "caixa", label: "Em caixas" }, { value: "parede", label: "Na parede" }], required: true },
            { id: "q2", title: "Quantos arquivos você tem?", description: "Um número aproximado já ajuda." },
          ]} />
        </Section>
        <Section title="GuidedTour">
          <GuidedTour open={tour} onOpenChange={setTour} steps={[
            { id: "busca", title: "Busque no espaço", description: "Digite artista, arquivo ou ano. A busca olha as três coisas." },
            { id: "importar", title: "Traga sua coleção", description: "Importe a lista do Drive e os arquivos aparecem aqui.", side: "top" },
          ]}>
            <GuidedTourAnchor stepId="busca" block><Input label="Buscar" placeholder="Artista, arquivo ou ano" /></GuidedTourAnchor>
            <View style={{ height: 12 }} />
            <GuidedTourAnchor stepId="importar"><Button>Importar do Drive</Button></GuidedTourAnchor>
          </GuidedTour>
          <View style={{ height: 12 }} />
          <Button variant="primary" onPress={() => setTour(true)}>Começar tour</Button>
        </Section>
        <Section title="IntentComposer">
          <IntentComposer examples={["Casa com quintal perto do metrô", "Apartamento de 2 quartos até R$ 3 mil"]}
            filters={[{ id: "op", label: "Operação", mode: "single", options: [{ value: "alugar", label: "Alugar" }, { value: "comprar", label: "Comprar" }] }]}
            defaultValue="Casa com 3 quartos no Santa Tereza, até R$ 3.500, aceito pet" />
          <View style={{ height: 16 }} />
          <IntentComposer state="understood" defaultValue="Casa com 3 quartos no Santa Tereza" understoodSummary="Casa para alugar, 3 quartos, Santa Tereza, até R$ 3.500." showVoiceControl={false} />
        </Section>
        <Section title="GeoAreaPicker">
          <GeoAreaPicker baseId="st" defaultIncludedIds={["sa"]} neighborhoods={[
            { id: "st", label: "Santa Tereza", distance: 0 }, { id: "sa", label: "Sagrada Família", distance: 1.2 },
            { id: "ho", label: "Horto", distance: 1.8 }, { id: "fl", label: "Floresta", distance: 2.4 },
          ]} />
        </Section>
        <Section title="VisitSchedulePicker">
          <VisitSchedulePicker defaultActiveDate={new Date(2026, 10, 10)} minDate={new Date(2026, 10, 6)} defaultValue={{ "2026-11-10": ["09:00", "09:30", "10:00", "14:00"], "2026-11-12": [] }} unavailable={{ "2026-11-10": ["11:00", "11:30"] }} />
        </Section>
        <Section title="ApprovalWorkbench">
          <ApprovalWorkbench label="Documentos da locação" activeId={workItem} onActiveChange={setWorkItem} items={[
            { id: "rg", label: "Documento de identidade", meta: "Ana Souza", state: "complete" },
            { id: "renda", label: "Comprovante de renda", meta: "3 holerites", state: "in-progress" },
            { id: "fiador", label: "Fiador", state: "not-started" },
          ]}>
            <Card><Text style={{ color: t.pick<string>("--ink-2") }}>Comprovante de renda: confira se os três holerites são dos últimos três meses.</Text></Card>
          </ApprovalWorkbench>
        </Section>
        <Section title="Trace">
          <Trace steps={[
            { id: "t1", title: "Ler o pedido", status: "complete", duration: "0,4 s", detail: '{ "quartos": 3, "bairro": "Santa Tereza" }' },
            { id: "t2", title: "Buscar imóveis", status: "running", detail: '{ "fonte": "espaço" }' },
            { id: "t3", title: "Calcular compatibilidade", status: "error", duration: "1,2 s", detail: '{ "erro": "sem preço" }' },
          ]} />
        </Section>
        <Section title="LineChart / AreaChart">
          <LineChart title="Visitas por mês" label="Visitas aos imóveis nos últimos seis meses" yTitle="Visitas" xLabels={["Jun", "Ago", "Out", "Nov"]}
            series={[{ name: "Santa Tereza", data: [12, 18, 15, 24, 29, 33] }, { name: "Floresta", data: [8, 9, 14, 12, 16, 21], tone: "info" }]} />
          <View style={{ height: 24 }} />
          <AreaChart title="Arquivos catalogados" label="Arquivos catalogados por semana" data={[4, 9, 7, 14, 18, 16, 25]} xLabels={["Sem 1", "Sem 4", "Sem 7"]} />
        </Section>
        <Section title="BarChart / DonutChart / Sparkline">
          <BarChart title="Imóveis por bairro" label="Imóveis disponíveis por bairro" valueTitle="Imóveis" items={[{ label: "Santa Tereza", value: 42 }, { label: "Floresta", value: 28 }, { label: "Horto", value: 17, tone: "info" }, { label: "Sagrada Família", value: 9, tone: "warn" }]} />
          <View style={{ height: 24 }} />
          <DonutChart label="Arquivos por estado" caption="arquivos" centerLabel="320" segments={[{ value: 210, label: "Boa" }, { value: 80, label: "Antiga", tone: "info" }, { value: 30, label: "Vencida", tone: "critical" }]} size={180} />
          <View style={{ height: 24 }} />
          <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
            <Sparkline label="Procura subindo" data={[3, 5, 4, 7, 8, 12]} />
            <Sparkline label="Procura caindo" tone="bad" data={[12, 9, 10, 6, 5, 3]} />
          </View>
        </Section>
        <Section title="D3Chart: famílias">
          <D3Chart type="bar" title="Visitas por dia" label="Visitas agendadas por dia da semana" height={220} series={[{ id: "v", label: "Visitas", data: [{ x: "Seg", y: 4 }, { x: "Ter", y: 7 }, { x: "Qua", y: 5 }, { x: "Qui", y: 9 }, { x: "Sex", y: 6 }] }]} />
          <View style={{ height: 24 }} />
          <D3Chart type="donut" title="Espaço por área" label="Arquivos do espaço por área" height={240} items={[{ id: "engenharia", label: "Engenharia", value: 140 }, { id: "design", label: "Design", value: 90 }, { id: "juridico", label: "Jurídico", value: 60 }, { id: "marketing", label: "Marketing", value: 30 }]} />
          <View style={{ height: 24 }} />
          <D3Chart type="treemap" title="Imóveis por região" label="Imóveis disponíveis por região e bairro" height={240} root={{ id: "bh", name: "BH", children: [
            { id: "leste", name: "Leste", children: [{ id: "st", name: "Santa Tereza", value: 42 }, { id: "fl", name: "Floresta", value: 28 }, { id: "sf", name: "Sagrada Família", value: 18 }] },
            { id: "sul", name: "Centro-Sul", children: [{ id: "sv", name: "Savassi", value: 35 }, { id: "fu", name: "Funcionários", value: 22 }] },
          ] }} />
          <View style={{ height: 24 }} />
          <D3Chart type="sankey" title="Do contato à visita" label="Pessoas do primeiro contato até a visita" height={240} network={{ nodes: [{ id: "site", label: "Site" }, { id: "whats", label: "WhatsApp" }, { id: "conversa", label: "Conversa" }, { id: "visita", label: "Visita" }], links: [{ source: "site", target: "conversa", value: 30 }, { source: "whats", target: "conversa", value: 20 }, { source: "conversa", target: "visita", value: 18 }] }} />
          <View style={{ height: 24 }} />
          <D3Chart type="radar" title="Comparar imóveis" label="Dois imóveis comparados em quatro critérios" height={260} max={10} series={[
            { id: "a", label: "Santa Tereza", data: [{ x: "Preço", y: 8 }, { x: "Área", y: 6 }, { x: "Vagas", y: 4 }, { x: "Metrô", y: 9 }] },
            { id: "b", label: "Floresta", data: [{ x: "Preço", y: 6 }, { x: "Área", y: 8 }, { x: "Vagas", y: 7 }, { x: "Metrô", y: 5 }] },
          ]} />
          <View style={{ height: 24 }} />
          <D3Chart type="heatmap" title="Procura por horário" label="Visitas pedidas por dia e período" height={200} cells={["Seg", "Ter", "Qua", "Qui", "Sex"].flatMap((x, i) => ["Manhã", "Tarde", "Noite"].map((y, j) => ({ x, y, value: ((i + 1) * (j + 2)) % 7 })))} />
        </Section>
        <Section title="Modal / Toast">
          <Button onPress={() => setModal(true)}>Abrir modal</Button>
        </Section>
      </ScrollView>
      <AlertDialog open={alert} onOpenChange={setAlert} destructive title="Apagar o espaço?" confirmLabel="Apagar" onConfirm={() => setAlert(false)}>Os 320 arquivos e as fotos somem. Não dá para desfazer.</AlertDialog>
      <Drawer open={drawer !== null} onOpenChange={(o) => { if (!o) setDrawer(null); }} side={drawer ?? "right"} title="Filtros" footer={<Button variant="primary" block onPress={() => setDrawer(null)}>Aplicar</Button>}>
        Área, ano e estado da capa.
      </Drawer>
      <Modal open={modal} onClose={() => setModal(false)} title="Acompanhar 19" width={440} footer={<Button variant="primary" onPress={() => setModal(false)}>Fechar</Button>}>
        <Text>Proposta</Text>
      </Modal>
      <ToastRegion toasts={showToasts ? toasts : []} onDismiss={(id) => setToasts((list) => list.filter((x) => x.id !== id))} />
    </View>
  );
}
