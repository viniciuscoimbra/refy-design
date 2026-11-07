"use client";
import { useState } from "react";
import { Badge, Button, Drawer, EmptyState, IconButton, PageHeader, ProgressBar, Segmented } from "../index";
import { photos } from "./photos";
import styles from "./StoreBlock.module.css";

const icon = (path: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={path} />
  </svg>
);
const bagIcon = icon("M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2");
const minusIcon = icon("M5 12h14");
const plusIcon = icon("M12 5v14M5 12h14");

interface Product {
  id: string;
  name: string;
  detail: string;
  category: "home" | "kitchen" | "office";
  price: number;
  note?: string;
  image: string;
}
const products: Product[] = [
  { id: "mug", name: "Ceramic mug", detail: "White porcelain, 300 ml", category: "kitchen", price: 59, note: "Handmade", image: photos.shopMug },
  { id: "lamp", name: "Desk lamp", detail: "Wooden base, warm light", category: "office", price: 249, image: photos.shopLamp },
  { id: "blanket", name: "Knit throw", detail: "Raw cotton, 130 × 170 cm", category: "home", price: 189, note: "New", image: photos.shopBlanket },
  { id: "teapot", name: "Cast iron teapot", detail: "Cast iron, 800 ml", category: "kitchen", price: 279, image: photos.shopTeapot },
  { id: "caderno", name: "Spiral notebook", detail: "Kraft cover, 80 sheets", category: "office", price: 69, image: photos.shopNotebook },
  { id: "vase", name: "Clay vase", detail: "Terracotta, 18 cm", category: "home", price: 129, note: "Last units", image: photos.shopVase },
];
const freeShipping = 300;
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function StoreBlock() {
  const [category, setCategory] = useState("all"),
    [cart, setCart] = useState<Record<string, number>>({ mug: 2 }),
    [open, setOpen] = useState(false),
    [ordered, setOrdered] = useState(false);
  const count = Object.values(cart).reduce((sum, value) => sum + value, 0);
  const subtotal = Object.entries(cart).reduce((sum, [id, quantity]) => sum + (products.find((item) => item.id === id)?.price ?? 0) * quantity, 0);
  const shipping = subtotal >= freeShipping || subtotal === 0 ? 0 : 24;
  const missing = Math.max(0, freeShipping - subtotal);
  const change = (id: string, step: number) =>
    setCart((rows) => {
      const next = (rows[id] ?? 0) + step;
      const { [id]: _, ...rest } = rows;
      return next > 0 ? { ...rows, [id]: next } : rest;
    });
  const visible = products.filter((item) => category === "all" || item.category === category);
  return (
    <div className={styles.page}>
      <PageHeader
        title="Home store"
        lead="Things to use every day. Free shipping from R$ 300."
        actions={
          <Button leadingIcon={bagIcon} onClick={() => setOpen(true)}>
            Bag{count ? ` (${count})` : ""}
          </Button>
        }
      />
      <div className={styles.toolbar}>
        <Segmented
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All" },
            { value: "home", label: "Home" },
            { value: "kitchen", label: "Kitchen" },
            { value: "office", label: "Office" },
          ]}
        />
        <div className={styles.shipping}>
          <span>{missing > 0 ? `${money.format(missing)} away from free shipping` : "Free shipping unlocked"}</span>
          <ProgressBar size="sm" value={(Math.min(subtotal, freeShipping) / freeShipping) * 100} aria-label="Progress to free shipping" />
        </div>
      </div>
      <ul className={styles.grid} aria-label="Products">
        {visible.map((item) => (
          <li key={item.id} className={styles.product}>
            <div className={styles.media}>
              <img src={item.image} alt={item.name} loading="lazy" />
              {item.note && <Badge className={styles.note} tone={item.note === "New" ? "info" : "neutral"}>{item.note}</Badge>}
            </div>
            <div className={styles.productRow}>
              <div className={styles.productText}>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </div>
              <span className={styles.price}>{money.format(item.price)}</span>
            </div>
            <Button
              variant={cart[item.id] ? "secondary" : "primary"}
              block
              onClick={() => {
                change(item.id, 1);
                setOrdered(false);
              }}
            >
              {cart[item.id] ? `One more (${cart[item.id]} in the bag)` : "Add to bag"}
            </Button>
          </li>
        ))}
      </ul>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Your bag"
        footer={
          count > 0 && (
            <div className={styles.summary}>
              <dl>
                <dt>Products</dt>
                <dd>{money.format(subtotal)}</dd>
                <dt>Shipping</dt>
                <dd>{shipping ? money.format(shipping) : "Free"}</dd>
                <dt>Total</dt>
                <dd>{money.format(subtotal + shipping)}</dd>
              </dl>
              <Button
                variant="primary"
                block
                onClick={() => {
                  setCart({});
                  setOrdered(true);
                }}
              >
                Check out
              </Button>
            </div>
          )
        }
      >
        {count === 0 ? (
          <EmptyState
            title={ordered ? "Order placed" : "Empty bag"}
            message={ordered ? "In this demo the order is not sent anywhere." : "Pick a product to start."}
          />
        ) : (
          <ul className={styles.lines}>
            {Object.entries(cart).map(([id, quantity]) => {
              const item = products.find((product) => product.id === id)!;
              return (
                <li key={id} className={styles.line}>
                  <img src={item.image} alt="" />
                  <div className={styles.productText}>
                    <strong>{item.name}</strong>
                    <span>{money.format(item.price * quantity)}</span>
                  </div>
                  <div className={styles.stepper}>
                    <IconButton aria-label={`Remove one ${item.name}`} variant="outline" size="sm" icon={minusIcon} onClick={() => change(id, -1)} />
                    <span aria-live="polite">{quantity}</span>
                    <IconButton aria-label={`Add one more ${item.name}`} variant="outline" size="sm" icon={plusIcon} onClick={() => change(id, 1)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Drawer>
    </div>
  );
}
