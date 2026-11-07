"use client";
import { useEffect, useRef, useState } from "react";
import { Badge, IntentComposer, Item, Message, MessageScroller, PropertyCard } from "../index";
import type { IntentFilterGroup } from "../index";
import { photos } from "./photos";
import styles from "./AssistantSearchBlock.module.css";

type Home = { id: string; title: string; area: string; rent: number; rooms: number; size: string; pet: boolean; furnished: boolean; metro: boolean; photo: string; alt: string };
type Criteria = { rooms?: number; max?: number; pet?: boolean; furnished?: boolean; metro?: boolean };
type Turn = { id: string; mine: boolean; time: string; text: string };

const homes: Home[] = [
  { id: "pinheiros", title: "Balcony with plants", area: "Pinheiros", rent: 3400, rooms: 2, size: "68 m²", pet: true, furnished: false, metro: true, photo: photos.homeBalcony, alt: "Building with balconies full of plants" },
  { id: "vila-madalena", title: "Furnished studio", area: "Vila Madalena", rent: 2300, rooms: 1, size: "36 m²", pet: false, furnished: true, metro: true, photo: photos.homeStudio, alt: "Bright studio with sofa and rug" },
  { id: "perdizes", title: "Back-facing, no noise", area: "Perdizes", rent: 3100, rooms: 2, size: "72 m²", pet: true, furnished: false, metro: false, photo: photos.homeQuiet, alt: "Living room with a window onto trees" },
  { id: "jardins", title: "Penthouse with terrace", area: "Jardins", rent: 6200, rooms: 3, size: "120 m²", pet: true, furnished: true, metro: true, photo: photos.homePenthouse, alt: "Penthouse terrace with a view" },
];

const filters: IntentFilterGroup[] = [
  { id: "deal", label: "I want to", mode: "single", options: [{ value: "rent", label: "Rent" }, { value: "buy", label: "Buy", disabled: true }] },
];

const brl = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`;

// Local, deterministic reading of the request; in a real app this function calls your model.
// It understands English, Portuguese and Spanish, the languages the refy site renders this template in.
const numbers: Record<string, number> = { one: 1, two: 2, three: 3, um: 1, uma: 1, dois: 2, duas: 2, "três": 3, tres: 3, uno: 1, una: 1, dos: 2 };
function read(text: string, previous: Criteria): Criteria {
  const next = { ...previous };
  const lower = text.toLowerCase();
  const rooms = lower.match(/(\d|one|two|three|um|uma|dois|duas|três|tres|uno|una|dos)\s+(?:bedrooms?|rooms?|quartos?|dormitorios?|habitaciones?)/);
  if (rooms) next.rooms = numbers[rooms[1]] ?? Number(rooms[1]);
  const max = lower.match(/(?:up to|max(?:imum)?|até|ate|máximo|maximo|hasta)\s*(?:r\$)?\s*([\d.,]+)\s*(k|mil)?/);
  if (max) next.max = Number(max[1].replace(/[.,]/g, "")) * (max[2] ? 1000 : 1);
  if (/pet|dog|cat|cachorr|gat|perr|mascota/.test(lower)) next.pet = !/no pets?|without (?:a )?pet|sem pet|não tenho pet|sin mascota|no tengo mascota/.test(lower);
  if (/furnish|mobiliad|amueblad/.test(lower)) next.furnished = !/unfurnish|sem mob|não precisa.*mobil|sin muebles/.test(lower);
  if (/subway|metro|metrô/.test(lower)) next.metro = true;
  return next;
}

const matches = (home: Home, c: Criteria) =>
  (!c.rooms || home.rooms >= c.rooms) && (!c.max || home.rent <= c.max) && (!c.pet || home.pet) && (!c.furnished || home.furnished) && (!c.metro || home.metro);

function chips(c: Criteria) {
  return [
    c.rooms && `${c.rooms}+ bedroom${c.rooms > 1 ? "s" : ""}`,
    c.max && `Up to ${brl(c.max)}`,
    c.pet && "Pets allowed",
    c.furnished && "Furnished",
    c.metro && "Near the subway",
  ].filter(Boolean) as string[];
}

function answer(found: Home[], c: Criteria) {
  if (!chips(c).length) return "Tell me what matters: bedrooms, max rent, pets, subway or furniture.";
  if (!found.length) return `No home with ${chips(c).join(", ").toLowerCase()}. Raise the cap or drop a criterion and I'll search again.`;
  const first = found[0];
  if (found.length === 1) return `Only one matches everything: ${first.title.toLowerCase()} in ${first.area}, for ${brl(first.rent)}.`;
  return `Found ${found.length} ${found.length === 1 ? "option" : "options"}. The cheapest is ${first.title.toLowerCase()} in ${first.area}, for ${brl(first.rent)}.`;
}

