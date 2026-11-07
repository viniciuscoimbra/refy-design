import { tr } from "../RefySitePage/i18n";
import { useEffect, useState } from "react";
import {
  AppShell,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardHeader,
  Callout,
  Checkbox,
  Combobox,
  Command,
  DatePicker,
  Drawer,
  EmptyState,
  FileUpload,
  Select,
  DecisionActions,
  ActivityTimeline,
  Input,
  KanbanBoard,
  BarChart,
  Menu,
  Modal,
  PageHeader,
  PersonCell,
  ProgressBar,
  RadioGroup,
  SectionHeader,
  SettingRow,
  SettingRowGroup,
  Stat,
  StatGroup,
  Table,
  Tabs,
  Textarea,
  ToastRegion,
  ApprovalWorkbench,
  UsageMeter,
  ChoiceCard,
  ChoiceCardGroup,
  NotificationBell,
  UserMenu,
} from "../../index";
import type {
  AccessIdentity,
  SetupConfiguration,
  DecisionAction,
} from "../../index";
import { LibraryBlock } from "../../blocks/LibraryBlock";
import { useCommandShortcut } from "../../_demo/shortcuts";
import { Icons } from "../../_demo/icons";
import styles from "./PlaygroundPage.module.css";

const workspaceAreas = {
  overview: "Visão geral",
  work: "Trabalho",
  library: "Biblioteca",
  settings: "Configurações",
};
const areas = workspaceAreas;
type Area = keyof typeof areas;
export interface CreatedWorkspace {
  id: string;
  configuration: SetupConfiguration;
}
const projectStatuses = [
  "Planejado",
  "Em andamento",
  "Em revisão",
  "Concluído",
];
const initialProjects = [
  {
    id: "aurora",
    name: "Projeto Aurora",
    owner: "Ana Lima",
    status: "Em andamento",
    progress: 72,
    visibility: "Equipe",
    createdAt: "2026-10-22T09:00:00-03:00",
  },
  {
    id: "horizonte",
    name: "Projeto Horizonte",
    owner: "Bruno Reis",
    status: "Em revisão",
    progress: 90,
    visibility: "Equipe",
    createdAt: "2026-10-22T10:00:00-03:00",
  },
  {
    id: "origem",
    name: "Projeto Origem",
    owner: "Clara Dias",
    status: "Planejado",
    progress: 18,
    visibility: "Equipe",
    createdAt: "2026-10-22T11:00:00-03:00",
  },
];
/** Demo page composition, deliberately not exported as a design-system organism. */
export function ApplicationPreview({
  initialName,
  onComponents,
  onAccess,
  active = true,
  identity = { name: "Ana Lima", email: "ana@example.com" },
  createdSpace,
}: {
  initialName: string;
  active?: boolean;
  identity?: AccessIdentity;
  createdSpace?: CreatedWorkspace;
  onComponents: () => void;
  onAccess: () => void;
}) {
  const [detailsId, setDetailsId] = useState<string>();
  const [attachments, setAttachments] = useState<Record<string, File[]>>({});
  const [deadlines, setDeadlines] = useState<Record<string, Date | null>>({});
  const [area, setArea] = useState<Area>("overview");
  const [workView, setWorkView] = useState("list");
  const [workspaceId, setWorkspaceId] = useState("aurora");
  const [spaces, setSpaces] = useState([
    {
      id: "aurora",
      name: initialName,
      role: tr("Equipe de criação"),
      initials: "EA",
      description: tr("Um espaço para criar, revisar e compartilhar projetos."),
      visibility: "Equipe",
      notifications: true,
      summary: true,
      frequency: "weekly",
    },
    {
      id: "horizonte",
      name: "Estúdio Horizonte",
      role: tr("Equipe de produto"),
      initials: "EH",
      description: tr("Projetos e entregas da equipe de produto."),
      visibility: "Equipe",
      notifications: true,
      summary: true,
      frequency: "weekly",
    },
  ]);
  const [projectLists, setProjectLists] = useState<
    Record<string, typeof initialProjects>
  >({
    aurora: initialProjects,
    horizonte: [
      {
        id: "produto",
        name: "Produto Horizonte",
        owner: "Bruno Reis",
        status: "Planejado",
        progress: 12,
        visibility: "Equipe",
        createdAt: "2026-10-22T09:00:00-03:00",
      },
    ],
  });
  const projects = projectLists[workspaceId] ?? [];
  const currentProject = projects.find((project) => project.id === detailsId);
  const detailsKey = `${workspaceId}-${detailsId}`;
  const setProjects = (
    update: (rows: typeof initialProjects) => typeof initialProjects,
  ) =>
    setProjectLists((lists) => ({
      ...lists,
      [workspaceId]: update(lists[workspaceId]).map((project) =>
        project.status === "Concluído"
          ? { ...project, progress: 100 }
          : project,
      ),
    }));
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState(false);
  useCommandShortcut(() => setSearch(true), active);
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState(false);
  const [projectVisibility, setProjectVisibility] = useState("Equipe");
  const savedWorkspace = spaces.find((space) => space.id === workspaceId)!;
  const workspace = savedWorkspace.name;
  const [preferenceError, setPreferenceError] = useState("");
  const [preferences, setPreferences] = useState<typeof savedWorkspace | null>(
    null,
  );
  const settings = preferences ?? savedWorkspace;
  const updatePreferences = (patch: Partial<typeof savedWorkspace>) =>
    setPreferences((current) => ({ ...(current ?? savedWorkspace), ...patch }));
  const openCreate = () => {
    setName("");
    setNameError("");
    setProjectVisibility(savedWorkspace.visibility);
    setCreating(true);
  };
  useEffect(() => {
    if (!active) {
      setSearch(false);
      setCreating(false);
      setDetailsId(undefined);
      setMenu(false);
    }
  }, [active]);
  useEffect(() => {
    if (!createdSpace) return;
    const { id, configuration: config } = createdSpace;
    setSpaces((items) =>
      items.some((item) => item.id === id)
        ? items
        : [
            ...items,
            {
              id,
              name: config.name,
              role: tr("Espaço da equipe"),
              initials: config.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
              description: config.description,
              visibility: config.access === "invite" ? "Privado" : "Equipe",
              notifications: config.notifications,
              summary: true,
              frequency: "weekly",
            },
          ],
    );
    setProjectLists((lists) => (id in lists ? lists : { ...lists, [id]: [] }));
    setWorkspaceId(id);
    setPreferences(null);
    setArea("overview");
    setNotice(
      `Espaço ${config.name} criado. Comece pelo seu primeiro projeto.`,
    );
  }, [createdSpace]);
  const [inbox, setInbox] = useState([
    {
      id: "review",
      workspaceId: "aurora",
      title: tr("Projeto Horizonte pronto para revisão"),
      description: tr("Bruno enviou uma nova entrega."),
      time: tr("há 15 min"),
      unread: true,
    },
    {
      id: "team",
      workspaceId: "aurora",
      title: tr("Clara entrou na equipe"),
      description: tr("O espaço tem uma nova integrante."),
      time: tr("há 1 h"),
      unread: true,
    },
  ]);
  const [reviewProjectId, setReviewProjectId] = useState("aurora");
  const reviewProject =
    projects.find((project) => project.id === reviewProjectId) ?? projects[0];
  const reviewKey = `${workspaceId}:${reviewProject?.id ?? "empty"}`;
  const [reviews, setReviews] = useState<
    Record<
      string,
      {
        decisions?: Record<string, DecisionAction>;
        approved: string[];
        notes: string;
      }
    >
  >({});
  const reviewData = reviews[reviewKey] ?? { approved: [], notes: "" };
  const { approved } = reviewData;
  const updateReview = (patch: Partial<typeof reviewData>) =>
    setReviews((previous) => ({
      ...previous,
      [reviewKey]: {
        ...(previous[reviewKey] ?? { approved: [], notes: "" }),
        ...patch,
      },
    }));
  const [review, setReview] = useState("content");

  const projectTable = (
    <Table
      caption={tr("Projetos da equipe")}
      rows={projects}
      rowKey={(r) => r.id}
      searchable
      searchPlaceholder={tr("Filtrar projetos…")}
      pagination={{ pageSize: 5, pageSizeOptions: [5, 10] }}
      minTableWidth={540}
      columns={[
        {
          key: "name",
          header: tr("Projeto"),
          sortable: true,
          cell: (r) => (
            <PersonCell
              size="sm"
              name={r.name}
              secondary={r.owner}
              avatar={
                <Avatar
                  initials={r.owner
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")}
                  alt={r.owner}
                  size="sm"
                />
              }
            />
          ),
        },
        {
          key: "status",
          header: tr("Estado"),
          filterable: true,
          cell: (r) => (
            <Badge
              tone={
                r.status === "Concluído"
                  ? "success"
                  : r.status === "Em revisão"
                    ? "warn"
                    : "neutral"
              }
            >
              {r.status}
            </Badge>
          ),
        },
        {
          key: "progress",
          header: tr("Progresso"),
          sortable: true,
          align: "num",
          cell: (r) => (
            <div className={styles.progress}>
              <span>{r.progress}%</span>
              <ProgressBar value={r.progress} size="sm" />
            </div>
          ),
        },
        {
          key: "action",
          header: tr("Ação"),
          cell: (r) => (
            <div className={styles.actions}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDetailsId(r.id)}
                aria-label={`Detalhes de ${r.name}`}
              >
                {tr("Detalhes")}</Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setArea("work");
                  setWorkView("review");
                  setReviewProjectId(r.id);
                  setReview("content");
                }}
              >
                {tr("Revisar")}</Button>
            </div>
          ),
        },
      ]}
    />
  );
  if (!active) return null;
  return (
    <>
      <AppShell
        responsiveSidebar
        sidebar={{
          brand: "refy",
          activeId: area,
          workspaces: spaces,
          workspaceId,
          onWorkspaceChange: (item) => {
            setWorkspaceId(item.id);
            setArea("overview");
            setPreferences(null);
            setDetailsId(undefined);
          },

          cta: {
            label: tr("Novo projeto"),
            icon: Icons.plus,
            onClick: openCreate,
          },
          groups: [
            {
              section: "Workspace",
              items: Object.entries(workspaceAreas).map(([id, label]) => ({
                id,
                label,
                icon:
                  id === "overview"
                    ? Icons.dashboard
                    : id === "work"
                      ? Icons.projects
                      : id === "library"
                        ? Icons.competitors
                        : Icons.settings,
              })),
            },
            {
              items: [
                {
                  id: "components",
                  label: tr("Componentes"),
                  icon: Icons.competitors,
                },
              ],
            },
          ],
          onNavigate: (item) =>
            item.id === "components"
              ? onComponents()
              : setArea(item.id as Area),
        }}
        topbar={{
          showBrand: false,
          crumbs: [
            { label: workspace, onClick: () => setArea("overview") },
            { label: areas[area] },
          ],
          searchPlaceholder: "Buscar neste espaço…",
          onSearchClick: () => setSearch(true),
          actions: (
            <>
              <NotificationBell
                items={inbox.filter((item) => item.workspaceId === workspaceId)}
                onMarkAllRead={() =>
                  setInbox((items) =>
                    items.map((item) => ({ ...item, unread: false })),
                  )
                }
                onItemClick={(item) => {
                  setInbox((items) =>
                    items.map((row) =>
                      row.id === item.id ? { ...row, unread: false } : row,
                    ),
                  );
                  setArea(item.id === "review" ? "work" : "settings");
                  setWorkView("review");
                  if (item.id === "review") setReviewProjectId("horizonte");
                }}
              />
              <UserMenu
                compact
                user={{
                  ...identity,
                  initials: identity.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                }}
                onSelect={(id) =>
                  id === "logout" ? onAccess() : setArea("settings")
                }
              />
            </>
          ),
        }}
      >
        <div className={styles.stack}>
          <PageHeader
            eyebrow={workspace}
            title={areas[area]}
            lead={
              area === "overview"
                ? tr("Acompanhe os projetos e as atividades da equipe.")
                : area === "work"
                  ? "Organize e revise as entregas."
                  : area === "library"
                    ? "Materiais e referências da equipe."
                    : "Preferências deste espaço."
            }
            actions={
              area === "overview" || area === "work" ? (
                <Button
                  variant="primary"
                  leadingIcon={Icons.plus}
                  onClick={openCreate}
                >
                  {tr("Criar projeto")}</Button>
              ) : undefined
            }
          />
          {area === "overview" && (
            <>
              <StatGroup>
                <Stat
                  label={tr("Projetos ativos")}
                  value={
                    projects.filter((project) => project.status !== "Concluído")
                      .length
                  }
                  description={tr("Neste workspace")}
                />
                <Stat
                  label={tr("Conclusão do ciclo")}
                  value={`${projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0}%`}
                  description={tr("Média dos projetos deste espaço")}
                />
                <Stat
                  label={tr("Em revisão")}
                  value={
                    projects.filter(
                      (project) => project.status === "Em revisão",
                    ).length
                  }
                  description={tr("Aguardando uma decisão da equipe")}
                />
              </StatGroup>
              <div className={styles.columns}>
                <Card>
                  {projects.length ? (
                    <BarChart
                      title={tr("Projetos por etapa")}
                      label={tr("Quantidade de projetos por etapa")}
                      valueTitle={tr("Projetos")}
                      items={[
                        "Planejado",
                        "Em andamento",
                        "Em revisão",
                        "Concluído",
                      ].map((status) => ({
                        label: status,
                        value: projects.filter(
                          (project) => project.status === status,
                        ).length,
                      }))}
                    />
                  ) : (
                    <EmptyState
                      title={tr("Ainda não há entregas")}
                      message={tr("O gráfico mostrará a distribuição dos projetos por etapa.")}
                    />
                  )}
                </Card>
                <Card>
                  <CardHeader title={tr("Equipe e capacidade")} />
                  <div className={styles.stack}>
                    <AvatarGroup
                      items={[
                        ...new Set([
                          identity.name,
                          ...projects.map((project) => project.owner),
                        ]),
                      ].map((name) => ({ name }))}
                    />
                    <UsageMeter
                      label={tr("Projetos concluídos")}
                      used={
                        projects.filter(
                          (project) => project.status === "Concluído",
                        ).length
                      }
                      limit={Math.max(1, projects.length)}
                    />
                    <UsageMeter
                      label={tr("Arquivos na sessão")}
                      used={Object.entries(attachments)
                        .filter(([key]) => key.startsWith(`${workspaceId}-`))
                        .reduce((sum, [, files]) => sum + files.length, 0)}
                      limit={20}
                      unit="arquivos"
                    />
                    <Button onClick={() => setArea("settings")}>
                      {tr("Gerenciar workspace")}</Button>
                  </div>
                </Card>
              </div>
              <Card>
                <CardHeader
                  title={tr("Projetos em movimento")}
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setArea("work")}
                    >
                      {tr("Ver trabalho")}</Button>
                  }
                />
                {projectTable}
              </Card>
              {projects.length ? (
                <ActivityTimeline
                  title={tr("Projetos recentes")}
                  context={tr("Projetos e estados deste espaço.")}
                  density="compact"
                  events={projects
                    .slice()
                    .reverse()
                    .map((project) => ({
                      id: project.id,
                      timestamp: project.createdAt,
                      title: project.name,
                      description: project.status,
                      actor: { name: project.owner },
                      action: (
                        <Button
                          size="sm"
                          onClick={() => setDetailsId(project.id)}
                        >
                          {tr("Abrir projeto")}</Button>
                      ),
                    }))}
                />
              ) : (
                <EmptyState
                  title={tr("Seu espaço está pronto")}
                  message={tr("Crie o primeiro projeto para organizar as entregas da equipe.")}
                  action={
                    <Button variant="primary" onClick={openCreate}>
                      {tr("Criar primeiro projeto")}</Button>
                  }
                />
              )}
            </>
          )}
          {area === "work" &&
            (projects.length ? (
              <Tabs
                value={workView}
                onChange={setWorkView}
                items={[
                  {
                    id: "list",
                    label: tr("Lista"),
                    content: <Card>{projectTable}</Card>,
                  },
                  {
                    id: "board",
                    label: tr("Quadro"),
                    content: (
                      <KanbanBoard
                        onCardClick={(item) => setDetailsId(item.id)}
                        onColumnsChange={(columns) =>
                          setProjects((rows) => {
                            const ordered = columns.flatMap((column) =>
                              column.items.map((item) => ({
                                id: item.id,
                                status: column.id,
                              })),
                            );
                            return [
                              ...ordered.flatMap(({ id, status }) => {
                                const row = rows.find((row) => row.id === id);
                                return row ? [{ ...row, status }] : [];
                              }),
                              ...rows.filter(
                                (row) =>
                                  !ordered.some((item) => item.id === row.id),
                              ),
                            ];
                          })
                        }
                        columns={projectStatuses.map((status) => ({
                          id: status,
                          title: status,
                          color:
                            status === "Concluído"
                              ? "var(--success)"
                              : status === "Em revisão"
                                ? "var(--warn)"
                                : status === "Em andamento"
                                  ? "var(--info)"
                                  : "var(--outline)",
                          items: projects
                            .filter((p) => p.status === status)
                            .map((p) => ({
                              id: p.id,
                              title: p.name,
                              description: p.owner,
                              footer: (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setProjects((rows) =>
                                      rows.map((row) =>
                                        row.id === p.id
                                          ? {
                                              ...row,
                                              status:
                                                projectStatuses[
                                                  (projectStatuses.indexOf(
                                                    status,
                                                  ) +
                                                    1) %
                                                    projectStatuses.length
                                                ],
                                            }
                                          : row,
                                      ),
                                    );
                                  }}
                                >
                                  {tr("Mover para")}{" "}
                                  {
                                    projectStatuses[
                                      (projectStatuses.indexOf(status) + 1) %
                                        projectStatuses.length
                                    ]
                                  }
                                </Button>
                              ),
                            })),
                        }))}
                      />
                    ),
                  },
                  {
                    id: "review",
                    label: tr("Revisão"),
                    content: (
                      <ApprovalWorkbench
                        activeId={review}
                        onActiveChange={setReview}
                        items={[
                          { id: "content", label: tr("Conteúdo") },
                          { id: "delivery", label: tr("Entrega") },
                        ].map((item) => ({
                          ...item,
                          state: approved.includes(item.id)
                            ? "complete"
                            : item.id === review
                              ? "in-progress"
                              : "not-started",
                        }))}
                      >
                        <Card>
                          <div className={styles.stack}>
                            <SectionHeader
                              title={
                                review === "content"
                                  ? tr("Revisão de conteúdo")
                                  : tr("Revisão da entrega")
                              }
                              sub={
                                reviewProject?.name ??
                                "Escolha um projeto para revisar."
                              }
                            />
                            <Select
                              label={tr("Projeto em revisão")}
                              value={reviewProject?.id ?? ""}
                              onChange={(event) => {
                                setReviewProjectId(event.target.value);
                                setReview("content");
                              }}
                            >
                              {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                </option>
                              ))}
                            </Select>
                            <Callout title={tr("Critérios da revisão")}>
                              {tr("Clareza, consistência e informações completas.")}</Callout>
                            <Textarea
                              label={tr("Observações")}
                              placeholder={tr("O que precisa ser ajustado?")}
                              value={reviewData.notes}
                              onChange={(event) =>
                                updateReview({ notes: event.target.value })
                              }
                            />
                            <DecisionActions
                              labels={{
                                select: "Aprovar etapa",
                                reject: "Solicitar ajuste",
                                save: "Revisar depois",
                              }}
                              statusMessage={
                                reviewData.decisions?.[review] === "select"
                                  ? tr("Etapa aprovada.")
                                  : reviewData.decisions?.[review] === "reject"
                                    ? "Ajuste solicitado."
                                    : reviewData.decisions?.[review] === "save"
                                      ? "Revisão guardada para depois."
                                      : undefined
                              }
                              activeAction={reviewData.decisions?.[review]}
                              onAction={(action) => {
                                if (!reviewProject) return;
                                const nextApproved =
                                  action === "select"
                                    ? [...new Set([...approved, review])]
                                    : action === "reject"
                                      ? approved.filter((id) => id !== review)
                                      : approved;
                                updateReview({
                                  decisions: {
                                    ...reviewData.decisions,
                                    [review]: action,
                                  },
                                  approved: nextApproved,
                                });
                                if (action !== "save")
                                  setProjects((rows) =>
                                    rows.map((project) =>
                                      project.id === reviewProject.id
                                        ? {
                                            ...project,
                                            status:
                                              action === "reject"
                                                ? "Em andamento"
                                                : nextApproved.length === 2
                                                  ? "Concluído"
                                                  : "Em revisão",
                                            progress:
                                              action === "select" &&
                                              nextApproved.length === 2
                                                ? 100
                                                : project.progress,
                                          }
                                        : project,
                                    ),
                                  );
                                setNotice(
                                  action === "select"
                                    ? "Item aprovado nesta demonstração."
                                    : action === "save"
                                      ? "Item salvo para revisar depois."
                                      : "Ajuste solicitado nesta demonstração.",
                                );
                              }}
                            />
                          </div>
                        </Card>
                      </ApprovalWorkbench>
                    ),
                  },
                ]}
              />
            ) : (
              <EmptyState
                title={tr("Nenhum projeto neste espaço")}
                message={tr("Crie um projeto para acompanhar o trabalho em lista, quadro e revisão.")}
                action={
                  <Button variant="primary" onClick={openCreate}>
                    {tr("Criar primeiro projeto")}</Button>
                }
              />
            ))}
          <div hidden={area !== "library"}>
            <LibraryBlock key={workspaceId} />
          </div>
          {area === "settings" && (
            <div className={styles.twoColumns}>
              <Card>
                <CardHeader title={tr("Perfil do workspace")} />
                <form
                  className={styles.stack}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (settings.name.trim().length < 2) {
                      setPreferenceError(
                        "Informe ao menos dois caracteres no nome.",
                      );
                      return;
                    }
                    setPreferenceError("");
                    setSpaces((items) =>
                      items.map((item) =>
                        item.id === workspaceId
                          ? {
                              ...settings,
                              name: settings.name.trim(),
                              description: settings.description.trim(),
                            }
                          : item,
                      ),
                    );
                    setPreferences(null);
                    setNotice("Preferências salvas nesta demonstração.");
                  }}
                >
                  <Input
                    label={tr("Nome do workspace")}
                    error={preferenceError}
                    minLength={2}
                    value={settings.name}
                    onChange={(e) => {
                      updatePreferences({ name: e.target.value });
                      setPreferenceError("");
                    }}
                    required
                    block
                  />
                  <Textarea
                    label={tr("Descrição")}
                    value={settings.description}
                    onChange={(e) =>
                      updatePreferences({ description: e.target.value })
                    }
                    block
                  />
                  <RadioGroup
                    name="frequency"
                    label={tr("Resumo de atividades")}
                    value={settings.frequency}
                    onChange={(frequency) => updatePreferences({ frequency })}
                    options={[
                      { value: "daily", label: tr("Diário") },
                      { value: "weekly", label: tr("Semanal") },
                    ]}
                  />
                  <Checkbox
                    label={tr("Incluir projetos concluídos no resumo")}
                    checked={settings.summary}
                    onChange={(e) =>
                      updatePreferences({ summary: e.target.checked })
                    }
                  />
                  <div className={styles.actions}>
                    <Button
                      type="button"
                      onClick={() => {
                        setPreferences(null);
                        setPreferenceError("");
                        setNotice("Alterações descartadas.");
                      }}
                    >
                      {tr("Cancelar alterações")}</Button>
                    <Button type="submit" variant="primary">
                      {tr("Salvar preferências")}</Button>
                  </div>
                </form>
              </Card>
              <div className={styles.stack}>
                <Card>
                  <CardHeader title={tr("Preferências de trabalho")} />
                  <SettingRowGroup>
                    <SettingRow
                      title={tr("Avisos da equipe")}
                      description={tr("Receber atualizações dos projetos.")}
                      switchProps={{
                        checked: settings.notifications,
                        onChange: (e) =>
                          updatePreferences({
                            notifications: e.target.checked,
                          }),
                      }}
                    />
                    <SettingRow
                      title={tr("Acesso ao workspace")}
                      description={settings.visibility}
                      actions={<Badge tone="success">{tr("Ativo")}</Badge>}
                    />
                  </SettingRowGroup>
                </Card>
                <Card>
                  <CardHeader title={tr("Compartilhamento padrão")} />
                  <ChoiceCardGroup
                    label={tr("Visibilidade")}
                    columns={1}
                    value={settings.visibility}
                    onChange={(value) =>
                      updatePreferences({ visibility: String(value) })
                    }
                  >
                    <ChoiceCard
                      value="Equipe"
                      title={tr("Equipe")}
                      description={tr("Colaboração com todos os integrantes.")}
                    />
                    <ChoiceCard
                      value="Privado"
                      title={tr("Privado")}
                      description={tr("Apenas pessoas convidadas.")}
                    />
                  </ChoiceCardGroup>
                </Card>
              </div>
            </div>
          )}
        </div>
      </AppShell>
      <Drawer
        open={!!currentProject}
        onOpenChange={(open) => {
          if (!open) setDetailsId(undefined);
        }}
        title={currentProject?.name ?? "Detalhes do projeto"}
        width={620}
      >
        {currentProject && (
          <Tabs
            key={detailsKey}
            items={[
              {
                id: "summary",
                label: tr("Resumo"),
                content: (
                  <div className={styles.stack}>
                    <Combobox
                      label={tr("Responsável do projeto")}
                      options={[
                        ...new Set([
                          identity.name,
                          ...projects.map((project) => project.owner),
                        ]),
                      ].map((label) => ({ value: label, label }))}
                      value={currentProject.owner}
                      onChange={(owner) => {
                        if (owner)
                          setProjects((rows) =>
                            rows.map((row) =>
                              row.id === currentProject.id
                                ? { ...row, owner: owner.label }
                                : row,
                            ),
                          );
                      }}
                    />
                    <Select
                      label={tr("Estado do projeto")}
                      value={currentProject.status}
                      onChange={(event) =>
                        setProjects((rows) =>
                          rows.map((row) =>
                            row.id === currentProject.id
                              ? { ...row, status: event.target.value }
                              : row,
                          ),
                        )
                      }
                    >
                      {projectStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </Select>
                    <Select
                      label={tr("Visibilidade do projeto")}
                      value={currentProject.visibility}
                      onChange={(event) =>
                        setProjects((rows) =>
                          rows.map((row) =>
                            row.id === currentProject.id
                              ? { ...row, visibility: event.target.value }
                              : row,
                          ),
                        )
                      }
                    >
                      <option>{tr("Equipe")}</option>
                      <option>{tr("Privado")}</option>
                    </Select>
                    <DatePicker
                      label={tr("Prazo do projeto")}
                      value={deadlines[detailsKey] ?? null}
                      onChange={(date) =>
                        setDeadlines((values) => ({
                          ...values,
                          [detailsKey]: date,
                        }))
                      }
                    />
                    <UsageMeter
                      label={tr("Conclusão do projeto")}
                      used={currentProject.progress}
                      limit={100}
                    />
                    <Callout title={tr("Alterações nesta sessão")}>
                      {tr("Responsável, estado e prazo são atualizados nesta demonstração, sem enviar dados.")}</Callout>
                  </div>
                ),
              },
              {
                id: "files",
                label: tr("Arquivos"),
                content: (
                  <div className={styles.stack}>
                    <FileUpload
                      label={tr("Anexar arquivos ao projeto")}
                      multiple
                      files={attachments[detailsKey] ?? []}
                      onFilesChange={(files) =>
                        setAttachments((values) => ({
                          ...values,
                          [detailsKey]: files,
                        }))
                      }
                    />
                    <p>
                      {tr("Os arquivos ficam na memória desta sessão. Nenhum upload é realizado.")}</p>
                  </div>
                ),
              },
              {
                id: "activity",
                label: tr("Atividade"),
                content: (
                  <ActivityTimeline
                    title={tr("Histórico do projeto")}
                    density="compact"
                    events={[
                      {
                        id: "created",
                        timestamp: currentProject.createdAt,
                        title: tr("Projeto organizado"),
                        actor: {
                          name: currentProject.owner,
                          initials: currentProject.owner
                            .split(" ")
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join(""),
                        },
                        description: `Estado atual: ${currentProject.status}.`,
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={tr("Criar projeto")}
      >
        <form
          className={styles.stack}
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              setNameError("Informe o nome do projeto.");
              return;
            }
            setProjects((items) => [
              ...items,
              {
                id: `project-${items.length}`,
                name: name.trim(),
                owner: identity.name,
                status: "Planejado",
                progress: 0,
                visibility: projectVisibility,
                createdAt: new Date().toISOString(),
              },
            ]);
            setNotice(`Projeto ${name.trim()} criado.`);
            setCreating(false);
            setName("");
          }}
        >
          <Input
            label={tr("Nome do projeto")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            error={nameError}
            required
            block
          />
          <Menu
            open={menu}
            onOpenChange={setMenu}
            entries={["Equipe", "Privado"].map((label) => ({
              id: label,
              label,
              onSelect: () => setProjectVisibility(label),
            }))}
          >
            <Button type="button" onClick={() => setMenu(!menu)}>
              Visibilidade: {projectVisibility}
            </Button>
          </Menu>
          <Callout title={tr("Demonstração")}>
            {tr("O projeto será incluído na lista desta sessão.")}</Callout>
          <div className={styles.actions}>
            <Button type="button" onClick={() => setCreating(false)}>
              {tr("Cancelar")}</Button>
            <Button variant="primary" type="submit">
              {tr("Criar")}</Button>
          </div>
        </form>
      </Modal>
      <Command
        open={search}
        onOpenChange={setSearch}
        placeholder={tr("Encontrar página ou projeto…")}
        items={[
          ...Object.entries(areas).map(([id, label]) => ({
            id,
            label,
            group: "Páginas",
          })),
          ...projects.map((project) => ({
            id: project.id,
            label: project.name,
            group: "Projetos",
          })),
        ]}
        onSelect={(item) => {
          if (item.id in areas) setArea(item.id as Area);
          else {
            setArea("work");
            setWorkView("review");
            setReviewProjectId(item.id);
            setReview("content");
          }
          setSearch(false);
        }}
      />
      <ToastRegion
        toasts={
          notice
            ? [{ id: "playground-notice", title: notice, duration: 5000 }]
            : []
        }
        onDismiss={() => setNotice("")}
      />
    </>
  );
}
