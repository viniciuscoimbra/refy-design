// Contrato de props do Bubble: o que a web e o nativo implementam igual.

/** Props for the Bubble message balloon. */
export interface BubbleCoreProps {
  /** `end` encosta à direita e usa a cor da marca (mensagem de quem usa). */
  side?: "start" | "end";
}
