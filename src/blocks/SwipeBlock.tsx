"use client";
import { useState } from "react";
import { Badge, Button, EmptyState, Item, PageHeader, SwipeDeck } from "../index";
import type { PropertyAction, SwipeDeckItem } from "../index";
import { photos } from "./photos";
import styles from "./SwipeBlock.module.css";

const homes: SwipeDeckItem[] = [
  { id: "pinheiros", title: "Apartment with balcony", subtitle: "Pinheiros, São Paulo", price: "R$ 4.200", priceSuffix: "/mo", matchScore: 92, media: [{ src: photos.homeBalcony, alt: "Living room with balcony and plants" }], badges: [{ label: "Pets allowed", tone: "success" }], facts: [{ label: "Bedrooms", value: "2" }, { label: "Area", value: "68 m²" }, { label: "Parking spot", value: "1" }], summary: "Morning sun, open kitchen and the subway 6 minutes away." },
  { id: "botafogo", title: "Studio near the beach", subtitle: "Botafogo, Rio de Janeiro", price: "R$ 3.100", priceSuffix: "/mo", matchScore: 84, media: [{ src: photos.homeStudio, alt: "Bright furnished studio" }], badges: [{ label: "Furnished", tone: "info" }], facts: [{ label: "Bedrooms", value: "1" }, { label: "Area", value: "38 m²" }, { label: "Parking spot", value: "No" }], summary: "Furnished, 24-hour doorman and the beach a 10-minute walk away." },
  { id: "savassi", title: "Penthouse with terrace", subtitle: "Savassi, Belo Horizonte", price: "R$ 5.800", priceSuffix: "/mo", matchScore: 77, media: [{ src: photos.homePenthouse, alt: "Penthouse terrace with a view" }], badges: [{ label: "New", tone: "info" }], facts: [{ label: "Bedrooms", value: "3" }, { label: "Area", value: "120 m²" }, { label: "Parking spots", value: "2" }], summary: "Terrace with a grill and a view of the Serra do Curral." },
  { id: "moinhos", title: "Quiet apartment", subtitle: "Moinhos de Vento, Porto Alegre", price: "R$ 3.600", priceSuffix: "/mo", matchScore: 71, media: [{ src: photos.homeQuiet, alt: "Living room with a window onto trees" }], badges: [{ label: "Pets allowed", tone: "success" }], facts: [{ label: "Bedrooms", value: "2" }, { label: "Area", value: "74 m²" }, { label: "Parking spot", value: "1" }], summary: "Tree-lined street, quiet back side and a park two blocks away." },
];

export function SwipeBlock() {
  const [index, setIndex] = useState(0),
    [saved, setSaved] = useState<SwipeDeckItem[]>([]),
    [visits, setVisits] = useState<SwipeDeckItem[]>([]);
  const decide = (action: PropertyAction, item: SwipeDeckItem) => {
    if (action === "save") setSaved((rows) => [...rows, item]);
    if (action === "visit") setVisits((rows) => [...rows, item]);
  };
  const list = (title: string, rows: SwipeDeckItem[], empty: string) => (
    <section className={styles.list} aria-label={title}>
      <h2>
        {title} <Badge>{rows.length}</Badge>
      </h2>
      {rows.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        <ul className={styles.rows}>
          {rows.map((row) => (
            <li key={row.id}>
              <Item
                title={String(row.title)}
                description={`${row.subtitle} · ${row.price}${row.priceSuffix}`}
                media={<img className={styles.thumb} src={row.media[0]?.src} alt="" />}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
  return (
    <div className={styles.page}>
      <PageHeader title="Find your apartment" lead="Four options for today, from best match to worst." />
      <div className={styles.layout}>
        <div className={styles.deck}>
          {index < homes.length ? (
            <SwipeDeck title="Apartments for you" instructions="hidden" items={homes} index={index} onIndexChange={setIndex} onAction={decide} />
          ) : (
            <EmptyState bordered title="You've seen them all for today" message={`${visits.length} to visit and ${saved.length} saved.`} action={<Button onClick={() => setIndex(0)}>See again</Button>} />
          )}
        </div>
        <aside className={styles.aside}>
          <section className={styles.list} aria-label="Your search">
            <h2>Your search</h2>
            <div className={styles.filters}>
              <Badge>Up to R$ 6,000</Badge>
              <Badge>1 bedroom or more</Badge>
              <Badge>Near the subway</Badge>
              <Badge tone="success">Pets allowed</Badge>
            </div>
          </section>
          {list("To visit", visits, "The apartments you select show up here.")}
          {list("Saved", saved, "Save to decide later without losing them.")}
        </aside>
      </div>
    </div>
  );
}
