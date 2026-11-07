import type {
  D3ChartProps,
  ChartSeries,
  ChartNode,
  ChartNetwork,
} from "../components/Charts/D3Chart";
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const series: ChartSeries[] = [
  {
    id: "desktop",
    label: "Desktop",
    data: [186, 305, 237, 73, 209, 214].map((y, i) => ({ x: months[i], y })),
  },
  {
    id: "mobile",
    label: "Mobile",
    data: [80, 200, 120, 190, 130, 140].map((y, i) => ({ x: months[i], y })),
  },
];
const items = [
  { id: "search", label: "Search", value: 420 },
  { id: "direct", label: "Direct", value: 280 },
  { id: "referral", label: "References", value: 190 },
  { id: "other", label: "Other", value: 110 },
];
const root: ChartNode = {
  id: "root",
  name: "Archive",
  children: [
    {
      id: "content",
      name: "Content",
      children: [
        { id: "articles", name: "Articles", value: 42 },
        { id: "guides", name: "Guides", value: 28 },
      ],
    },
    {
      id: "media",
      name: "Media",
      children: [
        { id: "images", name: "Images", value: 32 },
        { id: "videos", name: "Videos", value: 18 },
      ],
    },
  ],
};
const network: ChartNetwork = {
  nodes: [
    { id: "search", label: "Search" },
    { id: "social", label: "Social" },
    { id: "site", label: "Site" },
    { id: "signup", label: "Sign-up" },
    { id: "return", label: "Return" },
  ],
  links: [
    { source: "search", target: "site", value: 120 },
    { source: "social", target: "site", value: 80 },
    { source: "site", target: "signup", value: 110 },
    { source: "site", target: "return", value: 90 },
  ],
};
const samples = [
  18, 22, 24, 24, 28, 31, 32, 33, 34, 35, 35, 37, 39, 42, 44, 48, 52, 58, 64,
  72,
];
export const chartExamples: {
  id: D3ChartProps["type"];
  name: string;
  group: string;
  description: string;
  props: D3ChartProps;
}[] = [
  {
    id: "line",
    name: "Lines",
    group: "Comparison and trend",
    description: "Two series over time. Curves and points are configurable.",
    props: {
      type: "line",
      title: "Visits by device",
      label: "Visits from January to June",
      series,
      curve: "natural",
      dots: true,
    },
  },
  {
    id: "area",
    name: "Areas",
    group: "Comparison and trend",
    description: "Accumulated volume, stacked in absolute or percent terms.",
    props: {
      type: "area",
      title: "Visits by device",
      label: "Visits area by device",
      series,
      stacked: true,
      curve: "natural",
    },
  },
  {
    id: "bar",
    name: "Bars",
    group: "Comparison and trend",
    description:
      "Compare categories with grouped, stacked or horizontal bars.",
    props: {
      type: "bar",
      title: "Visits by device",
      label: "Monthly visits comparison",
      series,
    },
  },
  {
    id: "scatter",
    name: "Scatter",
    group: "Distributions",
    description: "Relation between two numeric variables.",
    props: {
      type: "scatter",
      title: "Time and quality",
      label: "Time versus quality",
      series: [
        {
          id: "sample",
          label: "Samples",
          data: [
            { x: 12, y: 34 },
            { x: 18, y: 48 },
            { x: 24, y: 41 },
            { x: 31, y: 72 },
            { x: 38, y: 65 },
            { x: 44, y: 88 },
            { x: 52, y: 79 },
          ],
        },
      ],
      xAxis: { title: "Time (min)" },
      yAxis: { title: "Quality" },
    },
  },
  {
    id: "bubble",
    name: "Bubbles",
    group: "Distributions",
    description: "A third variable sets the bubble area.",
    props: {
      type: "bubble",
      title: "Time, quality and volume",
      label: "Scatter with volume per bubble",
      series: [
        {
          id: "sample",
          label: "Samples",
          data: [
            { x: 12, y: 34, size: 20 },
            { x: 18, y: 48, size: 35 },
            { x: 24, y: 41, size: 12 },
            { x: 31, y: 72, size: 50 },
            { x: 38, y: 65, size: 28 },
            { x: 44, y: 88, size: 40 },
          ],
        },
      ],
    },
  },
  {
    id: "histogram",
    name: "Histogram",
    group: "Distributions",
    description:
      "D3 computes bins and frequencies from the observations.",
    props: {
      type: "histogram",
      title: "Reading time",
      label: "Reading time distribution",
      values: samples,
      thresholds: 8,
      xAxis: { title: "Minutes" },
      yAxis: { title: "Frequency" },
    },
  },
  {
    id: "boxplot",
    name: "Boxplot",
    group: "Distributions",
    description: "Median, quartiles, 1.5 IQR whiskers and outliers.",
    props: {
      type: "boxplot",
      title: "Time by group",
      label: "Distribution by group",
      groups: [
        { id: "a", label: "Group A", values: samples },
        { id: "b", label: "Group B", values: samples.map((v) => v * 0.7 + 12) },
        {
          id: "c",
          label: "Group C",
          values: [14, 18, 19, 21, 24, 27, 30, 32, 34, 38, 95],
        },
      ],
    },
  },
  {
    id: "candlestick",
    name: "Candlestick",
    group: "Comparison and trend",
    description:
      "Open, close, low and high. A hollow body means a drop.",
    props: {
      type: "candlestick",
      title: "Change by period",
      label: "Open and close by period",
      series: [
        {
          id: "price",
          label: "Quote",
          data: [
            { x: "Mon", y: 28, open: 22, close: 28, low: 20, high: 31 },
            { x: "Tue", y: 24, open: 28, close: 24, low: 22, high: 33 },
            { x: "Wed", y: 32, open: 24, close: 32, low: 23, high: 35 },
            { x: "Thu", y: 30, open: 32, close: 30, low: 27, high: 36 },
            { x: "Fri", y: 36, open: 30, close: 36, low: 28, high: 39 },
          ],
        },
      ],
    },
  },
  {
    id: "heatmap",
    name: "Heat map",
    group: "Distributions",
    description:
      "Intensity across two categories; values are available in the tooltip and the table.",
    props: {
      type: "heatmap",
      title: "Activity by day",
      label: "Activity by day and time of day",
      cells: ["Mon", "Tue", "Wed", "Thu", "Fri"].flatMap((x, i) =>
        ["Morning", "Afternoon", "Night"].map((y, j) => ({
          x,
          y,
          value: [12, 38, 24, 62, 48, 27, 74, 51, 33, 41, 81, 22, 58, 67, 19][
            i * 3 + j
          ],
        })),
      ),
    },
  },
  ...(["pie", "donut", "radial-bar", "gauge"] as const).map((type) => ({
    id: type,
    name: {
      pie: "Pie",
      donut: "Donut",
      "radial-bar": "Radial bars",
      gauge: "Gauge",
    }[type],
    group: "Radial",
    description:
      type === "gauge"
        ? "Progress of an indicator with an explicit maximum."
        : "Categories with angular geometry computed by D3.",
    props: {
      type,
      title: type === "gauge" ? "Reading goal" : "Visit sources",
      label:
        type === "gauge"
          ? "Reading goal:72 of 100"
          : "Share by source",
      items:
        type === "gauge" ? [{ id: "goal", label: "Meta", value: 72 }] : items,
      ...(type === "gauge" ? { max: 100 } : {}),
    },
  })),
  {
    id: "radar",
    name: "Radar",
    group: "Radial",
    description: "Profiles on equivalent dimensions, on a common scale.",
    props: {
      type: "radar",
      title: "Usage profile",
      label: "Profile comparison by dimension",
      max: 100,
      series: [
        {
          id: "a",
          label: "Profile A",
          data: ["Reading", "Search", "Creative", "Review", "Sharing"].map(
            (x, i) => ({ x, y: [85, 65, 72, 91, 58][i] }),
          ),
        },
        {
          id: "b",
          label: "Profile B",
          data: ["Reading", "Search", "Creative", "Review", "Sharing"].map(
            (x, i) => ({ x, y: [58, 87, 91, 62, 78][i] }),
          ),
        },
      ],
    },
  },
  ...(
    ["treemap", "pack", "tree", "cluster", "partition", "sunburst"] as const
  ).map((type) => ({
    id: type,
    name: {
      treemap: "Treemap",
      pack: "Circle packing",
      tree: "Tree",
      cluster: "Dendrogram",
      partition: "Partition",
      sunburst: "Sunburst",
    }[type],
    group: "Hierarchies",
    description:
      "Parent/child structure. Area and proportion use the leaf values; tree and dendrogram show relations.",
    props: {
      type,
      title: "Collection structure",
      label: "Collection hierarchy",
      root,
    },
  })),
  ...(["network", "chord", "sankey"] as const).map((type) => ({
    id: type,
    name: { network: "Network", chord: "Chords", sankey: "Sankey" }[type],
    group: "Relations and flows",
    description:
      type === "sankey"
        ? "Directed flows with no cycles, with thickness proportional to value."
        : type === "chord"
          ? "Directed exchanges between groups, arranged in a circle."
          : "Relations between nodes, laid out by D3 forces.",
    props: {
      type,
      title: "Entry journey",
      label: "Links between sources, site and destinations",
      network,
    },
  })),
  {
    id: "geo",
    name: "Geographic map",
    group: "Geography",
    description:
      "The consumer's local GeoJSON, with no map fetched from the network. Demo regions, not official borders.",
    props: {
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
            properties: { name: "Region A", value: 84 },
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
            properties: { name: "Region B", value: 52 },
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
            properties: { name: "Region C", value: 31 },
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
    },
  },
];
