import { D3Chart } from "./D3Chart";
import type { D3ChartProps } from "./D3Chart";
import { ChartExplorer } from "../../blocks/ChartExplorer";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AreaChart,
  BarChart,
  DonutChart,
  LineChart,
  Sparkline,
} from "./Charts";

/**
 * Charts: geometria D3, renderização React/SVG e identidade por tokens.
 */
const meta = {
  id: "components-organisms-charts",
  title: "Components/Organisms/Charts",
  component: LineChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Choose by the data: **LineChart** for change over time; **BarChart** to compare one measure across categories; **DonutChart** for parts of one total; **Sparkline** for a compact trend. Do not turn absence, failure or status into a series: show those states as an alert outside the chart. All of them use titles, units, accessibility and colors through tokens.",
      },
    },
  },
  argTypes: {
    data: { control: false },
    xLabels: { control: false },
    formatY: { control: false },
    label: { control: "text" },
    area: { control: "boolean" },
    max: { control: "number" },
  },
} satisfies Meta<typeof LineChart>;
export default meta;

type Story = StoryObj<typeof LineChart>;

const traffic = [
  3200, 3600, 3400, 4800, 5200, 6100, 6800, 7400, 8600, 8900, 10200, 11400,
];

/** Line chart with area: organic traffic over 90 days. */
export const Line: Story = {
  name: "LineChart",
  args: {
    title: "Organic traffic",
    data: traffic,
    xLabels: ["Aug", "Sep", "Oct", "Today"],
    pointLabels: [
      "Wk 1",
      "Wk 2",
      "Wk 3",
      "Wk 4",
      "Wk 5",
      "Wk 6",
      "Wk 7",
      "Wk 8",
      "Wk 9",
      "Wk 10",
      "Wk 11",
      "Wk 12",
    ],
    formatY: (v: number) => `${(v / 1000).toFixed(1)}k`,
    yTitle: "Visits/month",
    xTitle: "Last 90 days",
    label: "Organic traffic (90 days)",
  },
  render: (args) => (
    <div style={{ maxWidth: 680 }}>
      <LineChart {...args} />
    </div>
  ),
};

/** Two series with a legend: you × project. */
export const MultiSerie: Story = {
  name: "LineChart · 2 series",
  args: { data: traffic, label: "You × project" },
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <LineChart
        title="Traffic compared"
        label="Traffic: you × project"
        series={[
          { name: "refy.com.br", data: traffic, tone: "primary" },
          {
            name: "aurora.example.com",
            data: [
              5200, 5400, 5600, 5300, 5800, 6200, 6100, 6600, 7000, 6800, 7400,
              7800,
            ],
            tone: "info",
          },
        ]}
        xLabels={["Aug", "Sep", "Oct", "Today"]}
        formatY={(v: number) => `${(v / 1000).toFixed(1)}k`}
        yTitle="Visits/month"
      />
    </div>
  ),
};

/** Bars with a value axis (rulers + measures + unit). */
export const Bar: Story = {
  name: "BarChart",
  args: { data: [], label: "Issues by category" },
  render: () => (
    <div style={{ maxWidth: 680 }}>
      <BarChart
        title="Occurrences by category"
        label="Issues by category"
        valueTitle="Issues abertas"
        items={[
          { label: "Content", value: 320 },
          { label: "Links", value: 220, tone: "info" },
          { label: "Performance", value: 180, tone: "warn" },
          { label: "Schema", value: 120 },
          { label: "Mobile", value: 60, tone: "critical" },
        ]}
      />
    </div>
  ),
};

/** Progress ring with a central value. */
export const Donut: Story = {
  name: "DonutChart · progress",
  args: { data: [], label: "Completion rate" },
  render: () => (
    <DonutChart
      value={74}
      caption="Completion rate"
      label="Completion rate"
    />
  ),
};

/** Distribution in segments with semantic tones. */
export const DonutSegmentos: Story = {
  name: "DonutChart · segments",
  args: { data: [], label: "Issues by severity" },
  render: () => (
    <DonutChart
      label="Issues by severity"
      centerLabel="128"
      caption="Issues"
      segments={[
        { value: 34, tone: "critical", label: "Critical" },
        { value: 52, tone: "warn", label: "Medium" },
        { value: 28, tone: "primary", label: "Resolved" },
        { value: 14, tone: "muted", label: "Ignored" },
      ]}
      formatValue={(v) => `${v} issues`}
    />
  ),
};

