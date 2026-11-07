import { useState } from "react";
export function Before() {
  const [name, setName] = useState(""),
    [query, setQuery] = useState(""),
    [people, setPeople] = useState<{ id: number; name: string }[]>([]),
    [editing, setEditing] = useState<number | null>(null),
    [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [editError, setEditError] = useState("");
  return (
    <main style={{ color: "#163521", fontFamily: "Arial" }}>
      <h1>Pessoas do projeto</h1>
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
        <label>
          Nome completo
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit">Adicionar pessoa</button>
      </form>
      <label>
        Buscar pessoa
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <table>
        <caption>Pessoas cadastradas</caption>
        <tbody>
          {people
            .filter((person) =>
              person.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
            )
            .map((person) => (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>
                  <button
                    onClick={() => {
                      setEditing(person.id);
                      setDraft(person.name);
                      setEditError("");
                    }}
                  >
                    Editar {person.name}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {editing !== null && (
        <dialog open aria-label="Editar pessoa">
          <label>
            Nome na edição
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          {editError && <p role="alert">{editError}</p>}
          <button
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
          </button>
          <button onClick={() => setEditing(null)}>Cancelar edição</button>
        </dialog>
      )}
    </main>
  );
}
