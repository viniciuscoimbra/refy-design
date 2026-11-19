import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Coverflow } from "../components/Coverflow";
const meta = { id: "verification-coverflow-contracts", title: "Verificação/Coverflow loop e autoplay", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
const all = [
  { id: "one", label: "First reference" },
  { id: "two", label: "Second reference" },
  { id: "three", label: "Third reference" },
];
const render = (item: { label: string }) => <span>{item.label}</span>;
/** O pai renderiza a cada segundo; o autoplay de 2 s precisa avançar mesmo assim. */
export const PaiRenderiza: StoryObj = { render: () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return <><Coverflow items={all} renderItem={render} loop autoplay={{ interval: 2000 }} label="Parent rerenders" /><p>Ticks: {tick}</p></>;
} };
/** Lista que encolhe por evento: um item só com loop não habilita navegação. */
export const ListaEncolhe: StoryObj = { render: () => {
  const [items, setItems] = useState(all);
  useEffect(() => {
    const shrink = () => setItems((current) => current.slice(1));
    window.addEventListener("refy:test-coverflow-shrink", shrink);
    return () => window.removeEventListener("refy:test-coverflow-shrink", shrink);
  }, []);
  return <Coverflow items={items} renderItem={render} loop autoplay={{ interval: 2000 }} label="Shrinking list" />;
} };
/** Dois itens em loop: arrasto longo não pode desfazer a troca mostrada; caneta com hover pausa. */
export const DoisItens: StoryObj = { render: () => (
  <Coverflow items={all.slice(0, 2)} renderItem={render} loop autoplay={{ interval: 2000 }} label="Two items" />
) };
/** Intervalo inválido (NaN) cai no padrão de 5 s, nunca em zero. */
export const IntervaloInvalido: StoryObj = { render: () => {
  const [changes, setChanges] = useState(0);
  return <><Coverflow items={all} renderItem={render} loop autoplay={{ interval: Number.NaN }} onSelectionChange={() => setChanges((value) => value + 1)} label="Invalid interval" /><p>Changes: {changes}</p></>;
} };
/** Intervalo acima do limite do timer do navegador não pode disparar na hora. */
export const IntervaloEnorme: StoryObj = { render: () => {
  const [changes, setChanges] = useState(0);
  return <><Coverflow items={all} renderItem={render} loop autoplay={{ interval: 3_000_000_000 }} onSelectionChange={() => setChanges((value) => value + 1)} label="Huge interval" /><p>Changes: {changes}</p></>;
} };