/** Mini trends for table cells and cards. */
export const Sparklines: Story = {
  name: "Sparkline",
  args: { data: [], label: "Trend" },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Sparkline
        data={[4, 6, 5, 8, 7, 11, 9, 13]}
        label="Traffic trend (rising)"
      />
      <Sparkline
        data={[13, 10, 11, 9, 6, 7, 4, 2]}
        tone="bad"
        label="Position trend (falling)"
      />
      <Sparkline
        data={[5, 6, 8, 7, 10, 9, 11, 12]}
        label="Keyword trend"
      />
    </div>
  ),
};

/** The four visualizations share the same identity. */
export const VisaoGeral: Story = {
  name: "All charts",
  args: { data: traffic, label: "Visits over time" },
  render: (args) => (
    <div style={{ display: "grid", gap: 28, maxWidth: 680 }}>
      <LineChart {...args} title="Visits over time" />
      <BarChart
        title="Deliveries by team"
        label="Deliveries by team"
        items={[
          { label: "Creative", value: 24 },
          { label: "Content", value: 18, tone: "info" },
          { label: "Product", value: 30 },
        ]}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 32,
        }}
      >
        <DonutChart value={74} caption="Completed" label="Cycle completion" />
        <Sparkline data={[4, 6, 5, 8, 7, 11]} label="Delivery trend" />
      </div>
    </div>
  ),
};

export const Explorador = { name: "Explorer", render: () => <ChartExplorer /> };

/** Area to compare a series' volume over the period. */
export const Area: Story = {
  name: "Area",
  args: {
    data: traffic,
    label: "Visits over time",
    title: "Visits in the period",
  },
  render: (args) => <AreaChart {...args} />,
};

