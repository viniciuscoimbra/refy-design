"use client";
import { isValidElement, useState } from "react";
import type { SVGProps } from "react";
import { Avatar, Badge, Button, D3Chart, EmptyState, Item, PageHeader, ProgressBar, Segmented } from "../index";
import { neighborhoodFeatureCollection } from "./neighborhoods.geojson";
import { photos } from "./photos";
import styles from "./VisitRouteBlock.module.css";

type Stop = {
  id: string;
  order: number;
  area: string;
  place: string;
  time: string;
  title: string;
  street: string;
  contact: string;
  contactPhoto: string;
  photo: string;
  alt: string;
};

// One stop per neighborhood of the IBGE 2022 mesh of Belo Horizonte, in route order.
const stops: Stop[] = [
  { id: "s1", order: 1, area: "planalto", place: "Planalto", time: "09:00", title: "Balcony with plants", street: "Rua Doutor Cristiano Rezende, 210", contact: "Ana", contactPhoto: photos.personAna, photo: photos.homeBalcony, alt: "Building with balconies full of plants" },
  { id: "s2", order: 2, area: "vila-cloris", place: "Vila Clóris", time: "10:15", title: "Furnished studio", street: "Rua Jornalista Djalma Andrade, 45", contact: "Bruno", contactPhoto: photos.personBruno, photo: photos.homeStudio, alt: "Bright studio with bed and table" },
  { id: "s3", order: 3, area: "itapoa", place: "Itapoã", time: "11:30", title: "Penthouse with terrace", street: "Avenida Portugal, 3900", contact: "Clara", contactPhoto: photos.personClara, photo: photos.homePenthouse, alt: "Penthouse terrace with a view" },
  { id: "s4", order: 4, area: "campo-alegre", place: "Campo Alegre", time: "14:00", title: "Back-facing, no noise", street: "Rua Tenente Garro, 128", contact: "Ana", contactPhoto: photos.personAna, photo: photos.homeQuiet, alt: "Living room with a window onto trees" },
  { id: "s5", order: 5, area: "santa-amelia", place: "Santa Amélia", time: "15:30", title: "House with a backyard", street: "Rua Edna Quintel, 77", contact: "Bruno", contactPhoto: photos.personBruno, photo: photos.homeBalcony, alt: "Balcony with plants" },
];

// The value of each region is its stop number, so the color can follow the stop.
const features = {
  type: "FeatureCollection" as const,
  features: neighborhoodFeatureCollection.features.map((feature) => {
    const stop = stops.find((row) => row.area === feature.properties.id)!;
    return {
      type: "Feature" as const,
      id: stop.area,
      properties: { name: stop.place, value: stop.order },
      geometry: { type: "Polygon" as const, coordinates: feature.geometry.coordinates },
    };
  }),
};

const statusLabel = { visited: "Visited", next: "Next", later: "Scheduled" };
const statusTone = { visited: "success", next: "info", later: "neutral" } as const;

