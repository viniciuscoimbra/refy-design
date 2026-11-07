"use client";
import { useState } from "react";
import {
  AreaChart,
  BarChart,
  Button,
  DonutChart,
  LineChart,
  Segmented,
  Select,
  Sparkline,
  Switch,
  useLocale,
} from "../index";
import styles from "./blocks.module.css";
const labels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const visits = [186, 305, 237, 273, 209, 314, 390, 450, 370, 520, 600, 680];
const downloads = [80, 200, 120, 190, 130, 210, 240, 280, 200, 300, 390, 420];
export function ChartExplorer() {
  const locale = useLocale();
  const [kind, setKind] = useState("area"),
    [period, setPeriod] = useState("all"),
    [curve, setCurve] = useState<"smooth" | "linear" | "step">("smooth"),
    [stacked, setStacked] = useState(false),
    [empty, setEmpty] = useState(false);
  const count = period === "quarter" ? 3 : period === "semester" ? 6 : 12;
  const data = empty ? [] : visits.slice(-count),
    secondary = empty ? [] : downloads.slice(-count),
    ticks = empty ? [] : labels.slice(-count);
  const series = [
    { name: "Views", data, tone: "primary" as const },
    { name: "Downloads", data: secondary, tone: "info" as const },
  ];
  return (
    <section className={styles.stack} aria-label="Chart explorer">
      <Segmented
        label="Chart type"
        value={kind}
        onChange={setKind}
        options={[
          { value: "area", label: "Area" },
          { value: "line", label: "Line" },
          { value: "bar", label: "Bars" },
          { value: "donut", label: "Distribution" },
          { value: "spark", label: "Trend" },
        ]}
      />
      <div className={styles.chartPanel}>
        <header className={styles.chartHeader}>
          <div>
            <h3>Library activity</h3>
            <p>Views and downloads over the period.</p>
          </div>
          <Select
            label="Chart period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="quarter">Last 3 months</option>
            <option value="semester">Last 6 months</option>
            <option value="all">Last 12 months</option>
          </Select>
        </header>
        {kind === "area" ? (
          <AreaChart
            title="Views and downloads"
            showTitle={false}
            label="Library activity"
            series={series}
            xLabels={ticks}
            pointLabels={ticks}
            curve={curve}
            stacked={stacked}
            showLegend
          />
        ) : kind === "line" ? (
          <LineChart
            title="Views and downloads"
            showTitle={false}
            label="Library activity"
            series={series}
            xLabels={ticks}
            pointLabels={ticks}
            curve={curve}
            area={false}
            showLegend
          />
        ) : kind === "bar" ? (
          <BarChart
            title="Views per month"
            showTitle={false}
            label="Views per month"
            items={data.map((value, index) => ({ label: ticks[index], value }))}
          />
        ) : kind === "donut" ? (
          empty ? (
            <p role="status">No data for this period.</p>
          ) : (
            <DonutChart
              label="Activity distribution"
              caption="Interactions"
              centerLabel={(
                data.reduce((a, b) => a + b, 0) +
                secondary.reduce((a, b) => a + b, 0)
              ).toLocaleString(locale)}
              segments={[
                {
                  label: "Views",
                  value: data.reduce((a, b) => a + b, 0),
                  tone: "primary",
                },
                {
                  label: "Downloads",
                  value: secondary.reduce((a, b) => a + b, 0),
                  tone: "info",
                },
              ]}
            />
          )
        ) : (
          <div>
            <Sparkline
              label="Views trend"
              data={data}
              width={220}
              height={64}
            />
            <p className={styles.meta}>
              Lookups: {data.join(", ") || "no data"}
            </p>
          </div>
        )}
        {(kind === "area" || kind === "line") && (
          <div className={styles.controls}>
            <Select
              label="Stroke"
              value={curve}
              onChange={(event) => setCurve(event.target.value as typeof curve)}
            >
              <option value="smooth">Smooth</option>
              <option value="linear">Linear</option>
              <option value="step">Steps</option>
            </Select>
            {kind === "area" && (
              <Switch
                label="Stack series"
                checked={stacked}
                onChange={(event) => setStacked(event.target.checked)}
              />
            )}
          </div>
        )}
        <footer className={styles.header}>
          <span className={styles.meta}>
            Local sample data. Pick series in the legend and use the keyboard on the chart.
          </span>
          <Button size="sm" variant="ghost" onClick={() => setEmpty(!empty)}>
            {empty ? "Reset data" : "Simulate no data"}
          </Button>
        </footer>
      </div>
    </section>
  );
}
