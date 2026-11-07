"use client";
import {
  AreaChart,
  AvatarGroup,
  Badge,
  Button,
  Card,
  PageHeader,
  Stat,
  Table,
} from "../index";
import { useState } from "react";
import styles from "./blocks.module.css";
export interface DashboardProject {
  id: string;
  name: string;
  state: string;
  owner?: string;
  due?: string;
}
export const dashboardProjects: DashboardProject[] = [
  { id: "aurora", name: "Aurora project", state: "In progress", owner: "Ana Lima", due: "Nov 14" },
  { id: "horizonte", name: "Horizon project", state: "In review", owner: "Bruno Reis", due: "Nov 9" },
  { id: "origin", name: "Origin project", state: "Planned", owner: "Clara Dias", due: "Dec 2" },
  { id: "tide", name: "Tide project", state: "In progress", owner: "Clara Dias", due: "Nov 21" },
];
const monthDelta = "+1 this month";
const stateTone = (state: string) =>
  state === "Completed" ? "success" : state === "In review" ? "warn" : state === "In progress" ? "info" : "neutral";
export interface DashboardBlockProps {
  /** Hide the page title when a surrounding page already shows it. */
  showHeader?: boolean;
  /** Controlled list; without it the block keeps its own copy. */
  projects?: DashboardProject[];
  onProjectsChange?: (projects: DashboardProject[]) => void;
}
export function DashboardBlock({
  showHeader = true,
  projects: controlled,
  onProjectsChange,
}: DashboardBlockProps = {}) {
  const [own, setOwn] = useState(dashboardProjects);
  const projects = controlled ?? own;
  const setProjects = (update: (rows: DashboardProject[]) => DashboardProject[]) => {
    const next = update(projects);
    if (!controlled) setOwn(next);
    onProjectsChange?.(next);
  };
  return (
    <section className={styles.stack} aria-label="Projects dashboard">
      {showHeader && (
        <PageHeader
          title="Overview"
          lead="The team's projects, materials and activity."
        />
      )}
      <div className={styles.kpis}>
        <Card>
          <Stat label="Active projects" value={projects.filter((row) => row.state !== "Completed").length} delta={{ value: monthDelta, trend: "up" }} />
        </Card>
        <Card>
          <Stat label="In review" value={projects.filter((row) => row.state === "In review").length} description="Awaiting approval" />
        </Card>
        <Card>
          <Stat label="Completed" value={projects.filter((row) => row.state === "Completed").length} description="This quarter" />
        </Card>
      </div>
      <div className={styles.chartPanel}>
        <AreaChart
          title="Team deliveries"
          label="Deliveries completed per month"
          data={[12, 18, 15, 24, 28, 36]}
          xLabels={["May", "Jun", "Jul", "Aug", "Sep", "Oct"]}
        />
      </div>
      <Card className={styles.projects}>
        <div className={styles.projectsHeader}>
          <h3>Team projects</h3>
          <AvatarGroup
            items={[
              { name: "Ana Lima" },
              { name: "Bruno Reis" },
              { name: "Clara Dias" },
            ]}
          />
        </div>
        <Table
          caption="Team projects"
          rows={projects}
          rowKey={(row) => row.id}
          searchable
          columns={[
            {
              key: "name",
              header: "Project",
              sortable: true,
              cell: (row) => row.name,
            },
            {
              key: "owner",
              header: "Owner",
              cell: (row) => row.owner ?? "No owner",
            },
            {
              key: "due",
              header: "Delivery",
              cell: (row) => row.due ?? "No date",
            },
            {
              key: "state",
              header: "State",
              cell: (row) => (
                <Badge tone={stateTone(row.state)} dot>
                  {row.state}
                </Badge>
              ),
            },
            {
              key: "action",
              header: "",
              cell: (row) => (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Complete ${row.name}`}
                  disabled={row.state === "Completed"}
                  onClick={() =>
                    setProjects((rows) =>
                      rows.map((item) =>
                        item.id === row.id
                          ? { ...item, state: "Completed" }
                          : item,
                      ),
                    )
                  }
                >
                  {row.state === "Completed" ? "Completed" : "Complete"}
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </section>
  );
}
