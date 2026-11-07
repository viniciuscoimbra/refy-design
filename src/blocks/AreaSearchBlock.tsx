"use client";
import { useState } from "react";
import { D3Chart, GeoAreaPicker, PageHeader, PropertyCard, Segmented, useLocale } from "../index";
import type { GeoNeighborhood } from "../index";
import { neighborhoodFeatureCollection } from "./neighborhoods.geojson";
import { photos } from "./photos";
import styles from "./AreaSearchBlock.module.css";

const base = "planalto";
const neighborhoods: GeoNeighborhood[] = [
  { id: "planalto", label: "Planalto", distance: 0 },
  { id: "itapoa", label: "Itapoã", distance: 1.2 },
  { id: "vila-cloris", label: "Vila Clóris", distance: 1.4 },
  { id: "campo-alegre", label: "Campo Alegre", distance: 1.8 },
  { id: "santa-amelia", label: "Santa Amélia", distance: 2.6 },
];

// Malha de Bairros 2022 do IBGE, Belo Horizonte. O valor de cada região é a distância até o Planalto.
const features = {
  type: "FeatureCollection" as const,
  features: neighborhoodFeatureCollection.features.map((feature) => {
    const item = neighborhoods.find((row) => row.id === feature.properties.id)!;
    return {
      type: "Feature" as const,
      id: item.id,
      properties: { name: item.label, value: item.distance },
      geometry: { type: "Polygon" as const, coordinates: feature.geometry.coordinates },
    };
  }),
};

const homes = [
  { id: "a1", area: "planalto", title: "Balcony with plants", value: "R$ 2.900", photo: photos.homeBalcony, alt: "Living room with balcony and plants", rooms: "2", size: "68 m²", badge: "Pets allowed" },
  { id: "a2", area: "planalto", title: "Furnished studio", value: "R$ 1.850", photo: photos.homeStudio, alt: "Bright studio with bed and table", rooms: "1", size: "36 m²", badge: "Furnished" },
  { id: "a3", area: "itapoa", title: "Penthouse with terrace", value: "R$ 4.300", photo: photos.homePenthouse, alt: "Penthouse terrace with a view", rooms: "3", size: "120 m²", badge: "Terrace" },
  { id: "a4", area: "campo-alegre", title: "Back-facing, no noise", value: "R$ 2.400", photo: photos.homeQuiet, alt: "Living room with a window onto trees", rooms: "2", size: "72 m²", badge: "Quiet" },
  { id: "a5", area: "santa-amelia", title: "House with a backyard", value: "R$ 3.200", photo: photos.homeBalcony, alt: "Balcony with plants", rooms: "3", size: "140 m²", badge: "Backyard" },
];

export function AreaSearchBlock() {
  const locale = useLocale();
  const [radius, setRadius] = useState(2);
  const [included, setIncluded] = useState<string[]>(["itapoa"]);
  const [order, setOrder] = useState("near");
  const reached = (id: string) => (neighborhoods.find((row) => row.id === id)?.distance ?? 99) <= radius;
  const inSearch = (id: string) => id === base || (reached(id) && included.includes(id));
  const toggle = (id: string) => {
    if (id === base || !reached(id)) return;
    setIncluded((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]));
  };
  const distance = (id: string) => neighborhoods.find((row) => row.id === id)!.distance;
  const results = homes
    .filter((home) => inSearch(home.area))
    .sort((a, b) =>
      order === "near" ? distance(a.area) - distance(b.area) : Number(a.value.replace(/\D/g, "")) - Number(b.value.replace(/\D/g, "")),
    );
  const map = (
    <D3Chart
      type="geo"
      features={features}
      title="Neighborhoods around Planalto"
      label="Neighborhood map. Use the arrow keys to move and Enter to add or remove from the search."
      height={380}
      legend={false}
      showTitle={false}
      dataTable="screen-reader"
      renderOverlay={({ scene }) => (
        <g className={styles.mapLabels} aria-hidden="true">
          {scene.marks.map((mark) => (
            <text key={mark.id} x={mark.x} y={mark.y} data-on={inSearch(mark.id) || undefined}>
              {mark.datum.label}
            </text>
          ))}
        </g>
      )}
      colorScale={(value) => {
        const item = neighborhoods.find((row) => row.distance === value)!;
        if (item.id === base) return "var(--primary-hover)";
        if (item.distance > radius) return "var(--line)";
        return included.includes(item.id) ? "var(--primary)" : "var(--primary-soft)";
      }}
      onSelect={(datum) => toggle(datum.id)}
      tooltip={{
        render: (datum) => {
          const item = neighborhoods.find((row) => row.id === datum.id)!;
          return (
            <>
              <strong>{item.label}</strong>
              <span>
                {item.id === base
                  ? "Main neighborhood"
                  : item.distance > radius
                    ? `Outside the radius, ${item.distance.toLocaleString(locale)} km away`
                    : inSearch(item.id)
                      ? "In your search"
                      : "In the radius, not in search"}
              </span>
            </>
          );
        },
      }}
    />
  );
  return (
    <div className={styles.page}>
      <PageHeader title="Where do you want to live" lead="Start with Planalto and choose which neighbors join the search. Tap a neighborhood to add or remove it." />
      <GeoAreaPicker
        neighborhoods={neighborhoods}
        baseId={base}
        radius={radius}
        maxRadius={4}
        onRadiusChange={setRadius}
        includedIds={included}
        onIncludedIdsChange={setIncluded}
        map={map}
        mapLabel="Map of Belo Horizonte neighborhoods around Planalto"
      />
      <section className={styles.results} aria-label="Homes in your search">
        <header className={styles.resultsHead}>
          <h2>
            {results.length} {results.length === 1 ? "home" : "homes"} in your search
          </h2>
          <Segmented
            label="Sort"
            value={order}
            onChange={setOrder}
            options={[
              { value: "near", label: "Closest" },
              { value: "price", label: "Lowest rent" },
            ]}
          />
        </header>
        <ul className={styles.grid}>
          {results.map((home) => (
            <li key={home.id}>
              <PropertyCard
                layout="grid"
                title={home.title}
                subtitle={`${neighborhoods.find((row) => row.id === home.area)!.label} · ${distance(home.area) === 0 ? "in the main neighborhood" : `${distance(home.area).toLocaleString(locale)} km`}`}
                value={home.value}
                valueSuffix="/mo"
                media={[{ src: home.photo, alt: home.alt }]}
                badges={[{ label: home.badge }]}
                facts={[
                  { label: "Bedrooms", value: home.rooms },
                  { label: "Area", value: home.size },
                ]}
                actions={false}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
