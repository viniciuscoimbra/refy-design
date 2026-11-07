// Contrato de props do Select: o que a web e o nativo implementam igual.
// A web estende este tipo com os atributos do DOM; o nativo, com os do React Native.

/** Props for the Select field. */
export interface SelectCoreProps {
  label?: string;
  hint?: string;
  error?: string;
  block?: boolean;
}
