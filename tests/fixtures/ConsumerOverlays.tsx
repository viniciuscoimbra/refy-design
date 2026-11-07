import { useState } from "react";
import { Button, Carousel, Combobox, Drawer, Menu, Modal } from "@refy-design/web";

// Fixture copiada para o consumidor isolado; nunca importa fontes do workspace.
export function ConsumerOverlays() {
  const [panel, setPanel] = useState<"modal" | "drawer" | null>(null);
  const [menu, setMenu] = useState(false);
  const [result, setResult] = useState("Nenhuma ação");
  const content = <div style={{display:"grid",gap:16}}>
    <Combobox label="Pessoa revisora" options={[{value:"ana",label:"Ana Lima"},{value:"clara",label:"Clara Dias"}]} />
    <Menu open={menu} onOpenChange={setMenu} ariaLabel="Ações de compatibilidade"
      entries={[{id:"confirm",label:"Confirmar revisão",onSelect:()=>setResult("Revisão confirmada")}] }>
      <Button onClick={()=>setMenu(!menu)}>Ações de revisão</Button>
    </Menu>
    <p role="status">{result}</p>
  </div>;
  return <>
    <Carousel label="Verificação de conteúdo inativo" items={[{id:"first",label:"Primeiro",content:<Button>Primeiro slide</Button>},{id:"second",label:"Segundo",content:<Button>Segundo slide</Button>}]} />
    <Button onClick={()=>setPanel("modal")}>Testar modal</Button>
    <Button onClick={()=>setPanel("drawer")}>Testar drawer</Button>
    <Modal open={panel==="modal"} onClose={()=>setPanel(null)} title="Modal de compatibilidade">{content}</Modal>
    <Drawer open={panel==="drawer"} onOpenChange={open=>{if(!open)setPanel(null)}} title="Drawer de compatibilidade">{content}</Drawer>
  </>;
}
