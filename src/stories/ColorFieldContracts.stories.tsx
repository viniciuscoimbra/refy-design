import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ColorField } from "../components/ColorField";
const meta = { id: "verification-colorfield-contracts", title: "Verificação/ColorField formulário e controle", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
/** O formulário só leva a cor aceita; rascunho inválido fica fora. */
export const Formulario: StoryObj = { render: () => {
  const [sent, setSent] = useState("");
  return (
    <form onSubmit={(event) => { event.preventDefault(); setSent(String(new FormData(event.currentTarget).get("color"))); }}>
      <ColorField label="Brand color" name="color" defaultValue="#2163ad" />
      <button type="submit">Send</button>
      <output>Sent: {sent}</output>
    </form>
  );
} };
/** O app recusa toda troca: campo e sliders voltam ao value. */
export const Recusa: StoryObj = { render: () => (
  <ColorField label="Locked by the app" value="#ff0000" onChange={() => {}} />
) };
/** O app aplica a cor um render depois (estado atualizado por efeito): a matiz sobrevive. */
export const Atrasado: StoryObj = { render: () => {
  const [asked, setAsked] = useState("#00ff00");
  const [value, setValue] = useState(asked);
  useEffect(() => setValue(asked), [asked]);
  return <ColorField label="Applied a render later" value={value} onChange={setAsked} />;
} };
/** O app aplica a cor um instante depois (medição, rede): sair do campo antes disso não desfaz a escolha. */
export const Assincrono: StoryObj = { render: () => {
  const [value, setValue] = useState("#2643d1");
  const [changes, setChanges] = useState<string[]>([]);
  return (
    <>
      <ColorField label="Applied a moment later" value={value} onChange={(hex) => { setChanges((list) => [...list, hex]); window.setTimeout(() => setValue(hex), 150); }} />
      <ColorField label="Next field" defaultValue="#7c3aed" />
      <output>Changes: {changes.join(" ")}</output>
    </>
  );
} };
