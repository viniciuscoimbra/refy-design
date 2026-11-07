import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { KanbanBoard, type KanbanColumnItem } from "../components/KanbanBoard";
const meta = { id: "verification-board-contracts", title: "Verificação/Quadro controlado", parameters: { layout: "padded" } } satisfies Meta;
export default meta;
export const AtualizacaoExterna: StoryObj = { render: () => {
  const [columns, setColumns] = useState<KanbanColumnItem[]>([
    { id: "todo", title: "To do", items: [{ id: "a", title: "Review proposal" }] },
    { id: "doing", title: "In progress", items: [] },
  ]);
  const [changes, setChanges] = useState(0);
  useEffect(() => {
    const update = () => setColumns([{ id: "todo", title: "To do", items: [] }, { id: "doing", title: "In progress", items: [{ id: "a", title: "Review proposal" }] }]);
    window.addEventListener("refy:test-board-update", update);
    return () => window.removeEventListener("refy:test-board-update", update);
  }, []);
  return <><KanbanBoard columns={columns} onColumnsChange={next => { setColumns(next); setChanges(value => value + 1); }} /><p>Changes: {changes}</p></>;
} };