const start: Criteria = { rooms: 2, max: 3500, pet: true };
const history: Turn[] = [
  { id: "t1", mine: true, time: "09:12", text: "I'm looking for two bedrooms up to 3,500." },
  { id: "t2", mine: false, time: "09:12", text: "Found 2, one in Pinheiros and one in Perdizes. The cheaper one is in Perdizes, at R$ 3,100." },
  { id: "t3", mine: true, time: "09:13", text: "I have a dog, so it needs to allow pets." },
  { id: "t4", mine: false, time: "09:13", text: "Both allow pets. The one in Perdizes faces the trees at the back and is one block from the square." },
];

export function AssistantSearchBlock() {
  const [turns, setTurns] = useState(history);
  const [criteria, setCriteria] = useState<Criteria>(start);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [deal, setDeal] = useState<Record<string, string[]>>({ deal: ["rent"] });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const found = homes.filter((home) => matches(home, criteria)).sort((a, b) => a.rent - b.rent);

  const send = () => {
    const text = draft.trim();
    if (!text || busy) return;
    const next = read(text, criteria);
    const time = "09:" + String(12 + turns.length / 2).padStart(2, "0");
    setTurns((rows) => [...rows, { id: `u${rows.length}`, mine: true, time, text }]);
    setDraft("");
    setBusy(true);
    timer.current = setTimeout(() => {
      const result = homes.filter((home) => matches(home, next)).sort((a, b) => a.rent - b.rent);
      setCriteria(next);
      setTurns((rows) => [...rows, { id: `a${rows.length}`, mine: false, time, text: answer(result, next) }]);
      setBusy(false);
    }, 900);
  };

  return (
    <div className={styles.page}>
      <section className={styles.chat} aria-label="Chat with the assistant">
        <header className={styles.head}>
          <h1>Home search assistant</h1>
          <p>Say what you are looking for in your own words. The list beside it changes with each answer.</p>
        </header>
        <div className={styles.thread}>
          <MessageScroller maxHeight={520} label="Chat">
            {turns.map((turn) => (
              <Message key={turn.id} author={turn.mine ? "You" : "Assistant"} initials={turn.mine ? "VC" : "AS"} time={turn.time} side={turn.mine ? "end" : "start"}>
                {turn.text}
              </Message>
            ))}
          </MessageScroller>
        </div>
        <IntentComposer
          label="Your request"
          placeholder="E.g.: near the subway, furnished, up to 3k"
          value={draft}
          onChange={setDraft}
          filters={filters}
          filterValues={deal}
          onFilterValuesChange={setDeal}
          examples={["Near the subway", "Furnished, up to 2,500", "Three bedrooms with a pet"]}
          state={busy ? "processing" : "idle"}
          submitLabel="Send request"
          showVoiceControl={false}
          onSubmit={send}
          processingContent={<span role="status">Searching homes…</span>}
        />
      </section>
      <aside className={styles.results} aria-label="Homes found">
        <div className={styles.understood}>
          <h2>Here is what I understood</h2>
          <div className={styles.chips}>
            <Badge tone="info">Rent</Badge>
            {chips(criteria).map((chip) => (
              <Badge key={chip}>{chip}</Badge>
            ))}
          </div>
        </div>
        <h2 className={styles.count} aria-live="polite">
          {found.length} {found.length === 1 ? "home" : "homes"}
        </h2>
        {found[0] && (
          <PropertyCard
            layout="grid"
            title={found[0].title}
            subtitle={`${found[0].area} · ${found[0].size}`}
            value={brl(found[0].rent)}
            valueSuffix="/mo"
            media={[{ src: found[0].photo, alt: found[0].alt }]}
            badges={[{ label: found.length > 1 ? "Cheapest" : "Matches everything", tone: "success" }]}
            facts={[
              { label: "Bedrooms", value: String(found[0].rooms) },
              { label: "Subway", value: found[0].metro ? "On foot" : "Bus" },
              { label: "Pet", value: found[0].pet ? "Allowed" : "No" },
            ]}
            actions={false}
          />
        )}
        {found.length > 1 && (
          <ul className={styles.list}>
            {found.slice(1).map((home) => (
              <li key={home.id}>
                <Item
                  title={home.title}
                  description={`${home.area} · ${home.rooms} bedroom${home.rooms > 1 ? "s" : ""} · ${home.size}`}
                  media={<img className={styles.thumb} src={home.photo} alt="" />}
                  actions={<strong className={styles.price}>{brl(home.rent)}</strong>}
                />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