const exampleD3Line: D3ChartProps = {
  type: "line",
  title: "Visits by device",
  label: "Visits from January to June",
  series: [
    {
      id: "desktop",
      label: "Desktop",
      data: [
        {
          x: "Jan",
          y: 186,
        },
        {
          x: "Feb",
          y: 305,
        },
        {
          x: "Mar",
          y: 237,
        },
        {
          x: "Apr",
          y: 73,
        },
        {
          x: "May",
          y: 209,
        },
        {
          x: "Jun",
          y: 214,
        },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      data: [
        {
          x: "Jan",
          y: 80,
        },
        {
          x: "Feb",
          y: 200,
        },
        {
          x: "Mar",
          y: 120,
        },
        {
          x: "Apr",
          y: 190,
        },
        {
          x: "May",
          y: 130,
        },
        {
          x: "Jun",
          y: 140,
        },
      ],
    },
  ],
  curve: "natural",
  dots: true,
};
/** Two series over time. Curves and points are configurable. */
export const D3Line: StoryObj<typeof D3Chart> = {
  name: "D3 · Lines",
  render: () => <D3Chart {...exampleD3Line} />,
};

const exampleD3Area: D3ChartProps = {
  type: "area",
  title: "Visits by device",
  label: "Visits area by device",
  series: [
    {
      id: "desktop",
      label: "Desktop",
      data: [
        {
          x: "Jan",
          y: 186,
        },
        {
          x: "Feb",
          y: 305,
        },
        {
          x: "Mar",
          y: 237,
        },
        {
          x: "Apr",
          y: 73,
        },
        {
          x: "May",
          y: 209,
        },
        {
          x: "Jun",
          y: 214,
        },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      data: [
        {
          x: "Jan",
          y: 80,
        },
        {
          x: "Feb",
          y: 200,
        },
        {
          x: "Mar",
          y: 120,
        },
        {
          x: "Apr",
          y: 190,
        },
        {
          x: "May",
          y: 130,
        },
        {
          x: "Jun",
          y: 140,
        },
      ],
    },
  ],
  stacked: true,
  curve: "natural",
};
/** Accumulated volume, stacked in absolute or percent terms. */
export const D3Area: StoryObj<typeof D3Chart> = {
  name: "D3 · Areas",
  render: () => <D3Chart {...exampleD3Area} />,
};

const exampleD3Bar: D3ChartProps = {
  type: "bar",
  title: "Visits by device",
  label: "Monthly visits comparison",
  series: [
    {
      id: "desktop",
      label: "Desktop",
      data: [
        {
          x: "Jan",
          y: 186,
        },
        {
          x: "Feb",
          y: 305,
        },
        {
          x: "Mar",
          y: 237,
        },
        {
          x: "Apr",
          y: 73,
        },
        {
          x: "May",
          y: 209,
        },
        {
          x: "Jun",
          y: 214,
        },
      ],
    },
    {
      id: "mobile",
      label: "Mobile",
      data: [
        {
          x: "Jan",
          y: 80,
        },
        {
          x: "Feb",
          y: 200,
        },
        {
          x: "Mar",
          y: 120,
        },
        {
          x: "Apr",
          y: 190,
        },
        {
          x: "May",
          y: 130,
        },
        {
          x: "Jun",
          y: 140,
        },
      ],
    },
  ],
};
/** Compare categories with grouped, stacked or horizontal bars. */
export const D3Bar: StoryObj<typeof D3Chart> = {
  name: "D3 · Bars",
  render: () => <D3Chart {...exampleD3Bar} />,
};

const exampleD3Scatter: D3ChartProps = {
  type: "scatter",
  title: "Time and quality",
  label: "Time versus quality",
  series: [
    {
      id: "sample",
      label: "Samples",
      data: [
        {
          x: 12,
          y: 34,
        },
        {
          x: 18,
          y: 48,
        },
        {
          x: 24,
          y: 41,
        },
        {
          x: 31,
          y: 72,
        },
        {
          x: 38,
          y: 65,
        },
        {
          x: 44,
          y: 88,
        },
        {
          x: 52,
          y: 79,
        },
      ],
    },
  ],
  xAxis: {
    title: "Time (min)",
  },
  yAxis: {
    title: "Quality",
  },
};
/** Relation between two numeric variables. */
export const D3Scatter: StoryObj<typeof D3Chart> = {
  name: "D3 · Scatter",
  render: () => <D3Chart {...exampleD3Scatter} />,
};

const exampleD3Bubble: D3ChartProps = {
  type: "bubble",
  title: "Time, quality and volume",
  label: "Scatter with volume per bubble",
  series: [
    {
      id: "sample",
      label: "Samples",
      data: [
        {
          x: 12,
          y: 34,
          size: 20,
        },
        {
          x: 18,
          y: 48,
          size: 35,
        },
        {
          x: 24,
          y: 41,
          size: 12,
        },
        {
          x: 31,
          y: 72,
          size: 50,
        },
        {
          x: 38,
          y: 65,
          size: 28,
        },
        {
          x: 44,
          y: 88,
          size: 40,
        },
      ],
    },
  ],
};
/** A third variable sets the bubble area. */
export const D3Bubble: StoryObj<typeof D3Chart> = {
  name: "D3 · Bubbles",
  render: () => <D3Chart {...exampleD3Bubble} />,
};

const exampleD3Histogram: D3ChartProps = {
  type: "histogram",
  title: "Reading time",
  label: "Reading time distribution",
  values: [
    18, 22, 24, 24, 28, 31, 32, 33, 34, 35, 35, 37, 39, 42, 44, 48, 52, 58, 64,
    72,
  ],
  thresholds: 8,
  xAxis: {
    title: "Minutes",
  },
  yAxis: {
    title: "Frequency",
  },
};
/** D3 computes bins and frequencies from the observations. */
export const D3Histogram: StoryObj<typeof D3Chart> = {
  name: "D3 · Histogram",
  render: () => <D3Chart {...exampleD3Histogram} />,
};

const exampleD3Boxplot: D3ChartProps = {
  type: "boxplot",
  title: "Time by group",
  label: "Distribution by group",
  groups: [
    {
      id: "a",
      label: "Group A",
      values: [
        18, 22, 24, 24, 28, 31, 32, 33, 34, 35, 35, 37, 39, 42, 44, 48, 52, 58,
        64, 72,
      ],
    },
    {
      id: "b",
      label: "Group B",
      values: [
        24.6, 27.4, 28.799999999999997, 28.799999999999997, 31.599999999999998,
        33.7, 34.4, 35.099999999999994, 35.8, 36.5, 36.5, 37.9, 39.3, 41.4,
        42.8, 45.599999999999994, 48.4, 52.599999999999994, 56.8, 62.4,
      ],
    },
    {
      id: "c",
      label: "Group C",
      values: [14, 18, 19, 21, 24, 27, 30, 32, 34, 38, 95],
    },
  ],
};
/** Median, quartiles, 1.5 IQR limits and outliers. */
export const D3Boxplot: StoryObj<typeof D3Chart> = {
  name: "D3 · Boxplot",
  render: () => <D3Chart {...exampleD3Boxplot} />,
};

const exampleD3Candlestick: D3ChartProps = {
  type: "candlestick",
  title: "Change by period",
  label: "Open and close by period",
  series: [
    {
      id: "price",
      label: "Quote",
      data: [
        {
          x: "Mon",
          y: 28,
          open: 22,
          close: 28,
          low: 20,
          high: 31,
        },
        {
          x: "Tue",
          y: 24,
          open: 28,
          close: 24,
          low: 22,
          high: 33,
        },
        {
          x: "Wed",
          y: 32,
          open: 24,
          close: 32,
          low: 23,
          high: 35,
        },
        {
          x: "Thu",
          y: 30,
          open: 32,
          close: 30,
          low: 27,
          high: 36,
        },
        {
          x: "Fri",
          y: 36,
          open: 30,
          close: 36,
          low: 28,
          high: 39,
        },
      ],
    },
  ],
};
/** Open, close, low and high. A hollow body means a drop. */
export const D3Candlestick: StoryObj<typeof D3Chart> = {
  name: "D3 · Candlestick",
  render: () => <D3Chart {...exampleD3Candlestick} />,
};

const exampleD3Heatmap: D3ChartProps = {
  type: "heatmap",
  title: "Activity by day",
  label: "Activity by day and time of day",
  cells: [
    {
      x: "Mon",
      y: "Morning",
      value: 12,
    },
    {
      x: "Mon",
      y: "Afternoon",
      value: 38,
    },
    {
      x: "Mon",
      y: "Night",
      value: 24,
    },
    {
      x: "Tue",
      y: "Morning",
      value: 62,
    },
    {
      x: "Tue",
      y: "Afternoon",
      value: 48,
    },
    {
      x: "Tue",
      y: "Night",
      value: 27,
    },
    {
      x: "Wed",
      y: "Morning",
      value: 74,
    },
    {
      x: "Wed",
      y: "Afternoon",
      value: 51,
    },
    {
      x: "Wed",
      y: "Night",
      value: 33,
    },
    {
      x: "Thu",
      y: "Morning",
      value: 41,
    },
    {
      x: "Thu",
      y: "Afternoon",
      value: 81,
    },
    {
      x: "Thu",
      y: "Night",
      value: 22,
    },
    {
      x: "Fri",
      y: "Morning",
      value: 58,
    },
    {
      x: "Fri",
      y: "Afternoon",
      value: 67,
    },
    {
      x: "Fri",
      y: "Night",
      value: 19,
    },
  ],
};
/** Intensity across two categories; values are available in the tooltip and the table. */
export const D3Heatmap: StoryObj<typeof D3Chart> = {
  name: "D3 · Heat map",
  render: () => <D3Chart {...exampleD3Heatmap} />,
};

const exampleD3Pie: D3ChartProps = {
  type: "pie",
  title: "Visit sources",
  label: "Share by source",
  items: [
    {
      id: "search",
      label: "Search",
      value: 420,
    },
    {
      id: "direct",
      label: "Direct",
      value: 280,
    },
    {
      id: "referral",
      label: "References",
      value: 190,
    },
    {
      id: "other",
      label: "Other",
      value: 110,
    },
  ],
};
/** Categories with angular geometry computed by D3. */
export const D3Pie: StoryObj<typeof D3Chart> = {
  name: "D3 · Pie",
  render: () => <D3Chart {...exampleD3Pie} />,
};

const exampleD3Donut: D3ChartProps = {
  type: "donut",
  title: "Visit sources",
  label: "Share by source",
  items: [
    {
      id: "search",
      label: "Search",
      value: 420,
    },
    {
      id: "direct",
      label: "Direct",
      value: 280,
    },
    {
      id: "referral",
      label: "References",
      value: 190,
    },
    {
      id: "other",
      label: "Other",
      value: 110,
    },
  ],
};
/** Categories with angular geometry computed by D3. */
export const D3Donut: StoryObj<typeof D3Chart> = {
  name: "D3 · Donut",
  render: () => <D3Chart {...exampleD3Donut} />,
};

const exampleD3RadialBar: D3ChartProps = {
  type: "radial-bar",
  title: "Visit sources",
  label: "Share by source",
  items: [
    {
      id: "search",
      label: "Search",
      value: 420,
    },
    {
      id: "direct",
      label: "Direct",
      value: 280,
    },
    {
      id: "referral",
      label: "References",
      value: 190,
    },
    {
      id: "other",
      label: "Other",
      value: 110,
    },
  ],
};
/** Categories with angular geometry computed by D3. */
export const D3RadialBar: StoryObj<typeof D3Chart> = {
  name: "D3 · Radial bars",
  render: () => <D3Chart {...exampleD3RadialBar} />,
};

const exampleD3Gauge: D3ChartProps = {
  type: "gauge",
  title: "Reading goal",
  label: "Reading goal:72 of100",
  items: [
    {
      id: "goal",
      label: "Meta",
      value: 72,
    },
  ],
  max: 100,
};
/** Progress of an indicator with an explicit maximum. */
export const D3Gauge: StoryObj<typeof D3Chart> = {
  name: "D3 · Gauge",
  render: () => <D3Chart {...exampleD3Gauge} />,
};

const exampleD3Radar: D3ChartProps = {
  type: "radar",
  title: "Usage profile",
  label: "Profile comparison by dimension",
  max: 100,
  series: [
    {
      id: "a",
      label: "Profile A",
      data: [
        {
          x: "Reading",
          y: 85,
        },
        {
          x: "Search",
          y: 65,
        },
        {
          x: "Creative",
          y: 72,
        },
        {
          x: "Review",
          y: 91,
        },
        {
          x: "Sharing",
          y: 58,
        },
      ],
    },
    {
      id: "b",
      label: "Profile B",
      data: [
        {
          x: "Reading",
          y: 58,
        },
        {
          x: "Search",
          y: 87,
        },
        {
          x: "Creative",
          y: 91,
        },
        {
          x: "Review",
          y: 62,
        },
        {
          x: "Sharing",
          y: 78,
        },
      ],
    },
  ],
};
/** Profiles on equivalent dimensions, on a common scale. */
export const D3Radar: StoryObj<typeof D3Chart> = {
  name: "D3 · Radar",
  render: () => <D3Chart {...exampleD3Radar} />,
};

const exampleD3Treemap: D3ChartProps = {
  type: "treemap",
  title: "Collection structure",
  label: "Collection hierarchy",
  root: {
    id: "root",
    name: "Archive",
    children: [
      {
        id: "content",
        name: "Content",
        children: [
          {
            id: "articles",
            name: "Articles",
            value: 42,
          },
          {
            id: "guides",
            name: "Guides",
            value: 28,
          },
        ],
      },
      {
        id: "media",
        name: "Media",
        children: [
          {
            id: "images",
            name: "Images",
            value: 32,
          },
          {
            id: "videos",
            name: "Videos",
            value: 18,
          },
        ],
      },
    ],
  },
};
/** Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations. */
export const D3Treemap: StoryObj<typeof D3Chart> = {
  name: "D3 · Treemap",
  render: () => <D3Chart {...exampleD3Treemap} />,
};

const exampleD3Pack: D3ChartProps = {
  type: "pack",
  title: "Collection structure",
  label: "Collection hierarchy",
  root: {
    id: "root",
    name: "Archive",
    children: [
      {
        id: "content",
        name: "Content",
        children: [
          {
            id: "articles",
            name: "Articles",
            value: 42,
          },
          {
            id: "guides",
            name: "Guides",
            value: 28,
          },
        ],
      },
      {
        id: "media",
        name: "Media",
        children: [
          {
            id: "images",
            name: "Images",
            value: 32,
          },
          {
            id: "videos",
            name: "Videos",
            value: 18,
          },
        ],
      },
    ],
  },
};
/** Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations. */
export const D3Pack: StoryObj<typeof D3Chart> = {
  name: "D3 · Circle packing",
  render: () => <D3Chart {...exampleD3Pack} />,
};

const exampleD3Tree: D3ChartProps = {
  type: "tree",
  title: "Collection structure",
  label: "Collection hierarchy",
  root: {
    id: "root",
    name: "Archive",
    children: [
      {
        id: "content",
        name: "Content",
        children: [
          {
            id: "articles",
            name: "Articles",
            value: 42,
          },
          {
            id: "guides",
            name: "Guides",
            value: 28,
          },
        ],
      },
      {
        id: "media",
        name: "Media",
        children: [
          {
            id: "images",
            name: "Images",
            value: 32,
          },
          {
            id: "videos",
            name: "Videos",
            value: 18,
          },
        ],
      },
    ],
  },
};
/** Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations. */
export const D3Tree: StoryObj<typeof D3Chart> = {
  name: "D3 · Tree",
  render: () => <D3Chart {...exampleD3Tree} />,
};

const exampleD3Cluster: D3ChartProps = {
  type: "cluster",
  title: "Collection structure",
  label: "Collection hierarchy",
  root: {
    id: "root",
    name: "Archive",
    children: [
      {
        id: "content",
        name: "Content",
        children: [
          {
            id: "articles",
            name: "Articles",
            value: 42,
          },
          {
            id: "guides",
            name: "Guides",
            value: 28,
          },
        ],
      },
      {
        id: "media",
        name: "Media",
        children: [
          {
            id: "images",
            name: "Images",
            value: 32,
          },
          {
            id: "videos",
            name: "Videos",
            value: 18,
          },
        ],
      },
    ],
  },
};
/** Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations. */
export const D3Cluster: StoryObj<typeof D3Chart> = {
  name: "D3 · Dendrogram",
  render: () => <D3Chart {...exampleD3Cluster} />,
};

const exampleD3Partition: D3ChartProps = {
  type: "partition",
  title: "Collection structure",
  label: "Collection hierarchy",
  root: {
    id: "root",
    name: "Archive",
    children: [
      {
        id: "content",
        name: "Content",
        children: [
          {
            id: "articles",
            name: "Articles",
            value: 42,
          },
          {
            id: "guides",
            name: "Guides",
            value: 28,
          },
        ],
      },
      {
        id: "media",
        name: "Media",
        children: [
          {
            id: "images",
            name: "Images",
            value: 32,
          },
          {
            id: "videos",
            name: "Videos",
            value: 18,
          },
        ],
      },
    ],
  },
};
/** Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations. */
export const D3Partition: StoryObj<typeof D3Chart> = {
  name: "D3 · Partition",
  render: () => <D3Chart {...exampleD3Partition} />,
};

const exampleD3Sunburst: D3ChartProps = {
  type: "sunburst",
  title: "Collection structure",
  label: "Collection hierarchy",
  root: {
    id: "root",
    name: "Archive",
    children: [
      {
        id: "content",
        name: "Content",
        children: [
          {
            id: "articles",
            name: "Articles",
            value: 42,
          },
          {
            id: "guides",
            name: "Guides",
            value: 28,
          },
        ],
      },
      {
        id: "media",
        name: "Media",
        children: [
          {
            id: "images",
            name: "Images",
            value: 32,
          },
          {
            id: "videos",
            name: "Videos",
            value: 18,
          },
        ],
      },
    ],
  },
};
/** Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations. */
export const D3Sunburst: StoryObj<typeof D3Chart> = {
  name: "D3 · Sunburst",
  render: () => <D3Chart {...exampleD3Sunburst} />,
};

const exampleD3Network: D3ChartProps = {
  type: "network",
  title: "Entry journey",
  label: "Links between sources, site and destinations",
  network: {
    nodes: [
      {
        id: "search",
        label: "Search",
      },
      {
        id: "social",
        label: "Social",
      },
      {
        id: "site",
        label: "Site",
      },
      {
        id: "signup",
        label: "Sign-up",
      },
      {
        id: "return",
        label: "Return",
      },
    ],
    links: [
      {
        source: "search",
        target: "site",
        value: 120,
      },
      {
        source: "social",
        target: "site",
        value: 80,
      },
      {
        source: "site",
        target: "signup",
        value: 110,
      },
      {
        source: "site",
        target: "return",
        value: 90,
      },
    ],
  },
};
/** Relations between nodes, laid out by D3 forces. */
export const D3Network: StoryObj<typeof D3Chart> = {
  name: "D3 · Network",
  render: () => <D3Chart {...exampleD3Network} />,
};

const exampleD3Chord: D3ChartProps = {
  type: "chord",
  title: "Entry journey",
  label: "Links between sources, site and destinations",
  network: {
    nodes: [
      {
        id: "search",
        label: "Search",
      },
      {
        id: "social",
        label: "Social",
      },
      {
        id: "site",
        label: "Site",
      },
      {
        id: "signup",
        label: "Sign-up",
      },
      {
        id: "return",
        label: "Return",
      },
    ],
    links: [
      {
        source: "search",
        target: "site",
        value: 120,
      },
      {
        source: "social",
        target: "site",
        value: 80,
      },
      {
        source: "site",
        target: "signup",
        value: 110,
      },
      {
        source: "site",
        target: "return",
        value: 90,
      },
    ],
  },
};
/** Directed exchanges between groups, arranged in a circle. */
export const D3Chord: StoryObj<typeof D3Chart> = {
  name: "D3 · Chords",
  render: () => <D3Chart {...exampleD3Chord} />,
};

const exampleD3Sankey: D3ChartProps = {
  type: "sankey",
  title: "Entry journey",
  label: "Links between sources, site and destinations",
  network: {
    nodes: [
      {
        id: "search",
        label: "Search",
      },
      {
        id: "social",
        label: "Social",
      },
      {
        id: "site",
        label: "Site",
      },
      {
        id: "signup",
        label: "Sign-up",
      },
      {
        id: "return",
        label: "Return",
      },
    ],
    links: [
      {
        source: "search",
        target: "site",
        value: 120,
      },
      {
        source: "social",
        target: "site",
        value: 80,
      },
      {
        source: "site",
        target: "signup",
        value: 110,
      },
      {
        source: "site",
        target: "return",
        value: 90,
      },
    ],
  },
};
/** Directed flows with no cycles, with thickness proportional to value. */
export const D3Sankey: StoryObj<typeof D3Chart> = {
  name: "D3 · Sankey",
  render: () => <D3Chart {...exampleD3Sankey} />,
};

const exampleD3Geo: D3ChartProps = {
  type: "geo",
  title: "Regional distribution",
  label: "Values across sample geographic regions",
  projection: "mercator",
  features: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "a",
        properties: {
          name: "Region A",
          value: 84,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-70, -10],
              [-60, -10],
              [-60, -20],
              [-70, -20],
              [-70, -10],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "b",
        properties: {
          name: "Region B",
          value: 52,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-59, -10],
              [-49, -10],
              [-49, -20],
              [-59, -20],
              [-59, -10],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "c",
        properties: {
          name: "Region C",
          value: 31,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-59, -21],
              [-49, -21],
              [-49, -31],
              [-59, -31],
              [-59, -21],
            ],
          ],
        },
      },
    ],
  },
};
/** The consumer's local GeoJSON, with no map fetched from the network. Demo regions, not official borders. */
export const D3Geo: StoryObj<typeof D3Chart> = {
  name: "D3 · Geographic map",
  render: () => <D3Chart {...exampleD3Geo} />,
};

/** Zoom recomputes the axis; the brush bounds the window with the mouse or with Range from the keyboard. */
export const Exploracao: StoryObj<typeof D3Chart> = {
  name: "D3 · Zoom and brush",
  render: () => <D3Chart {...exampleD3Line} zoom brush />,
};
