import { tr } from "../RefySitePage/i18n";
import type { ReactNode } from "react";
import {
  AppShell,
  Avatar,
  AvatarGroup,
  Button,
  Card,
  D3Chart,
  IconButton,
  Input,
  ProgressBar,
  Stat,
  StatusDot,
  Switch,
  Table,
} from "../../index";
import styles from "../RefySitePage/RefySitePage.module.css";
import own from "./ThemeStudioPreview.module.css";
import anaPhoto from "../RefySitePage/assets/avatars/ana.jpg";
import liaPhoto from "../RefySitePage/assets/avatars/lia.jpg";
import ruiPhoto from "../RefySitePage/assets/avatars/rui.jpg";
import leoPhoto from "../RefySitePage/assets/avatars/leo.jpg";

const glyph = (children: ReactNode) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="100%"
    height="100%"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const icons = {
  home: glyph(<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z" />),
  folder: glyph(<path d="M3 7V5h6l2 2h10v13H3z" />),
  tasks: glyph(<><rect x="4" y="4" width="16" height="16" rx="2" /><path d="m8 12 3 3 5-6" /></>),
  team: glyph(<><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M17 20h4a5 5 0 0 0-4-5" /></>),
  file: glyph(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>),
  report: glyph(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />),
  plug: glyph(<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4" />),
  palette: glyph(<><circle cx="12" cy="12" r="9" /><circle cx="8" cy="10" r="1" /><circle cx="12" cy="7" r="1" /><circle cx="16" cy="10" r="1" /></>),
  user: glyph(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  bell: glyph(<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0" />),
  calendar: glyph(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
  clock: glyph(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  more: glyph(<><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>),
  search: glyph(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
};
const ana = { name: "Ana Lima", src: anaPhoto };
const rui = { name: "Rui Costa", src: ruiPhoto };
const lia = { name: "Lia Alves", src: liaPhoto };
const leo = { name: "Leo Melo", src: leoPhoto };
const activity = [12, 18, 9, 22, 16, 25, 14, 20, 28, 17, 23, 11, 19, 26, 15, 21, 27, 13, 24, 18, 29, 16, 22, 25, 14, 27, 20, 23, 28, 26].map(
  (y, index) => ({ x: index + 1, y }),
);
const projects = [
  { id: "web", name: "Plataforma Web", detail: tr("Produto principal"), status: tr("Em andamento"), tone: "good", progress: 72, team: [ana, rui, lia, leo, { name: "Bia Rocha" }], updated: tr("Hoje, 10:24"), icon: icons.home, toneClass: styles.toneGood },
  { id: "mobile", name: "App Mobile", detail: tr("Aplicativo nativo"), status: tr("Planejamento"), tone: "info", progress: 38, team: [leo, ana, rui], updated: tr("Ontem, 16:12"), icon: icons.folder, toneClass: styles.toneInfo },
  { id: "system", name: "Design System", detail: tr("Biblioteca de componentes"), status: tr("Concluído"), tone: "good", progress: 100, team: [lia, rui, ana], updated: tr("12 de abr. de 2024"), icon: icons.palette, toneClass: styles.toneViolet },
] as const;

/** Prévia "Estúdio Aurora" da página Temas: um app inteiro pintado pelo tema escolhido. */
export function ThemeStudioPreview({ brand }: { brand: ReactNode }) {
  return (
    <div className={styles.studioPreview}>
      <AppShell
        responsiveSidebar
        navigationLabel={tr("Estúdio Aurora")}
        sidebar={{
          brand,
          showHeader: true,
          groups: [
            {
              items: [
                { id: "overview", label: tr("Visão geral"), icon: icons.home },
                { id: "projects", label: tr("Projetos"), icon: icons.folder },
                { id: "tasks", label: tr("Tarefas"), icon: icons.tasks },
                { id: "team", label: tr("Equipe"), icon: icons.team },
                { id: "files", label: tr("Arquivos"), icon: icons.file },
                { id: "reports", label: tr("Relatórios"), icon: icons.report },
              ],
            },
            {
              section: tr("Configurações"),
              items: [
                { id: "integrations", label: tr("Integrações"), icon: icons.plug },
                { id: "appearance", label: tr("Aparência"), icon: icons.palette },
                { id: "account", label: tr("Conta"), icon: icons.user },
              ],
            },
          ],
          defaultActiveId: "overview",
        }}
        topbar={{
          showBrand: false,
          composition: "dense",
          leading: (
            <Input
              aria-label={tr("Buscar projetos e tarefas")}
              placeholder={tr("Buscar projetos, tarefas…")}
              prefix={icons.search}
              className={styles.studioSearch}
            />
          ),
          actions: (
            <span className={styles.studioUser}>
              <IconButton aria-label={tr("Notificações")} icon={icons.bell} variant="ghost" />
              <Avatar initials="AC" size="sm" />
              <span>{tr("Ana Costa")}</span>
            </span>
          ),
        }}
      >
        <div className={`${styles.studioBody} ${own.body}`}>
          <header className={styles.studioHeader}>
            <div>
              <small>{tr("Estúdio Aurora")}</small>
              <h3>{tr("Visão geral")}</h3>
              <p>{tr("Acompanhe o progresso, as atividades e os próximos passos.")}</p>
            </div>
            <Button size="sm" leadingIcon={icons.calendar}>{tr("1–30 de abr. de 2024")}</Button>
          </header>
          <div className={styles.studioStats}>
            <Card padding="sm"><span className={styles.studioStatIcon}><span className={styles.studioGlyph}>{icons.folder}</span></span><Stat label={tr("Projetos ativos")} value="12" delta={{ value: "20%", trend: "up" }} description={tr("vs. período anterior")} /></Card>
            <Card padding="sm"><span className={styles.studioStatIcon}><span className={styles.studioGlyph}>{icons.team}</span></span><Stat label={tr("Tarefas concluídas")} value="148" delta={{ value: "12%", trend: "up" }} description={tr("vs. período anterior")} /></Card>
            <Card padding="sm"><span className={styles.studioStatIcon}><span className={styles.studioGlyph}>{icons.clock}</span></span><Stat label={tr("Tempo de ciclo")} value="3,2 dias" delta={{ value: "28%", trend: "down", sentiment: "positive" }} description={tr("vs. período anterior")} /></Card>
          </div>
          <Card padding="sm">
            <div className={styles.studioCardHead}>
              <h4>{tr("Atividade nos últimos 30 dias")}</h4>
              <Button size="sm" variant="secondary">{tr("Tarefas concluídas ▾")}</Button>
            </div>
            <D3Chart
              type="bar"
              title={tr("Atividade nos últimos 30 dias")}
              label={tr("Tarefas concluídas por dia em abril")}
              showTitle={false}
              series={[{ id: "tasks", label: tr("Tarefas concluídas"), data: activity }]}
              colorScale={(value) => (value >= 25 ? "var(--chart-secondary)" : value >= 20 ? "var(--chart-tertiary)" : value >= 15 ? "var(--chart-quaternary)" : "var(--chart-quinary)")}
              height={120}
              legend={false}
              margin={{ top: 6, right: 6, bottom: 20, left: 24 }}
              dataTable="screen-reader"
              xAxis={{ format: (value) => ([1, 5, 10, 15, 20, 25, 30].includes(Number(value)) ? `${value} abr.` : "") }}
              yAxis={{ domain: [0, 30], tickValues: [0, 10, 20, 30] }}
            />
          </Card>
          <Card padding="sm">
            <div className={styles.studioCardHead}>
              <h4>{tr("Projetos recentes")}</h4>
              <Button size="sm" variant="ghost">{tr("Ver todos →")}</Button>
            </div>
            <Table
              caption={tr("Projetos recentes")}
              rowKey={(row) => row.id}
              minTableWidth={480}
              rows={[...projects]}
              columns={[
                { key: "name", header: tr("Nome"), cell: (row) => <span className={styles.studioProject}><span className={row.toneClass}><span className={styles.studioGlyphSmall}>{row.icon}</span></span><span><strong>{row.name}</strong><small>{row.detail}</small></span></span> },
                { key: "status", header: tr("Status"), cell: (row) => <StatusDot tone={row.tone}>{row.status}</StatusDot> },
                { key: "progress", header: tr("Progresso"), cell: (row) => <span className={styles.studioProgress}>{row.progress}%<ProgressBar value={row.progress} aria-label={`Progresso de ${row.name}`} /></span> },
                { key: "team", header: tr("Equipe"), cell: (row) => <AvatarGroup size="xs" max={3} items={[...row.team]} /> },
                { key: "updated", header: tr("Atualizado"), cell: (row) => row.updated },
                { key: "more", header: "", cell: (row) => <IconButton aria-label={`${tr("Mais opções de")} ${row.name}`} icon={icons.more} variant="ghost" size="sm" /> },
              ]}
            />
          </Card>
        </div>
      </AppShell>
      <div className={styles.studioElements} aria-label={tr("Elementos do tema")}>
        <strong>{tr("Elementos do tema")}</strong>
        <span>{tr("Button")}</span>
        <Button size="sm" variant="primary">{tr("Botão principal")}</Button>
        <Button size="sm">{tr("Botão secundário")}</Button>
        <span>{tr("Input")}</span>
        <Input aria-label={tr("Exemplo de campo")} placeholder={tr("Digite algo…")} prefix={icons.search} className={styles.studioInput} />
        <span>{tr("Switch")}</span>
        <Switch label={tr("Ativado")} defaultChecked />
        <Switch label={tr("Desativado")} />
      </div>
    </div>
  );
}
