import { useState } from "react";
import { Button, Card, D3Chart, Segmented } from "@refy-design/web";
import Page from "./adoption-block/page";

/** Consumer composition: copied block source and installed public components. */
export function ConsumerAdoption() {
  const [view, setView] = useState("chart");
  const [selected, setSelected] = useState("Nenhum dado selecionado");
  return (
    <section
      aria-label="Jornada de adoção"
      style={{
        maxWidth: 960,
        margin: "48px auto",
        display: "grid",
        gap: "var(--space-5)",
        minWidth: 0,
      }}
    >
      <h2>Do Playground para a aplicação</h2>
      <Segmented
        label="Exemplo instalado"
        value={view}
        onChange={setView}
        options={[
          { value: "chart", label: "Chart instalado" },
          { value: "block", label: "Block copiado" },
        ]}
      />
      {view === "block" ? (
        <Page />
      ) : (
        <Card>
          <D3Chart
            type="line"
            title="Entregas do projeto"
            label="Entregas do projeto"
            series={[
              {
                id: "planned",
                label: "Planejadas",
                data: [
                  { x: "Jan", y: 12 },
                  { x: "Fev", y: 20 },
                  { x: "Mar", y: 28 },
                ],
              },
              {
                id: "done",
                label: "Concluídas",
                data: [
                  { x: "Jan", y: 8 },
                  { x: "Fev", y: 16 },
                  { x: "Mar", y: 24 },
                ],
              },
            ]}
            legend={{ interactive: true }}
            dots
            onSelect={(datum) =>
              setSelected(
                `${datum.label}: ${Object.values(datum.values).join(" · ")}`,
              )
            }
          />
          <p role="status">{selected}</p>
          <Button onClick={() => setSelected("Nenhum dado selecionado")}>
            Limpar seleção
          </Button>
        </Card>
      )}
    </section>
  );
}
