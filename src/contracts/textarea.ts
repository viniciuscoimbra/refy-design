// Contrato de props do Textarea: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.

/** Props for the Textarea field. */
export interface TextareaCoreProps {
  label?: string;
  hint?: string;
  error?: string;
  block?: boolean;
}
