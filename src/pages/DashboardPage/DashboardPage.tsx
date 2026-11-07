import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { Modal, Input, Command, ToastRegion } from "../../index";
import { Card, CardHeader } from "../../components/Card";
import { ProgressBar } from "../../components/ProgressBar";
import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { SplitButton } from "../../components/SplitButton";
import { IconButton } from "../../components/IconButton";
import { Avatar } from "../../components/Avatar";
import { Icons } from "../../_demo/icons";
import styles from "./DashboardPage.module.css";

/**
 * Tela real (Visão geral) composta EXCLUSIVAMENTE de componentes do @refy-design/web.
 * Nenhum estilo de componente é redefinido aqui — o CSS local trata só do
 * arranjo (grid, espaçamento). É o teste de fogo do design system.
 */
export function DashboardPage() {
  const [creating, setCreating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  const [projects, setProjects] = useState([
    { name: "Projeto Aurora", url: "example.com/projeto-a", score: 84, tone: "primary" as const, badge: "Bom", bt: "success" as const },
    { name: "Projeto Horizonte", url: "example.com/projeto-b", score: 71, tone: "warn" as const, badge: "Atenção", bt: "warn" as const },
    { name: "Projeto Origem", url: "example.com/projeto-c", score: 40, tone: "critical" as const, badge: "Crítico", bt: "danger" as const },
  ]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault(); setSearching(true);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  function exportProjects(format: "csv" | "json") {
    const text = format === "json" ? JSON.stringify(projects, null, 2) :
      ["Projeto,Progresso,Status", ...projects.map(project => [project.name, project.score, project.badge].map(value => {
        const safe = String(value).replace(/^[=+@\-\t\r]/, "'$&");
        return `"${safe.replace(/"/g, '""')}"`;
      }).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: format === "json" ? "application/json" : "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `projetos.${format}`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
    <AppShell
      responsiveSidebar
      sidebar={{
        activeId: "dashboard",
        workspace: { name: "Equipe Exemplo", role: "Workspace · Pro", initials: "GE" },
        account: { name: "João Mendes", email: "joao@example.com", initials: "JM" },
        cta: { label: "Novo projeto", icon: Icons.plus, onClick: () => setCreating(true) },
        onNavigate: (item) => {
          if (item.id === "projects") setSearching(true);
          else if (item.id !== "dashboard") setNotice(`${item.label}: esta composição demonstra a navegação; conecte sua rota no projeto.`);
        },
        groups: [
          {
            section: "Trabalho",
            items: [
              { id: "dashboard", label: "Visão geral", icon: Icons.dashboard },
              { id: "projects", label: "Projetos", icon: Icons.projects },
              { id: "backlog", label: "Tarefas", icon: Icons.backlog, badge: 12 },
              { id: "monitor", label: "Atividades", icon: Icons.monitor },
              { id: "competitors", label: "Arquivos", icon: Icons.competitors },
            ],
          },
          {
            section: "Sistema",
            items: [
              { id: "notifications", label: "Notificações", icon: Icons.bell, badge: 3 },
              { id: "settings", label: "Configurações", icon: Icons.settings },
            ],
          },
        ],
      }}
      topbar={{
        crumbs: [{ label: "Equipe Exemplo", onClick: () => setSearching(true) }, { label: "Visão geral" }],
        searchPlaceholder: "Buscar projetos…",
        onSearchClick: () => setSearching(true),
        actions: (
          <>
            <IconButton aria-label="Notificações" icon={Icons.bell} onClick={() => setNotice("Você está em dia. Nenhuma nova notificação.")} />
            <IconButton aria-label="Ajuda" icon={Icons.help} onClick={() => setNotice("Crie um projeto, encontre-o na busca e exporte a lista. Os dados ficam nesta demonstração.")} />
            <Avatar size="md" initials="JM" style={{ marginLeft: 4 }} />
          </>
        ),
      }}
    >
      {/* Header da página */}
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Workspace · última atualização há 14min</p>
          <h1 className={styles.h1}>Visão geral</h1>
          <p className={styles.sub}>
            {projects.length} projetos · <span className={styles.mono}>2.451</span> atividades concluídas neste ciclo ·{" "}
            <span className={styles.mono}>8</span> tarefas pendentes
          </p>
        </div>
        <div className={styles.headActions}>
          <SplitButton
            label="Exportar"
            leadingIcon={Icons.download}
            options={[
              { label: "CSV", hint: ".csv", onSelect: () => exportProjects("csv") },
              { label: "JSON", hint: ".json", onSelect: () => exportProjects("json") },
            ]}
          />
          <Button variant="primary" leadingIcon={Icons.plus} onClick={() => setCreating(true)}>
            Criar projeto
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className={styles.kpis}>
        {[
          { label: "Progresso médio", value: "78", tone: "primary" as const, pct: 78, foot: "+4 vs. ciclo anterior" },
          { label: "Pendências", value: "3", tone: "critical" as const, pct: 30, foot: "em 2 projetos" },
          { label: "Conclusão do ciclo", value: "64%", tone: "warn" as const, pct: 64, foot: "12 tarefas concluídas" },
        ].map((k) => (
          <Card key={k.label} elevation={1}>
            <p className={styles.kpiLabel}>{k.label}</p>
            <p className={styles.kpiValue}>{k.value}</p>
            <ProgressBar value={k.pct} tone={k.tone} size="sm" />
            <p className={styles.kpiFoot}>{k.foot}</p>
          </Card>
        ))}
      </div>

      {/* Duas colunas: projetos + uso */}
      <div className={styles.cols}>
        <Card>
          <CardHeader
            title="Projetos"
            count={`${projects.length} ativos`}
            action={<Button variant="ghost" size="sm" onClick={() => setSearching(true)}>Encontrar</Button>}
          />
          <div className={styles.projList}>
            {projects.map((p, index) => (
              <div key={index} className={styles.projRow}>
                <Avatar size="md" initials={p.name.slice(0, 2)} style={{ borderRadius: 7 }} />
                <div className={styles.projInfo}>
                  <div className={styles.projName}>{p.name}</div>
                  <div className={styles.projUrl}>{p.url}</div>
                </div>
                <div className={styles.projScore}>
                  <span className={styles.mono}>{p.score}</span>
                  <ProgressBar value={p.score} tone={p.tone} size="sm" />
                </div>
                <Badge tone={p.bt}>{p.badge}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Uso este ciclo"
            action={<Button variant="ghost" size="sm" onClick={() => setNotice("Ciclo de exemplo: os limites de uso e indicadores são dados ilustrativos.")}>Detalhes</Button>}
          />
          <div className={styles.usage}>
            {[
              { label: "Atividades do ciclo", val: "2.451 / 5.000", pct: 49, tone: "primary" as const },
              { label: "Projetos em andamento", val: "18 / 40", pct: 45, tone: "primary" as const },
              { label: "Revisões concluídas", val: "6 / 10", pct: 60, tone: "warn" as const },
            ].map((u) => (
              <div key={u.label}>
                <div className={styles.usageMeta}>
                  <span>{u.label}</span>
                  <b className={styles.mono}>{u.val}</b>
                </div>
                <ProgressBar value={u.pct} tone={u.tone} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
    <Modal open={creating} onClose={() => setCreating(false)} title="Criar projeto">
      <form className={styles.createForm} onSubmit={event => {
        event.preventDefault();
        if (!name.trim()) return;
        setProjects(items => [...items, { name: name.trim(), url: "Rascunho · somente nesta sessão", score: 0, tone: "primary", badge: "Novo", bt: "success" }]);
        setNotice(`Projeto ${name.trim()} criado nesta demonstração.`); setName(""); setCreating(false);
      }}>
        <Input label="Nome do projeto" value={name} onChange={event => setName(event.target.value)} required maxLength={120} block />
        <div className={styles.headActions}><Button type="button" onClick={() => setCreating(false)}>Cancelar</Button><Button type="submit" variant="primary">Criar</Button></div>
      </form>
    </Modal>
    <Command open={searching} onOpenChange={setSearching} placeholder="Buscar projetos…" items={projects.map((project, index) => ({ id: String(index), label: project.name, group: "Projetos" }))} onSelect={item => { setSearching(false); setNotice(`${item.label}: ${projects[Number(item.id)].score}% concluído.`); }} />
    <ToastRegion toasts={notice ? [{ id: "dashboard", title: notice, duration: null }] : []} onDismiss={() => setNotice("")} />
    </>
  );
}