export function VisitRouteBlock() {
  const [visited, setVisited] = useState<string[]>(["s1", "s2"]);
  const [selectedId, setSelectedId] = useState("s3");
  const [filter, setFilter] = useState("all");
  const nextId = stops.find((stop) => !visited.includes(stop.id))?.id;
  const statusOf = (stop: Stop) => (visited.includes(stop.id) ? "visited" : stop.id === nextId ? "next" : "later");
  const selected = stops.find((stop) => stop.id === selectedId)!;
  const shown = stops.filter((stop) => filter === "all" || (filter === "done" ? visited.includes(stop.id) : !visited.includes(stop.id)));
  const toggleVisited = (id: string) => setVisited((rows) => (rows.includes(id) ? rows.filter((row) => row !== id) : [...rows, id]));
  const progress = Math.round((visited.length / stops.length) * 100);

  const map = (
    <D3Chart
      type="geo"
      features={features}
      title="Visit route"
      label="Route map. Use the arrow keys to move between neighborhoods and Enter to open the stop."
      height={380}
      legend={false}
      showTitle={false}
      dataTable="screen-reader"
      colorScale={(value) => {
        const stop = stops.find((row) => row.order === value)!;
        const status = statusOf(stop);
        if (status === "visited") return "var(--surface-container-high)";
        if (status === "next") return "var(--primary)";
        return "var(--primary-soft)";
      }}
      onSelect={(datum) => setSelectedId(stops.find((stop) => stop.area === datum.id)!.id)}
      renderOverlay={({ scene }) => (
        <g className={styles.overlay} aria-hidden="true">
          {scene.marks.map((mark) => {
            const stop = stops.find((row) => row.area === mark.id)!;
            if (stop.id !== selectedId || !isValidElement<SVGProps<SVGPathElement>>(mark.element)) return null;
            return <path key="outline" className={styles.outline} d={mark.element.props.d} data-selected={stop.area} />;
          })}
          {scene.marks.map((mark) => {
            const stop = stops.find((row) => row.area === mark.id)!;
            return (
              <g key={mark.id} className={styles.pin} transform={`translate(${mark.x ?? 0} ${mark.y ?? 0})`} data-status={statusOf(stop)} data-on={stop.id === selectedId || undefined}>
                <circle r={13} />
                <text>{stop.order}</text>
              </g>
            );
          })}
        </g>
      )}
      tooltip={{
        render: (datum) => {
          const stop = stops.find((row) => row.area === datum.id)!;
          return (
            <span className={styles.tip}>
              <strong>{stop.order}. {stop.place}</strong>
              <span>
                {stop.time} · {statusLabel[statusOf(stop)]}
              </span>
            </span>
          );
        },
      }}
    />
  );

  return (
    <div className={styles.page}>
      <PageHeader title="Today's visit route" lead="Five homes, one per neighborhood. Pick a stop on the map or in the list to see the home and mark the visit." />
      <div className={styles.layout}>
        <section className={styles.mapCard} aria-label="Route map">
          {map}
          <ul className={styles.legend} aria-label="Legend">
            <li data-status="visited">Visited</li>
            <li data-status="next">Next</li>
            <li data-status="later">Scheduled</li>
          </ul>
        </section>
        <article className={styles.detail} aria-label="Selected stop">
          <img src={selected.photo} alt={selected.alt} />
          <div className={styles.detailBody}>
            <Badge tone={statusTone[statusOf(selected)]}>{statusLabel[statusOf(selected)]}</Badge>
            <h2>
              {selected.order}. {selected.title}
            </h2>
            <p>
              {selected.street} · {selected.place}
            </p>
            <p className={styles.contact}>
              <Avatar src={selected.contactPhoto} alt="" size="sm" />
              <span>
                {selected.time} with {selected.contact}
              </span>
            </p>
            <Button variant={visited.includes(selected.id) ? "secondary" : "primary"} onClick={() => toggleVisited(selected.id)}>
              {visited.includes(selected.id) ? "Undo visit" : "Mark as visited"}
            </Button>
          </div>
        </article>
        <aside className={styles.aside} aria-label="Stops">
          <div className={styles.progress}>
            <p>
              <strong>{visited.length}</strong> of {stops.length} visits done
            </p>
            <ProgressBar value={progress} aria-label="Visits done" />
          </div>
          <Segmented
            label="Show"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "todo", label: "To visit" },
              { value: "done", label: "Done" },
            ]}
          />
          {shown.length ? (
            <ul className={styles.list}>
              {shown.map((stop) => (
                <li key={stop.id}>
                  <Item
                    title={stop.title}
                    description={
                      <>
                        {stop.place} · {stop.time}
                      </>
                    }
                    media={
                      <span className={styles.number} data-status={statusOf(stop)} aria-hidden="true">
                        {stop.order}
                      </span>
                    }
                    actions={<Badge tone={statusTone[statusOf(stop)]}>{statusLabel[statusOf(stop)]}</Badge>}
                    onClick={() => setSelectedId(stop.id)}
                    selected={stop.id === selectedId}
                  />
                </li>
              ))}
            </ul>
          ) : (
            filter === "done" ? (
              <EmptyState title="No visits done yet" message="Mark a visit as done and it shows up here." />
            ) : (
              <EmptyState title="Route complete" message="Every home on today's route was visited." />
            )
          )}
        </aside>
      </div>
    </div>
  );
}
