"use client";
import { useState } from "react";
import { ActivityTimeline, Badge, Button, Callout, Item, PageHeader, WizardStepper } from "../index";
import type { ActivityEvent } from "../index";
import { photos } from "./photos";
import styles from "./OrderBlock.module.css";

const truck = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01" /></svg>;
const box = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4-9-4ZM3 7v10l9 4 9-4V7M12 11v10" /></svg>;
const check = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>;

const steps = [
  { id: "paid", label: "Paid · Nov 3" },
  { id: "packed", label: "Packed · Nov 4" },
  { id: "route", label: "On the way" },
  { id: "home", label: "Delivery by Friday" },
];
const events: ActivityEvent[] = [
  { id: "e4", timestamp: "2026-11-05T08:05:00-03:00", title: "Left the Barueri distribution center", description: "Next stop: delivery hub in Lapa.", icon: truck, status: { label: "In transit", tone: "info", pulse: true } },
  { id: "e3", timestamp: "2026-11-04T19:30:00-03:00", title: "Arrived at the distribution center", description: "Barueri, SP", icon: box },
  { id: "e2", timestamp: "2026-11-04T15:40:00-03:00", title: "Packed and labeled", description: "1 box, 3.2 kg", icon: box },
  { id: "e1", timestamp: "2026-11-03T10:12:00-03:00", title: "Payment approved", description: "Pix", icon: check, status: { label: "Paid", tone: "good" } },
];
const items = [
  { id: "blanket", name: "Knit throw", detail: "Raw cotton, 130 × 170 cm", price: 219, photo: photos.shopBlanket },
  { id: "mug", name: "Mug", detail: "White porcelain, 300 ml · 2 units", price: 98, photo: photos.shopMug },
  { id: "teapot", name: "Cast iron teapot", detail: "Cast iron, 800 ml", price: 189, photo: photos.shopTeapot },
];
const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function OrderBlock() {
  const [notify, setNotify] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return (
    <div className={styles.page}>
      <PageHeader
        title="Arrives Friday, November 6"
        lead="Order 4821 · 3 items · delivery to Rua Fradique Coutinho, 1200, Pinheiros"
        actions={<Badge tone="info">On the way</Badge>}
      />
      <section className={styles.track} aria-label="Delivery steps">
        <WizardStepper steps={steps} current="route" label="Delivery steps" variant="horizontal" />
      </section>
      <div className={styles.layout}>
        <section className={styles.history} aria-label="History">
          <ActivityTimeline events={events} title="Where it has been" timezone="America/Sao_Paulo" density="compact" />
        </section>
        <aside className={styles.aside}>
          <section className={styles.card} aria-labelledby="order-items">
            <h2 id="order-items">In the package</h2>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.id}>
                  <Item
                    variant="plain"
                    title={item.name}
                    description={item.detail}
                    media={<img className={styles.thumb} src={item.photo} alt="" />}
                    actions={<span className={styles.price}>{brl(item.price)}</span>}
                  />
                </li>
              ))}
            </ul>
            <dl className={styles.total}>
              <div><dt>Shipping</dt><dd>Free</dd></div>
              <div><dt>Total</dt><dd>{brl(total)}</dd></div>
            </dl>
          </section>
          {notify ? (
            <Callout tone="success" title="Alert on">You get a message when the courier is 3 stops away.</Callout>
          ) : (
            <Button variant="primary" onClick={() => setNotify(true)}>Notify me when it is close</Button>
          )}
          <Button variant="ghost">Contact the store</Button>
        </aside>
      </div>
    </div>
  );
}
