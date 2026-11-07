import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { D3Chart } from "../Charts";
import { GeoAreaPicker } from "./GeoAreaPicker";
import type { GeoNeighborhood } from "./GeoAreaPicker";

const neighborhoods: GeoNeighborhood[] = [
  { id: "planalto", label: "Planalto", distance: 0 },
  { id: "itapoa", label: "Itapoã", distance: 1.2 },
  { id: "vila-cloris", label: "Vila Clóris", distance: 1.4 },
  { id: "campo-alegre", label: "Campo Alegre", distance: 1.8 },
  { id: "santa-amelia", label: "Santa Amélia", distance: 2.6 },
  { id: "pampulha", label: "Pampulha", distance: 4.1 },
];

// Deliberately synthetic grid, not the geometry or position of any real place.
const syntheticFeatures = {
  type: "FeatureCollection" as const,
  features: neighborhoods.map((item, index) => {
    const x = (index % 3) * 1.1;
    const y = Math.floor(index / 3) * 1.1;
    return {
      type: "Feature" as const,
      id: item.id,
      properties: { name: item.label, value: item.distance },
      geometry: {
        type: "Polygon" as const,
        coordinates: [
          [
            [x, y],
            [x, y + 1],
            [x + 1, y + 1],
            [x + 1, y],
            [x, y],
          ],
        ],
      },
    };
  }),
};

function LocalMap({
  radius,
  includedIds,
  onToggle,
  error,
  notice,
}: {
  radius: number;
  includedIds: string[];
  onToggle: (id: string) => void;
  error: boolean;
  notice: string;
}) {
  const state = (item: GeoNeighborhood) =>
    item.id === "planalto"
      ? "Main, always included"
      : item.distance > radius
        ? "Outside the radius"
        : includedIds.includes(item.id)
          ? "Included in search"
          : "In the radius, not in search";
  return (
    <div>
      <p>
        Simulated map — sample regions and distances. No location service is used.
      </p>
      <D3Chart
        type="geo"
        features={syntheticFeatures}
        title="Sample regions"
        label="Simulated region map; use the arrows to explore and Enter or Space to select"
        height={280}
        legend={false}
        colorScale={(distance) => {
          const item = neighborhoods.find(
            (region) => region.distance === distance,
          )!;
          return item.id === "planalto"
            ? "var(--primary-hover)"
            : item.distance > radius
              ? "var(--surface-2)"
              : includedIds.includes(item.id)
                ? "var(--primary)"
                : "var(--surface-3)";
        }}
        onSelect={(datum) => onToggle(datum.id)}
        tooltip={{
          render: (datum) => {
            const item = neighborhoods.find(
              (region) => region.id === datum.id,
            )!;
            return (
              <>
                <strong>{item.label}</strong>
                <span>
                  {error ? "Selection locked by the error" : state(item)}
                </span>
              </>
            );
          },
        }}
      />
      <p>
        In the table, “Value” is a sample distance in km. Being in the radius does not include a region automatically.
      </p>
      <p role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}

const meta = {
  id: "components-organisms-geoareapicker",
  title: "Components/Organisms/GeoAreaPicker",
  component: GeoAreaPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The map is a slot that adapts to the provider. The DS controls the radius, the neighborhoods reached and separate text lists of included/excluded. Being inside the radius does not automatically include a neighborhood in the ranking. Composes `Range`, `Multiselect`, `Chip`, `SettingRowGroup` and `Callout`.",
      },
    },
  },
  argTypes: {
    neighborhoods: { control: false },
    baseId: { control: false },
    radius: { control: false },
    includedIds: { control: false },
    map: { control: false },
    onRadiusChange: { action: "radius" },
    onIncludedIdsChange: { action: "included" },
    error: { control: "text" },
  },
} satisfies Meta<typeof GeoAreaPicker>;
export default meta;

type Story = StoryObj<typeof GeoAreaPicker>;

function PickerDemo({
  initialRadius = 2,
  initialIncluded = ["itapoa"],
  withMap = true,
  error,
}: {
  initialRadius?: number;
  initialIncluded?: string[];
  withMap?: boolean;
  error?: string;
}) {
  const [radius, setRadius] = useState(initialRadius);
  const [included, setIncluded] = useState(initialIncluded);
  const [notice, setNotice] = useState(
    "Select a region on the map or in the lists.",
  );
  const toggleFromMap = (id: string) => {
    const item = neighborhoods.find((region) => region.id === id);
    if (error)
      return setNotice(
        "Selection kept: fix the error before changing regions.",
      );
    if (!item) return;
    if (id === "planalto")
      return setNotice("Planalto is the main region and stays included.");
    if (item.distance > radius)
      return setNotice(
        `${item.label} is outside the radius. Widen the surroundings to select it.`,
      );
    const selected = included.includes(id);
    setIncluded(
      selected ? included.filter((value) => value !== id) : [...included, id],
    );
    setNotice(
      `${item.label} ${selected ? "removed from" : "added to"} search.`,
    );
  };
  return (
    <div style={{ maxWidth: 1080 }}>
      <GeoAreaPicker
        neighborhoods={neighborhoods}
        baseId="planalto"
        radius={radius}
        onRadiusChange={setRadius}
        includedIds={included}
        onIncludedIdsChange={setIncluded}
        map={
          withMap ? (
            <LocalMap
              radius={radius}
              includedIds={included}
              onToggle={toggleFromMap}
              error={Boolean(error)}
              notice={notice}
            />
          ) : undefined
        }
        mapLabel="Simulated map of sample regions"
        error={error}
      />
    </div>
  );
}

/** Local synthetic map: arrows and Enter/Space select, no external service. */
export const MapaLocal: Story = { name: "Local map", render: () => <PickerDemo /> };

/** The radius redraws the map and immediately updates the neighborhoods reached. */
export const Raio: Story = { name: "Radius", render: () => <PickerDemo /> };

/** Planalto and Itapoã included; neighbors in the radius stay explicitly outside the search. */
export const Incluidos: Story = { name: "Included",
  render: () => <PickerDemo initialIncluded={["itapoa"]} />,
};

/** No neighbor was confirmed: everything reached appears in the outside list. */
export const Excluidos: Story = { name: "Excluded",
  render: () => <PickerDemo initialIncluded={[]} />,
};

/** Without a map provider, the text selection stays fully usable. */
export const SemMapa: Story = { name: "No map", render: () => <PickerDemo withMap={false} /> };

/** Map failure is persistent and blocks changes until it syncs again. */
export const Erro: Story = { name: "Error",
  render: () => (
    <PickerDemo error="The connection to the provider was lost. Your previous selection was kept." />
  ),
};
