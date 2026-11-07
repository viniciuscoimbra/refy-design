import { useState } from "react";
import { Button, Card, Input, Modal, Table } from "@refy-design/web";
export function After() {
  const [name, setName] = useState(""),
    [query, setQuery] = useState(""),
    [people, setPeople] = useState<{ id: number; name: string }[]>([]),
    [editing, setEditing] = useState<number | null>(null),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [editError, setEditError] = useState("");
  return (
    <main style={{ display: "grid", gap: "var(--space-5)", minWidth: 0 }}>
      <h1>Pessoas do projeto</h1>
      <Card>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) {
              setError("Informe o nome.");
              return;
            }
            setPeople([...people, { id: people.length, name: name.trim() }]);
            setName("");
            setError("");
          }}
        >
          <Input
            label="Nome completo"
            value={name}
            error={error}
            onChange={(event) => setName(event.target.value)}
          />
          <Button type="submit" variant="primary">
            Adicionar pessoa
          </Button>
        </form>
      </Card>
      <Input
        label="Buscar pessoa"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Table
        caption="Pessoas cadastradas"
        rows={people.filter((person) =>
          person.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        )}
        rowKey={(person) => String(person.id)}
        columns={[
          { key: "name", header: "Nome", cell: (person) => person.name },
          {
            key: "edit",
            header: "Edição",
            cell: (person) => (
              <Button
                onClick={() => {
                  setEditing(person.id);
                  setDraft(person.name);
                  setEditError("");
                }}
              >
                Editar {person.name}
              </Button>
            ),
          },
        ]}
      />
      <Modal
        open={editing !== null}
        title="Editar pessoa"
        onClose={() => setEditing(null)}
        footer={
          <>
            <Button onClick={() => setEditing(null)}>Cancelar edição</Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!draft.trim()) {
                  setEditError("Informe o nome da pessoa.");
                  return;
                }
                setPeople(
                  people.map((person) =>
                    person.id === editing
                      ? { ...person, name: draft.trim() }
                      : person,
                  ),
                );
                setEditing(null);
              }}
            >
              Salvar alterações
            </Button>
          </>
        }
      >
        <Input
          label="Nome na edição"
          value={draft}
          error={editError}
          onChange={(event) => setDraft(event.target.value)}
        />
      </Modal>
    </main>
  );
}
